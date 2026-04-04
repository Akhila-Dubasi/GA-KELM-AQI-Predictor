from fastapi import FastAPI
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


# 🔥 TRAIN ONLY ONCE
@app.on_event("startup")
def startup_event():
    print("Training model... please wait ⏳")
    train_model()
    print("Model ready ✅")


@app.post("/predict")
def predict(data: Input):
    return predict_aqi(data)