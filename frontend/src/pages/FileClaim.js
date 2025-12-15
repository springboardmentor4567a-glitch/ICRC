import React, { useState } from "react";

export default function FileClaim() {
  const [name, setName] = useState("");
  const [policyId, setPolicyId] = useState("");
  const [reason, setReason] = useState("");
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");

  const submitClaim = (e) => {
    e.preventDefault();

    if (!name || !policyId || !reason) return setMessage("⚠ Please fill all fields");
    if (!file) return setMessage("📄 Upload required document");

    setMessage("✔ Claim submitted successfully!");
  };

  return (
    <div style={{ textAlign:"center", color:"white", paddingTop:"60px" }}>
      <h1 style={{color:"#7c3aed", fontSize:"28px", marginBottom:"10px"}}>
        Claim Assistant 📁
      </h1>
       <p className="page-desc">
      Submit claim details and upload required documents for faster processing
    </p>

      <p style={{marginBottom:"30px", opacity:0.8}}>
        Submit Insurance Claim Documents & Reason
      </p>

      <form onSubmit={submitClaim} style={{
        width:"400px",
        margin:"auto",
        background:"#1a1a2e",
        padding:"25px",
        borderRadius:"12px",
        boxShadow:"0 0 15px #7c3aed"
      }}>
        
        {message && <p style={{color:"yellow"}}>{message}</p>}

        <input className="input-box" placeholder="Full Name"
          value={name} onChange={(e)=>setName(e.target.value)} required/>

        <input className="input-box" placeholder="Policy Number"
          value={policyId} onChange={(e)=>setPolicyId(e.target.value)} required/>

        <textarea className="input-box" placeholder="Reason for Claim"
          style={{height:"90px"}}
          value={reason} onChange={(e)=>setReason(e.target.value)} required/>

        <input type="file" onChange={(e)=>setFile(e.target.files[0])}
          style={{margin:"10px 0", color:"#ccc"}}/>

        <button className="btn-purple" type="submit">Submit Claim</button>
      </form>
    </div>
  );
}
