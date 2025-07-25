# My Farming App

My Farming App is a modern, web-based application designed to help small-scale farmers and agricultural enthusiasts manage their plots, track farming activities, and monitor financial performance throughout a crop's lifecycle.

The application is built with Next.js, Prisma, and Tailwind CSS, providing a fast, responsive, and user-friendly experience, especially on mobile devices.

## Core Features

- **Dashboard**: Get an at-a-glance overview of ongoing and completed crop cycles, along with a summary of your plots.
- **Plot Management**: Add and manage your plots of land. You can archive plots that are no longer in use to keep your workspace clean.
- **Automated Crop Cycles**: The application automatically creates and manages production cycles based on your recorded activities. A cycle begins with a "Sowing" activity and ends with a "Harvesting" activity, simplifying tracking.
- **Activity Logging**: Record all your farming activities, from fertilizing and watering to pest control. Each activity is linked to a specific plot and crop cycle.
- **Financial Tracking**: Log expenses and income associated with each activity. The app automatically calculates the total cost, revenue, and net profit for each completed cycle.
- **Comprehensive Reports**: A detailed reporting page allows you to filter all activities and financial records by date range, plot, and financial category.
- **Direct Feedback**: A built-in feedback form allows users to send suggestions directly to the developer.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [SQLite](https://www.sqlite.org/index.html)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI**: [Lucide React](https://lucide.dev/) for icons
- **Deployment**: [Docker](https://www.docker.com/)

---

## Getting Started

Follow these instructions to get the project up and running on your local machine for development.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en) (v20.x or later recommended)
- [Git](https://git-scm.com/)

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://your-repository-url.com/my-farming.git
cd my-farming
npm install
```

### 3. Environment Variables

Create a `.env` file by copying the example file. This file will store your database connection string and other secrets.

```bash
cp env.example .env
```

Now, open the `.env` file and ensure the `DATABASE_URL` is set for your development environment. You can also add your Bark URL for feedback notifications.

```env
# .env

# Path to your local database file
DATABASE_URL="file:./dev.db"

# (Optional) Your Bark URL for feedback notifications
BARK_URL="https://api.day.app/YOUR_BARK_KEY_HERE"
```

### 4. Development Workflow

To run the application in development mode with hot-reloading:

1.  **Initialize and Seed the Database**:

    This command will set up your local database (`dev.db`) and populate it with a rich set of test data.

    ```bash
    # Set up the database schema
    npx prisma migrate dev

    # Fill with test data (plots, cycles, activities)
    npm run db:seed-dev
    ```

2.  **Run the Development Server**:

    ```bash
    npm run dev
    ```

Open [http://localhost:3000](http://localhost:3000) in your browser to see the result.

---

## Production Deployment

We provide two recommended methods for deploying the application to production.

### Option 1: Deploy with Vercel (Recommended)

Vercel is the platform created by the Next.js team and offers the most seamless deployment experience.

1.  **Push to Git**: Push your code to a GitHub, GitLab, or Bitbucket repository.
2.  **Import Project**: Sign up on [Vercel](https://vercel.com/) and import your Git repository.
3.  **Configure Environment Variables**: In the Vercel project settings, add your production `DATABASE_URL` and `BARK_URL`.
4.  **Deploy**: Vercel will automatically build and deploy your application. Future pushes to your main branch will trigger automatic redeployments.

### Option 2: Deploy with Docker on Your Own Server

This method gives you full control over your infrastructure. You will need a server with Docker installed.

1.  **Set up Server**: Connect to your server and make sure Docker is installed.

2.  **Clone Repository**: Clone your project onto the server.
    ```bash
    git clone https://your-repository-url.com/my-farming.git
    cd my-farming
    ```

3.  **Create Production Environment File**: Create a `.env` file and add your production secrets.
    ```bash
    nano .env
    ```
    Add the following content:
    ```env
    DATABASE_URL="file:/path/to/your/prod.db"
    BARK_URL="https://api.day.app/YOUR_PRODUCTION_BARK_KEY"
    ```

4.  **Build the Docker Image**:
    ```bash
    docker build -t my-farming-app .
    ```

5.  **Run the Application**:
    This single command will start the container. The `entrypoint.sh` script inside the container will automatically run database migrations and seeding before starting the application server.
    ```bash
    docker run -d -p 3000:3000 --name my-farming-container --env-file .env my-farming-app
    ```

6.  **Access Your App**: Your application should now be available at `http://<your-server-ip>:3000`.

### Updating a Docker Deployment

To update your application with the latest code changes:

1.  **Pull the latest code**:
    ```bash
    git pull
    ```
2.  **Rebuild the image**:
    ```bash
    docker build -t my-farming-app .
    ```
3.  **Stop and remove the old container**:
    ```bash
    docker stop my-farming-container
    docker rm my-farming-container
    ```
4.  **Run the new container**:
    ```bash
    docker run -d -p 3000:3000 --name my-farming-container --env-file .env my-farming-app
    ```

