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

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Database**: [SQLite](https://www.sqlite.org/index.html)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI**: [Lucide React](https://lucide.dev/) for icons

---

## Getting Started

Follow these instructions to get the project up and running on your local machine for development or on a server for production.

### 1. Prerequisites

- [Node.js](https://nodejs.org/en) (v20.x or later recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

### 2. Installation

Clone the repository and install the dependencies:

```bash
git clone https://your-repository-url.com/my-farming.git
cd my-farming
npm install
```

### 3. Environment Variables

Create a `.env` file by copying the example file. This file will store your database connection string.

```bash
cp env.example .env
```

Now, open the `.env` file and ensure the `DATABASE_URL` is set correctly for your environment.

- **For development**, a local file path is sufficient:
  ```
  DATABASE_URL="file:./dev.db"
  ```
- **For production**, use an absolute path on your server:
  ```
  DATABASE_URL="file:/path/to/your/prod.db"
  ```

---

## Development Workflow

To run the application in development mode with hot-reloading:

1.  **Initialize and Seed the Database**:

    This command will set up your local database and populate it with a rich set of test data.

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

## Production Deployment

Follow these steps to build and run the application in a production environment.

1.  **Build the Application**:

    This command creates an optimized production build.

    ```bash
    npm run build
    ```

2.  **Prepare the Production Database**:

    These commands will safely apply all migrations to your production database and populate it with the essential data types (e.g., "Sowing", "Fertilizer Cost"). These commands are safe to run on subsequent deployments.

    ```bash
    # Apply database migrations
    npx prisma migrate deploy

    # Seed essential data types
    npx prisma db seed
    ```

3.  **Start the Server**:

    ```bash
    npm run start
    ```

It is highly recommended to use a process manager like `pm2` to keep the application running in the background:

```bash
# Install pm2 globally if you haven't already
npm install -g pm2

# Start the app with pm2
pm2 start npm --name "my-farming-app" -- run start
```