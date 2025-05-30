# Election Popularity Tracker - Server Documentation

## Overview

The Election Popularity Tracker server is built using Node.js with Express and Socket.io. It serves as the backend for the election popularity tracking application, handling vote submissions, real-time updates, and data persistence.

## Table of Contents

1. [Installation](#installation)
2. [Configuration](#configuration)
3. [Running the Server](#running-the-server)
4. [API Endpoints](#api-endpoints)
5. [Scheduled Tasks](#scheduled-tasks)
6. [Logging](#logging)
7. [Deployment](#deployment)

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/election-popularity-tracker.git
   cd election-popularity-tracker/server
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Copy the example environment variables:
   ```
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration settings.

## Configuration

The server configuration is managed through environment variables defined in the `.env` file. Key variables include:

- `DATABASE_URL`: Connection string for PostgreSQL.
- `REDIS_URL`: Connection string for Redis.
- `GNEWS_API_KEY`: API key for Google News API.
- `REDDIT_CLIENT_ID`, `REDDIT_CLIENT_SECRET`, `REDDIT_REFRESH_TOKEN`, `REDDIT_USER_AGENT`: Credentials for Reddit API.

## Running the Server

To start the server, use the following command:
```
npm start
```

For development, you can use:
```
npm run dev
```

This will start the server with hot-reloading enabled.

## API Endpoints

The server exposes several API endpoints for interacting with the application:

- `POST /api/vote`: Submit a vote for a candidate.
- `GET /api/leaderboard`: Retrieve the current leaderboard with vote counts and metrics.
- `GET /api/candidates`: Fetch candidate information.

Refer to the routes defined in `server/src/routes/index.js` for more details.

## Scheduled Tasks

The server includes a scheduler that fetches external data at regular intervals. This is managed in `server/src/services/scheduler.js`. The scheduler runs every 10 minutes to update candidate metrics from external APIs.

## Logging

Logging is handled through a utility defined in `server/src/utils/logger.js`. It provides functions for logging messages and errors, which can be configured to log to different outputs based on the environment.

## Deployment

The server is configured to run on Heroku. Ensure you have the Heroku CLI installed and follow these steps:

1. Create a new Heroku app:
   ```
   heroku create your-app-name
   ```

2. Set up the Heroku Redis and PostgreSQL add-ons:
   ```
   heroku addons:create heroku-redis
   heroku addons:create heroku-postgresql
   ```

3. Deploy the application:
   ```
   git push heroku main
   ```

4. Scale the web and worker processes:
   ```
   heroku ps:scale web=1 worker=1
   ```

Ensure that all environment variables are set in the Heroku dashboard.

## Conclusion

This README provides an overview of the server-side application for the Election Popularity Tracker. For further details, refer to the code comments and documentation within the project files.