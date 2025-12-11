import React from "react";

export default function InsurancePlans() {
  const plans = [
    { name: "LIC Jeevan Anand", policy_no: "LIC984523", coverage: "Life + Maturity", premium: "₹12,000/year" },
    { name: "HDFC Life Sanchay Plus", policy_no: "HDFC778899", coverage: "Wealth & Life", premium: "₹18,000/year" },
    { name: "Tata AIA Smart Protect", policy_no: "TATA557733", coverage: "Life Insurance", premium: "₹8,500/year" },
    { name: "Star Health Family Optima", policy_no: "STAR444221", coverage: "Health Cover", premium: "₹14,000/year" }
  ];

  return (
    <div style={{ textAlign: "center", paddingTop: "40px", color: "white" }}>
      <h1 style={{ color: "#9d4edd", fontSize: "30px", marginBottom: "10px" }}>
        Insurance Plans 📄
      </h1>
      <p style={{ color: "#a6e3a1", marginBottom: "30px" }}>
        Explore Available Policies & Benefits
      </p>

      <div style={{ width:"60%", margin:"auto", background:"#1e1e2f",
        padding:"30px", borderRadius:"10px", boxShadow:"0 0 15px #6a0dad" }}>

        {plans.map((p,i)=>(
          <div key={i} style={{
            background:"#2a2a3d", padding:"15px", margin:"10px 0",
            borderRadius:"8px", textAlign:"left", color:"white"
          }}>
            <h3 style={{color:"#c77dff"}}>{p.name}</h3>
            <p><b>Policy Number:</b> {p.policy_no}</p>
            <p><b>Coverage:</b> {p.coverage}</p>
            <p><b>Premium:</b> {p.premium}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
