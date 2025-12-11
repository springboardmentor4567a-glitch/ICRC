import React, { useEffect, useState } from "react";

export default function Home() {
  const [message, setMessage] = useState("Loading...");
  const [email, setEmail] = useState("");

  const fetchHome = async () => {
    const token = localStorage.getItem("access_token");

    let res = await fetch("http://127.0.0.1:8000/home", {
      headers: { "token": token }
    });

    let data = await res.json();

    // If token expired -> try refresh token
    if (data.detail === "Token expired or invalid") {
      await refreshToken();
      return fetchHome(); // retry again after refresh
    }

    setMessage(data.message);
    setEmail(data.email);
  };

  const refreshToken = async () => {
    const refresh = localStorage.getItem("refresh_token");
    if (!refresh) return logout();

    let res = await fetch("http://127.0.0.1:8000/refresh", {
      method: "POST",
      headers: { "refresh_token": refresh }
    });

    let data = await res.json();

    if (data.access_token) {
      localStorage.setItem("access_token", data.access_token);
    } else {
      logout();
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.location.href = "/login";
  };

  useEffect(() => { fetchHome(); });

  return (
    <div style={{textAlign:"center", marginTop:"90px"}}>
      <h1 style={{color:"#0E6FF7", fontSize:"32px", fontWeight:"bold"}}>
        Insurance Comparison, Recommendation & Claim Assistant
      </h1>

      <h2 style={{color:"#22c55e", marginTop:"20px"}}>
        {message} {email && `👋 ${email}`}
      </h2>

      <p style={{fontSize:"20px", marginTop:"15px", color:"#5A5A5A"}}>
        Compare Policies | Get Recommendations | File Claims Easily 📄🛡️💰
      </p>

      <button 
        onClick={logout} 
        style={{
          marginTop:"30px",
          padding:"10px 20px",
          background:"#ff4757",
          color:"white",
          border:"none",
          borderRadius:"5px",
          cursor:"pointer",
          fontSize:"16px"
        }}>
        Logout 🚪
      </button>
    </div>
  );
}
