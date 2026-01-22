import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const auth = localStorage.getItem("adminAuth");
  return auth ? children : <Navigate to="/" />;
}

export default ProtectedRoute;
