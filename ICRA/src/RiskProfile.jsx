import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Shield, DollarSign, Activity, Home, AlertCircle, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const RiskProfile = ({ onBack, onComplete }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Health, 2: Finance, 3: Assets

    const [formData, setFormData] = useState({
        // 1. HEALTH
        age: '', height: '', weight: '', smoker: false, alcohol: 'None', medical_history: [],
        // 2. FINANCE
        occupation: 'Salaried', annual_income: '', dependents: '', existing_loans: '', retirement_age: '',
        // 3. ASSETS
        vehicle_type: 'None', vehicle_age: '0', home_ownership: 'Rented', top_priority: 'Low Premium',
    });

    useEffect(() => {
        const loadProfile = async () => {
            const token = localStorage.getItem('access_token');
            try {
                const res = await fetch('http://127.0.0.1:8000/user/profile', { headers: { 'Authorization': `Bearer ${token}` } });
                if (res.ok) {
                    const data = await res.json();
                    if (data.risk_profile) setFormData(prev => ({ ...prev, ...data.risk_profile }));
                }
            } catch (err) { console.error("Failed to load", err); }
        };
        loadProfile();
    }, []);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const toggleCondition = (condition) => {
        setFormData(prev => {
            const current = Array.isArray(prev.medical_history) ? prev.medical_history : [];
            return current.includes(condition) ? { ...prev, medical_history: current.filter(c => c !== condition) } : { ...prev, medical_history: [...current, condition] };
        });
    };

    const handleSubmit = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch('http://127.0.0.1:8000/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(formData)
            });
            if (res.ok) {
                await fetch('http://127.0.0.1:8000/recommendations', { headers: { 'Authorization': `Bearer ${token}` } });
                onComplete();
            } else { alert("Failed to save."); }
        } catch (err) { alert("Error saving."); } finally { setLoading(false); }
    };

    // --- STEPS UI ---
    const renderStep1 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Age</label><input type="number" name="age" value={formData.age} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="e.g. 30" /></div>
                <div className="grid grid-cols-2 gap-4">
                    <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Height (cm)</label><input type="number" name="height" value={formData.height} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" placeholder="175" /></div>
                    <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Weight (kg)</label><input type="number" name="weight" value={formData.weight} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none" placeholder="70" /></div>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Lifestyle & Habits</label>
                <div className="flex flex-col md:flex-row gap-4">
                    <select name="alcohol" value={formData.alcohol} onChange={handleChange} className="flex-1 p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none">
                        <option value="None">Alcohol: None</option>
                        <option value="Social">Alcohol: Social</option>
                        <option value="Regular">Alcohol: Regular</option>
                    </select>
                    <div onClick={() => setFormData({ ...formData, smoker: !formData.smoker })} className={`flex-1 p-4 border rounded-xl flex items-center gap-3 cursor-pointer transition-all ${formData.smoker ? 'bg-red-50 border-red-300 text-red-700' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.smoker ? 'bg-red-600 border-red-600' : 'bg-white border-slate-300'}`}>{formData.smoker && <Check size={12} className="text-white" />}</div>
                        <span className="font-medium">I smoke / use tobacco</span>
                    </div>
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Medical History</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {['Diabetes', 'Hypertension', 'Asthma', 'Thyroid', 'Heart Condition', 'None'].map(cond => (
                        <button key={cond} onClick={() => toggleCondition(cond)} className={`p-3 rounded-xl text-sm font-bold border transition-all ${(formData.medical_history || []).includes(cond) ? 'bg-red-100 border-red-300 text-red-800 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{cond}</button>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderStep2 = () => (
        <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Occupation</label>
                    <select name="occupation" value={formData.occupation} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none">
                        <option value="Salaried">Salaried (Office)</option>
                        <option value="Business">Business Owner</option>
                        <option value="Student">Student</option>
                        <option value="Retired">Retired</option>
                        <option value="Hazardous">Hazardous (Factory/Mining)</option>
                    </select>
                </div>
                <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Annual Income (₹)</label><input type="number" name="annual_income" value={formData.annual_income} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="e.g. 1200000" /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Current Debt / Loans (₹)</label><input type="number" name="existing_loans" value={formData.existing_loans} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="Total loan amount" /></div>
                <div><label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Dependents</label><input type="number" name="dependents" value={formData.dependents} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-green-500 outline-none" placeholder="No. of people relying on you" /></div>
            </div>
        </div>
    );

    const renderStep3 = () => (
        <div className="space-y-6 animate-fade-in">
            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Vehicle Details</label>
                <div className="flex gap-4 mb-4">
                    {['None', 'Car', 'Bike'].map(v => (
                        <button key={v} onClick={() => setFormData({ ...formData, vehicle_type: v })} className={`flex-1 p-4 rounded-xl font-bold border transition-all ${formData.vehicle_type === v ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>{v}</button>
                    ))}
                </div>
                {formData.vehicle_type !== 'None' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Vehicle Age (Years)</label>
                        <input type="number" name="vehicle_age" value={formData.vehicle_age} onChange={handleChange} className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
                    </div>
                )}
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Home Ownership</label>
                <div className="flex gap-4">
                    {['Owned', 'Rented'].map(h => (
                        <button key={h} onClick={() => setFormData({ ...formData, home_ownership: h })} className={`flex-1 p-4 rounded-xl font-bold border flex items-center justify-center gap-2 transition-all ${formData.home_ownership === h ? 'bg-purple-100 border-purple-300 text-purple-800 shadow-sm' : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'}`}>
                            <Home size={18} /> {h}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="text-xs font-bold text-slate-500 uppercase mb-3 block">Primary Goal</label>
                <select name="top_priority" value={formData.top_priority} onChange={handleChange} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-medium">
                    <option value="Low Premium">💰 I want the Lowest Premium</option>
                    <option value="Max Cover">🛡️ I want Maximum Coverage</option>
                    <option value="Tax Saving">📉 I want Tax Saving</option>
                </select>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">

            {/* CARD CONTAINER */}
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-xl overflow-hidden border border-slate-100">

                {/* HEADER & PROGRESS */}
                <div className="bg-white p-8 border-b border-slate-100 relative">
                    <button onClick={onBack} className="absolute top-8 left-8 text-slate-400 hover:text-slate-600 transition-colors"><ArrowLeft size={24} /></button>
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Build Your Risk Profile</h1>
                        <p className="text-slate-500 text-sm">Step {step} of 3</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
                        <div className={`h-full transition-all duration-500 ease-out rounded-full ${step === 1 ? 'w-1/3 bg-red-500' : step === 2 ? 'w-2/3 bg-green-500' : 'w-full bg-blue-500'}`}></div>
                    </div>
                </div>

                {/* STEP CONTENT */}
                <div className="p-8 min-h-[400px]">
                    {step === 1 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6 text-red-600 bg-red-50 p-3 rounded-xl w-fit"><Activity size={20} /><span className="font-bold">Health & Lifestyle</span></div>
                            {renderStep1()}
                        </div>
                    )}
                    {step === 2 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6 text-green-600 bg-green-50 p-3 rounded-xl w-fit"><DollarSign size={20} /><span className="font-bold">Financial & Career</span></div>
                            {renderStep2()}
                        </div>
                    )}
                    {step === 3 && (
                        <div>
                            <div className="flex items-center gap-3 mb-6 text-blue-600 bg-blue-50 p-3 rounded-xl w-fit"><Shield size={20} /><span className="font-bold">Assets & Goals</span></div>
                            {renderStep3()}
                        </div>
                    )}
                </div>

                {/* FOOTER NAVIGATION */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${step === 1 ? 'opacity-0 pointer-events-none' : 'text-slate-600 hover:bg-white hover:shadow-sm'}`}
                    >
                        <ChevronLeft size={20} /> Back
                    </button>

                    {step < 3 ? (
                        <button onClick={() => setStep(s => s + 1)} className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center gap-2">
                            Next Step <ChevronRight size={20} />
                        </button>
                    ) : (
                        <button onClick={handleSubmit} disabled={loading} className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center gap-2">
                            {loading ? "Analyzing..." : "Finish & Analyze"} <Check size={20} />
                        </button>
                    )}
                </div>

            </div>
        </div>
    );
};

export default RiskProfile;