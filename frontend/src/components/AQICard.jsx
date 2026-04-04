export default function AQICard({ data }) {
  if (!data) {
    return (
      <div className="card big-card">
        <h2>Search a city or click on map</h2>
      </div>
    );
  }

  const getColor = (aqi) => {
    if (aqi <= 50) return "#22c55e";
    if (aqi <= 100) return "#eab308";
    if (aqi <= 150) return "#f97316";
    if (aqi <= 200) return "#ef4444";
    return "#7e22ce";
  };

  const getMessage = (aqi) => {
    if (aqi <= 50) return "Air quality is excellent 🌿";
    if (aqi <= 100) return "Moderate air quality 🙂";
    if (aqi <= 150) return "Limit outdoor activity ⚠️";
    if (aqi <= 200) return "Unhealthy air 🚫";
    return "Hazardous 🚨";
  };

  return (
    <div className="card big-card">
      <div>
        <h1 style={{ fontSize: "60px", color: getColor(data.aqi) }}>
          {data.aqi || "--"}
        </h1>
        <p>{data.status}</p>
      </div>

      <div>
        <h3>Recommendation</h3>
        <p>{getMessage(data.aqi)}</p>
      </div>
    </div>
  );
}