# MathE API

Backend/API for the MathE Platform, built with Node.js, Express, Sequelize, and MariaDB.

## Requirements

- [Node.js](https://nodejs.org/) (with npm)
- [XAMPP](https://www.apachefriends.org/) (or another database management tool of your choice, e.g. MySQL Workbench, Docker, etc.)
- A [GitHub](https://github.com/) account with access to the repository
- A [Postman](https://www.postman.com/) account

## Environment setup

### 1. Install and configure XAMPP

Install XAMPP (or an equivalent tool) and start the **Apache** server and the **MySQL** database server.

### 2. Import the database

Import the provided `.sql` file into the XAMPP database server (for example, via phpMyAdmin: `Database > Import`).

### 3. Clone the repository

Clone the GitHub repository containing the MathE API code (the invite is sent to the `booleana1` user).

```bash
git clone <REPOSITORY_URL>
cd matheBackend
```

Check out the desired branch:

```bash
git checkout <BRANCH>
```

### 4. Configure environment variables

Copy the `.env.example` file to `.env` and fill in the values (database connection, tokens, mail server, etc.):

```bash
cp .env.example .env
```

### 5. Run the backend

Install the project dependencies (this step is only needed the first time, or whenever dependencies are updated):

```bash
npm install
```

Start the backend:

```bash
node server
```

## Testing the API with Postman

1. Create an account on [Postman](https://www.postman.com/).
2. Import the Postman collection sent as an attachment.
3. Run the **login** request first to obtain the authentication token.

## Project structure

```
app/
├── index.js        # Express app setup
├── controllers/     # HTTP request/response handling
├── models/          # Sequelize models
├── routes/          # Route definitions
├── services/        # Business logic
└── utils/           # Utilities (DB connection, CORS, etc.)
middleware/          # Middlewares (authentication, permissions, upload, etc.)
newsImage/           # Uploaded news images
olympiadsImage/      # Uploaded olympiad images
questionsImage/      # Uploaded question images
teachingAbilities/   # Uploaded teaching abilities files
uploads/             # Uploaded material files
.env.example         # Environment variable template
package.json         # Dependencies and scripts
server.js            # Application entry point
```
