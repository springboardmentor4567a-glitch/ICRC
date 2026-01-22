function Sidebar() {
  const logout = () => {
    localStorage.removeItem("adminAuth");
    window.location.href = "/";
  };

  return (
    <div className="sidebar">
      <h2>Admin Panel</h2>

      <ul>
        <li>Dashboard</li>
        <li>Claims Management</li>
        <li>Policies</li>
        <li>Users</li>
        <li onClick={logout} className="logout">Logout</li>
      </ul>
    </div>
  );
}

export default Sidebar;
