import React, { useState, useEffect } from 'react';
import { 
    ShieldAlert, Users, FileText, CheckCircle, XCircle, 
    Activity, ArrowLeft, Plus, Trash2, ShieldCheck, LogOut, 
    Edit, Eye, Paperclip, AlertTriangle, Search, Filter, Save, 
    FileIcon, Download, Clock, DollarSign, User
} from 'lucide-react';

const AdminDashboard = ({ onLogout }) => {
    // Views: 'dashboard' | 'policies' | 'users' | 'risk'
    const [currentView, setCurrentView] = useState('dashboard');
    
    // Data States
    const [stats, setStats] = useState({ users: 0, online_users: 0, claims: 0, pending: 0, fraud_alerts: 0 });
    const [claims, setClaims] = useState([]);
    const [policies, setPolicies] = useState([]);
    const [users, setUsers] = useState([]);

    // --- LIVE UPDATE LOGIC (Requirement 2) ---
    // This effect runs once on mount, then sets up a timer to run every 5 seconds
    useEffect(() => {
        fetchData(); // Initial load

        const interval = setInterval(() => {
            fetchData(true); // 'true' means silent update (no loading spinners)
        }, 5000); 

        return () => clearInterval(interval); // Cleanup on unmount
    }, []);

    const fetchData = async (silent = false) => {
        const token = localStorage.getItem('access_token');
        const headers = { 'Authorization': `Bearer ${token}` };
        try {
            // We use Promise.all to fetch everything at once
            const [sRes, cRes, pRes, uRes] = await Promise.all([
                fetch('http://127.0.0.1:8000/admin/dashboard-stats', { headers }),
                fetch('http://127.0.0.1:8000/admin/claims-feed', { headers }),
                fetch('http://127.0.0.1:8000/policies', { headers }),
                fetch('http://127.0.0.1:8000/admin/users-list', { headers })
            ]);

            if (sRes.ok) setStats(await sRes.json());
            if (cRes.ok) setClaims(await cRes.json());
            if (pRes.ok) setPolicies(await pRes.json());
            if (uRes.ok) setUsers(await uRes.json());

        } catch (err) { 
            // If auth fails (token expired), stop polling
            if(err.status === 401) onLogout();
            console.error(err); 
        }
    };

    // --- UI STATES ---
    const [claimFilter, setClaimFilter] = useState('Pending');
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("All");
    
    // Policy Editing
    const [showPolicyForm, setShowPolicyForm] = useState(false);
    const [editingPolicyId, setEditingPolicyId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [newPolicy, setNewPolicy] = useState({ category: 'Health', provider: '', policy_name: '', premium: '', cover_amount: '', description: '', features: '' });

    // --- PROFESSIONAL CLAIM INSPECTOR STATES (Requirement 1) ---
    const [inspectModalOpen, setInspectModalOpen] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState(null);
    const [rejectReason, setRejectReason] = useState("");
    const [showRejectInput, setShowRejectInput] = useState(false); // Toggle the reason box inside the inspector

    // --- ACTIONS ---
    const handlePolicyAction = async (method, url, body) => {
        const token = localStorage.getItem('access_token');
        await fetch(url, {
            method: method,
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        fetchData();
    };

    const saveInlinePolicy = async () => {
        await handlePolicyAction('PUT', `http://127.0.0.1:8000/admin/policies/${editingPolicyId}`, editForm);
        setEditingPolicyId(null);
    };

    const saveNewPolicy = async (e) => {
        e.preventDefault();
        await handlePolicyAction('POST', 'http://127.0.0.1:8000/admin/policies', newPolicy);
        setShowAddPolicy(false);
    };

    const handleDeletePolicy = async (id) => {
        if(!confirm("Permanently delete this policy?")) return;
        const token = localStorage.getItem('access_token');
        const res = await fetch(`http://127.0.0.1:8000/admin/policies/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
        if(res.ok) fetchData(); else alert("Error: Policy has active users.");
    };

    const handleDeleteUser = async (id) => {
        if(!confirm("Ban user?")) return;
        const token = localStorage.getItem('access_token');
        await fetch(`http://127.0.0.1:8000/admin/users/${id}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }});
        fetchData();
    };

    // --- INSPECTOR ACTIONS ---
    const openInspector = (claim) => {
        setSelectedClaim(claim);
        setShowRejectInput(false);
        setRejectReason("");
        setInspectModalOpen(true);
    };

    const submitDecision = async (action) => {
        const token = localStorage.getItem('access_token');
        
        // If rejecting, we need a reason
        if (action === 'reject' && !rejectReason) {
            alert("Please provide a reason for rejection.");
            return;
        }

        await fetch(`http://127.0.0.1:8000/admin/claims/${selectedClaim.id}/action`, { 
            method: 'PUT', 
            headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify({ action, reason: rejectReason }) 
        });

        setInspectModalOpen(false);
        fetchData();
    };

    // --- HEADER ---
    const Header = () => (
        <div className="bg-slate-950 border-b border-slate-900 px-6 py-4 sticky top-0 z-30 flex justify-between items-center shadow-lg">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setCurrentView('dashboard')}>
                <div className="bg-blue-600 text-white p-1.5 rounded-lg shadow-blue-500/20 shadow-lg"><ShieldCheck size={24} /></div>
                <span className="text-xl font-bold text-white tracking-tight">ICRA <span className="text-slate-600 font-normal">Admin</span></span>
            </div>
            
            <div className="flex items-center gap-4">
                {/* Live Indicator */}
                <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-full border border-slate-800">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                    <span className="text-xs font-bold text-slate-400">Live Feed</span>
                </div>
                
                <button onClick={onLogout} className="text-red-400 hover:bg-slate-900 px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-colors"><LogOut size={18} /> Logout</button>
            </div>
        </div>
    );

    // --- DASHBOARD HOME ---
    const DashboardHome = () => (
        <div className="max-w-7xl mx-auto p-8 animate-fade-in">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Command Center</h1>
                <p className="text-slate-500">System metrics update automatically.</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                <StatCard label="Total Users" value={stats.users} subValue={`${stats.online_users} Online`} subColor="text-green-400" />
                <StatCard label="Total Claims" value={stats.claims} />
                <StatCard label="Active Policies" value={policies.length} />
                <StatCard label="Pending Actions" value={stats.pending} valueColor="text-yellow-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <NavTile 
                    title="Risk Watchtower" 
                    icon={<ShieldAlert size={28} />} 
                    color="red" 
                    desc="Review claims & fraud." 
                    badge={stats.pending > 0 ? `${stats.pending} Pending` : null}
                    onClick={() => setCurrentView('risk')} 
                />
                <NavTile 
                    title="Policy Manager" 
                    icon={<FileText size={28} />} 
                    color="blue" 
                    desc="Manage inventory." 
                    onClick={() => setCurrentView('policies')} 
                />
                <NavTile 
                    title="User Directory" 
                    icon={<Users size={28} />} 
                    color="purple" 
                    desc="Manage accounts." 
                    badge={`${users.length} Users`}
                    onClick={() => setCurrentView('users')} 
                />
            </div>
        </div>
    );

    const StatCard = ({ label, value, valueColor = "text-white", subValue, subColor }) => (
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800">
            <p className="text-slate-500 text-xs font-bold uppercase mb-1">{label}</p>
            <div className="flex items-baseline gap-2">
                <p className={`text-3xl font-bold ${valueColor}`}>{value}</p>
                {subValue && <span className={`text-xs font-bold ${subColor}`}>{subValue}</span>}
            </div>
        </div>
    );

    const NavTile = ({ title, icon, color, desc, badge, onClick }) => (
        <div onClick={onClick} className={`bg-slate-900 p-6 rounded-2xl border border-slate-800 hover:bg-slate-800 cursor-pointer group transition-all hover:-translate-y-1 relative overflow-hidden`}>
            <div className={`h-12 w-12 bg-${color}-900/50 text-${color}-400 rounded-xl flex items-center justify-center mb-4`}>{icon}</div>
            <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-500 text-sm mb-4">{desc}</p>
            {badge && <span className={`bg-${color}-900/30 text-${color}-300 px-3 py-1 rounded-full text-xs font-bold border border-${color}-900/50`}>{badge}</span>}
        </div>
    );

    // --- RISK WATCHTOWER (With Professional Inspector) ---
    const RiskView = () => {
        const filtered = claims.filter(c => c.status === claimFilter);
        return (
            <div className="max-w-7xl mx-auto p-6 animate-fade-in text-white">
                <button onClick={() => setCurrentView('dashboard')} className="mb-6 text-slate-500 hover:text-white flex items-center gap-2 transition-colors"><ArrowLeft size={20}/> Back to Command Center</button>
                
                <div className="flex justify-between items-end mb-8 border-b border-slate-800 pb-6">
                    <div>
                        <h2 className="text-2xl font-bold flex gap-2 items-center"><ShieldAlert className="text-red-500"/> Risk Watchtower</h2>
                        <p className="text-slate-500 text-sm mt-1">Review pending claims and analyze fraud flags.</p>
                    </div>
                    <div className="bg-slate-900 p-1 rounded-lg flex border border-slate-800">
                        {['Pending', 'Approved', 'Rejected'].map(s => (
                            <button key={s} onClick={() => setClaimFilter(s)} className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${claimFilter === s ? 'bg-slate-700 text-white shadow' : 'text-slate-500 hover:text-white'}`}>{s}</button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    {filtered.length === 0 ? <div className="text-center py-20 text-slate-600 bg-slate-900/50 rounded-xl border border-slate-800 border-dashed">No {claimFilter} claims found.</div> : 
                        filtered.map(c => (
                            <div key={c.id} className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col md:flex-row items-center gap-6 hover:border-slate-700 transition-colors group">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`p-2 rounded-lg ${c.flags.length > 0 ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'}`}>
                                            {c.flags.length > 0 ? <ShieldAlert size={20}/> : <CheckCircle size={20}/>}
                                        </span>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">{c.type}</h3>
                                            <p className="text-xs text-slate-500">#{1000+c.id} • by <span className="text-slate-300">{c.user}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        {c.flags.map((f,i) => <span key={i} className="text-[10px] bg-red-900/30 text-red-300 px-2 py-0.5 rounded border border-red-900/50">{f.details}</span>)}
                                    </div>
                                </div>

                                <div className="text-right pr-6 border-r border-slate-800">
                                    <p className="text-xs text-slate-500 uppercase font-bold">Claim Amount</p>
                                    <p className="text-2xl font-bold text-white">₹{c.amount.toLocaleString()}</p>
                                </div>

                                <div>
                                    {/* INSPECT BUTTON - The Gateway to the Professional Modal */}
                                    <button 
                                        onClick={() => openInspector(c)} 
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-blue-900/20 transition-all"
                                    >
                                        <Eye size={18} /> Inspect Details
                                    </button>
                                </div>
                            </div>
                        ))
                    }
                </div>
            </div>
        );
    };

    // --- PROFESSIONAL CLAIM INSPECTOR MODAL ---
    const ClaimInspectorModal = () => {
        if (!inspectModalOpen || !selectedClaim) return null;

        return (
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
                <div className="bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden relative animate-fade-in-up">
                    
                    {/* Header */}
                    <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-950">
                        <div>
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <FileText className="text-blue-500" /> Claim Inspection: #{1000 + selectedClaim.id}
                            </h2>
                            <p className="text-slate-500 text-sm">Reviewing submission from {selectedClaim.user}</p>
                        </div>
                        <button onClick={() => setInspectModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full text-slate-500 hover:text-white transition-colors"><XCircle size={24}/></button>
                    </div>

                    {/* Content Grid */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 overflow-hidden">
                        
                        {/* LEFT: Claim Data */}
                        <div className="p-8 overflow-y-auto border-r border-slate-800">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-6 tracking-wider">Incident Report</h3>
                            
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                                        <p className="text-xs text-slate-400 mb-1">Incident Type</p>
                                        <p className="font-bold text-white text-lg">{selectedClaim.type}</p>
                                    </div>
                                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800">
                                        <p className="text-xs text-slate-400 mb-1">Date of Incident</p>
                                        <p className="font-bold text-white text-lg">{new Date(selectedClaim.date).toLocaleDateString()}</p>
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400 mb-2">User's Description</p>
                                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800 text-slate-300 italic leading-relaxed">
                                        "{selectedClaim.details}"
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs text-slate-400 mb-2">Claimed Amount</p>
                                    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-800 flex justify-between items-center">
                                        <span className="text-2xl font-bold text-blue-400">₹{selectedClaim.amount.toLocaleString()}</span>
                                        <span className="text-xs bg-slate-700 px-2 py-1 rounded text-slate-300">Verified Currency</span>
                                    </div>
                                </div>

                                {/* Fraud Analysis Section */}
                                <div className="mt-8 pt-6 border-t border-slate-800">
                                    <h3 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider flex items-center gap-2">
                                        <ShieldAlert size={14}/> Fraud Analysis System
                                    </h3>
                                    {selectedClaim.flags.length > 0 ? (
                                        <div className="bg-red-900/10 border border-red-900/30 rounded-lg p-4">
                                            <div className="flex items-center gap-2 text-red-400 font-bold mb-2">
                                                <AlertTriangle size={18}/> {selectedClaim.flags.length} Risk Factors Detected
                                            </div>
                                            <ul className="space-y-2">
                                                {selectedClaim.flags.map((f, i) => (
                                                    <li key={i} className="text-sm text-red-300 flex items-start gap-2">
                                                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-1.5"></span> {f.details}
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    ) : (
                                        <div className="bg-green-900/10 border border-green-900/30 rounded-lg p-4 flex items-center gap-3">
                                            <div className="p-2 bg-green-900/30 rounded-full text-green-500"><CheckCircle size={20}/></div>
                                            <div>
                                                <p className="text-green-400 font-bold text-sm">No Fraud Risks Detected</p>
                                                <p className="text-green-600 text-xs">System checks passed successfully.</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT: Evidence File */}
                        <div className="bg-slate-950 p-8 flex flex-col">
                            <h3 className="text-xs font-bold text-slate-500 uppercase mb-6 tracking-wider flex justify-between">
                                <span>Evidence Attachments</span>
                                <span className="text-blue-500 cursor-pointer hover:underline flex items-center gap-1"><Download size={14}/> Download All</span>
                            </h3>

                            {/* Mock File Viewer */}
                            <div className="flex-1 bg-slate-900 rounded-xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-10 group hover:border-slate-700 transition-colors">
                                <div className="w-20 h-20 bg-slate-800 rounded-2xl flex items-center justify-center mb-4 shadow-xl group-hover:scale-105 transition-transform">
                                    <FileText size={40} className="text-slate-400" />
                                </div>
                                <h4 className="text-white font-bold text-lg mb-1">Hospital_Bill_Scan.pdf</h4>
                                <p className="text-slate-500 text-sm mb-6">2.4 MB • Uploaded {new Date(selectedClaim.date).toLocaleDateString()}</p>
                                <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors border border-slate-700">
                                    Preview Document
                                </button>
                                <p className="mt-8 text-xs text-slate-600 max-w-xs">
                                    * This is a simulated file preview. In a production environment, the AWS S3 document viewer would appear here.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Footer: Decision Actions */}
                    <div className="p-6 bg-slate-950 border-t border-slate-900 flex justify-between items-center gap-4">
                        <div className="flex-1">
                            {showRejectInput ? (
                                <input 
                                    autoFocus
                                    type="text" 
                                    placeholder="Enter reason for rejection (Required)..." 
                                    className="w-full bg-slate-900 border border-red-900/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500 transition-colors"
                                    value={rejectReason}
                                    onChange={(e) => setRejectReason(e.target.value)}
                                />
                            ) : (
                                <p className="text-slate-500 text-sm ml-2">Review all details before making a decision.</p>
                            )}
                        </div>

                        <div className="flex gap-3">
                            {showRejectInput ? (
                                <>
                                    <button onClick={() => setShowRejectInput(false)} className="px-6 py-3 rounded-lg font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                                    <button onClick={() => submitDecision('reject')} className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-red-900/20 transition-all flex items-center gap-2">
                                        <XCircle size={18}/> Confirm Rejection
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setShowRejectInput(true)} className="bg-slate-800 hover:bg-red-900/20 hover:text-red-400 hover:border-red-900/50 border border-slate-800 text-slate-300 px-6 py-3 rounded-lg font-bold transition-all flex items-center gap-2">
                                        <XCircle size={18}/> Reject Claim
                                    </button>
                                    <button onClick={() => submitDecision('approve')} className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-lg shadow-green-900/20 transition-all flex items-center gap-2">
                                        <CheckCircle size={18}/> Authorize & Approve
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // --- POLICIES & USERS (Keep existing logic, they are good) ---
    // (Pasting simplified versions here to keep file complete. You can reuse previous code for these two components)
    const PoliciesView = () => {
        const filteredPolicies = policies.filter(p => (categoryFilter === "All" || p.category === categoryFilter) && (p.policy_name.toLowerCase().includes(searchTerm.toLowerCase())));
        return (
            <div className="max-w-6xl mx-auto p-6 animate-fade-in text-white">
                <button onClick={() => setCurrentView('dashboard')} className="mb-6 text-slate-500 hover:text-white flex items-center gap-2"><ArrowLeft size={20}/> Back</button>
                <div className="flex justify-between items-center mb-6"><h2 className="text-2xl font-bold text-white flex gap-2"><FileText className="text-blue-500"/> Policy Manager</h2><button onClick={() => { setEditingPolicyId(null); setShowPolicyForm(!showPolicyForm); }} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-bold flex gap-2"><Plus size={18}/> Add New</button></div>
                
                {/* Add Form */}
                {showPolicyForm && <form onSubmit={saveNewPolicy} className="bg-slate-900 p-6 rounded-xl border border-slate-800 grid grid-cols-2 gap-4 mb-8"><h3 className="col-span-2 font-bold mb-2 border-b border-slate-800 pb-2">Create Policy</h3><input className="p-3 bg-slate-950 rounded border border-slate-800 text-white" placeholder="Name" required onChange={e=>setNewPolicy({...newPolicy, policy_name: e.target.value})} /><input className="p-3 bg-slate-950 rounded border border-slate-800 text-white" placeholder="Provider" required onChange={e=>setNewPolicy({...newPolicy, provider: e.target.value})} /><select className="p-3 bg-slate-950 rounded border border-slate-800 text-white" onChange={e=>setNewPolicy({...newPolicy, category: e.target.value})}><option>Health</option><option>Life</option><option>Auto</option></select><input type="number" className="p-3 bg-slate-950 rounded border border-slate-800 text-white" placeholder="Premium" required onChange={e=>setNewPolicy({...newPolicy, premium: e.target.value})} /><input type="number" className="p-3 bg-slate-950 rounded border border-slate-800 text-white" placeholder="Cover" required onChange={e=>setNewPolicy({...newPolicy, cover_amount: e.target.value})} /><input className="p-3 bg-slate-950 rounded border border-slate-800 text-white" placeholder="Description" required onChange={e=>setNewPolicy({...newPolicy, description: e.target.value})} /><div className="col-span-2 flex gap-4 mt-2"><button type="button" onClick={() => setShowPolicyForm(false)} className="flex-1 bg-slate-800 py-3 rounded font-bold">Cancel</button><button type="submit" className="flex-1 bg-green-600 py-3 rounded font-bold">Save</button></div></form>}

                <div className="grid grid-cols-1 gap-4">
                    {filteredPolicies.map(p => (
                        <div key={p.id} className="bg-slate-900 rounded-xl overflow-hidden flex flex-col md:flex-row items-center relative group border border-slate-800">
                             <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${p.category === 'Health' ? 'bg-red-900' : p.category === 'Auto' ? 'bg-blue-900' : 'bg-emerald-900'}`}></div>
                             {editingPolicyId === p.id ? (
                                <div className="w-full p-4 grid grid-cols-2 gap-3 bg-slate-800/50 animate-fade-in"><div className="col-span-2 font-bold text-blue-400 mb-2">Editing: {p.policy_name}</div><input className="p-2 bg-slate-950 border border-slate-700 rounded text-sm text-white" value={editForm.policy_name || p.policy_name} onChange={e=>setEditForm({...editForm, policy_name: e.target.value})} placeholder="Name" /><input className="p-2 bg-slate-950 border border-slate-700 rounded text-sm text-white" value={editForm.premium || p.premium} onChange={e=>setEditForm({...editForm, premium: e.target.value})} placeholder="Premium" /><div className="col-span-2 flex justify-end gap-2 mt-2"><button onClick={() => setEditingPolicyId(null)} className="px-4 py-2 bg-slate-700 rounded text-sm font-bold">Cancel</button><button onClick={saveInlinePolicy} className="px-4 py-2 bg-green-600 rounded text-sm font-bold flex items-center gap-2"><Save size={16}/> Save</button></div></div>
                             ) : (
                                <><div className="p-6 flex items-center gap-4 w-full md:w-1/3 pl-8"><div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-2xl border border-slate-700">{p.category === 'Health' ? "🏥" : p.category === 'Auto' ? "🚗" : "🛡️"}</div><div><span className="text-xs font-bold text-slate-500 uppercase">{p.provider}</span><h3 className="text-lg font-bold text-white">{p.policy_name}</h3><span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">{p.category}</span></div></div><div className="p-6 w-full md:w-1/3 border-l border-slate-800"><div className="flex justify-between text-sm mb-1"><span className="text-slate-500">Premium</span><span className="font-bold text-white">₹{p.premium.toLocaleString()}</span></div><div className="flex justify-between text-sm"><span className="text-slate-500">Cover</span><span className="font-bold text-slate-300">₹{(p.cover_amount/100000).toFixed(0)} Lakhs</span></div></div><div className="p-6 w-full md:w-auto flex flex-col items-end gap-2 border-l border-slate-800 min-w-[180px]">{p.active_users > 0 ? (<div className="text-right"><div className="text-xs font-bold text-purple-400 bg-purple-900/30 px-3 py-1 rounded-full border border-purple-900/50 mb-2 flex items-center gap-1"><Users size={12}/> {p.active_users} Active Users</div></div>) : (<div className="text-right w-full"><div className="flex gap-2 justify-end"><button onClick={() => {setEditingPolicyId(p.id); setEditForm(p)}} className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-blue-400 hover:bg-slate-700 text-xs font-bold flex items-center justify-center gap-1"><Edit size={14}/> Edit</button><button onClick={() => handleDeletePolicy(p.id)} className="flex-1 px-3 py-1.5 bg-slate-800 border border-slate-700 rounded text-red-400 hover:bg-red-900/30 text-xs font-bold flex items-center justify-center gap-1"><Trash2 size={14}/> Del</button></div></div>)}</div></>
                             )}
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    const UsersView = () => (
        <div className="max-w-6xl mx-auto p-6 animate-fade-in text-white">
             <button onClick={() => setCurrentView('dashboard')} className="mb-6 flex items-center gap-2 text-slate-500 hover:text-white"><ArrowLeft size={20}/> Back</button>
             <h2 className="text-2xl font-bold mb-6">User Directory</h2>
             <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
                <table className="w-full text-left text-sm"><thead className="bg-slate-950 text-slate-500"><tr><th className="p-4">Name</th><th className="p-4">Email</th><th className="p-4">Role</th><th className="p-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-slate-800">{users.map(u => (<tr key={u.id}><td className="p-4 font-bold">{u.name}</td><td className="p-4 text-slate-400">{u.email}</td><td className="p-4"><span className="bg-slate-800 text-slate-300 px-2 py-1 rounded text-xs uppercase">{u.role}</span></td><td className="p-4 text-right">{u.role !== 'admin' && <button onClick={() => handleDeleteUser(u.id)} className="text-red-400 hover:text-red-300"><Trash2 size={16}/></button>}</td></tr>))}</tbody></table>
             </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans">
            <Header />
            {currentView === 'dashboard' && <DashboardHome />}
            {currentView === 'risk' && <RiskView />}
            {currentView === 'policies' && <PoliciesView />}
            {currentView === 'users' && <UsersView />}
            <ClaimInspectorModal />
        </div>
    );
};

export default AdminDashboard;