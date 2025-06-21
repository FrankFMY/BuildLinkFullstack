# BuildLink - Backend

This directory contains the backend service for the BuildLink application, built with Node.js, Express, and MongoDB.

## Prerequisites

-   Node.js (v20 or higher recommended)
-   MongoDB (running instance, local or remote)

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/FrankFMY/BuildLinkFullstack.git
    cd BuildLinkFullstack/Backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in this directory and add the following variables:

    ```
    MONGO_URI=your_mongodb_connection_string
    JWT_SECRET=your_super_secret_jwt_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The server will start on `http://localhost:8000`.

## Available Scripts

-   `npm run dev`: Starts the server with `nodemon` for automatic restarts.
-   `npm start`: Starts the server with `ts-node`.
-   `npm run build`: Compiles TypeScript to JavaScript.
-   `npm test`: Runs the Jest test suite.
