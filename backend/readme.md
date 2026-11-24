# template Backend API

## Overview

This project is a backend API built with **Node.js, Express, and TypeScript**. It uses PostgreSQL as its database and TypeORM to manage database entities and queries.

The API includes user management, authentication, role-based authorization, rate limiting, and Swagger documentation for testing endpoints.

I have tried to add clear and simple comments throughout the code to explain each step, making the project easier to understand, especially for junior developers and anyone who wants to learn how the backend works.

## Technologies Used

- **Node.js** — JavaScript runtime
- **Express.js** — Backend web framework
- **TypeScript** — Type-safe JavaScript
- **PostgreSQL** — Relational database
- **TypeORM** — Database management and entity mapping
- **JWT (JSON Web Tokens)** — Authentication
- **HTTP-only Cookies** — Secure token storage
- **bcryptjs** — Password hashing
- **express-rate-limit** — Request rate limiting
- **Swagger / OpenAPI** — API documentation
- **dotenv** — Environment variable management

## Features

- User login with email and password
- Access tokens valid for 12 hours
- Refresh tokens valid for 7 days
- Authentication using HTTP-only cookies
- Password hashing and password comparison
- Role-based access control for regular users and admins
- Retrieve all users and individual user details
- Rate limiting to reduce excessive requests
- Centralized error handling
- PostgreSQL connection management
- Swagger UI for API documentation and testing
- Temporary seed service for creating test users

## Project Structure

```text
src/
├── controllers/       # Handle requests and responses
├── database/          # Database configuration and connection
├── entities/          # TypeORM database entities
├── middlewares/       # Authentication, authorization, and rate limiting
├── repositories/      # Database queries and operations
├── routes/            # API route definitions
├── secrets/           # Environment variable configuration
├── services/          # Application logic
├── types/             # TypeScript types and enums
├── utils/             # Shared helpers and API responses
├── app.ts             # Express application setup
└── index.ts           # Application entry point
```

## Requirements

Before running the project, make sure you have installed:

- Node.js and npm
- PostgreSQL
- Git

## Installation

1. Clone the repository:

```bash
   git clone <repository-url>
```

2. Navigate to the project directory:

```bash
   cd <project-folder>
```

3. Install dependencies:

```bash
   npm ci
```

4. Create a `.env` file in the project root and configure your environment variables.

## Environment Variables

Update env values to match your local environment. Use a strong, private JWT secret and database password. Do not commit your `.env` file to version control.

## Running the Project

Start the development server using the script configured in `package.json`:

```bash
npm run dev
```

The API will be available at the configured server port, for example:

```text
http://localhost:4040
```

## API Documentation

Swagger provides an interactive interface for viewing and testing API endpoints.

Open the following URL if Swagger UI is configured at `/api-docs`:

```text
http://localhost:4040/api-docs
```

In Swagger UI, expand an endpoint, click **Try it out**, enter the required data, and click **Execute** to send the request and view the response.

## API Endpoints

The following endpoints are based on the current route configuration.

| Method | Endpoint                | Description                   |
| ------ | ----------------------- | ----------------------------- |
| POST   | `/api/auth/login`       | Authenticate a user           |
| GET    | `/api/user/seed-users`  | Temporarily create test users |
| GET    | `/api/user/list`        | Retrieve all users            |
| GET    | `/api/user/details/:id` | Retrieve a user by ID         |

**Note:** The login endpoint is registered under `/api/auth/login` in the current route configuration. Update the Swagger paths to match the actual routes.

User endpoints require authentication, and admin-only operations require the appropriate role. Login requests are limited to five attempts per hour, based on the configured rate limiter.

## Authentication

After a successful login, the API sets two HTTP-only cookies:

- **Access token:** Expires after 12 hours.
- **Refresh token:** Expires after 7 days.

The authentication middleware verifies the access token and checks that the user exists. Admin authorization middleware restricts protected operations to users with the admin role.

## Error Handling

The project uses centralized error handling to process errors from controllers, services, middleware, and database operations. Shared API response utilities help keep successful and error responses consistent.

## Code Comments and Maintainability

I have tried to include clear, straightforward comments throughout the project to explain the purpose of important functions, middleware, and processing steps.

The goal is to make the code easier to follow, help junior developers understand how different parts of the application work together, and make future maintenance easier.

## Development Notes

- The seed-users endpoint is temporary and is intended for development and testing only. It should be removed or disabled before production deployment.
- Never store plain-text passwords in the database.
- Keep secrets and credentials in environment variables.
- Ensure protected endpoints have the appropriate authentication and authorization middleware.
- Review cookie security settings before deploying to production.
