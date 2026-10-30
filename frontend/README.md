# BridgeEscrow frontend

React/Vite frontend for the BridgeEscrow **demo**. The API lives in the `backend/` directory of the same repository.

## Deploy on Vercel

1. Deploy the backend as a separate Vercel Flask project rooted at `backend` and copy its URL. Verify `/api/health` first.
2. Push the monorepo to GitHub.
3. Import it into Vercel. Set the Root Directory to `frontend` and select **Vite**. Use `npm run build` and output directory `dist`.
4. Add the Vercel environment variable `VITE_API_BASE_URL=https://YOUR-BACKEND.vercel.app/api` for Production. This URL is public browser configuration, not a secret. Redeploy after changing it.
5. Set the backend Vercel project's `CORS_ORIGINS` to the exact frontend site origin, such as `https://bridge-escrow.vercel.app`.
6. Open the Vercel site. Check sign-in, a transaction detail URL after refreshing, and a buyer-to-seller message. `vercel.json` sends client-side routes to `index.html`.

To support a Vercel preview URL, add that exact origin to the comma-separated backend `CORS_ORIGINS` value and provide `VITE_API_BASE_URL` for frontend Preview deployments as well.

## Local development

```bash
npm ci
npm run dev
```

Vite proxies `/api` to `http://localhost:5000` when `VITE_API_BASE_URL` is unset. Open `http://localhost:5173`.
