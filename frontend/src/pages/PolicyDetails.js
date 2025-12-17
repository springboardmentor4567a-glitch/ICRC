import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function PolicyDetails() {
  const { id } = useParams();
  const [policy, setPolicy] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/policies/${id}`)
      .then(r => r.json())
      .then(d => setPolicy(d))
      .catch(() => setPolicy(null));
  }, [id]);

  if (!policy) return <div style={{textAlign:"center", marginTop:40}}>Loading...</div>;

  return (
    <div style={{padding:28, maxWidth:800, margin:"10 auto"}}>
      <button className="btn-outline" onClick={()=>navigate(-1)}>Back</button>
      <h2 style={{color:"#6C63FF", marginTop:12}}>{policy.name}</h2>
      <p><b>Provider:</b> {policy.provider?.name ?? policy.provider_id}</p>
      <p><b>Coverage:</b> {policy.coverage}</p>
      <p><b>Premium:</b> ₹{policy.premium}</p>
      <p><b>Benefits:</b><br/>{policy.benefits}</p>
      <p><b>Policy Code:</b> {policy.policy_number}</p>
    </div>
  );
}
