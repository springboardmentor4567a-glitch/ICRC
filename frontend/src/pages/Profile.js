import React, { useEffect, useState } from "react";

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");

    fetch("http://127.0.0.1:8000/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(setUser);
  }, []);

  if (!user) return null;

  const avatarLetter =
    user.name?.charAt(0).toUpperCase() ||
    user.email?.charAt(0).toUpperCase();

  return (
    <div className="profile-page">
      <div className="profile-card">
        
        <div className="profile-header">
          <div className="profile-avatar-big">{avatarLetter}</div>
          <h2>{user.name || "User"}</h2>
          <p>{user.email}</p>
        </div>

        <div className="profile-grid">
          <div><span>📞 Phone</span><p>{user.phone || "1234567890"}</p></div>
          <div><span> Age</span><p>{user.age || "50"}</p></div>
          <div><span>🏠 City</span><p>{user.city || "—"}</p></div>
          <div><span>⚠️ Risk Level</span><p>{user.risk || "Medium"}</p></div>
          <div><span>❤️ Policy Type</span><p>{user.policy_type || "Health"}</p></div>
          <div><span>💰 Coverage</span><p>₹{user.coverage || "5,00,000"}</p></div>
        </div>

        <div className="profile-actions">
          <button className="btn-outline">Edit Profile</button>
        </div>

      </div>
    </div>
  );
}
