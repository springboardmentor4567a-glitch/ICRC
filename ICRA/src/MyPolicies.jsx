import React, { useState } from 'react';
import {
    ArrowLeft,
    Download,
    FileText,
    RefreshCw,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

const MyPolicies = ({ onBack }) => {
    // Mock Data for Active Policies
    const [myPolicies] = useState([
        {
            id: 101,
            name: "Titanium Health Plus",
            provider: "HDFC ERGO",
            policyNumber: "POL-8829-2024",
            status: "Active",
            renewalDate: "12 Oct 2025",
            premium: 12500,
            logo: "🛡️"
        },
        {
            id: 102,
            name: "Drive Assure Elite",
            provider: "Bajaj Allianz",
            policyNumber: "CAR-9921-2023",
            status: "Expiring Soon",
            renewalDate: "15 Jan 2025",
            premium: 4500,
            logo: "🚗"
        }
    ]);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">

            {/* --- HEADER (Arrow + Page Name Only) --- */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-4">
                    <div
                        onClick={onBack}
                        className="p-2 -ml-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors text-slate-600"
                        title="Back to Dashboard"
                    >
                        <ArrowLeft size={24} />
                    </div>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">My Policies</span>
                </div>
            </div>

            {/* --- CONTENT --- */}
            <div className="max-w-6xl mx-auto p-6">
                {myPolicies.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">You have no active policies.</div>
                ) : (
                    <div className="space-y-4">
                        {myPolicies.map((policy) => (
                            <div key={policy.id} className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all">

                                {/* Top Row: Provider & Status */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center text-2xl border border-slate-100">
                                            {policy.logo}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{policy.name}</h3>
                                            <p className="text-xs text-slate-500 font-medium uppercase tracking-wide">{policy.provider}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${policy.status === 'Active'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-orange-100 text-orange-700'
                                        }`}>
                                        {policy.status === 'Active' ? <CheckCircle size={12} /> : <AlertTriangle size={12} />}
                                        {policy.status}
                                    </span>
                                </div>

                                {/* Details Grid */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-slate-50 rounded-lg border border-slate-100">
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Policy Number</p>
                                        <p className="font-semibold text-slate-700 text-sm">{policy.policyNumber}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Renewal Date</p>
                                        <p className="font-semibold text-slate-700 text-sm">{policy.renewalDate}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Premium</p>
                                        <p className="font-semibold text-blue-600 text-sm">₹{policy.premium.toLocaleString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 mb-1">Payment Mode</p>
                                        <p className="font-semibold text-slate-700 text-sm">Yearly</p>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-wrap gap-3 pt-2 border-t border-slate-100">
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                                        <Download size={16} /> Download Policy
                                    </button>
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-slate-200 rounded-lg text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                                        <FileText size={16} /> File Claim
                                    </button>
                                    <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 shadow-sm transition-colors ml-auto">
                                        <RefreshCw size={16} /> Renew Now
                                    </button>
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