import React, { useState, useEffect, useRef } from 'react';
import {
    Search,
    Filter,
    CheckCircle,
    Info,
    Heart,
    BarChart2,
    X,
    Trash2,
    Shield,
    AlertCircle,
    Clock,
    ArrowLeft,
    Layers
} from 'lucide-react';

const FindInsurance = ({ onBack, autoOpenPolicyId, onModalClosed }) => {
    // --- STATES ---
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    // UI States
    const [selectedPolicy, setSelectedPolicy] = useState(null);
    const [showCompare, setShowCompare] = useState(false);
    const [wishlist, setWishlist] = useState([]);
    const [compareList, setCompareList] = useState([]);
    const [buyingId, setBuyingId] = useState(null);

    // Filter States
    const [showFilters, setShowFilters] = useState(false);
    const [activeCategory, setActiveCategory] = useState("All");
    const filterRef = useRef(null);

    // --- INITIAL LOAD & KEYBOARD LOGIC ---
    useEffect(() => {
        const savedWishlist = JSON.parse(localStorage.getItem('icra_wishlist') || '[]');
        setWishlist(savedWishlist);

        if (selectedPolicy || showCompare) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape') {
                if (selectedPolicy) {
                    handleCloseModal();
                }
                setShowCompare(false);
                setShowFilters(false);
            }
        };

        const handleClickOutside = (event) => {
            if (filterRef.current && !filterRef.current.contains(event.target)) {
                setShowFilters(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            document.body.style.overflow = 'auto';
            window.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [selectedPolicy, showCompare]);

    // --- HELPER: ENRICH DATA ---
    const enrichPolicy = (policy) => {
        const isHealth = (policy.category || 'General') === 'Health';
        const isAuto = (policy.category || 'General') === 'Auto';
        const isLife = (policy.category || 'General') === 'Life';

        return {
            ...policy,
            id: policy.id || Math.random(),
            policy_name: policy.policy_name || policy.name || "Insurance Plan",
            provider: policy.provider || "Unknown Provider",
            premium: Number(policy.premium) || 0,
            category: policy.category || "General",
            logo: isHealth ? "🏥" : isAuto ? "🚗" : isLife ? "🛡️" : "📄",
            cover: policy.cover || (isHealth ? "₹5 Lakhs" : "₹10 Lakhs"),
            claimsRatio: policy.claimsRatio || "98.5%",
            hospitals: policy.hospitals || (isHealth ? "10,000+" : "N/A"),
            description: policy.description || "Comprehensive coverage with extensive benefits including cashless claims and 24/7 support.",
            features: Array.isArray(policy.features) && policy.features.length > 0 ? policy.features : ["Cashless Claims", "24/7 Support", "Tax Benefits", "Instant Renewal"],
            reports: "Rated highly for claim settlement speed and customer support efficiency.",
            covered: ["In-patient Hospitalization", "Pre & Post Hospitalization", "Day Care Procedures", "Ambulance Charges", "Annual Health Checkup"],
            notCovered: ["Cosmetic Surgery", "Self-inflicted injuries", "War/Nuclear perils", "Breach of Law"],
            waitingPeriod: ["Initial: 30 Days", "Specific: 24 Months", "Pre-Existing: 36 Months"]
        };
    };

    // --- FETCH DATA ---
    useEffect(() => {
        const fetchPolicies = async () => {
            try {
                const response = await fetch('http://127.0.0.1:8000/policies');
                const data = await response.json();

                if (Array.isArray(data)) {
                    const enhancedData = data.map(enrichPolicy);
                    enhancedData.sort((a, b) => a.policy_name.localeCompare(b.policy_name));
                    setPolicies(enhancedData);
                } else {
                    setPolicies([]);
                }
                setLoading(false);
            } catch (error) {
                console.error("Error fetching policies:", error);
                setLoading(false);
            }
        };

        fetchPolicies();
    }, []);

    // --- AUTO-OPEN MODAL LOGIC ---
    useEffect(() => {
        if (autoOpenPolicyId && policies.length > 0) {
            const policyToOpen = policies.find(p => p.id === autoOpenPolicyId);
            if (policyToOpen) {
                setSelectedPolicy(policyToOpen);
            }
        }
    }, [autoOpenPolicyId, policies]);

    // --- HANDLERS ---
    const handleCloseModal = () => {
        setSelectedPolicy(null);
        if (onModalClosed) onModalClosed();
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
                handleCloseModal();
            } else {
                alert(data.detail || "Purchase failed.");
            }
        } catch (err) {
            alert("Network error. Try again later.");
        } finally {
            setBuyingId(null);
        }
    };

    const toggleWishlist = (e, policy) => {
        e.stopPropagation();
        let newWishlist;
        const exists = wishlist.some(p => p.id === policy.id);

        if (exists) {
            newWishlist = wishlist.filter(p => p.id !== policy.id);
        } else {
            newWishlist = [...wishlist, policy];
        }

        setWishlist(newWishlist);
        localStorage.setItem('icra_wishlist', JSON.stringify(newWishlist));
    };

    // --- COMPARE LOGIC ---
    const toggleCompare = (e, policy) => {
        e.stopPropagation();
        const exists = compareList.find(p => p.id === policy.id);

        if (exists) {
            setCompareList(compareList.filter(p => p.id !== policy.id));
        } else {
            if (compareList.length >= 3) {
                alert("You can compare up to 3 policies at a time.");
                return;
            }
            setCompareList([...compareList, policy]);
        }
    };

    const removeFromCompare = (policyId) => {
        setCompareList(compareList.filter(p => p.id !== policyId));
        if (compareList.length === 1) setShowCompare(false);
    };

    const isWishlisted = (id) => wishlist.some(p => p.id === id);
    const isCompared = (id) => compareList.some(p => p.id === id);

    // --- FILTERING ---
    const filteredPolicies = policies.filter(p => {
        const matchesSearch =
            p.policy_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.provider.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = activeCategory === "All" || p.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-32">

            {/* --- HEADER --- */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">

                    <div className="flex items-center gap-3">
                        <div
                            onClick={onBack}
                            className="p-2 -ml-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors text-slate-600"
                            title="Back to Dashboard"
                        >
                            <ArrowLeft size={24} />
                        </div>
                        <span className="text-xl font-bold text-slate-800 tracking-tight">Find Insurance</span>
                    </div>

                    <div className="flex gap-4 w-full md:w-auto relative">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search plans, providers..."
                                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`flex items-center gap-2 px-4 py-2 border rounded-lg transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-600' : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'}`}
                            >
                                <Filter size={18} />
                                <span className="hidden sm:inline">Filters</span>
                            </button>

                            {showFilters && (
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-40 animate-fade-in">
                                    <div className="px-4 py-2 border-b border-slate-50 text-xs font-bold text-slate-400 uppercase">Category</div>
                                    {['All', 'Health', 'Auto', 'Life', 'Travel'].map(cat => (
                                        <button
                                            key={cat}
                                            onClick={() => { setActiveCategory(cat); setShowFilters(false); }}
                                            className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${activeCategory === cat ? 'text-blue-600 font-bold' : 'text-slate-600'}`}
                                        >
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* --- CONTENT (Policies List) --- */}
            <div className="max-w-6xl mx-auto p-6">
                {loading ? (
                    <div className="text-center py-20 text-slate-400">Loading policies...</div>
                ) : filteredPolicies.length === 0 ? (
                    <div className="text-center py-20 text-slate-400">No policies found matching your criteria.</div>
                ) : (
                    <div className="space-y-4">
                        {filteredPolicies.map((policy) => (
                            <div
                                key={policy.id}
                                onClick={() => setSelectedPolicy(policy)}
                                className="group bg-white rounded-xl border border-slate-200 p-6 flex flex-col md:flex-row items-start md:items-center justify-between shadow-sm hover:shadow-md transition-all cursor-pointer relative overflow-hidden"
                            >
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${policy.category === 'Health' ? 'bg-red-500' :
                                    policy.category === 'Auto' ? 'bg-blue-500' :
                                        policy.category === 'Life' ? 'bg-green-500' : 'bg-slate-500'
                                    }`}></div>

                                <div className="flex items-center gap-4 mb-4 md:mb-0 w-full md:w-1/3">
                                    <div className="w-16 h-16 rounded-lg bg-slate-50 flex items-center justify-center text-3xl border border-slate-100 flex-shrink-0">
                                        {policy.logo}
                                    </div>
                                    <div>
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{policy.provider}</span>
                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-tight">{policy.policy_name}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{policy.category}</span>
                                            <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <CheckCircle size={10} /> {policy.claimsRatio}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-x-8 gap-y-2 w-full md:w-1/3 mb-4 md:mb-0 pl-0 md:pl-8 border-l-0 md:border-l border-slate-100">
                                    <div><p className="text-xs text-slate-400">Cover Amount</p><p className="font-semibold text-slate-700">{policy.cover}</p></div>
                                    <div><p className="text-xs text-slate-400">Network</p><p className="font-semibold text-slate-700">{policy.hospitals}</p></div>
                                    <div className="col-span-2"><p className="text-xs text-slate-400">Description</p><p className="text-sm text-slate-600 truncate">{policy.description}</p></div>
                                </div>

                                <div className="flex flex-col items-end gap-3 w-full md:w-auto pl-0 md:pl-8 border-l-0 md:border-l border-slate-100">
                                    <div className="text-right">
                                        <p className="text-xs text-slate-400">Premium/Year</p>
                                        <p className="text-2xl font-bold text-blue-600">₹{policy.premium.toLocaleString()}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={(e) => toggleCompare(e, policy)}
                                            className={`p-2 border rounded-lg transition-colors ${isCompared(policy.id)
                                                ? 'bg-blue-50 border-blue-200 text-blue-600'
                                                : 'text-slate-400 border-slate-200 hover:border-blue-200 hover:text-blue-600'
                                                }`}
                                            title={isCompared(policy.id) ? "Remove from Compare" : "Add to Compare"}
                                        >
                                            <BarChart2 size={18} fill={isCompared(policy.id) ? "currentColor" : "none"} />
                                        </button>

                                        <button onClick={(e) => toggleWishlist(e, policy)} className={`p-2 border rounded-lg transition-colors ${isWishlisted(policy.id) ? 'bg-pink-50 border-pink-200 text-pink-600' : 'text-slate-400 border-slate-200 hover:text-pink-500 hover:border-pink-200'}`} title="Wishlist"><Heart size={18} fill={isWishlisted(policy.id) ? "currentColor" : "none"} /></button>
                                        <button onClick={(e) => handleBuy(e, policy.id)} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow hover:bg-blue-700 transition-colors">Buy Now</button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* --- FLOATING COMPARE BAR --- */}
            {compareList.length > 0 && (
                <div className="fixed bottom-0 left-0 right-0 p-4 z-40 animate-slide-up">
                    <div className="max-w-xl mx-auto bg-slate-800 text-white rounded-xl shadow-2xl p-4 flex items-center justify-between border border-slate-700">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-600 p-2 rounded-lg relative">
                                <Layers size={20} className="text-white" />
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-800">
                                    {compareList.length}
                                </span>
                            </div>
                            <div>
                                <p className="font-bold text-sm">Compare Policies</p>
                                <p className="text-xs text-slate-400">{compareList.length} Selected</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => setCompareList([])} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white transition-colors">Clear</button>
                            <button onClick={() => setShowCompare(true)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold text-sm shadow-lg transition-colors">Compare Now</button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: DETAILS (Fixed Footer Issue Here) --- */}
            {selectedPolicy && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    {/* Fixed Layout: Flex Column with Hidden Overflow on Parent */}
                    <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] shadow-2xl animate-fade-in relative flex flex-col overflow-hidden">

                        {/* Close Button */}
                        <button onClick={handleCloseModal} className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full hover:bg-slate-200 transition-colors z-10"><X size={20} /></button>

                        {/* Header: Flex Shrink 0 (Always Visible) */}
                        <div className="p-8 border-b border-slate-100 bg-slate-50 flex-shrink-0">
                            <div className="flex items-center gap-4 mb-4">
                                <span className="text-4xl">{selectedPolicy.logo}</span>
                                <div><h2 className="text-2xl font-bold text-slate-800">{selectedPolicy.policy_name}</h2><p className="text-slate-500">{selectedPolicy.provider}</p></div>
                            </div>
                            <p className="text-slate-600 leading-relaxed max-w-2xl">{selectedPolicy.description}</p>
                        </div>

                        {/* Content: Flex 1 + min-h-0 (Scrollable Area) */}
                        <div className="p-8 space-y-8 overflow-y-auto flex-1 min-h-0">
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex gap-3 items-start"><Info className="text-blue-600 mt-1 flex-shrink-0" size={20} /><div><h4 className="font-bold text-blue-800 text-sm mb-1">Analyst Report</h4><p className="text-sm text-blue-700">{selectedPolicy.reports}</p></div></div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50"><p className="text-slate-400 text-xs uppercase font-bold mb-1">Cover</p><p className="text-lg font-bold text-slate-800">{selectedPolicy.cover}</p></div>
                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50"><p className="text-slate-400 text-xs uppercase font-bold mb-1">Settlement</p><p className="text-lg font-bold text-green-600">{selectedPolicy.claimsRatio}</p></div>
                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50"><p className="text-slate-400 text-xs uppercase font-bold mb-1">Network</p><p className="text-lg font-bold text-slate-800">{selectedPolicy.hospitals}</p></div>
                                <div className="p-4 border border-slate-100 rounded-xl bg-slate-50"><p className="text-slate-400 text-xs uppercase font-bold mb-1">Premium</p><p className="text-lg font-bold text-blue-600">₹{selectedPolicy.premium.toLocaleString()}</p></div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><CheckCircle className="text-green-500" size={20} /> What's Covered</h3><ul className="space-y-3">{selectedPolicy.covered.map((item, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-slate-600"><span className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5"></span>{item}</li>))}</ul></div>
                                <div><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><AlertCircle className="text-red-500" size={20} /> What's Not Covered</h3><ul className="space-y-3">{selectedPolicy.notCovered.map((item, idx) => (<li key={idx} className="flex items-start gap-2 text-sm text-slate-600"><span className="w-1.5 h-1.5 bg-red-400 rounded-full mt-1.5"></span>{item}</li>))}</ul></div>
                            </div>
                            <div className="border-t border-slate-100 pt-6"><h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2"><Clock className="text-orange-500" size={20} /> Waiting Period</h3><div className="flex flex-wrap gap-3">{selectedPolicy.waitingPeriod.map((item, idx) => (<span key={idx} className="px-3 py-1.5 bg-orange-50 text-orange-700 text-sm rounded-lg border border-orange-100 font-medium">{item}</span>))}</div></div>
                        </div>

                        {/* Footer: Flex Shrink 0 (Always Visible at Bottom) */}
                        <div className="p-6 border-t border-slate-100 flex gap-4 bg-white flex-shrink-0 z-20">
                            {/* Only Buy and Wishlist - Compare Icon Removed */}
                            <button onClick={(e) => handleBuy(e, selectedPolicy.id)} disabled={buyingId === selectedPolicy.id} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 disabled:opacity-50">{buyingId === selectedPolicy.id ? "Processing..." : "Buy Policy Now"}</button>
                            <button onClick={(e) => toggleWishlist(e, selectedPolicy)} className={`p-3 rounded-xl border transition-colors ${isWishlisted(selectedPolicy.id) ? 'bg-pink-50 border-pink-200 text-pink-600' : 'bg-white border-slate-200 text-slate-400 hover:border-pink-200 hover:text-pink-500'}`} title="Wishlist"><Heart size={24} fill={isWishlisted(selectedPolicy.id) ? "currentColor" : "none"} /></button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL: COMPARE --- */}
            {showCompare && (
                <div className="fixed inset-0 bg-white z-[60] overflow-auto animate-slide-up flex flex-col h-screen">
                    <div className="sticky top-0 bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center shadow-sm z-10 flex-shrink-0">
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2"><BarChart2 className="text-blue-600" /> Comparing {compareList.length} Policies</h2>
                        <button onClick={() => setShowCompare(false)} className="text-slate-500 hover:text-slate-800 flex items-center gap-1 font-medium"><X size={20} /></button>
                    </div>
                    <div className="flex-1 p-8 max-w-7xl mx-auto overflow-x-auto w-full">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-4 min-w-[200px] bg-slate-50 text-slate-500 font-semibold uppercase text-xs">Features</th>
                                    {compareList.map(p => (<th key={p.id} className="p-4 min-w-[250px] border-l border-slate-200 bg-slate-50 relative group"><div className="flex flex-col items-center text-center"><span className="text-3xl mb-2">{p.logo}</span><span className="font-bold text-slate-800 text-lg">{p.policy_name}</span><span className="text-xs text-slate-500">{p.provider}</span><button onClick={() => removeFromCompare(p.id)} className="mt-2 text-red-500 text-xs hover:underline flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /> Remove</button></div></th>))}
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-slate-100"><td className="p-4 font-bold text-slate-700">Premium</td>{compareList.map(p => (<td key={p.id} className="p-4 text-center border-l border-slate-100 text-xl font-bold text-blue-600">₹{p.premium.toLocaleString()}</td>))}</tr>
                                <tr className="border-b border-slate-100"><td className="p-4 font-medium text-slate-600">Cover</td>{compareList.map(p => (<td key={p.id} className="p-4 text-center border-l border-slate-100 font-semibold">{p.cover}</td>))}</tr>
                                <tr className="border-b border-slate-100"><td className="p-4 font-medium text-slate-600">Settlement</td>{compareList.map(p => (<td key={p.id} className="p-4 text-center border-l border-slate-100 font-semibold text-green-600">{p.claimsRatio}</td>))}</tr>
                                <tr className="border-b border-slate-100"><td className="p-4 font-medium text-slate-600">Features</td>{compareList.map(p => (<td key={p.id} className="p-4 text-center border-l border-slate-100 align-top"><ul className="text-sm text-slate-600 space-y-1 text-left inline-block">{(p.features || []).slice(0, 3).map(f => <li key={f}>• {f}</li>)}</ul></td>))}</tr>
                                <tr><td className="p-4"></td>{compareList.map(p => (<td key={p.id} className="p-4 text-center border-l border-slate-100"><button onClick={(e) => handleBuy(e, p.id)} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold shadow-md hover:bg-blue-700 transition-colors">Buy</button></td>))}</tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindInsurance;