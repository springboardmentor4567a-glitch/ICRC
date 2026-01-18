import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();
  const name = localStorage.getItem("loggedInUser");

  const logout = () => {
    localStorage.removeItem("loggedInUser");
    navigate("/login");
  };

  return (
    <div>
      <div style={{ padding: "20px", display: "flex", justifyContent: "space-between" }}>
        <div>
          <h2>Insurance Platform</h2>
          <p>Welcome back, {name}!</p>
        </div>
        <button className="btn secondary" onClick={logout}>Logout</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "20px", padding: "20px" }}>
        {[
          { title: "Policy Comparison", color: "#2ecc71" },
          { title: "Premium Calculator", color: "#3498db" },
          { title: "Get Recommendations", color: "#e67e22" },
          { title: "File a Claim", color: "#9b59b6" },
          { title: "Track Claims", color: "#e84393" }
        ].map((item, i) => (
          <div key={i} style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "12px",
            boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
            textAlign: "center"
          }}>
            <h3>{item.title}</h3>
            <button className="btn" style={{ background: item.color, color: "#fff" }}>
              Access →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Welcome;
