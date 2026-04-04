import { useState } from "react";
import axios from "axios";

export default function Admin() {
  const [loggedIn, setLoggedIn] = useState(false);

  const login = async () => {
    const res = await axios.post("http://localhost:5000/admin/login", {
      username: "admin",
      password: "admin123",
    });

    if (res.data.success) setLoggedIn(true);
  };

  if (!loggedIn) {
    return (
      <div style={{ padding: "20px" }}>
        <h2>Admin Login</h2>
        <button onClick={login}>Login</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Dashboard</h1>

      <button onClick={() => alert("Upload Dataset")}>
        Upload Dataset
      </button>

      <button onClick={() => alert("Train Model")}>
        Train Model
      </button>
    </div>
  );
}