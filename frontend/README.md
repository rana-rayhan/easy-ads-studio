# template Frontend

## Overview

This is the frontend for the template project, built with **React, TypeScript, and Vite**. It uses React Router for navigation, TanStack Query for server data, and Tailwind CSS and Ant Design for styling. It is designed to work with the template Backend API.

## Technologies Used

- **React 19**: UI library
- **TypeScript**: Type-safe JavaScript
- **Vite**: Dev server and build tool
- **React Router v8**: Routing
- **TanStack Query**: Data fetching and caching
- **Axios**: HTTP requests
- **Ant Design**: UI components
- **Tailwind CSS v3**: Utility-first styling

## Project Structure

```text
src/
├── assets/          # Images and static files
├── constants/       # Shared constant values
├── features/        # Feature modules (components, hooks, API calls)
├── layouts/         # Page layouts
├── pages/           # Standalone pages (e.g. error page)
├── routers/         # Route configuration and route guards
├── shared/          # Shared helpers (e.g. React Query client)
├── App.tsx          # Root component
├── main.tsx         # Application entry point
└── index.css        # Tailwind directives
```

## Requirements

- Node.js and npm
- The template Backend API running locally

## Installation

```bash
git clone <repository-url>
cd <project-folder>
npm install
```

## Running the Project

```bash
npm run dev
```

The app will be available at `http://localhost:3030`.

## Available Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `npm run dev`        | Start the development server         |
| `npm run build`      | Type-check and build for production  |
| `npm run build:dev`  | Build using the `dev` mode           |
| `npm run build:prod` | Build using the `prod` mode          |
| `npm run lint`       | Run ESLint                           |
| `npm run preview`    | Preview the production build locally |

## Routing

| Path         | Access    | Description  |
| ------------ | --------- | ------------ |
| `/`          | Public    | Welcome page |
| `/user`      | Protected | User list    |
| `/user/list` | Protected | User list    |

Public pages render inside `OpenRoute`. Protected pages are wrapped in `ProtectedRoute`, which checks the user's role and redirects to `/` if access is not allowed.

## Development Notes

- Add new features as folders under `src/features/`.
- Do not commit secrets or `.env` files.
- Replace the placeholder role check in `ProtectedRoute` with real authentication before deployment.
