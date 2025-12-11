import React from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div style={{
      textAlign:"center",
      marginTop:"60px"
    }}>
      <h1 style={{fontSize:"30px", color:"#6C63FF", fontWeight:"bold"}}>
        Welcome to Insurance Dashboard 🛡️
      </h1>

      <p style={{fontSize:"20px", marginTop:"8px", color:"#41eb77ff"}}>
        Choose an option below to continue👇
      </p>

      <div style={{
        display:"flex",
        justifyContent:"center",
        gap:"20px",
        marginTop:"40px"
      }}>
        <button className="dash-btn" onClick={()=>navigate("/plans")}>
          📄 Insurance Plans
        </button>

        <button className="dash-btn" onClick={()=>navigate("/recommend")}>
          🤖 Get Recommendations
        </button>

        <button className="dash-btn" onClick={()=>navigate("/claims")}>
          📝 File Claim
        </button>
      </div>

      <button 
        onClick={logout} 
        style={{
          marginTop:"50px",
          padding:"10px 20px",
          background:"#ff4757",
          color:"white",
          border:"none",
          borderRadius:"5px",
          cursor:"pointer"
        }}>
        Logout 🚪
      </button>
    </div>
  );
}
