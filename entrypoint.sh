#!/bin/sh

# Exit immediately if a command exits with a non-zero status.
set -e

# 1. Temporarily install dependencies needed for deployment tasks.
echo "Temporarily installing Prisma CLI..."
npm install prisma --no-save

# 2. Run database migrations and seeding.
echo "Running production database migrations..."
npx prisma migrate deploy
echo "Migrations complete."

echo "Seeding essential data (if necessary)..."
npx prisma db seed
echo "Seeding complete."

# 3. Uninstall the temporary dependencies.
echo "Uninstalling temporary Prisma CLI..."
npm uninstall prisma

# 4. Start the application.
echo "Starting application..."
exec "$@"