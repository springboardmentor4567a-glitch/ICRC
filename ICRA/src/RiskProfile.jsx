import React, { useState } from 'react';
import { ArrowLeft, CheckCircle, ChevronRight, Activity, DollarSign, Home, User } from 'lucide-react';

const RiskProfile = ({ onBack, onComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // --- FORM STATE ---
    const [formData, setFormData] = useState({
        marital_status: "Single",
        dependents: 0,
        annual_income: "",
        debt: 0,
        health_conditions: [],
        smoker: false,
        vehicle_type: "None",
        own_house: false
    });

    // --- OPTIONS ---
    const healthOptions = ["Diabetes", "Hypertension", "Asthma", "Heart Condition", "None"];

    // --- HANDLERS ---
    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleHealthChange = (condition) => {
        let current = [...formData.health_conditions];
        if (current.includes(condition)) {
            current = current.filter(c => c !== condition);
        } else {
            if (condition === "None") current = ["None"];
            else {
                current = current.filter(c => c !== "None");
                current.push(condition);
            }
        }
        setFormData({ ...formData, health_conditions: current });
    };

    // --- SUBMIT LOGIC ---
    const handleSubmit = async () => {
        setLoading(true);
        const token = localStorage.getItem('access_token');

        try {
            const res = await fetch('http://127.0.0.1:8000/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...formData,
                    dependents: Number(formData.dependents),
                    annual_income: Number(formData.annual_income),
                    debt: Number(formData.debt)
                })
            });

            if (res.ok) {
                alert("Profile Updated Successfully!");
                onComplete(); // Go back to dashboard or next step
            } else {
                alert("Failed to update profile.");
            }
        } catch (error) {
            console.error(error);
            alert("Network Error");
        } finally {
            setLoading(false);
        }
    };

    // --- RENDER STEPS ---
    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2"><User size={24} className="text-blue-600" /> Personal Details</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Marital Status</label>
                            <select name="marital_status" value={formData.marital_status} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white">
                                <option>Single</option>
                                <option>Married</option>
                                <option>Divorced</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Number of Dependents (Children/Parents)</label>
                            <input type="number" name="dependents" value={formData.dependents} onChange={handleChange} className="w-full p-3 border rounded-lg" min="0" />
                        </div>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2"><DollarSign size={24} className="text-green-600" /> Financial Status</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Annual Income (₹)</label>
                            <input type="number" name="annual_income" value={formData.annual_income} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="e.g. 1000000" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Total Outstanding Debt (Loans/EMIs)</label>
                            <input type="number" name="debt" value={formData.debt} onChange={handleChange} className="w-full p-3 border rounded-lg" placeholder="e.g. 500000" />
                        </div>
                    </div>
                );
            case 3:
                return (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2"><Activity size={24} className="text-red-600" /> Health Profile</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-3">Do you have any pre-existing conditions?</label>
                            <div className="grid grid-cols-2 gap-3">
                                {healthOptions.map(opt => (
                                    <div key={opt} onClick={() => handleHealthChange(opt)}
                                        className={`p-3 rounded-lg border cursor-pointer flex items-center gap-2 transition-all ${formData.health_conditions.includes(opt) ? 'bg-red-50 border-red-500 text-red-700 font-bold' : 'hover:bg-slate-50'}`}>
                                        <div className={`w-5 h-5 rounded border flex items-center justify-center ${formData.health_conditions.includes(opt) ? 'bg-red-500 border-red-500' : 'border-slate-300'}`}>
                                            {formData.health_conditions.includes(opt) && <CheckCircle size={14} className="text-white" />}
                                        </div>
                                        {opt}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <input type="checkbox" name="smoker" checked={formData.smoker} onChange={handleChange} className="w-5 h-5 accent-red-600" />
                            <label className="text-slate-700 font-medium">I am a smoker / consumer of tobacco products</label>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-fade-in space-y-6">
                        <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2"><Home size={24} className="text-purple-600" /> Assets & Lifestyle</h3>
                        <div>
                            <label className="block text-sm font-medium text-slate-600 mb-2">Do you own a vehicle?</label>
                            <select name="vehicle_type" value={formData.vehicle_type} onChange={handleChange} className="w-full p-3 border rounded-lg bg-white">
                                <option value="None">No Vehicle</option>
                                <option value="Two Wheeler">Two Wheeler (Bike/Scooter)</option>
                                <option value="Four Wheeler">Four Wheeler (Car)</option>
                                <option value="Both">Both</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                            <input type="checkbox" name="own_house" checked={formData.own_house} onChange={handleChange} className="w-5 h-5 accent-purple-600" />
                            <label className="text-slate-700 font-medium">I own a house / apartment</label>
                        </div>
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24">
            {/* HEADER - Updated to match Dashboard/FindInsurance alignment */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-6xl mx-auto flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    <span className="text-xl font-bold text-slate-800 tracking-tight">Complete Risk Profile</span>
                </div>
            </div>

            {/* PROGRESS BAR */}
            <div className="max-w-2xl mx-auto mt-8 px-6">
                <div className="flex justify-between mb-2">
                    {['Personal', 'Financial', 'Health', 'Assets'].map((label, idx) => (
                        <span key={idx} className={`text-xs font-bold uppercase tracking-wider ${step > idx ? 'text-blue-600' : step === idx + 1 ? 'text-blue-600' : 'text-slate-300'}`}>{label}</span>
                    ))}
                </div>
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${(step / 4) * 100}%` }}></div>
                </div>
            </div>

            {/* CARD */}
            <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-2xl shadow-sm border border-slate-200">
                {renderStep()}

                <div className="mt-8 flex justify-between pt-6 border-t border-slate-100">
                    <button
                        onClick={() => setStep(s => Math.max(1, s - 1))}
                        disabled={step === 1}
                        className="px-6 py-2 text-slate-500 font-bold disabled:opacity-30 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                        Back
                    </button>

                    {step < 4 ? (
                        <button
                            onClick={() => setStep(s => Math.min(4, s + 1))}
                            className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg shadow-blue-200"
                        >
                            Next <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 flex items-center gap-2 shadow-lg shadow-green-200"
                        >
                            {loading ? "Saving..." : "Finish Profile"} <CheckCircle size={18} />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RiskProfile;