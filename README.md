# Medi-Care

Medical center appointment and staff management application.

## Deploy the frontend on Vercel

Import this repository and set the Vercel **Root Directory** to `frontend`.

- Framework preset: Vite
- Build command: `npm run build`
- Output directory: `dist`
- Environment variable: `VITE_API_URL=https://YOUR-BACKEND-HOST/api`

`VITE_API_URL` must be the public URL of a deployed backend. Do not set it to `localhost` in a Vercel deployment. The root `.env` is not automatically used by the frontend deployment.

## Run locally

1. Copy `.env.example` to `.env` and set `MONGO_URI` and a strong `JWT_SECRET`.
2. In one terminal run `npm --prefix backend run dev`.
3. In another terminal run `npm --prefix frontend run dev`.

For local frontend development, `frontend/.env.example` uses `http://localhost:5000/api`.

## Backend hosting

The backend is a persistent Express server. Deploy it to a Node.js host and configure its environment variables from `.env.example`. The backend currently writes uploaded files to `backend/uploads`, so production hosting must provide persistent storage for that directory or replace it with managed object storage before relying on patient uploads.

Never commit `.env` files, database credentials, patient data, or uploaded files.