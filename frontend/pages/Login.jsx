import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
  e.preventDefault();
  alert("JWT LOGIN CODE RUNNING"); // 👈 ADD THIS

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.detail || "Login failed");
        return;
      }

      // ✅ STORE TOKENS (FOR DEVTOOLS → APPLICATION)
      localStorage.setItem("login_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("token_type", "JWT");

      // Optional: store user name for welcome page
      localStorage.setItem("loggedInUser", data.user.name);

      navigate("/welcome");
    } catch (err) {
      setError("Backend not reachable");
    }
  };

  return (
    <div className="app-container">
      <h1 className="project-title">
        Insurance Comparison, Recommendation & Claim Assistant
      </h1>

      <div className="card">
        <h2>LOGIN</h2>

        {error && <p className="error-text">{error}</p>}

        <form className="form" onSubmit={handleLogin}>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button className="btn primary">LOGIN</button>
        </form>
      </div>
    </div>
  );
}

export default Login;
