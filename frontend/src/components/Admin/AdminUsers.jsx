import React, { useEffect, useState } from 'react';
import { listUsers, banUser, unbanUser } from '../../adminApi';
import AdminHeader from './AdminHeader';
import './admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [banTarget, setBanTarget] = useState(null); 

  useEffect(() => { load(); }, []);
  const load = async () => {
    const u = await listUsers();
    setUsers(u || []);
  };

  const confirmBan = async () => {
      if(!banTarget) return;
      const res = await banUser(banTarget.id);
      if (res && res.message) { load(); setBanTarget(null); } 
      else { alert('Failed to ban user'); }
  };

  const handleUnban = async (id) => {
    await unbanUser(id);
    load();
  };

  return (
    <div className="admin-container">
      <AdminHeader />
      <div className="table-card">
          <table className="admin-table">
              <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Fraud Risk</th><th>Actions</th></tr></thead>
              <tbody>
                  {users.map(u => (
                      <tr key={u.id}>
                          <td className="user-cell"><div>{u.name}</div><div style={{fontSize:'0.8rem', color:'#64748b'}}>{u.email}</div></td>
                          <td>{u.is_admin ? <span className="status-pill submitted">Admin</span> : 'User'}</td>
                          <td>{u.is_banned ? <span className="status-pill rejected">Banned</span> : <span className="status-pill approved">Active</span>}</td>
                          
                          {/* ✅ DYNAMIC RISK STATUS (Red/Green based on Active Flags) */}
                          <td>
                              {u.has_fraud ? (
                                  <span className="risk-badge critical">⚠️ Flagged</span>
                              ) : (
                                  <span className="risk-badge safe">✅ Clean</span>
                              )}
                          </td>
                          
                          <td>
                              {!u.is_banned ? (
                                  <button className="btn-delete" disabled={!u.has_fraud && !u.is_admin} onClick={() => setBanTarget(u)}>
                                      BAN USER
                                  </button>
                              ) : (
                                  <button className="btn small secondary" onClick={() => handleUnban(u.id)}>Unban</button>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {banTarget && (
          <div className="modal-overlay">
              <div className="mini-modal">
                  <h3>Ban {banTarget.name}?</h3>
                  <p>Are you sure you want to ban this user? They will be logged out immediately.</p>
                  <div className="mini-modal-actions">
                      <button className="btn secondary" onClick={() => setBanTarget(null)}>Cancel</button>
                      <button className="btn danger" onClick={confirmBan}>Confirm Ban</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default AdminUsers;