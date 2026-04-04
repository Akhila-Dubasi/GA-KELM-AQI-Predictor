import { useState, useMemo } from "react";
import Navbar from "../components/Navbar";
import ReactCountryFlag from "react-country-flag";

/* 🌍 DATA (TOP 50 SAMPLE — extend to 100 if needed) */
const rawData = [
  { country: "Bangladesh", code: "BD", aqi: 172, continent: "Asia", stations: 45 },
  { country: "Pakistan", code: "PK", aqi: 165, continent: "Asia", stations: 38 },
  { country: "India", code: "IN", aqi: 154, continent: "Asia", stations: 2782 },
  { country: "Tajikistan", code: "TJ", aqi: 152, continent: "Asia", stations: 12 },
  { country: "Iraq", code: "IQ", aqi: 145, continent: "Asia", stations: 20 },
  { country: "UAE", code: "AE", aqi: 142, continent: "Asia", stations: 50 },
  { country: "Nepal", code: "NP", aqi: 140, continent: "Asia", stations: 25 },
  { country: "Egypt", code: "EG", aqi: 138, continent: "Africa", stations: 33 },
  { country: "Indonesia", code: "ID", aqi: 135, continent: "Asia", stations: 60 },
  { country: "China", code: "CN", aqi: 132, continent: "Asia", stations: 500 },
  { country: "Vietnam", code: "VN", aqi: 130, continent: "Asia", stations: 120 },
  { country: "Iran", code: "IR", aqi: 128, continent: "Asia", stations: 95 },
  { country: "Thailand", code: "TH", aqi: 126, continent: "Asia", stations: 814 },
  { country: "Mexico", code: "MX", aqi: 124, continent: "America", stations: 150 },
  { country: "Turkey", code: "TR", aqi: 122, continent: "Europe", stations: 200 },
  { country: "Peru", code: "PE", aqi: 120, continent: "America", stations: 90 },
  { country: "Colombia", code: "CO", aqi: 118, continent: "America", stations: 110 },
  { country: "South Korea", code: "KR", aqi: 115, continent: "Asia", stations: 668 },
  { country: "Philippines", code: "PH", aqi: 112, continent: "Asia", stations: 80 },
];

/* 🎯 HELPERS */
const getStatus = (aqi) => {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Poor";
  return "Unhealthy";
};

const getColor = (aqi) => {
  if (aqi <= 50) return "#22c55e";
  if (aqi <= 100) return "#eab308";
  if (aqi <= 150) return "#f97316";
  return "#ef4444";
};

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);

  const pageSize = 8;

  /* 🔥 FILTER + SORT */
  const filtered = useMemo(() => {
    let data = rawData.filter((item) =>
      item.country.toLowerCase().includes(search.toLowerCase())
    );

    data.sort((a, b) =>
      sortDesc ? b.aqi - a.aqi : a.aqi - b.aqi
    );

    return data.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [search, sortDesc]);

  /* 📄 PAGINATION */
  const paginated = filtered.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const totalPages = Math.ceil(filtered.length / pageSize);

  return (
    <div className="container">
      <Navbar />

      <div className="card">
        <h2>🌍 World's Most Polluted Countries</h2>

        {/* 🔗 REPORT LINK */}
        <p style={{ color: "#94a3b8" }}>
          Source: IQAir Global Air Quality Report  
          👉{" "}
          <a
            href="https://www.iqair.com/world-most-polluted-countries"
            target="_blank"
            style={{ color: "#00e5ff" }}
          >
            View Full Report
          </a>
        </p>

        {/* 🔍 SEARCH + SORT */}
        <div style={{ display: "flex", gap: "10px", margin: "15px 0" }}>
          <input
            placeholder="Search country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <button onClick={() => setSortDesc(!sortDesc)}>
            Sort {sortDesc ? "↓ High AQI" : "↑ Low AQI"}
          </button>
        </div>

        {/* TABLE */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderSpacing: "0 10px" }}>
            <thead>
              <tr style={{ color: "#94a3b8" }}>
                <th>#</th>
                <th>Country</th>
                <th>AQI</th>
                <th>Status</th>
                <th>Continent</th>
                <th>Stations</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((item) => (
                <tr
                  key={item.rank}
                  style={{
                    background: "#1e2a47",
                    transition: "0.3s",
                  }}
                >
                  <td>{item.rank}</td>

                  <td style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <ReactCountryFlag
                      countryCode={item.code}
                      svg
                      style={{ width: "20px", height: "20px" }}
                    />
                    {item.country}
                  </td>

                  <td>
                    <span
                      style={{
                        background: getColor(item.aqi),
                        padding: "6px 12px",
                        borderRadius: "8px",
                        color: "black",
                      }}
                    >
                      {item.aqi}
                    </span>
                  </td>

                  <td style={{ color: getColor(item.aqi) }}>
                    {getStatus(item.aqi)}
                  </td>

                  <td>{item.continent}</td>
                  <td>{item.stations}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 📄 PAGINATION */}
        <div style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            Prev
          </button>

          <span>Page {page} / {totalPages}</span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}