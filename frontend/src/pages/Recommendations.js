import React, { useState } from "react";

export default function Recommendations() {
  const [age, setAge] = useState("");
  const [salary, setSalary] = useState("");
  const [type, setType] = useState("");
  const [result, setResult] = useState("");

  const recommend = () => {
    if(type === "health") setResult("Recommended: ⭐ Star Health Family Optima / Max Bupa Health Insurance");
    else if(type === "life") setResult("Recommended: 🛡 LIC Jeevan Anand / HDFC Life Protect Plan");
    else if(type === "vehicle") setResult("Recommended: 🚗 Tata AIG Vehicle Insurance / Bajaj Allianz Motor Insurance");
    else setResult("Enter valid details to get recommendation.");
  };

  return (
    <div style={{ textAlign:"center", paddingTop:"40px", color:"white" }}>
      <h1 style={{ color:"#9d4edd", fontSize:"30px" }}>Get Recommendations 🤝</h1>
       <p className="page-desc">
      Provide your details to receive the most suitable insurance plans
    </p>
      <p style={{ color:"#a6e3a1" }}>Fill your details & get best policy suggestions</p>

      <div style={{
        width:"40%", margin:"30px auto", background:"#1e1e2f", padding:"30px",
        borderRadius:"10px", boxShadow:"0 0 15px #6a0dad"
      }}>
        <input className="input-box" placeholder="Your Age"
          value={age} onChange={(e)=>setAge(e.target.value)} />
        
        <input className="input-box" placeholder="Monthly Salary"
          value={salary} onChange={(e)=>setSalary(e.target.value)} />

        <select className="input-box" value={type} onChange={(e)=>setType(e.target.value)}>
          <option value="">Select Policy Type</option>
          <option value="health">Health Insurance</option>
          <option value="life">Life Insurance</option>
          <option value="vehicle">Vehicle Insurance</option>
        </select>

        <button className="btn-purple" onClick={recommend}>Get Recommendation</button>

        {result && (
          <p style={{
            color:"yellow", fontWeight:"bold", marginTop:"15px",
            background:"#2a2a3d", padding:"12px", borderRadius:"8px"
          }}>
            {result}
          </p>
        )}
      </div>
    </div>
  );
}
