import React, { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, RefreshCw, CheckCircle, AlertTriangle, Loader, Trash2, ShieldCheck, Clock, XCircle, FileBarChart } from 'lucide-react';
import FileClaimModal from './FileClaimModal';

const MyPolicies = ({ onBack }) => {
    // --- STATES ---
    const [activeTab, setActiveTab] = useState('policies'); // 'policies' or 'claims'
    const [myPolicies, setMyPolicies] = useState([]);
    const [myClaims, setMyClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClaimPolicy, setSelectedClaimPolicy] = useState(null);

    // --- FETCH POLICIES ---
    const fetchMyPolicies = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const res = await fetch('http://127.0.0.1:8000/my-policies', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                const formattedData = data.map(item => {
                    const purchaseDate = new Date(item.purchase_date);
                    const renewalDate = new Date(purchaseDate);
                    renewalDate.setFullYear(renewalDate.getFullYear() + 1);

                    return {
                        id: item.id,
                        name: item.policy.policy_name,
                        provider: item.policy.provider,
                        policyNumber: `ICRA-${item.policy.category.toUpperCase().slice(0, 3)}-${new Date(item.purchase_date).getFullYear()}-${1000 + item.id}`,
                        status: item.status,
                        purchaseDate: purchaseDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }),
                        renewalDate: renewalDate.toLocaleDateString("en-GB", { day: 'numeric', month: 'short', year: 'numeric' }),
                        premium: item.policy.premium,
                        logo: item.policy.category === 'Health' ? "🏥" : item.policy.category === 'Auto' ? "🚗" : "🛡️",
                        category: item.policy.category
                    };
                });
                setMyPolicies(formattedData);
            }
        } catch (err) {
            console.error("Failed to fetch policies", err);
        }
    };

    // --- FETCH CLAIMS ---
    const fetchMyClaims = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const res = await fetch('http://127.0.0.1:8000/claims', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                const data = await res.json();
                setMyClaims(data.reverse()); // Show newest first
            }
        } catch (err) { console.error("Failed to fetch claims", err); }
    };

    // Load Data on Mount
    useEffect(() => {
        const loadAll = async () => {
            setLoading(true);
            await Promise.all([fetchMyPolicies(), fetchMyClaims()]);
            setLoading(false);
        };
        loadAll();
    }, []);

    // --- RENEW HANDLER ---
    const handleRenew = async (purchaseId) => {
        if (!window.confirm("Confirm renewal? This will extend your policy for 1 year.")) return;

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`http://127.0.0.1:8000/renew/${purchaseId}`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                alert("Policy Renewed Successfully!");
                fetchMyPolicies(); // Refresh data
            } else {
                alert("Renewal failed.");
            }
        } catch (err) { console.error(err); }
    };

    // --- DELETE POLICY HANDLER ---
    const handleDelete = async (purchaseId) => {
        if (!window.confirm("Are you sure you want to remove this policy record?")) return;
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`http://127.0.0.1:8000/my-policies/${purchaseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) setMyPolicies(myPolicies.filter(p => p.id !== purchaseId));
        } catch (err) { console.error("Delete failed", err); }
    };

    // --- DELETE CLAIM HANDLER ---
    const handleDeleteClaim = async (claimId) => {
        if (!window.confirm("Delete this claim record?")) return;
        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`http://127.0.0.1:8000/claims/${claimId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setMyClaims(myClaims.filter(c => c.id !== claimId));
            }
        } catch (err) { 
            console.error("Delete claim failed", err); 
        }
    };

    // --- INVOICE GENERATOR ---
    const generateInvoice = (policy) => {
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        const userName = userData.name || "Valued Customer";
        const userEmail = userData.email || "";
        const baseAmount = policy.premium;
        const gstRate = 0.18;
        const taxAmount = baseAmount * gstRate;
        const totalAmount = baseAmount + taxAmount;

        const printWindow = window.open('', '', 'height=800,width=800');
        const htmlContent = `
            <html>
            <head>
                <title>Invoice - ${policy.policyNumber}</title>
                <style>
                    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; }
                    .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0, 0, 0, 0.05); }
                    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
                    .logo { font-size: 24px; font-weight: bold; color: #2563EB; display: flex; align-items: center; gap: 5px; }
                    .invoice-details { text-align: right; }
                    .invoice-details h2 { margin: 0; color: #1e293b; }
                    .invoice-details p { margin: 5px 0 0; color: #64748b; font-size: 14px; }
                    .info-section { display: flex; justify-content: space-between; margin-bottom: 40px; }
                    .info-block h3 { font-size: 12px; text-transform: uppercase; color: #94a3b8; margin-bottom: 5px; letter-spacing: 1px; }
                    .info-block p { margin: 0; font-size: 15px; font-weight: 500; }
                    table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
                    th { text-align: left; padding: 15px; background: #f8fafc; color: #475569; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #e2e8f0; }
                    td { padding: 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
                    .total-row td { font-weight: bold; border-bottom: none; }
                    .amount { text-align: right; }
                    .footer { text-align: center; margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #94a3b8; }
                    .status { display: inline-block; padding: 5px 10px; border-radius: 4px; font-size: 12px; font-weight: bold; background: #dcfce7; color: #166534; }
                </style>
            </head>
            <body>
                <div class="invoice-box">
                    <div class="header">
                        <div class="logo">🛡️ ICRA INSURANCE</div>
                        <div class="invoice-details">
                            <h2>INVOICE</h2>
                            <p>#INV-${new Date().getFullYear()}-${1000 + policy.id}</p>
                            <p>Date: ${policy.purchaseDate}</p>
                        </div>
                    </div>
                    <div class="info-section">
                        <div class="info-block">
                            <h3>Billed To</h3>
                            <p>${userName}</p>
                            <p style="font-size: 13px; color: #64748b; font-weight: 400;">${userEmail}</p>
                        </div>
                        <div class="info-block" style="text-align: right;">
                            <h3>Policy Status</h3>
                            <span class="status">ACTIVE • PAID</span>
                        </div>
                    </div>
                    <table>
                        <thead>
                            <tr>
                                <th>Description</th>
                                <th>Provider</th>
                                <th>Term</th>
                                <th class="amount">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <strong>${policy.name}</strong><br>
                                    <span style="font-size: 12px; color: #64748b;">Policy No: ${policy.policyNumber}</span>
                                </td>
                                <td>${policy.provider}</td>
                                <td>1 Year</td>
                                <td class="amount">₹${baseAmount.toLocaleString()}</td>
                            </tr>
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="text-align: right; padding-top: 20px;">Subtotal</td>
                                <td class="amount" style="padding-top: 20px;">₹${baseAmount.toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td colspan="3" style="text-align: right; color: #64748b;">GST (18%)</td>
                                <td class="amount" style="color: #64748b;">₹${taxAmount.toLocaleString()}</td>
                            </tr>
                            <tr class="total-row">
                                <td colspan="3" style="text-align: right; font-size: 18px;">Total Paid</td>
                                <td class="amount" style="font-size: 18px; color: #2563EB;">₹${totalAmount.toLocaleString()}</td>
                            </tr>
                        </tfoot>
                    </table>
                    <div class="footer">
                        <p>Thank you for choosing ICRA for your insurance needs.</p>
                        <p>This is a computer-generated receipt and does not require a physical signature.</p>
                    </div>
                </div>
                <script>window.onload = function() { window.print(); }</script>
            </body>
            </html>
        `;
        printWindow.document.write(htmlContent);
        printWindow.document.close();
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">

            {/* CLAIM MODAL */}
            {selectedClaimPolicy && (
                <FileClaimModal
                    policy={selectedClaimPolicy}
                    onClose={() => setSelectedClaimPolicy(null)}
                    onSuccess={() => {
                        setSelectedClaimPolicy(null);
                        fetchMyClaims(); // Refresh claims list
                    }}
                />
            )}

            {/* Header with Tabs */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors text-slate-600">
                            <ArrowLeft size={24} />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Portfolio</span>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                        <button
                            onClick={() => setActiveTab('policies')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'policies' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Active Policies
                        </button>
                        <button
                            onClick={() => setActiveTab('claims')}
                            className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'claims' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            Claims History
                            {myClaims.length > 0 && <span className="bg-slate-200 text-slate-600 text-[10px] px-1.5 py-0.5 rounded-md">{myClaims.length}</span>}
                        </button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-6">
                {loading ? (
                    <div className="flex justify-center py-20 text-slate-400 gap-2"><Loader className="animate-spin" /> Loading portfolio...</div>
                ) : (
                    <>
                        {/* --- TAB 1: POLICIES --- */}
                        {activeTab === 'policies' && (
                            myPolicies.length === 0 ? (
                                <div className="text-center py-20 text-slate-400"><p className="mb-4">No active policies found.</p><button onClick={onBack} className="text-blue-600 font-bold hover:underline">Explore Plans</button></div>
                            ) : (
                                <div className="space-y-4">
                                    {myPolicies.map((policy) => (
                                        <div key={policy.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative group animate-fade-in">
                                            <button onClick={() => handleDelete(policy.id)} className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={20} /></button>
                                            <div className="flex justify-between items-start mb-4 pr-12">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl border border-slate-100">{policy.logo}</div>
                                                    <div><h3 className="font-bold text-slate-800 text-lg">{policy.name}</h3><p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{policy.provider}</p></div>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${policy.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                    {policy.status === 'Active' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />} {policy.status}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                                <div><p className="text-xs text-slate-400 mb-1">Policy No</p><p className="font-semibold text-slate-700 text-sm">{policy.policyNumber}</p></div>
                                                <div><p className="text-xs text-slate-400 mb-1">Renewal Date</p><p className="font-semibold text-slate-700 text-sm">{policy.renewalDate}</p></div>
                                                <div><p className="text-xs text-slate-400 mb-1">Premium</p><p className="font-semibold text-blue-600 text-sm">₹{policy.premium.toLocaleString()}</p></div>
                                                <div><p className="text-xs text-slate-400 mb-1">Payment Mode</p><p className="font-semibold text-slate-700 text-sm">Yearly</p></div>
                                            </div>
                                            <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                                                <button onClick={() => generateInvoice(policy)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"><Download size={16} /> Invoice</button>
                                                <button onClick={() => setSelectedClaimPolicy(policy)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"><FileText size={16} /> File Claim</button>
                                                <button onClick={() => handleRenew(policy.id)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors ml-auto"><RefreshCw size={16} /> Renew</button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}

                        {/* --- TAB 2: CLAIMS HISTORY --- */}
                        {activeTab === 'claims' && (
                            myClaims.length === 0 ? (
                                <div className="text-center py-20 text-slate-400">
                                    <FileBarChart size={48} className="mx-auto mb-3 opacity-20" />
                                    <p>No claims filed yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {myClaims.map((claim) => (
                                        <div key={claim.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6 animate-fade-in relative group">
                                            {/* Delete Button - appears on hover */}
                                            <button 
                                                onClick={() => handleDeleteClaim(claim.id)} 
                                                className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                            <div className="flex items-start gap-4">
                                                <div className={`p-3 rounded-xl ${claim.status === 'Approved' ? 'bg-green-100 text-green-600' : claim.status === 'Rejected' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                                    {claim.status === 'Approved' ? <CheckCircle size={24} /> : claim.status === 'Rejected' ? <XCircle size={24} /> : <Clock size={24} />}
                                                </div>
                                                <div>
                                                    <h3 className="font-bold text-slate-800 text-lg">{claim.incident_type}</h3>
                                                    <p className="text-sm text-slate-500 mb-1">Claim ID: #CLM-{1000 + claim.id}</p>
                                                    <p className="text-sm text-slate-600 italic">"{claim.description}"</p>
                                                </div>
                                            </div>
                                            <div className="text-left md:text-right pl-16 md:pl-0 pr-12">
                                                <p className="text-xs text-slate-400 uppercase font-bold">Claim Amount</p>
                                                <p className="text-2xl font-bold text-slate-800 mb-2">₹{claim.claim_amount.toLocaleString()}</p>
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${claim.status === 'Approved' ? 'bg-green-100 text-green-700' : claim.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                    {claim.status}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default MyPolicies;