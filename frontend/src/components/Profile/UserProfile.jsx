import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserDashboard, cancelUserPolicy } from '../../api.js';
import './UserProfile.css';

// --- ICONS ---
const Icon = {
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  FileText: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>,
  Star: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Home: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Settings: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Download: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
  Eye: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
  Refresh: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>,
  Check: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  X: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
  Sparkles: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L12 3Z"/></svg>,
  ChevronRight: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>,
  Alert: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,
  Trash: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>,
  Info: () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>,
};

const UserProfile = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('policies');
  
  // --- MODAL STATES ---
  const [trackingClaim, setTrackingClaim] = useState(null);
  const [cancelModal, setCancelModal] = useState(null); // { policy, type: 'warning' | 'danger' }
  const [renewModal, setRenewModal] = useState(null);
  const [detailsModal, setDetailsModal] = useState(null);
  const [isRenewing, setIsRenewing] = useState(false);

  // Recommendations Mock
  const mockRecs = [
    { id: 101, title: 'Family Health Plus', match: 98, premium: 5400, reason: 'Best coverage for family', features: ['Cashless', 'No room limit'] },
    { id: 102, title: 'Term Life Secure Pro', match: 92, premium: 8200, reason: 'High coverage amount', features: ['Tax benefits', 'Critical illness'] },
    { id: 103, title: 'Travel Elite Global', match_score: 88, premium: 1200, reason: 'Popular in your region', features: ['Lost baggage', 'Trip cancel'] },
  ];

  const loadData = useCallback(async () => {
    try {
        const token = localStorage.getItem('access_token');
        if (!token) { navigate('/login'); return; }
        
        const dashboardRes = await getUserDashboard();
        
        // --- SAFEGUARD: MOCK DATA INJECTION ---
        // Ensure policies have details needed for the new modals
        if(dashboardRes && dashboardRes.policies) {
            dashboardRes.policies = dashboardRes.policies.map(p => ({
                ...p,
                start_date: p.start_date || '2023-01-15',
                end_date: p.expiry_date || '2024-01-15',
                agent: 'InsureZ Direct',
                features: p.features || ['No Claim Bonus Protection', '24x7 Roadside Assistance', 'Zero Depreciation'],
                description: 'This comprehensive policy covers accidental damages, theft, and third-party liabilities with zero depreciation add-on.'
            }));
        }

        if (dashboardRes) setData(dashboardRes);
        else navigate('/login');
    } catch (e) {
        console.error("Profile Error", e);
    } finally {
        setLoading(false);
    }
  }, [navigate]);

  useEffect(() => { loadData(); }, [loadData]);

  // Actions
  const generatePDF = (policy) => {
    if(!policy) return;
    const premium = policy.premium_amount || 0;
    const tax = premium * 0.18;

    const win = window.open('', '', 'height=800,width=800');
    if (!win) return;
    win.document.write(`
      <html><head><title>Invoice ${policy.policy_number}</title>
      <style>body{font-family:sans-serif;padding:40px;color:#1e293b}h1{border-bottom:2px solid #000} .row{display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #eee}</style></head>
      <body><h1>INSUREZ INVOICE</h1>
      <div style="background:#f8fafc;padding:20px;border-radius:10px;margin:20px 0">
        <p><strong>Bill To:</strong> ${data?.user?.name}</p><p><strong>Policy:</strong> ${policy.title}</p>
      </div>
      <div class="row"><span>Premium</span><strong>₹${premium.toLocaleString()}</strong></div>
      <div class="row"><span>GST (18%)</span><strong>₹${tax.toFixed(2)}</strong></div>
      <h3 style="text-align:right">Total: ₹${premium.toLocaleString()}</h3>
      <script>window.print()</script></body></html>
    `);
    win.document.close();
  };

  const handleBuy = (id) => navigate('/calculator', { state: { selectedPlanId: id } });

  // --- SMART CANCEL LOGIC ---
  const initiateCancel = (policy) => {
    // Check for active claims related to this policy (Submitted or Under Review)
    const activeClaim = data.recent_claims?.find(
        c => c.policy === policy.title && ['Submitted', 'Under Review'].includes(c.status)
    );

    if (activeClaim) {
        // RED WARNING: Active claim exists
        setCancelModal({ policy, type: 'danger', activeClaimId: activeClaim.claim_number });
    } else {
        // YELLOW WARNING: No active claim, standard cancel
        setCancelModal({ policy, type: 'warning' });
    }
  };

  const confirmCancel = async () => {
    if (!cancelModal) return;
    try {
        await cancelUserPolicy(cancelModal.policy.id);
        setCancelModal(null);
        alert(`Policy ${cancelModal.policy.policy_number} cancelled.`);
        loadData(); 
    } catch (error) {
        alert("Failed to cancel policy.");
    }
  };

  const handleRenewalSubmit = () => {
    setIsRenewing(true);
    setTimeout(() => {
        setIsRenewing(false);
        setRenewModal(null);
        alert('Renewal Successful! Policy active for another year.');
    }, 2000);
  };

  if (loading) return <div className="loading-screen">Loading...</div>;
  if (!data?.user) return null;

  const totalCoverage = (data.policies || []).reduce((sum, p) => sum + (p.coverage_amount || 0), 0);
  const hasRiskProfile = data.user.riskScore && data.user.riskScore > 0;
  const riskScore = data.user.riskScore || 20; 
  const riskColor = hasRiskProfile ? 'var(--success)' : 'var(--warning)';
  const riskGrad = hasRiskProfile ? 'var(--grad-success)' : 'var(--grad-warning)';

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="glass-header">
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', height: '64px', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'var(--grad-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
              <Icon.Shield />
            </div>
            <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>InsureZ</span>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn btn-ghost" onClick={() => navigate('/')}><Icon.Home /> Dashboard</button>
            <button className="btn btn-ghost" onClick={() => navigate('/settings')}><Icon.Settings /></button>
          </div>
        </div>
      </header>

      <div className="container grid-layout" style={{ marginTop: '2rem' }}>
        
        {/* Sidebar */}
        <aside className="animate-fade">
          <div className="card" style={{ padding: '2rem', textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'var(--grad-hero)', opacity: 0.05 }}></div>
            <div style={{ position: 'relative' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--grad-primary)', margin: '0 auto 1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: 'bold' }}>
                {(data.user.name || 'U').charAt(0)}
              </div>
              <h2 className="font-display" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{data.user.name}</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>{data.user.email}</p>
              <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => navigate('/risk-profile')}>
                {hasRiskProfile ? 'Edit Profile' : 'Complete Profile'}
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '1rem' }}>Overview</h3>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><Icon.Shield /> Policies</div>
              <span style={{ fontWeight: 'bold' }}>{(data.policies || []).length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f8fafc', borderRadius: '0.5rem', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}><Icon.Star /> Coverage</div>
              <span style={{ fontWeight: 'bold' }}>₹{(totalCoverage/100000).toFixed(1)}L</span>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="animate-slide">
          <h1 className="font-display" style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>My Portfolio</h1>

          <div className="tabs">
            <button onClick={() => setActiveTab('policies')} className={`tab-btn ${activeTab === 'policies' ? 'active' : ''}`}>
              <Icon.Shield /> Policies
            </button>
            <button onClick={() => setActiveTab('claims')} className={`tab-btn ${activeTab === 'claims' ? 'active' : ''}`}>
              <Icon.FileText /> Claims
            </button>
            <button onClick={() => setActiveTab('recommendations')} className={`tab-btn ${activeTab === 'recommendations' ? 'active' : ''}`}>
              <Icon.Star /> For You
            </button>
          </div>

          {/* POLICIES TAB */}
          {activeTab === 'policies' && (
            <div className="grid-2">
              {(data.policies || []).map((policy, i) => (
                <div key={i} className="card" style={{ padding: '1.5rem', opacity: policy.status==='cancelled'?0.7:1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <div style={{ fontSize: '2rem' }}>{policy.type === 'health' ? '🏥' : '📄'}</div>
                    <span className={`badge ${policy.status === 'cancelled' ? 'rejected' : 'active'}`}>
                        {policy.status}
                    </span>
                  </div>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.25rem' }}>{policy.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{policy.policy_number}</p>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    <div>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Premium</p>
                      <p style={{ fontWeight: 'bold' }}>₹{(policy.premium_amount || 0).toLocaleString()}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Cover</p>
                      <p style={{ fontWeight: 'bold' }}>₹{((policy.coverage_amount || 0) / 100000).toFixed(0)}L</p>
                    </div>
                  </div>

                  {/* ACTION BUTTONS GRID */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                     <button className="btn btn-primary" style={{ fontSize:'0.8rem', padding:'0.5rem', background:'var(--success)', borderColor:'var(--success)' }} onClick={() => setRenewModal(policy)}>
                         <Icon.Refresh /> Renew
                     </button>
                     <button className="btn btn-outline" style={{ fontSize:'0.8rem', padding:'0.5rem' }} onClick={() => setDetailsModal(policy)}>
                         <Icon.Info /> Details
                     </button>

                     <button className="btn btn-ghost" style={{ fontSize:'0.8rem', padding:'0.5rem', border:'1px solid var(--border)' }} onClick={() => generatePDF(policy)}>
                         <Icon.Download /> Inv
                     </button>
                     {policy.status === 'active' && (
                        <button className="btn btn-ghost" style={{ fontSize:'0.8rem', padding:'0.5rem', border:'1px solid #fee2e2', color:'#ef4444' }} onClick={() => initiateCancel(policy)}>
                            <Icon.Trash /> Cancel
                        </button>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CLAIMS TAB */}
          {activeTab === 'claims' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {(data.recent_claims || []).map((claim, i) => (
                <div key={i} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ width: '3rem', height: '3rem', borderRadius: '0.75rem', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Icon.FileText />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 'bold' }}>#{claim.claim_number}</span>
                        <span className={`badge ${claim.status.toLowerCase().includes('reject') ? 'rejected' : claim.status.toLowerCase().includes('approv') ? 'active' : 'review'}`}>{claim.status}</span>
                      </div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{claim.policy} • {claim.date}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{(claim.amount || 0).toLocaleString()}</p>
                    <button className="btn btn-ghost" style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setTrackingClaim(claim)}>
                      <Icon.Eye /> Track
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* RECOMMENDATIONS TAB */}
          {activeTab === 'recommendations' && (
             <div className="grid-2">
               {mockRecs.map((rec, i) => (
                <div key={i} className="card" style={{ padding: '1.5rem' }}>
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <span className="badge" style={{ background: 'var(--grad-primary)', color: 'white' }}>{rec.match || rec.match_score}% Match</span>
                  </div>
                  <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{rec.title}</h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Icon.Star /> {rec.reason}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                    <div>
                      <p style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>₹{(rec.premium || 0).toLocaleString()}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>per year</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => handleBuy(rec.id)}>View Quote <Icon.ChevronRight /></button>
                  </div>
                </div>
              ))}
             </div>
          )}

        </main>
      </div>

      {/* --- MODALS --- */}

      {/* 1. TRACKING MODAL */}
      {trackingClaim && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setTrackingClaim(null)}>
          <div className="card animate-slide" style={{ width: '500px', maxWidth: '90%', padding: 0 }} onClick={e => e.stopPropagation()}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 className="font-display" style={{ fontWeight: 'bold', fontSize: '1.25rem' }}>Tracking #{trackingClaim.claim_number}</h3>
              <button className="btn btn-ghost" onClick={() => setTrackingClaim(null)}><Icon.X /></button>
            </div>
            
            <div style={{ padding: '2rem' }}>
              <div className="timeline-wrapper">
                 <div className="t-item"><div className="t-dot active"><Icon.FileText/></div><h4>Claim Submitted</h4></div>
                 <div className="t-item"><div className={`t-dot ${['Under Review','Approved','Rejected'].includes(trackingClaim.status)?'active':'waiting'}`}><Icon.Shield/></div><h4>Under Review</h4></div>
                 <div className="t-item"><div className={`t-dot ${['Approved','Rejected'].includes(trackingClaim.status)?(trackingClaim.status==='Rejected'?'error':'active'):'waiting'}`}><Icon.Check/></div><h4>Decision</h4></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. CANCEL CONFIRM MODAL (SMART COLOR LOGIC) */}
      {cancelModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setCancelModal(null)}>
            <div className="card animate-slide" style={{ width: '400px', maxWidth: '90%', padding: '2rem', textAlign:'center', borderTop: `6px solid ${cancelModal.type === 'danger' ? 'var(--danger)' : 'var(--warning)'}` }} onClick={e => e.stopPropagation()}>
                
                <div style={{ fontSize:'3rem', marginBottom:'1rem', color: cancelModal.type === 'danger' ? 'var(--danger)' : 'var(--warning)' }}>
                    <Icon.Alert />
                </div>
                
                <h2 style={{ marginBottom:'0.5rem', color:'var(--text-main)', fontWeight:'bold' }}>
                    {cancelModal.type === 'danger' ? 'Critical Warning' : 'Cancel Policy?'}
                </h2>
                
                <p style={{ color:'var(--text-muted)', marginBottom:'2rem', lineHeight:'1.5' }}>
                    {cancelModal.type === 'danger' ? (
                        <span>
                            You have an active claim <strong>#{cancelModal.activeClaimId}</strong> currently under review. <br/><br/>
                            <strong style={{color:'var(--danger)'}}>Cancelling this policy will immediately REJECT your ongoing claim.</strong>
                        </span>
                    ) : (
                        <span>
                            Are you sure you want to cancel <strong>{cancelModal.policy.title}</strong>?<br/>
                            This action cannot be undone and you will lose coverage immediately.
                        </span>
                    )}
                </p>

                <div style={{ display:'flex', gap:'1rem' }}>
                    <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setCancelModal(null)}>
                        Keep Policy
                    </button>
                    <button 
                        className="btn btn-primary" 
                        style={{ flex:1, background: cancelModal.type === 'danger' ? 'var(--danger)' : 'var(--warning)', borderColor:'transparent', color: cancelModal.type === 'warning' ? '#713f12' : 'white' }} 
                        onClick={confirmCancel}
                    >
                        {cancelModal.type === 'danger' ? 'Reject Claim & Cancel' : 'Confirm Cancel'}
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* 3. FULL DETAILS MODAL (SAFEGUARDS APPLIED HERE) */}
      {detailsModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setDetailsModal(null)}>
            <div className="card animate-slide" style={{ width: '600px', maxWidth: '95%', padding: 0, overflow:'hidden' }} onClick={e => e.stopPropagation()}>
                 {/* Modal Header */}
                 <div style={{ padding: '1.5rem', background: 'var(--primary)', color:'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <p style={{ fontSize:'0.75rem', opacity:0.8, textTransform:'uppercase', letterSpacing:'1px' }}>{detailsModal.type || 'General'} Policy</p>
                        <h3 className="font-display" style={{ fontWeight: 'bold', fontSize: '1.5rem' }}>{detailsModal.title || 'Policy Details'}</h3>
                    </div>
                    <button onClick={() => setDetailsModal(null)} style={{ background:'transparent', border:'none', color:'white', cursor:'pointer' }}><Icon.X /></button>
                 </div>

                 <div style={{ padding: '2rem', maxHeight:'70vh', overflowY:'auto' }}>
                    {/* Key Info Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                         <div>
                             <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase' }}>Policy Number</p>
                             <p style={{ fontWeight:'bold', fontSize:'1rem' }}>{detailsModal.policy_number || 'N/A'}</p>
                         </div>
                         <div>
                             <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase' }}>Purchased On</p>
                             <p style={{ fontWeight:'bold', fontSize:'1rem' }}>{detailsModal.start_date || 'N/A'}</p>
                         </div>
                         <div>
                             <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase' }}>Valid Until</p>
                             <p style={{ fontWeight:'bold', fontSize:'1rem' }}>{detailsModal.end_date || 'N/A'}</p>
                         </div>
                         <div>
                             <p style={{ fontSize:'0.75rem', color:'var(--text-muted)', textTransform:'uppercase' }}>Agent/Provider</p>
                             <p style={{ fontWeight:'bold', fontSize:'1rem' }}>{detailsModal.agent || 'Direct'}</p>
                         </div>
                    </div>

                    {/* Financials Box */}
                    <div style={{ background:'var(--bg-app)', padding:'1rem', borderRadius:'0.5rem', marginBottom:'1.5rem', display:'flex', justifyContent:'space-between' }}>
                         <div>
                            <p style={{ fontSize:'0.75rem' }}>Annual Premium</p>
                            {/* FIX APPLIED HERE: Added ( ... || 0) */}
                            <p style={{ fontSize:'1.25rem', fontWeight:'bold' }}>₹{(detailsModal.premium_amount || 0).toLocaleString()}</p>
                         </div>
                         <div style={{ textAlign:'right' }}>
                            <p style={{ fontSize:'0.75rem' }}>Coverage Amount</p>
                            {/* FIX APPLIED HERE: Added ( ... || 0) */}
                            <p style={{ fontSize:'1.25rem', fontWeight:'bold', color:'var(--success)' }}>₹{((detailsModal.coverage_amount || 0)/100000).toFixed(1)} Lakhs</p>
                         </div>
                    </div>

                    <h4 style={{ fontWeight:'bold', marginBottom:'0.5rem' }}>Description</h4>
                    <p style={{ fontSize:'0.9rem', color:'var(--text-muted)', lineHeight:'1.5', marginBottom:'1.5rem' }}>
                        {detailsModal.description || 'No description available for this policy.'}
                    </p>

                    <h4 style={{ fontWeight:'bold', marginBottom:'0.5rem' }}>Features Included</h4>
                    <ul style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.5rem', listStyle:'none', padding:0 }}>
                        {(detailsModal.features || []).map((f, i) => (
                            <li key={i} style={{ display:'flex', gap:'0.5rem', fontSize:'0.85rem', color:'var(--text-muted)' }}>
                                <span style={{ color:'var(--success)' }}>✓</span> {f}
                            </li>
                        ))}
                    </ul>
                 </div>
            </div>
        </div>
      )}

      {/* 4. RENEW MODAL */}
      {renewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }} onClick={() => setRenewModal(null)}>
            <div className="card animate-slide" style={{ width: '450px', maxWidth: '90%', padding: '2rem' }} onClick={e => e.stopPropagation()}>
                <h2 style={{ marginBottom:'0.5rem', fontWeight:'bold', fontSize:'1.5rem' }}>Renew Policy</h2>
                <div style={{ background:'#eff6ff', border:'1px solid #dbeafe', borderRadius:'0.5rem', padding:'1rem', marginBottom:'1.5rem' }}>
                    <p style={{ fontSize:'0.9rem', color:'#1e40af' }}>You are renewing:</p>
                    <p style={{ fontWeight:'bold', color:'#1e3a8a', fontSize:'1.1rem' }}>{renewModal.title}</p>
                </div>

                <div style={{ marginBottom:'1.5rem' }}>
                    <label style={{ display:'block', marginBottom:'0.5rem', fontSize:'0.9rem', fontWeight:'600' }}>Select Duration</label>
                    <select style={{ width:'100%', padding:'0.75rem', borderRadius:'0.5rem', border:'1px solid var(--border)', background:'white' }}>
                        <option>1 Year - ₹{renewModal.premium_amount}</option>
                        <option>2 Years - ₹{(renewModal.premium_amount * 2 * 0.9).toFixed(0)} (10% Off)</option>
                    </select>
                </div>

                <div style={{ display:'flex', gap:'0.5rem', alignItems:'start', marginBottom:'1.5rem' }}>
                    <input type="checkbox" style={{ marginTop:'0.25rem' }} />
                    <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', margin:0 }}>I agree to the terms and conditions of renewal and confirm my health details haven't changed.</p>
                </div>

                <button 
                    className="btn btn-primary" 
                    style={{ width:'100%', background:'var(--success)', borderColor:'var(--success)' }}
                    onClick={handleRenewalSubmit}
                    disabled={isRenewing}
                >
                    {isRenewing ? 'Processing...' : `Pay ₹${(renewModal.premium_amount || 0)} & Renew`}
                </button>
            </div>
        </div>
      )}

    </div>
  );
};

export default UserProfile;