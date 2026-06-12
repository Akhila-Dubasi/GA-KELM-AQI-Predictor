# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from model.ga_kelm import predict_aqi, train_model

app = FastAPI()


class Input(BaseModel):
    pm25: float
    pm10: float
    no2: float
    so2: float
    co: float
    o3: float


import threading

# 🔥 TRAIN ONLY ONCE (IN BACKGROUND)
@app.on_event("startup")
def startup_event():
    print("Launching model training in background thread...")
    thread = threading.Thread(target=train_model)
    thread.start()
    print("Startup task completed. Port binding initiated.")


@app.post("/predict")
def predict(data: Input):
    return predict_aqi(data)
from model.ga_kelm import get_model_metrics

@app.get("/admin/metrics")
def metrics():
    return get_model_metrics()