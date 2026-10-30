# BridgeEscrow MVP demo

This repository contains the React/Vite frontend in `frontend/` and the Flask API in `backend/`. The hosted configuration is a **demo**: payments are simulated, wallet balances are internal ledger records, and no real M-Pesa payout occurs.

## Deploy

1. Import this repository into Render as a Blueprint using the root `render.yaml`. It creates a web service rooted at `backend/` and a Postgres database. Set `CORS_ORIGINS` to the exact Vercel site origin.
2. Verify `https://YOUR-API.onrender.com/api/health` returns `status: healthy`.
3. Import the same repository into Vercel. Set **Root Directory** to `frontend`, **Framework** to Vite, **Build Command** to `npm run build`, and **Output Directory** to `dist`.
4. In Vercel, set `VITE_API_BASE_URL=https://YOUR-API.onrender.com/api` and deploy. Update Render's `CORS_ORIGINS` to the actual Vercel URL if needed.
5. Test sign-in, deal creation, buyer/seller messaging, a page refresh on `/transactions/<reference>`, and the simulated payment flow.

The Blueprint enables demo data on an empty database. Use only synthetic information: the sample account credentials are public. Render's free Postgres database expires after 30 days, so select a durable plan before keeping real user data.

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
