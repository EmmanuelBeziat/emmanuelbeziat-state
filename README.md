# ![Emmanuel Béziat Logo](public/favicons/favicon-32x32.png) emmanuelbeziat-push :: Emmanuel Béziat

🔔 Get some build logs out without needing to connect to my server.

![Built with](https://img.shields.io/badge/built_with-fastify-blue.svg?style=flat) ![Built With](https://img.shields.io/badge/built_with-nunjucks-green.svg?style=flat
)

## What?

- Fetch build logs
- Environment configuration using dotenv


## Installation

```bash
# Get the repo
git clone git+ssh://git@github.com/EmmanuelBeziat/emmanuelbeziat-push.git

# Navigate into project folder
cd emmanuelbeziat-push

# Intall dependencies
npm i
```

**.env file example:**

```env
PORT=3000
HOST="127.0.0.1"
PATH_LOGS="/var/logs/mywebsite"
NAME_LOGS="mywebsite.log"
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

## License

This project is licensed under the GPL-3.0-or-later License.
