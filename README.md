Week 9 Exercise — Next.js Task Management App

A Next.js frontend for the Week 8 authenticated Task Management API.

Tech Stack
Next.js (App Router)
TypeScript
Tailwind CSS
Jest + React Testing Library
JWT Authentication
Features
Login with JWT authentication
Protected Tasks page
View and filter tasks
Create tasks
Delete tasks
API validation/error handling
Sign out
Automated tests
GitHub Actions CI
Environment Variables

Create .env.local:

NEXT_PUBLIC_API_URL=http://localhost:3001

.env.local is not committed. Use .env.example as a template.

Installation
npm ci
Running the Application
1. Start the Week 8 API

In the Week 8 project:

npm run start:dev

The API runs on:

http://localhost:3001
2. Start the Week 9 Frontend

In this project:

npm run dev

The frontend runs on:

http://localhost:3000

Open:

http://localhost:3000/login

Sign in using an existing account from the Week 8 API.

Registration is not part of this Week 9 frontend.

After login, you are redirected to /tasks.

Authentication

The JWT session is stored in browser localStorage.

Authenticated API requests automatically include:

Authorization: Bearer <token>

Signing out clears the stored session and redirects to /login.

Testing

Run:

npm test

Tests cover:

Authorization header handling
Task rendering and empty state
Task creation
API validation errors
Production Build
npm run build

The build does not require the API or database to be running.

CI

GitHub Actions runs on push and pull requests and performs:

npm ci
npm run build
npm test

using Node.js 20.