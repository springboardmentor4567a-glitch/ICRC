import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = (e) => {
    e.preventDefault();

    // save user in localStorage (mock DB)
    localStorage.setItem(
      "user",
      JSON.stringify({ name, email, password })
    );

    setMessage("Registered successfully ✅");

    // redirect to login after 1 second
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  };

  return (
    <div className="app-container">
      <h1 className="project-title">
        Insurance Comparison, Recommendation & Claim Assistant
      </h1>

      <div className="card">
        <h2>REGISTER</h2>

        {message && <p style={{ color: "green" }}>{message}</p>}

        <form className="form" onSubmit={handleRegister}>
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />

          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          <button className="btn primary">Create Account</button>
        </form>

        <p className="switch-text">
          Already a member?{" "}
          <button className="link-button" onClick={() => navigate("/login")}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}

export default Register;
