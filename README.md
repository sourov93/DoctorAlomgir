# Doctor Portfolio

A Bangla-first doctor portfolio and appointment website built with React, Vite, Express, MongoDB, and Mongoose.

## Run locally

1. Copy `.env.example` to `.env` and set `MONGODB_URI`, `JWT_SECRET`, and admin credentials when persistence/authentication is needed.
2. Install dependencies with `npm install`.
3. Start the frontend and API together with `npm run dev`.
4. Open `http://localhost:5173`.

The frontend uses fallback public content so the visual site can load before MongoDB content models are configured. Appointment submissions are persisted only when `MONGODB_URI` is available.

## Routes

- `/` public doctor portfolio
- `/admin/login` admin login entry point
- `GET /api/health` API health check
- `GET /api/content` public content payload
- `POST /api/appointments` rate-limited appointment request endpoint
- `POST /api/auth/login` JWT login endpoint

## Assets

The supplied doctor and chamber images are in `public/assets`. They are referenced by URL and are not stored in MongoDB.
