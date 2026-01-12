import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    fetch("http://127.0.0.1:8000/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setUser)
      .catch(() => {});
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  // ✅ show back button except dashboard
  const showBack = location.pathname !== "/dashboard";

  // ✅ avatar first letter
  const avatarLetter =
    user?.name?.charAt(0).toUpperCase() ||
    user?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <header className="app-header">
      {/* LEFT SIDE */}
      <div className="header-left">
        <div className="logo" onClick={() => navigate("/dashboard")}>
          ICRC
        </div>

        {showBack && (
          <button className="back-btn" onClick={() => navigate(-1)}>
            ← Back
          </button>
        )}
      </div>

      {/* RIGHT SIDE */}
      <div className="profile-wrapper">
        <div
          className="profile-avatar"
          onClick={() => setOpen(!open)}
        >
          {avatarLetter}
        </div>

        {open && (
          <div className="profile-dropdown">
            <p className="profile-email">{user?.email}</p>

            <button
              className="dropdown-btn"
              onClick={() => navigate("/profile")}
            >
              View Profile
            </button>

            <button
              className="dropdown-btn logout"
              onClick={logout}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
