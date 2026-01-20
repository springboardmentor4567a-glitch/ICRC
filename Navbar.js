import { useLocation } from "react-router-dom";

const Navbar = ({ isLoggedIn, handleLogout }) => {
  const location = useLocation();

  const hideAuthButtons =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  return (
    <div className="navbar">
      {!hideAuthButtons && isLoggedIn && (
        <button onClick={handleLogout}>Logout</button>
      )}
    </div>
  );
};

export default Navbar;

