import React, { useState, useEffect } from 'react';

const MyPolicies = ({ onBack }) => {
    const [myPolicies, setMyPolicies] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyPolicies = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const res = await fetch('http://127.0.0.1:8000/my-policies', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setMyPolicies(data);
                }
            } catch (error) {
                console.error("Error fetching my policies:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMyPolicies();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6">
            <div className="max-w-6xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
                <button onClick={onBack} className="flex items-center text-slate-500 hover:text-blue-600 transition font-medium self-start md:self-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Dashboard
                </button>
                <h1 className="text-3xl font-bold text-slate-800">My Purchased Policies</h1>
            </div>

            {loading ? (
                <div className="text-center py-20 text-slate-400">Loading your portfolio...</div>
            ) : (
                <div className="max-w-6xl mx-auto space-y-4">
                    {myPolicies.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                            <div className="mx-auto h-16 w-16 text-slate-300 mb-4">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-slate-700">No Policies Found</h3>
                            <p className="text-slate-500 mb-4">You haven't bought any policies yet.</p>
                        </div>
                    ) : (
                        myPolicies.map((item) => (
                            <div key={item.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${item.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {item.status}
                                        </span>
                                        <span className="text-xs text-slate-400">Purchased: {item.purchase_date}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800">{item.policy.policy_name}</h3>
                                    <p className="text-slate-500">{item.policy.provider} • ₹{(item.policy.cover_amount / 100000).toFixed(1)} Lakh Cover</p>
                                </div>

                                <div className="text-right min-w-[150px]">
                                    <p className="text-sm text-slate-400 uppercase font-bold text-xs">Premium Paid</p>
                                    <p className="text-xl font-bold text-slate-800">₹{item.policy.premium.toLocaleString()}<span className="text-xs font-normal text-slate-400">/yr</span></p>
                                </div>

                                <button className="bg-blue-50 text-blue-600 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-100 transition-colors flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                    Download PDF
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default MyPolicies;