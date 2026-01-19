import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirm) {
      setError("Passwords do not match ❌");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, phone, password, confirm }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Registration Failed ❌");
        return;
      }

      setSuccess(
  <span style={{ color: "#058333", fontWeight: "600" }}>
    Registration Successful ✔ Redirecting...
  </span>
);

      setTimeout(() => navigate("/login"), 1500);

    } catch {
      setError("⚠ Backend Server Not Reachable");
    }
  };

  return (
    <>
      {/* Heading */}
      <h1 style={{
        textAlign:"center",
        marginTop:"40px",
        marginBottom:"20px",
        fontSize:"32px",
        fontWeight:"bold",
        color:"black",
      }}>
        Insurance Comparison, Recommendation & Claim Assistant
      </h1>

      <div className="center-box">
        <form onSubmit={submit} className="form-card">
          <h2 style={{marginBottom:"10px",color:"black"}}>Create Account</h2>

          {error && <p className="msg-error">{error}</p>}
          {success && <p className="msg-success">{success}</p>}

          <input className="input-box" type="text" placeholder="Full Name"
            value={full_name} onChange={(e)=>setFullName(e.target.value)} required />

          <input className="input-box" type="email" placeholder="Email"
            value={email} onChange={(e)=>setEmail(e.target.value)} required />

          <input className="input-box" type="text" placeholder="Phone"
            value={phone} onChange={(e)=>setPhone(e.target.value)} />

          <input className="input-box" type="password" placeholder="Password"
            value={password} onChange={(e)=>setPassword(e.target.value)} required />

          <input className="input-box" type="password" placeholder="Confirm Password"
            value={confirm} onChange={(e)=>setConfirm(e.target.value)} required />

          <div className="form-actions">
            <button className="btn-purple">Create Account</button>
            </div>


          <p style={{marginTop:"12px",color:"black"}}>
            Already have an account? <a href="/login" style={{color:"black",fontWeight: "600"}}>Login</a>
          </p>
        </form>
      </div>
    </>
  );
}
