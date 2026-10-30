# BridgeEscrow MVP demo

This repository contains the React/Vite frontend in `frontend/` and the Flask API in `backend/`. The hosted configuration is a **demo**: payments are simulated, wallet balances are internal ledger records, and no real M-Pesa payout occurs.

## Deploy: Render API with SQLite, Vercel frontend

1. In Render, choose **New → Blueprint**, connect `Weruh/bridge-escrow-mvp`, and select the root `render.yaml`. It creates one **paid** Python web service with a 1 GB persistent disk mounted at `/var/data`. No PostgreSQL service is needed. Review Render's charges before creating it.
2. Set `CORS_ORIGINS` to the exact Vercel frontend origin, such as `https://bridge-escrow-mvp.vercel.app` (no trailing slash). If you do not know the final URL yet, set it after deploying the frontend and redeploy the API.
3. Deploy. The start command creates the SQLite tables on the disk and seeds public demo accounts when the database is empty. Verify `https://YOUR-API.onrender.com/api/health` returns `status: healthy`.
4. In Vercel, import the same GitHub repository as a new project. Set **Root Directory** to `frontend`, **Framework Preset** to Vite, **Build Command** to `npm run build`, and **Output Directory** to `dist`. Set the Production environment variable `VITE_API_BASE_URL=https://YOUR-API.onrender.com/api`, then deploy.
5. Update the Render `CORS_ORIGINS` value to the frontend's actual URL if needed. Test sign-in, deal creation, buyer/seller messaging, a page refresh on `/transactions/<reference>`, and the simulated payment flow.

The sample credentials are public; use only synthetic information. Password recovery and real payment collection are unavailable in the hosted demo. The SQLite database survives Render redeploys because it lives on the persistent disk. Keep one backend instance attached to the disk.

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
