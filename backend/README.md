# BridgeEscrow API

Flask API for the BridgeEscrow **demo**. Payments are simulated and seller settlement is recorded only in the internal ledger. Do not use this deployment to collect or hold real money.

## Deploy on Vercel

1. Create an external PostgreSQL database. Use its connection string in `DATABASE_URL`; `postgres://` and `postgresql://` URL schemes are supported.
2. Create a separate Vercel project from this GitHub repository with **Root Directory** `backend` and **Framework Preset** Flask. `wsgi.py` exports the Flask application for Vercel's Python runtime. No custom build or output command is needed.
3. Set Production environment variables: `APP_ENV=hosted`, `DATABASE_URL`, unique `SECRET_KEY` and `JWT_SECRET_KEY`, `MPESA_ENV=sandbox`, and `CORS_ORIGINS=https://YOUR-FRONTEND.vercel.app` (exact origin, no trailing slash). Set `SEED_DEMO_DATA=true` for public demo accounts, or `false` otherwise.
4. Initialize the database once from a trusted terminal with `DATABASE_URL`, `APP_ENV=hosted`, `SECRET_KEY`, `JWT_SECRET_KEY`, and `SEED_DEMO_DATA` set locally: `python -m flask --app app init-db`. Run it with the same database URL used by the Vercel backend. `init-db` creates the tables and seeds demo data only when enabled and the users table is empty. Do not run it as a Vercel build command.
5. Deploy and open `https://YOUR-BACKEND.vercel.app/api/health`. It should return JSON with `status: healthy`.
6. Set the frontend Vercel project's `VITE_API_BASE_URL` to `https://YOUR-BACKEND.vercel.app/api`. Redeploy the frontend after changing that build-time setting.

For local development, the default SQLite database is initialized automatically. Hosted application startup does not create tables or seed data. The existing `render.yaml` is an alternative deployment configuration and also needs the one-time `init-db` command.

`SEED_DEMO_DATA=true` creates public sample accounts only on an empty database. Everyone with the sample credentials can access those accounts, so keep all data synthetic. The current schema setup uses `create_all`; replace it with migrations before a production release.

## Local development

```bash
python3 -m venv .venv-linux
source .venv-linux/bin/activate
pip install -r requirements.txt
python -m flask --app app run --port 5000
```

The local default uses SQLite and seeds demo accounts if the database has no users. Password recovery's fixed demonstration code works only locally; it is disabled when `APP_ENV=hosted`.
