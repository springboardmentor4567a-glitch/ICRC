import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, ShoppingCart, FileText, Shield, CheckCircle, AlertTriangle, Calendar, ChevronDown, ChevronUp } from 'lucide-react';

const ActivityLog = ({ onBack }) => {
    const [policyHistory, setPolicyHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedPolicyId, setExpandedPolicyId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                // Fetch Policies and Claims
                const [policiesRes, claimsRes] = await Promise.all([
                    fetch('http://127.0.0.1:8000/my-policies', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://127.0.0.1:8000/claims', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);

                const policies = policiesRes.ok ? await policiesRes.json() : [];
                const claims = claimsRes.ok ? await claimsRes.json() : [];

                // --- SMART GROUPING LOGIC ---
                const groupedData = policies.map(policy => {
                    // 1. Create the "Purchase" Event
                    const events = [{
                        id: `purchase-${policy.id}`,
                        type: 'Purchase',
                        title: 'Policy Purchased',
                        date: policy.purchase_date,
                        desc: 'Coverage started successfully.',
                        icon: <ShoppingCart size={14} />,
                        color: 'bg-green-100 text-green-600',
                        amount: policy.policy.premium
                    }];

                    // 2. Find Claims related to THIS policy
                    const policyClaims = claims.filter(c => c.purchase_id === policy.id);

                    policyClaims.forEach(c => {
                        events.push({
                            id: `claim-${c.id}`,
                            type: 'Claim',
                            title: `Claim Filed: ${c.incident_type}`,
                            date: c.created_at,
                            desc: c.description,
                            status: c.status,
                            icon: <FileText size={14} />,
                            color: c.status === 'Approved' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600',
                            amount: c.claim_amount
                        });
                    });

                    // 3. Sort events (Newest First)
                    events.sort((a, b) => new Date(b.date) - new Date(a.date));

                    return {
                        ...policy,
                        events: events,
                        totalClaims: policyClaims.length,
                        totalClaimAmount: policyClaims.reduce((sum, c) => sum + c.claim_amount, 0)
                    };
                });

                setPolicyHistory(groupedData);
                // Auto-expand the first policy if exists
                if (groupedData.length > 0) setExpandedPolicyId(groupedData[0].id);

            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const toggleExpand = (id) => {
        setExpandedPolicyId(expandedPolicyId === id ? null : id);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">

            {/* Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-3xl mx-auto flex items-center gap-4">
                    <div onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 cursor-pointer text-slate-600 transition-colors">
                        <ArrowLeft size={24} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Clock className="text-blue-600" size={20} /> Policy History
                        </h1>
                        <p className="text-xs text-slate-500">Full timeline of your purchases and claims.</p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-3xl mx-auto p-6 space-y-6">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading your history...</div>
                ) : policyHistory.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">
                        <Shield size={48} className="mx-auto mb-3 opacity-20" />
                        <p>No policy history found.</p>
                    </div>
                ) : (
                    policyHistory.map((item) => (
                        <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all duration-300">

                            {/* Policy Header Card */}
                            <div
                                onClick={() => toggleExpand(item.id)}
                                className="p-6 cursor-pointer hover:bg-slate-50 transition-colors flex items-start justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-2xl border border-slate-200">
                                        {item.policy.category === 'Health' ? "🏥" : item.policy.category === 'Auto' ? "🚗" : "🛡️"}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 text-lg">{item.policy.policy_name}</h3>
                                        <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{item.policy.provider} • ID: {1000 + item.id}</p>
                                        <div className="flex gap-3 mt-2">
                                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${item.status === 'Active' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                {item.status === 'Active' ? <CheckCircle size={10} /> : <AlertTriangle size={10} />} {item.status}
                                            </span>
                                            {item.totalClaims > 0 && (
                                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-orange-50 text-orange-700 border border-orange-200 flex items-center gap-1">
                                                    <FileText size={10} /> {item.totalClaims} Claims
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-slate-400">
                                    {expandedPolicyId === item.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {/* Timeline Details (Collapsible) */}
                            {expandedPolicyId === item.id && (
                                <div className="bg-slate-50/50 border-t border-slate-100 p-6">
                                    <div className="relative pl-4 border-l-2 border-slate-200 space-y-8 ml-2">

                                        {item.events.map((event, idx) => (
                                            <div key={idx} className="relative">
                                                {/* Dot on Line */}
                                                <div className={`absolute -left-[25px] top-0 w-4 h-4 rounded-full border-2 border-white shadow-sm flex items-center justify-center ${event.color}`}>
                                                    <div className="w-2 h-2 bg-current rounded-full"></div>
                                                </div>

                                                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className={`p-1 rounded-md ${event.color}`}>{event.icon}</span>
                                                            <h4 className="font-bold text-slate-800 text-sm">{event.title}</h4>
                                                            {event.status && (
                                                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${event.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                                    {event.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed max-w-md">{event.desc}</p>
                                                    </div>
                                                    <div className="text-left md:text-right">
                                                        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 md:justify-end">
                                                            <Calendar size={10} /> {formatDate(event.date)}
                                                        </span>
                                                        <span className="block font-bold text-slate-700 mt-1">
                                                            {event.type === 'Purchase' ? 'Paid: ' : 'Claim: '}
                                                            ₹{event.amount.toLocaleString()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default ActivityLog;