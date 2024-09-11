# ![Emmanuel Béziat Logo](public/favicons/favicon-32x32.png) emmanuelbeziat-state :: Emmanuel Béziat

🔔 Get some build logs out without needing to connect to my server.

![Built with](https://img.shields.io/badge/built_with-fastify-blue.svg?style=flat) ![Built With](https://img.shields.io/badge/built_with-nunjucks-green.svg?style=flat
)

## What?

- Fetch build logs
- Environment configuration using dotenv

## Installation

```bash
# Get the repo
git clone git+ssh://git@github.com/EmmanuelBeziat/emmanuelbeziat-state.git

# Navigate into project folder
cd emmanuelbeziat-state

# Intall dependencies
npm i
```

**.env file example:**

```env
PORT=3000
HOST="127.0.0.1"
LOGS_PATH="/var/logs/mywebsite"
FILE_LOG="mywebsite.log"
FILE_STATUS="status.log"
SERVICES_LIST=[{ "name": "<app_name>", "url": "<app_url>"}]
```

## Usage

- **Start the application in development mode:**
  ```bash
  npm run dev
  ```
  Launches the application with hot-reloading for development, with changes in real-time with node watch.

- **Start the application in production mode:**
  ```bash
  npm run prod
  ```
  Runs the application in a production environment, optimized for performance and stability, with nodemon.

- **Deploy the application:**
  ```bash
  npm run deploy
  ```
  Deploys the application for production using PM2.

- **Run tests:**
  ```bash
  npm run test
  ```
  Run all tests

- **Run route tests:**
  ```bash
  npm run test:routes
  ```
  Specifically tests the application's routes to verify that they respond correctly.

- **Run environment tests:**
  ```bash
  npm run test:env
  ```
	Checks the environment configurations to ensure all necessary variables are set correctly.

- **Run class tests:**
  ```bash
  npm run test:class:home
  ```
  Runs tests for the Home class.

  ```bash
  npm run test:class:log
  ```
  Runs tests for the Log class.

- **Run filter tests:**
  ```bash
  npm run test:filters
  ```
  Runs tests for filters.

- **Run template tests:**
  ```bash
  npm run test:templates
  ```
  Runs tests for templates.

## License

This project is licensed under the GPL-3.0-or-later License.
