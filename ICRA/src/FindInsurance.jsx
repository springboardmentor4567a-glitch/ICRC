import React, { useState, useEffect } from 'react';

const FindInsurance = ({ onBack }) => {
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('All');
    const [buyingId, setBuyingId] = useState(null); // Which policy is being bought?

    // --- FETCH DATA FROM BACKEND ---
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/policies');
                const data = await response.json();
                setPolicies(data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching policies:", error);
                setLoading(false);
            }
        };

        fetchPolicies();
    }, []);

    // --- BUY LOGIC ---
    const handleBuy = async (policyId) => {
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
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await res.json();

            if (res.ok) {
                alert(data.message); // Success Message
            } else {
                alert(data.detail || "Purchase failed.");
            }
        } catch (err) {
            console.error("Purchase Error:", err);
            alert("Network error. Try again later.");
        } finally {
            setBuyingId(null);
        }
    };

    // --- FILTERING ---
    const filteredPolicies = filter === 'All'
        ? policies
        : policies.filter(p => p.category === filter);

    const categories = ['All', 'Health', 'Auto', 'Life', 'Travel', 'Home', 'Cyber', 'Gadget', 'Pet'];

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6">
            {/* --- HEADER & BACK BUTTON --- */}
            <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <button onClick={onBack} className="flex items-center text-slate-500 hover:text-blue-600 transition font-medium self-start md:self-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-slate-800">Find Insurance Plans</h1>
            </div>

            {/* --- CATEGORY TABS --- */}
            <div className="max-w-6xl mx-auto mb-8 flex flex-wrap gap-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setFilter(cat)}
                        className={`px-4 py-2 rounded-full font-bold text-sm transition-all shadow-sm border
              ${filter === cat
                                ? 'bg-blue-600 text-white border-blue-600 shadow-blue-200 transform scale-105'
                                : 'bg-white text-slate-600 hover:bg-slate-50 border-slate-200'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* --- POLICY GRID --- */}
            <div className="max-w-6xl mx-auto">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading policies from database...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                        {filteredPolicies.map((policy) => (
                            <div key={policy.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-lg transition-all hover:-translate-y-1 group cursor-pointer flex flex-col h-full">

                                {/* Card Header Color Strip */}
                                <div className={`h-2 w-full ${policy.category === 'Health' ? 'bg-red-500' :
                                        policy.category === 'Auto' ? 'bg-blue-500' :
                                            policy.category === 'Life' ? 'bg-green-500' :
                                                policy.category === 'Travel' ? 'bg-yellow-500' : 'bg-slate-500'
                                    }`}></div>

                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-bold px-2 py-1 rounded-md uppercase tracking-wide bg-slate-100 text-slate-600">
                                            {policy.category}
                                        </span>
                                        <span className="text-xs font-semibold text-slate-400">{policy.provider}</span>
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-blue-600 transition-colors">{policy.policy_name}</h3>
                                    <p className="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{policy.description}</p>

                                    <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
                                        <div>
                                            <p className="text-xs text-slate-400 font-bold uppercase">Premium/Yr</p>
                                            <p className="font-bold text-blue-600 text-lg">₹{policy.premium.toLocaleString()}</p>
                                        </div>
                                        <button
                                            onClick={() => handleBuy(policy.id)}
                                            disabled={buyingId === policy.id}
                                            className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-bold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                                        >
                                            {buyingId === policy.id ? "..." : "Buy Now"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindInsurance;