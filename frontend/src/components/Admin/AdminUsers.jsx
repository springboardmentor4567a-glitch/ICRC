import React, { useEffect, useState } from 'react';
import { listUsers, banUser, unbanUser, getUserFullProfile } from '../../adminApi';
import AdminHeader from './AdminHeader';
import './admin.css';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [banTarget, setBanTarget] = useState(null); 
  
  // ✅ FIX: Removed unused 'loadingProfile' state
  const [selectedProfile, setSelectedProfile] = useState(null);

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

  const openUserProfile = async (user) => {
      // ✅ FIX: Removed setLoadingProfile calls
      const data = await getUserFullProfile(user.id);
      if (data) {
          setSelectedProfile(data);
      } else {
          alert("Failed to load user profile");
      }
  };

  return (
    <div className="admin-container">
      <AdminHeader title="User Registry" active="users" />
      
      <div className="table-card">
          <table className="admin-table">
              <thead><tr><th>Name</th><th>Role</th><th>Status</th><th>Risk</th><th>Actions</th></tr></thead>
              <tbody>
                  {users.map(u => (
                      <tr key={u.id}>
                          <td className="user-cell">
                              <div style={{fontWeight:600}}>{u.name}</div>
                              <div style={{fontSize:'0.8rem', color:'#64748b'}}>{u.email}</div>
                          </td>
                          <td>{u.is_admin ? <span className="status-pill submitted">Admin</span> : 'User'}</td>
                          <td>{u.is_banned ? <span className="status-pill rejected">Banned</span> : <span className="status-pill approved">Active</span>}</td>
                          
                          <td>
                              {u.has_fraud ? (
                                  <span className="risk-badge critical">⚠️ High Risk</span>
                              ) : (
                                  <span className="risk-badge safe">✅ Clean</span>
                              )}
                          </td>
                          
                          <td style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                              <button className="btn small secondary" onClick={() => openUserProfile(u)}>
                                  👤 View 360°
                              </button>

                              {!u.is_banned ? (
                                  <button className="btn-delete" disabled={u.is_admin} onClick={() => setBanTarget(u)}>
                                      Ban
                                  </button>
                              ) : (
                                  <button className="btn small primary" onClick={() => handleUnban(u.id)}>Unban</button>
                              )}
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>

      {/* --- 👤 360 DEGREE PROFILE MODAL --- */}
      {selectedProfile && (
          <div className="modal-overlay" onClick={() => setSelectedProfile(null)}>
              <div className="case-file-modal" style={{height:'auto', maxHeight:'90vh'}} onClick={e => e.stopPropagation()}>
                  <div className="case-header">
                      <div className="case-title">
                          <h3>{selectedProfile.personal.name}</h3>
                          <span style={{fontSize:'0.9rem', color:'#64748b'}}>{selectedProfile.personal.email}</span>
                      </div>
                      <button className="close-icon-btn" onClick={() => setSelectedProfile(null)}>✕</button>
                  </div>

                  <div className="case-body-grid" style={{gridTemplateColumns:'1fr 1fr'}}>
                      <div className="case-column main-col">
                          <div className="data-widget">
                              <h4 className="widget-title">Risk Profile</h4>
                              <div style={{display:'flex', alignItems:'center', gap:'20px'}}>
                                  <div style={{fontSize:'2.5rem', fontWeight:800, color: selectedProfile.risk.score > 50 ? '#ef4444' : '#10b981'}}>
                                      {selectedProfile.risk.score}%
                                  </div>
                                  <div>
                                      <div><strong>Risk Score</strong></div>
                                      <div style={{color:'#64748b', fontSize:'0.9rem'}}>Calculated based on age, income & claims.</div>
                                  </div>
                              </div>
                              <div className="detail-grid" style={{marginTop:'15px'}}>
                                  <div className="info-box"><label>Age</label><p>{selectedProfile.risk.profile?.age || 'N/A'}</p></div>
                                  <div className="info-box"><label>Income</label><p>₹{(selectedProfile.risk.profile?.income || 0).toLocaleString()}</p></div>
                              </div>
                          </div>

                          <div className="data-widget">
                              <h4 className="widget-title">Activity Stats</h4>
                              <div className="detail-grid">
                                  <div className="info-box"><label>Total Claims</label><p>{selectedProfile.stats.total_claims}</p></div>
                                  <div className="info-box"><label>Rejected</label><p style={{color:'#ef4444'}}>{selectedProfile.stats.rejected_claims}</p></div>
                                  <div className="info-box"><label>Active Policies</label><p>{selectedProfile.stats.active_policies}</p></div>
                                  <div className="info-box"><label>Joined</label><p>{selectedProfile.personal.joined_at}</p></div>
                              </div>
                          </div>
                      </div>

                      <div className="case-column side-col">
                         <div className="data-widget">
                             <h4 className="widget-title">Admin Notes</h4>
                             <p style={{color:'#64748b', fontSize:'0.9rem', fontStyle:'italic'}}>
                                 No manual notes added for this user yet.
                             </p>
                         </div>
                         <div className="action-stack">
                             <button className="btn secondary full-width" onClick={() => setSelectedProfile(null)}>Close Profile</button>
                         </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* BAN CONFIRMATION MODAL */}
      {banTarget && (
          <div className="modal-overlay">
              <div className="mini-modal">
                  <h3>Ban {banTarget.name}?</h3>
                  <p>Are you sure? This will log them out immediately.</p>
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