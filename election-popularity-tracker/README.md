# Election Popularity Tracker

## Overview

The **Election Popularity Tracker** is a web application designed to provide real-time insights into the popularity of candidates during the 2028 election cycle. The application features a modern tech stack, utilizing React for the front-end and Node.js with Express for the back-end, along with Redis and PostgreSQL for data management.

## Features

- **Real-Time Leaderboard**: View live updates of candidate popularity metrics, including votes, clicks, and external trends.
- **Responsive Design**: The application is fully responsive, providing an optimal experience on both desktop and mobile devices.
- **Dark Mode Support**: Automatically adjusts to dark mode for comfortable viewing in low-light environments.
- **Rate Limiting**: Prevents spam voting through robust rate-limiting mechanisms.
- **External Data Integration**: Fetches and displays additional metrics from external sources, such as Google Trends and news articles.

## Project Structure

The project is organized into two main directories: `client` for the front-end and `server` for the back-end.

```
election-popularity-tracker
├── client                # Front-end application
│   ├── public            # Public assets
│   ├── src               # Source files for React application
│   └── package.json      # Client-side dependencies and scripts
├── server                # Back-end application
│   ├── src               # Source files for Node.js application
│   └── package.json      # Server-side dependencies and scripts
├── .env.example          # Example environment variables
└── README.md             # Project documentation
```

## Setup Instructions

### Prerequisites

- Node.js (version 20 or higher)
- PostgreSQL
- Redis

### Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   cd election-popularity-tracker
   ```

2. Set up the client:
   ```
   cd client
   npm install
   ```

3. Set up the server:
   ```
   cd server
   npm install
   ```

4. Create a `.env` file in the root directory based on the `.env.example` file and fill in the required environment variables.

### Running the Application

1. Start the server:
   ```
   cd server
   npm start
   ```

2. Start the client:
   ```
   cd client
   npm start
   ```

## Deployment

The application is configured to be deployed on Heroku. Ensure that the necessary add-ons for Redis and PostgreSQL are provisioned. Use the provided `Procfile` to define the web and worker processes.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.