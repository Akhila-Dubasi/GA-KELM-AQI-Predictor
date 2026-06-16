LIVE ----- https://ga-kelm-aqi-predictor.vercel.app/
# GA-KELM AQI Predictor

A modern, full-stack Web Application for predicting and visualizing the Air Quality Index (AQI) using a **Genetic Algorithm (GA)** optimized **Kernel Extreme Learning Machine (KELM)**. The project integrates real-time air quality data, interactive map visualizations, historical and forecast analytics, and an AI-powered health assistant.

---

## 🌟 Key Features

*   **GA-KELM Machine Learning Model**: Uses Genetic Algorithm (GA) to optimize hyperparameters ($C$ and $\gamma$) for a Kernel Extreme Learning Machine (KELM) with Radial Basis Function (RBF) kernel on startup.
*   **Real-time Air Quality Data**: Fetches live meteorological and air quality metrics (PM2.5, PM10, $\text{NO}_2$, $\text{SO}_2$, $\text{CO}$, $\text{O}_3$) from the **Open-Meteo Air Quality API** based on GPS coordinates.
*   **Interactive Visualizations**: Includes an interactive **Leaflet map** for coordinate selection and **Recharts** charts to display:
    *   7-day future air quality forecasting.
    *   7-day historical daily air quality logs.
*   **AeroSense AI Health Guide**: A context-aware chatbot powered by **Google Gemini** (`gemini-2.5-flash`) providing real-time, personalized health and precaution guidelines based on the current location's AQI.
*   **Model Performance Analytics**: An admin/metrics interface displaying model training statistics (Root Mean Squared Error (RMSE), $R^2$ Score, and a comparison graph of Actual vs. Predicted AQI values).

---

## 📂 Project Structure

```text
├── dataset/
│   └── air_quality.csv          # Dataset containing historical air quality pollutants
├── ml-service/
│   ├── model/
│   │   ├── ga_kelm.py           # GA optimization and model training script
│   │   └── kelm.py              # Custom Kernel Extreme Learning Machine implementation
│   ├── main.py                  # FastAPI server and ML endpoints (/predict, /admin/metrics)
│   └── requirements.txt         # Python dependencies
├── backend/
│   ├── server.js                # Express.js Server (API routing, Open-Meteo & Gemini APIs)
│   ├── .env                     # Backend environment variables configuration
│   └── package.json             # Node.js backend dependencies
├── frontend/
│   ├── src/
│   │   ├── pages/               # React Page Views (Dashboard, History, Precautions, Admin, etc.)
│   │   ├── components/          # Reusable UI elements (Map components, charts, layout)
│   │   ├── App.jsx              # Main routing and navigation structure
│   │   └── index.css            # Tailwind CSS styles
│   ├── package.json             # Frontend package configuration
│   └── tailwind.config.js       # Tailwind CSS configurations
├── start.bat                    # One-click Windows launch script
└── README.md                    # Project documentation
```

---

## ⚙️ Tech Stack

*   **Frontend**: React 19, Vite, Tailwind CSS, Lucide React (Icons), Recharts, React-Leaflet (Maps), Framer Motion (Animations).
*   **Backend**: Node.js, Express, Axios, `@google/genai` (Gemini SDK).
*   **ML Service**: Python, FastAPI, Uvicorn, NumPy, Pandas, Scikit-learn.

---

## 🚀 Execution & Setup Guide

Follow these steps to set up and run the project locally.

### 📋 Prerequisites

Ensure you have the following installed on your machine:
*   [Node.js](https://nodejs.org/) (v18.x or higher)
*   [Python](https://www.python.org/) (v3.8 or higher) with `pip`

---

### 💻 Method 1: Automatic Launch (Windows Only)

This repository includes a `start.bat` script that installs dependencies and launches the Frontend, Backend, and ML services in separate command windows.

1.  Open the project directory in a terminal or command prompt.
2.  Double-click `start.bat` or run:
    ```cmd
    start.bat
    ```
3.  The script will:
    *   Start the **ML Service** (FastAPI) at `http://127.0.0.1:8000`.
    *   Install backend dependencies and start the **Node.js Backend** at `http://localhost:5000`.
    *   Install frontend dependencies and start the **Vite React Server** at `http://localhost:5173`.

---

### 🛠️ Method 2: Manual Launch (Windows, macOS, Linux)

If you are on macOS/Linux or prefer manual initialization, run each service in a separate terminal:

#### 1. Machine Learning Service (Python FastAPI)
1.  Navigate into the `ml-service` directory:
    ```bash
    cd ml-service
    ```
2.  Create and activate a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    # On Windows:
    venv\Scripts\activate
    # On macOS/Linux:
    source venv/bin/activate
    ```
3.  Install Python dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Run the ML service:
    ```bash
    python -m uvicorn main:app --reload
    ```
    *   *The model will automatically begin training/optimizing parameters using the Genetic Algorithm. It will log `Model ready ✅` once complete.*

#### 2. Backend Server (Express.js)
1.  Navigate into the `backend` directory:
    ```bash
    cd ../backend
    ```
2.  Create a `.env` file in the root of the `backend` folder and add your Gemini API Key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
3.  Install node packages:
    ```bash
    npm install
    ```
4.  Run the Node server:
    ```bash
    node server.js
    ```

#### 3. Frontend App (React + Vite)
1.  Navigate into the `frontend` directory:
    ```bash
    cd ../frontend
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the dev server:
    ```bash
    npm run dev
    ```
4.  Open your browser and navigate to `http://localhost:5173`.

---

## 🧠 Machine Learning Details

The predicting module leverages a **Kernel Extreme Learning Machine (KELM)**. Traditional ELMs randomly assign input weights, which can lead to suboptimal accuracy. KELM resolves this by applying a kernel function (RBF Kernel) to map features into a higher dimension.

To find the optimal hyperparameter combination of penalty parameter $C$ and kernel parameter $\gamma$:
1.  On startup, the FastAPI app launches a **Genetic Algorithm (GA)** evolutionary routine.
2.  A population of parameter pairs ($C$, $\gamma$) is initialized.
3.  Over **40 generations**, pairs are evaluated based on their Root Mean Squared Error (RMSE) on test data.
4.  Standard **crossover** ($P_c = 0.80$) and **mutation** ($P_m = 0.10$) operators evolve the population.
5.  The optimal parameters are chosen to train the final KELM model.

Performance metrics can be verified at any time in the frontend **Admin Dashboard** (`/admin`), which queries `/admin/metrics`.
