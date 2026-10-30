# BridgeEscrow MVP demo

This repository contains the React/Vite frontend in `frontend/` and the Flask API in `backend/`. The hosted configuration is a **demo**: payments are simulated, wallet balances are internal ledger records, and no real M-Pesa payout occurs.

## Deploy both apps on Vercel

Create **two Vercel projects from this same GitHub repository**:

1. Provision an external PostgreSQL database and copy its connection URL. Vercel Functions cannot use a local SQLite file for persistent data.
2. Import the repository for the API project. Set **Root Directory** to `backend` and **Framework Preset** to Flask. Leave the build and output settings at their defaults. Vercel discovers `wsgi.py` and its `app` instance.
3. Set backend environment variables for Production: `APP_ENV=hosted`, `DATABASE_URL` to the PostgreSQL URL, unique `SECRET_KEY` and `JWT_SECRET_KEY`, `MPESA_ENV=sandbox`, and `CORS_ORIGINS` to the exact frontend origin (for example `https://bridge-escrow-mvp.vercel.app`, without a trailing slash). Set `SEED_DEMO_DATA=true` only if you want public demonstration accounts.
4. Initialize the database once from a trusted local terminal using the same database URL and hosted environment variables: `cd backend && python -m flask --app app init-db`. This creates tables and, when `SEED_DEMO_DATA=true`, seeds demo accounts in an empty database. Do this before using the deployed API. Do not put database secrets in Git or in the frontend project.
5. Deploy the backend and verify `https://YOUR-BACKEND.vercel.app/api/health` returns `status: healthy`.
6. Import the repository again for the frontend project. Set **Root Directory** to `frontend`, **Framework Preset** to Vite, **Build Command** to `npm run build`, and **Output Directory** to `dist`. Set `VITE_API_BASE_URL=https://YOUR-BACKEND.vercel.app/api` for Production, then deploy.
7. Update the backend project's `CORS_ORIGINS` to the actual frontend URL if it differs from the planned URL, and redeploy the backend. Test sign-in, deal creation, buyer/seller messaging, a page refresh on `/transactions/<reference>`, and the simulated payment flow.

The sample credentials are public; use only synthetic information. Password recovery and real payment collection are unavailable in the hosted demo. The existing `render.yaml` remains available if you choose Render instead; initialize its PostgreSQL database with the same `init-db` command before using it.

## Local development

In one terminal, run the API:

```bash
cd backend
python3 -m venv .venv-linux
source .venv-linux/bin/activate
pip install -r requirements.txt
python -m flask --app app run --port 5000
```

In another terminal, run the frontend:

```bash
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. See `backend/README.md` and `frontend/README.md` for more details.
