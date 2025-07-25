# Stage 1: Builder - Installs dependencies, builds the source code
FROM node:20-slim AS builder
WORKDIR /app

# Copy package management files
COPY package*.json ./

# Update packages
RUN sed -i 's/deb.debian.org/mirrors.ustc.edu.cn/g' /etc/apt/sources.list.d/debian.sources
RUN apt-get update && apt-get install -y openssl

# Install all dependencies, including devDependencies needed for build
RUN npm config set registry https://registry.npmmirror.com
RUN npm ci --verbose

# Copy the rest of the application source code
COPY . .

# --- Build-time Database Setup ---
# Create a dummy database file for the build process.
RUN mkdir -p /app/db
ENV DATABASE_URL="file:/app/db/build.db"

# Generate Prisma Client based on the schema
RUN npx prisma generate

# Run migrations on the dummy database to create the schema.
RUN npx prisma migrate deploy

# Build the Next.js application
RUN npm run build

# --- Stage 2: Production - Creates the final, lean image ---
FROM node:20-slim AS production
WORKDIR /app

ENV NODE_ENV=production

# 1. Copy package.json and lock file from the source code context
#    (or from the builder, they are the same)
COPY package*.json ./

# 2. Install only production dependencies based on the lock file.
#    This creates a new, clean node_modules folder.
RUN npm config set registry https://registry.npmmirror.com
RUN npm ci --omit=dev --verbose

# 3. Copy the build artifacts and other necessary files from the builder stage.
#    We do NOT copy the node_modules from the builder.
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh

# 4. Make the entrypoint script executable
RUN chmod +x ./entrypoint.sh

# 5. Expose the port and set the entrypoint
EXPOSE 3000
ENTRYPOINT ["./entrypoint.sh"]
CMD ["npm", "start"]
