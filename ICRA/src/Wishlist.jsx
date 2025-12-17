import React, { useState, useEffect } from 'react';
import {
    Heart,
    Trash2,
    CheckCircle,
    Info,
    X,
    BarChart2,
    ArrowLeft,
    Clock,
    Shield,
    AlertCircle
} from 'lucide-react';

const Wishlist = ({ onBack }) => {
    // --- STATES ---
    const [wishlistItems, setWishlistItems] = useState([]);
    const [selectedPolicy, setSelectedPolicy] = useState(null); // For Detail Modal
    const [buyingId, setBuyingId] = useState(null);

    // --- LOAD DATA ON MOUNT ---
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem('icra_wishlist') || '[]');
        setWishlistItems(saved);

        // Scroll Lock Logic for Modal
        if (selectedPolicy) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        // ESC Key to Close Modal
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setSelectedPolicy(null);
        };
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [selectedPolicy]);

    // --- HANDLERS ---
    const handleRemove = (e, id) => {
        e.stopPropagation();
        const updatedList = wishlistItems.filter(item => item.id !== id);
        setWishlistItems(updatedList);
        localStorage.setItem('icra_wishlist', JSON.stringify(updatedList));
        if (selectedPolicy && selectedPolicy.id === id) setSelectedPolicy(null);
    };

    const handleBuy = async (e, policyId) => {
        e.stopPropagation();
        setBuyingId(policyId);
        const token = localStorage.getItem('access_token');

        if (!token) {
            alert("You must be logged in to buy a policy.");
            setBuyingId(null);
            return;
        }

        try {
            const res = await fetch(`http://127.0.0.1:8000/buy/${policyId}`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            const data = await res.json();
            if (res.ok) {
                alert(data.message);
                handleRemove(e, policyId); // Auto-remove after buying
                setSelectedPolicy(null);
            } else {
                alert(data.detail || "Purchase failed.");
            }
        } catch (err) {
            alert("Network error. Try again later.");
        } finally {
            setBuyingId(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">

            {/* --- HEADER (Arrow + Text Only) --- */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <div
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors text-slate-600"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={24} />
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">My Wishlist</span>
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="max-w-6xl mx-auto p-6">
                {wishlistItems.length === 0 ? (
                    <div className="text-center py-20 flex flex-col items-center">
                        <div className="bg-slate-100 w-24 h-24 rounded-full flex items-center justify-center mb-6">
                            <Heart size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Your wishlist is empty</h3>
                        <p className="text-slate-500 mb-6">Save policies here to compare or buy them later.</p>
                        <button onClick={onBack} className="text-blue-600 font-bold hover:underline">Return to Dashboard</button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {wishlistItems.map((policy) => (
                            <div
                                key={policy.id}
                                onClick={() => setSelectedPolicy(policy)}
                                className="group bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                            >
                                {/* Category Color Strip */}
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${policy.category === 'Health' ? 'bg-red-500' :
                                        policy.category === 'Auto' ? 'bg-blue-500' :
                                            policy.category === 'Life' ? 'bg-green-500' : 'bg-slate-500'
                                    }`}></div>

                                {/* Main Info */}
                                <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-1/3">
                                    <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center text-3xl border border-slate-100 flex-shrink-0">
                                        {policy.logo}
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{policy.provider}</span>
                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{policy.policy_name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{policy.category}</span>
                                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle size={10} /> {policy.claimsRatio}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Key Stats */}
                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full md:w-1/3 mb-4 md:mb-0 pl-0 md:pl-8 border-l-0 md:border-l border-slate-100">
                                    <div><p className="text-xs text-slate-400">Cover Amount</p><p className="font-semibold text-slate-700">{policy.cover}</p></div>
                                    <div><p className="text-xs text-slate-400">Network</p><p className="font-semibold text-slate-700">{policy.hospitals}</p></div>
                                    <div className="col-span-2"><p className="text-xs text-slate-400">Description</p><p className="text-sm text-slate-600 truncate">{policy.description}</p></div>
                                </div>

                                {/* Price & Action */}
                                <div className="flex flex-col items-end gap-3 w-full md:w-auto pl-0 md:pl-8 border-l-0 md:border-l border-slate-100">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Premium/Year</p>
                                        <p className="text-2xl font-bold text-blue-600">₹{policy.premium.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => handleRemove(e, policy.id)}
                                            className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors"
                                            title="Remove"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                        <button
                                            onClick={(e) => handleBuy(e, policy.id)}
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition-colors"
                                        >
                                            Buy Now
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- MODAL: DETAILS --- */}
            {selectedPolicy && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-fade-in relative flex flex-col">
                        <button onClick={() => setSelectedPolicy(null)} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"><X size={20} /></button>
                        <div className="p-8 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-4xl">{selectedPolicy.logo}</span>
                                <div><h2 className="text-2xl font-bold text-slate-800">{selectedPolicy.policy_name}</h2><p className="text-slate-500">{selectedPolicy.provider}</p></div>
                            </div>
                            <p className="text-slate-600 leading-relaxed max-w-2xl">{selectedPolicy.description}</p>
                        </div>
                        <div className="p-8 space-y-8 overflow-y-auto flex-1">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 items-start"><Info className="text-blue-600 mt-1 flex-shrink-0" size={20} /><div><h4 className="font-bold text-blue-800 text-sm mb-1">Analyst Report</h4><p className="text-sm text-blue-700">{selectedPolicy.reports}</p></div></div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50"><p className="text-slate-400 text-xs uppercase font-bold mb-1">Cover</p><p className="text-lg font-bold text-slate-800">{selectedPolicy.cover}</p></div>
                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50"><p className="text-slate-400 text-xs uppercase font-bold mb-1">Settlement</p><p className="text-lg font-bold text-green-600">{selectedPolicy.claimsRatio}</p></div>
                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50"><p className="text-slate-400 text-xs uppercase font-bold mb-1">Network</p><p className="text-lg font-bold text-slate-800">{selectedPolicy.hospitals}</p></div>
                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50"><p className="text-slate-400 text-xs uppercase font-bold mb-1">Premium</p><p className="text-lg font-bold text-blue-600">₹{selectedPolicy.premium.toLocaleString()}</p></div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle className="text-green-500" size={20} /> What's Covered</h3><ul className="space-y-3">{(selectedPolicy.covered || []).map((item, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-slate-600"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>{item}</li>))}</ul></div>
                                <div><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertCircle className="text-red-500" size={20} /> What's Not Covered</h3><ul className="space-y-3">{(selectedPolicy.notCovered || []).map((item, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-slate-600"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></span>{item}</li>))}</ul></div>
                            </div>
                            <div className="border-t border-slate-100 pt-6"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock className="text-orange-500" size={20} /> Waiting Period</h3><div className="flex flex-wrap gap-3">{(selectedPolicy.waitingPeriod || []).map((item, idx) => (<span key={idx} className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-100 font-medium">{item}</span>))}</div></div>
                        </div>

                        {/* Sticky Footer */}
                        <div className="p-6 border-t border-slate-100 flex gap-4 bg-white z-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                            <button
                                onClick={(e) => handleBuy(e, selectedPolicy.id)}
                                disabled={buyingId === selectedPolicy.id}
                                className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50"
                            >
                                {buyingId === selectedPolicy.id ? "Processing..." : "Buy Policy Now"}
                            </button>

                            <button
                                onClick={(e) => handleRemove(e, selectedPolicy.id)}
                                className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-600 hover:bg-red-100 transition-colors flex items-center gap-2 font-semibold"
                            >
                                <Trash2 size={20} /> Remove
                            </button>
                        </div>

                    </div>
                </div>
            )}

        </div>
    );
};

export default Wishlist;