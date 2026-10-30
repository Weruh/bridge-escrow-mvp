# BridgeEscrow API

Flask API for the BridgeEscrow **demo**. Payments are simulated and seller settlement is recorded only in the internal ledger. Do not use this deployment to collect or hold real money.

## Deploy on Render with SQLite

1. Push the monorepo to GitHub.
2. In Render, choose **New → Blueprint**, connect `Weruh/bridge-escrow-mvp`, and select the root `render.yaml`.
3. The Blueprint creates a paid Python web service and a persistent disk at `/var/data`. Its `DATABASE_URL` points to `sqlite:////var/data/bridge_escrow.db`. Set `CORS_ORIGINS` to your exact Vercel frontend origin, for example `https://bridge-escrow-mvp.vercel.app` (no trailing slash). Render generates `SECRET_KEY` and `JWT_SECRET_KEY`.
4. Deploy. The start command runs `init-db` before Gunicorn; this creates tables and seeds public demo accounts only if the users table is empty.
5. Open `https://YOUR-API.onrender.com/api/health`. It should return JSON with `status: healthy`.
6. In Vercel, set the frontend project's `VITE_API_BASE_URL` to `https://YOUR-API.onrender.com/api` and deploy. Update `CORS_ORIGINS` on Render if the actual frontend URL differs.

Do not use Render's free web service for this SQLite setup: it cannot attach a persistent disk, so the database would be lost after restarts or redeploys. Keep one backend instance attached to the disk. The current schema setup uses `create_all`; replace it with migrations before a production release.

`SEED_DEMO_DATA=true` creates public sample accounts on a new database. Everyone with the sample credentials can access those accounts, so keep all data synthetic.

## Local development

```bash
python3 -m venv .venv-linux
source .venv-linux/bin/activate
pip install -r requirements.txt
python -m flask --app app run --port 5000
```

The local default uses SQLite and seeds demo accounts if the database has no users. Password recovery's fixed demonstration code works only locally; it is disabled when `APP_ENV=hosted`.
