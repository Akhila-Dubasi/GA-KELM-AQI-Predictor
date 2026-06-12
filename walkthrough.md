# Walkthrough - Deployment Setup Completed

The AQI Prediction System has been successfully updated and configured for production deployment on **Vercel** (frontend) and **Render** (backend and ML services). The changes have been pushed to the GitHub repository.

---

## Changes Made

### 1. Root Configuration
- **Created** [render.yaml](file:///c:/Users/akhil/aqi-system/render.yaml): Declares a Render Blueprint that sets up the Express backend and the FastAPI ML service automatically with their corresponding environments, root directories, build/start commands, and binds their URLs dynamically via environment variables.

### 2. Frontend Configuration (`frontend/`)
- **Created** [vercel.json](file:///c:/Users/akhil/aqi-system/frontend/vercel.json): Configured a rewrite rule to redirect all routes to `index.html`, ensuring React Router client-side routing works on Vercel upon refreshes and direct URL visits.
- **Created** [config.js](file:///c:/Users/akhil/aqi-system/frontend/src/config.js): Handles dynamic extraction of the `VITE_API_BASE_URL` environment variable, defaulting to `http://localhost:5000` for local testing.
- **Modified** [Dashboard.jsx](file:///c:/Users/akhil/aqi-system/frontend/src/pages/Dashboard.jsx), [History.jsx](file:///c:/Users/akhil/aqi-system/frontend/src/pages/History.jsx), [Precautions.jsx](file:///c:/Users/akhil/aqi-system/frontend/src/pages/Precautions.jsx), and [AiChatbot.jsx](file:///c:/Users/akhil/aqi-system/frontend/src/components/AiChatbot.jsx) to utilize the central `API_BASE_URL` instead of the hardcoded `http://localhost:5000`.
- **Modified** [Admin.jsx](file:///c:/Users/akhil/aqi-system/frontend/src/pages/Admin.jsx): Re-routed the metrics retrieval request to go through the Node.js backend proxy route, ensuring single-base API communication and resolving potential CORS/cross-origin access issues.

### 3. Backend Configuration (`backend/`)
- **Modified** [package.json](file:///c:/Users/akhil/aqi-system/backend/package.json): Added a `"start": "node server.js"` script for Render deployment.
- **Modified** [server.js](file:///c:/Users/akhil/aqi-system/backend/server.js):
  - Made the server port dynamic using `process.env.PORT || 5000`.
  - Replaced hardcoded `http://127.0.0.1:8000` for the ML service with `process.env.ML_SERVICE_URL`.
  - Added a new Express proxy endpoint (`/api/admin/metrics`) that forwards requests to the ML service.

### 4. ML Service Configuration (`ml-service/`)
- **Modified** [ga_kelm.py](file:///c:/Users/akhil/aqi-system/ml-service/model/ga_kelm.py): Updated the dataset path resolution so it dynamically resolves the location of `dataset/air_quality.csv` relative to the script itself, rather than depending on the execution folder.

---

## Verification & Testing

### 1. Build Verification
- Running `npm run build` inside `frontend/` succeeds cleanly, producing a production-ready SPA output:
  ```
  vite v8.0.3 building client environment for production...
  transforming...✓ 2795 modules transformed.
  rendering chunks...
  ✓ built in 3.07s
  ```

### 2. Version Control
- All changes were staged, committed, and successfully pushed to the repository's `main` branch:
  ```
  To https://github.com/Akhila-Dubasi/GA-KELM-AQI-Predictor.git
     0067eeb..8db16a8  main -> main
  ```

---

## Steps to Deploy

### 1. Deploy the Backend & ML Service on Render
1. Log in to [Render](https://render.com/).
2. In the Dashboard, click **New** -> **Blueprint**.
3. Connect your GitHub repository: `Akhila-Dubasi/GA-KELM-AQI-Predictor`.
4. Render will automatically read `render.yaml` and configure two services:
   - `aqi-ml-service` (Python FastAPI service)
   - `aqi-express-backend` (Node.js Express backend)
5. Under the `aqi-express-backend` settings in Render, add the environment variable:
   - `GEMINI_API_KEY`: *Your Google Gemini API Key*
6. Deploy the Blueprint. Once deployed, note down the public URL of `aqi-express-backend` (e.g., `https://aqi-express-backend.onrender.com`).

### 2. Deploy the Frontend on Vercel
1. Log in to [Vercel](https://vercel.com/).
2. Click **Add New** -> **Project**.
3. Import your GitHub repository: `Akhila-Dubasi/GA-KELM-AQI-Predictor`.
4. Select the **Root Directory** of the project as `frontend` (crucial!).
5. In the **Environment Variables** section, add:
   - Key: `VITE_API_BASE_URL`
   - Value: `https://aqi-express-backend.onrender.com` (use your actual backend Render URL)
6. Click **Deploy**.
