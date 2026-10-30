# BridgeEscrow API

Flask API for the BridgeEscrow **demo**. Payments are simulated and seller settlement is recorded only in the internal ledger. Do not use this deployment to collect or hold real money.

## Deploy on Render

1. Push the monorepo to GitHub.
2. In Render, choose **New → Blueprint**, connect the repository, and select the root `render.yaml`.
3. The Blueprint creates a Python web service and a Render Postgres database. Set `CORS_ORIGINS` to your exact Vercel frontend origin, for example `https://bridge-escrow.vercel.app` (no trailing slash). The Blueprint generates `SECRET_KEY` and `JWT_SECRET_KEY`.
4. Deploy, then open `https://YOUR-API.onrender.com/api/health`. It should return JSON with `status: healthy`.
5. In Vercel, set `VITE_API_BASE_URL` to `https://YOUR-API.onrender.com/api` and redeploy the frontend. After the Vercel URL is known, update `CORS_ORIGINS` in Render if necessary.

For manual Render setup, set the Root Directory to `backend`, use Python 3.12, `pip install -r requirements.txt` as the build command and `gunicorn 'app:create_app()' --bind 0.0.0.0:$PORT --workers 1 --threads 4` as the start command. Set `APP_ENV=hosted`, `MPESA_ENV=sandbox`, `DATABASE_URL` to a PostgreSQL connection string, unique `SECRET_KEY` and `JWT_SECRET_KEY`, and `CORS_ORIGINS` to the frontend origin.

`SEED_DEMO_DATA=true` creates the public sample accounts on a new database for presentations. Everyone with the sample credentials can access those accounts, so keep all data synthetic. Set it to `false` for a private deployment. The app creates tables on startup; a future production release should replace this with database migrations.

Render's free web service can sleep when idle, and its free Postgres database expires after 30 days. Use a durable database plan if deals must persist beyond a short demo.

## Local development

```bash
python3 -m venv .venv-linux
source .venv-linux/bin/activate
pip install -r requirements.txt
python -m flask --app app run --port 5000
```

The local default uses SQLite and seeds demo accounts if the database has no users. Password recovery's fixed demonstration code works only locally; it is disabled when `APP_ENV=hosted`.
