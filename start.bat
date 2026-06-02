@echo off
echo Starting AQI System...

start cmd /k "title ML Service && cd ml-service && echo Starting ML Service... && python -m uvicorn main:app --reload"
start cmd /k "title Backend && cd backend && echo Starting Node Backend... && npm install && node server.js"
start cmd /k "title Frontend && cd frontend && echo Starting React Frontend... && npm install && npm run dev"

echo All services are booting up in separate terminal windows!
