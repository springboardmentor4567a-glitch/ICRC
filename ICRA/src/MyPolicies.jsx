import React, { useState, useEffect } from 'react';
import {
    ArrowLeft,
    Download,
    FileText,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Loader,
    Trash2 // Added Trash Icon
} from 'lucide-react';

const MyPolicies = ({ onBack }) => {
    // --- STATES ---
    const [myPolicies, setMyPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ---
    const fetchMyPolicies = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) { setLoading(false); return; }

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
                        id: item.id, // This is the Purchase ID
                        name: item.policy.policy_name,
                        provider: item.policy.provider,
                        policyNumber: `ICRA-${item.policy.category.toUpperCase().slice(0, 3)}-${new Date().getFullYear()}-${1000 + item.id}`,
                        status: item.status,
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
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyPolicies();
    }, []);

    // --- DELETE HANDLER ---
    const handleDelete = async (purchaseId) => {
        if (!window.confirm("Are you sure you want to remove this policy?")) return;

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`http://127.0.0.1:8000/my-policies/${purchaseId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                // Remove from UI instantly
                setMyPolicies(myPolicies.filter(p => p.id !== purchaseId));
            } else {
                alert("Failed to delete policy.");
            }
        } catch (err) {
            console.error("Delete failed", err);
        }
    };

    // --- DOWNLOAD RECEIPT ---
    const handleDownload = (policy) => {
        const receiptContent = `ICRA POLICY RECEIPT\n\nPolicy: ${policy.name}\nNo: ${policy.policyNumber}\nPaid: Rs. ${policy.premium}\nValid Till: ${policy.renewalDate}`;
        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${policy.policyNumber}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <div onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors text-slate-600"><ArrowLeft size={24} /></div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">My Policies</span>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-6xl mx-auto p-6">
                {loading ? (
                    <div className="flex justify-center py-20 text-slate-400 gap-2"><Loader className="animate-spin" /> Loading...</div>
                ) : myPolicies.length === 0 ? (
                    <div className="text-center py-20 text-slate-400"><p className="mb-4">No active policies.</p><button onClick={onBack} className="text-blue-600 font-bold hover:underline">Buy one now!</button></div>
                ) : (
                    <div className="space-y-4">
                        {myPolicies.map((policy) => (
                            <div key={policy.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all relative group">

                                {/* Delete Button (Top Right) */}
                                <button
                                    onClick={() => handleDelete(policy.id)}
                                    className="absolute top-4 right-4 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                                    title="Remove Policy"
                                >
                                    <Trash2 size={20} />
                                </button>

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
                                    <div><p className="text-xs text-slate-400 mb-1">Renewal</p><p className="font-semibold text-slate-700 text-sm">{policy.renewalDate}</p></div>
                                    <div><p className="text-xs text-slate-400 mb-1">Premium</p><p className="font-semibold text-blue-600 text-sm">₹{policy.premium.toLocaleString()}</p></div>
                                    <div><p className="text-xs text-slate-400 mb-1">Mode</p><p className="font-semibold text-slate-700 text-sm">Yearly</p></div>
                                </div>

                                <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                                    <button onClick={() => handleDownload(policy)} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"><Download size={16} /> Download Policy</button>
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"><FileText size={16} /> File Claim</button>
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors ml-auto"><RefreshCw size={16} /> Renew Now</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyPolicies;