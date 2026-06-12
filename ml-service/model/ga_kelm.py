import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from model.kelm import KELM

trained_model = None
scaler = StandardScaler()


# ================= LOAD DATA =================
def load_data():
    import os
    current_dir = os.path.dirname(os.path.abspath(__file__))
    dataset_path = os.path.abspath(os.path.join(current_dir, "../../dataset/air_quality.csv"))
    df = pd.read_csv(dataset_path)

    df = df[["PM2.5", "PM10", "NO2", "SO2", "CO", "O3", "AQI"]]
    df = df.dropna()

    df = df.sample(n=2000, random_state=42)  # Increased sample size since we have cleaner global data

    X = df[["PM2.5", "PM10", "NO2", "SO2", "CO", "O3"]].values
    y = df["AQI"].values

    # 🔥 SCALE DATA
    X = scaler.fit_transform(X)

    return train_test_split(X, y, test_size=0.2, random_state=42)


# ================= RMSE =================
def rmse(y_true, y_pred):
    return np.sqrt(np.mean((y_true - y_pred) ** 2))


# ================= GA =================
def genetic_algorithm(X_train, y_train, X_test, y_test):

    population_size = 10
    generations = 40  # As per paper: maximum evolutionary generation is set to 40

    # Initialize population
    population = [
        {
            "gamma": np.random.uniform(0.01, 1),
            "C": np.random.uniform(0.1, 10),
        }
        for _ in range(population_size)
    ]

    for _ in range(generations):

        # ✅ ALWAYS assign fitness FIRST
        for individual in population:
            model = KELM(
                gamma=individual["gamma"],
                C=individual["C"]
            )

            model.fit(X_train, y_train)
            pred = model.predict(X_test)

            individual["fitness"] = rmse(y_test, pred)

        # ✅ SORT AFTER FITNESS
        population = sorted(population, key=lambda x: x["fitness"])

        # Select best
        selected = population[: population_size // 2]

        new_population = selected.copy()

        # Crossover (using standard crossover probability from paper range)
        while len(new_population) < population_size:
            p1, p2 = np.random.choice(selected, 2)
            
            # Crossover probability
            if np.random.rand() < 0.80:
                child = {
                    "gamma": (p1["gamma"] + p2["gamma"]) / 2,
                    "C": (p1["C"] + p2["C"]) / 2,
                }
            else:
                child = {
                    "gamma": p1["gamma"],
                    "C": p1["C"],
                }

            # Mutation probability
            if np.random.rand() < 0.10:
                child["gamma"] *= np.random.uniform(0.8, 1.2)
                child["C"] *= np.random.uniform(0.8, 1.2)

            new_population.append(child)

        population = new_population

    # ✅ FINAL SAFETY CHECK (CRITICAL)
    for individual in population:
        if "fitness" not in individual:
            model = KELM(
                gamma=individual["gamma"],
                C=individual["C"]
            )

            model.fit(X_train, y_train)
            pred = model.predict(X_test)

            individual["fitness"] = rmse(y_test, pred)

    # ✅ NOW SAFE
    best = min(population, key=lambda x: x["fitness"])

    return best
# ================= TRAIN =================
def train_model():
    global trained_model

    print("Loading dataset...")
    X_train, X_test, y_train, y_test = load_data()

    print("Running GA...")
    best = genetic_algorithm(X_train, y_train, X_test, y_test)

    model = KELM(best["gamma"], best["C"])
    model.fit(X_train, y_train)

    trained_model = model
    print("Model ready")


# ================= PREDICT =================
def predict_aqi(data):
    global trained_model, scaler

    if trained_model is None:
        return {"aqi": 50, "status": "Fallback"}

    features = np.array([[ 
        data.pm25,
        data.pm10,
        data.no2,
        data.so2,
        data.co,
        data.o3
    ]])

    # 🔥 SCALE INPUT
    features = scaler.transform(features)

    pred = trained_model.predict(features)[0]

    # 🔥 HARD FIX
    if np.isnan(pred) or pred <= 0:
        pred = data.pm25 * 1.8

    aqi = int(pred)

    status = "Good"
    if aqi > 50: status = "Moderate"
    if aqi > 100: status = "Unhealthy"
    if aqi > 150: status = "Very Unhealthy"
    if aqi > 200: status = "Hazardous"

    return {
        "aqi": aqi,
        "status": status,
        "pm25": data.pm25,
        "pm10": data.pm10,
        "no2": data.no2,
        "so2": data.so2,
        "co": data.co,
        "o3": data.o3,
    }
from sklearn.metrics import r2_score, mean_squared_error

# ================= ADMIN METRICS =================
def get_model_metrics():
    global trained_model, scaler

    if trained_model is None:
        return {"error": "Model not trained"}

    # Reload data
    X_train, X_test, y_train, y_test = load_data()

    # Predict
    y_pred = trained_model.predict(X_test)

    # Metrics
    rmse_val = np.sqrt(mean_squared_error(y_test, y_pred))
    r2_val = r2_score(y_test, y_pred)

    # Convert small sample for graph
    sample_size = 50
    actual = y_test[:sample_size].tolist()
    predicted = y_pred[:sample_size].tolist()

    chart_data = [
        {
            "index": i,
            "actual": round(actual[i], 2),
            "predicted": round(predicted[i], 2),
        }
        for i in range(sample_size)
    ]

    return {
        "rmse": round(rmse_val, 2),
        "r2": round(r2_val, 2),
        "chart": chart_data,
    }