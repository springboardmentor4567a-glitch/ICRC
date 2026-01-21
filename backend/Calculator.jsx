import React, { useState } from 'react';

const Calculators = ({ onBack }) => {
    const [activeTab, setActiveTab] = useState('bmi');

    // --- CALCULATOR 1: BMI ---
    const [bmiData, setBmiData] = useState({ weight: '', height: '' });
    const [bmiResult, setBmiResult] = useState(null);

    const calculateBMI = () => {
        const hInMeters = bmiData.height / 100;
        const bmi = (bmiData.weight / (hInMeters * hInMeters)).toFixed(1);
        setBmiResult(bmi);
    };

    // --- CALCULATOR 2: LIFE INSURANCE NEED ---
    const [lifeData, setLifeData] = useState({ income: '', years: '', debt: '' });
    const [lifeResult, setLifeResult] = useState(null);

    const calculateLifeCover = () => {
        // Formula: (Annual Income * Years to replace) + Debt
        const cover = (Number(lifeData.income) * Number(lifeData.years)) + Number(lifeData.debt);
        setLifeResult(cover.toLocaleString());
    };

    // --- CALCULATOR 3: LOAN EMI ---
    const [emiData, setEmiData] = useState({ amount: '', rate: '', tenure: '' });
    const [emiResult, setEmiResult] = useState(null);

    const calculateEMI = () => {
        const P = Number(emiData.amount);
        const r = Number(emiData.rate) / 12 / 100; // Monthly Interest
        const n = Number(emiData.tenure) * 12; // Months
        // EMI = [P x R x (1+R)^N]/[(1+R)^N-1]
        const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        setEmiResult(Math.round(emi).toLocaleString());
    };

    // --- CALCULATOR 4: RETIREMENT CORPUS ---
    const [retireData, setRetireData] = useState({ currentAge: '', retireAge: '', monthlySave: '', returnRate: '' });
    const [retireResult, setRetireResult] = useState(null);

    const calculateRetirement = () => {
        const years = Number(retireData.retireAge) - Number(retireData.currentAge);
        const months = years * 12;
        const r = Number(retireData.returnRate) / 12 / 100;
        // FV = P * [((1+r)^n - 1) / r] * (1+r)
        const fv = Number(retireData.monthlySave) * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
        setRetireResult(Math.round(fv).toLocaleString());
    };

    // --- CALCULATOR 5: EMERGENCY FUND ---
    const [fundData, setFundData] = useState({ expenses: '', months: '6' });
    const [fundResult, setFundResult] = useState(null);

    const calculateFund = () => {
        const total = Number(fundData.expenses) * Number(fundData.months);
        setFundResult(total.toLocaleString());
    };

    const renderActiveCalculator = () => {
        switch (activeTab) {
            case 'bmi':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-800">BMI Calculator (Health)</h2>
                        <p className="text-slate-500">Check if your BMI falls within the healthy range for health insurance premiums.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="number" placeholder="Weight (kg)" className="p-3 border rounded-lg" value={bmiData.weight} onChange={(e) => setBmiData({ ...bmiData, weight: e.target.value })} />
                            <input type="number" placeholder="Height (cm)" className="p-3 border rounded-lg" value={bmiData.height} onChange={(e) => setBmiData({ ...bmiData, height: e.target.value })} />
                        </div>
                        <button onClick={calculateBMI} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 transition">Calculate BMI</button>
                        {bmiResult && (
                            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                                <span className="text-slate-600">Your BMI is:</span>
                                <p className="text-3xl font-bold text-blue-700">{bmiResult}</p>
                                <p className="text-sm text-slate-500 mt-1">{bmiResult < 18.5 ? "Underweight" : bmiResult < 25 ? "Normal Weight" : "Overweight"}</p>
                            </div>
                        )}
                    </div>
                );
            case 'life':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-800">Life Insurance Estimator</h2>
                        <p className="text-slate-500">Calculate how much life cover your family needs based on your income.</p>
                        <div className="grid grid-cols-1 gap-4">
                            <input type="number" placeholder="Annual Income (₹/$)" className="p-3 border rounded-lg" value={lifeData.income} onChange={(e) => setLifeData({ ...lifeData, income: e.target.value })} />
                            <input type="number" placeholder="Years to Provide Income (e.g. 20)" className="p-3 border rounded-lg" value={lifeData.years} onChange={(e) => setLifeData({ ...lifeData, years: e.target.value })} />
                            <input type="number" placeholder="Total Outstanding Debt (₹/$)" className="p-3 border rounded-lg" value={lifeData.debt} onChange={(e) => setLifeData({ ...lifeData, debt: e.target.value })} />
                        </div>
                        <button onClick={calculateLifeCover} className="bg-green-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-green-700 transition">Calculate Cover</button>
                        {lifeResult && (
                            <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                                <span className="text-slate-600">Recommended Cover:</span>
                                <p className="text-3xl font-bold text-green-700">{lifeResult}</p>
                            </div>
                        )}
                    </div>
                );
            case 'emi':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-800">Loan EMI Calculator</h2>
                        <p className="text-slate-500">Plan your finances before taking a home or auto loan.</p>
                        <div className="grid grid-cols-1 gap-4">
                            <input type="number" placeholder="Loan Amount" className="p-3 border rounded-lg" value={emiData.amount} onChange={(e) => setEmiData({ ...emiData, amount: e.target.value })} />
                            <input type="number" placeholder="Interest Rate (%)" className="p-3 border rounded-lg" value={emiData.rate} onChange={(e) => setEmiData({ ...emiData, rate: e.target.value })} />
                            <input type="number" placeholder="Tenure (Years)" className="p-3 border rounded-lg" value={emiData.tenure} onChange={(e) => setEmiData({ ...emiData, tenure: e.target.value })} />
                        </div>
                        <button onClick={calculateEMI} className="bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition">Calculate EMI</button>
                        {emiResult && (
                            <div className="mt-4 p-4 bg-purple-50 border border-purple-100 rounded-xl">
                                <span className="text-slate-600">Monthly EMI:</span>
                                <p className="text-3xl font-bold text-purple-700">{emiResult}</p>
                            </div>
                        )}
                    </div>
                );
            case 'retire':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-800">Retirement Planner</h2>
                        <p className="text-slate-500">See how much your monthly savings will grow by the time you retire.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="number" placeholder="Current Age" className="p-3 border rounded-lg" value={retireData.currentAge} onChange={(e) => setRetireData({ ...retireData, currentAge: e.target.value })} />
                            <input type="number" placeholder="Retirement Age" className="p-3 border rounded-lg" value={retireData.retireAge} onChange={(e) => setRetireData({ ...retireData, retireAge: e.target.value })} />
                        </div>
                        <input type="number" placeholder="Monthly Saving Amount" className="p-3 border rounded-lg w-full" value={retireData.monthlySave} onChange={(e) => setRetireData({ ...retireData, monthlySave: e.target.value })} />
                        <input type="number" placeholder="Expected Return Rate (%)" className="p-3 border rounded-lg w-full" value={retireData.returnRate} onChange={(e) => setRetireData({ ...retireData, returnRate: e.target.value })} />
                        <button onClick={calculateRetirement} className="bg-orange-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-700 transition">Calculate Wealth</button>
                        {retireResult && (
                            <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-xl">
                                <span className="text-slate-600">Projected Corpus:</span>
                                <p className="text-3xl font-bold text-orange-700">{retireResult}</p>
                            </div>
                        )}
                    </div>
                );
            case 'fund':
                return (
                    <div className="space-y-6 animate-fade-in">
                        <h2 className="text-2xl font-bold text-slate-800">Emergency Fund Calculator</h2>
                        <p className="text-slate-500">Calculate the safety net you need for unexpected life events.</p>
                        <div className="grid grid-cols-1 gap-4">
                            <input type="number" placeholder="Monthly Expenses (Rent, Food, Bills)" className="p-3 border rounded-lg" value={fundData.expenses} onChange={(e) => setFundData({ ...fundData, expenses: e.target.value })} />
                            <select className="p-3 border rounded-lg" value={fundData.months} onChange={(e) => setFundData({ ...fundData, months: e.target.value })}>
                                <option value="3">3 Months (Minimum)</option>
                                <option value="6">6 Months (Recommended)</option>
                                <option value="12">12 Months (High Security)</option>
                            </select>
                        </div>
                        <button onClick={calculateFund} className="bg-teal-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-teal-700 transition">Calculate Fund</button>
                        {fundResult && (
                            <div className="mt-4 p-4 bg-teal-50 border border-teal-100 rounded-xl">
                                <span className="text-slate-600">You need to save:</span>
                                <p className="text-3xl font-bold text-teal-700">{fundResult}</p>
                            </div>
                        )}
                    </div>
                );
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 font-sans p-6">
            <button onClick={onBack} className="mb-6 flex items-center text-slate-500 hover:text-blue-600 transition font-medium">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" /></svg>
                Back to Dashboard
            </button>

            <div className="max-w-6xl mx-auto flex flex-col md:flex-row gap-8">
                {/* SIDEBAR NAVIGATION */}
                <div className="w-full md:w-1/4 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-fit">
                    <div className="p-4 bg-slate-100 border-b border-slate-200 font-bold text-slate-700">Select Calculator</div>
                    <button onClick={() => setActiveTab('bmi')} className={`w-full text-left p-4 hover:bg-slate-50 transition border-b border-slate-100 ${activeTab === 'bmi' ? 'bg-blue-50 text-blue-600 font-bold border-l-4 border-l-blue-600' : 'text-slate-600'}`}>🏋️ BMI Health</button>
                    <button onClick={() => setActiveTab('life')} className={`w-full text-left p-4 hover:bg-slate-50 transition border-b border-slate-100 ${activeTab === 'life' ? 'bg-green-50 text-green-600 font-bold border-l-4 border-l-green-600' : 'text-slate-600'}`}>🛡️ Life Insurance</button>
                    <button onClick={() => setActiveTab('emi')} className={`w-full text-left p-4 hover:bg-slate-50 transition border-b border-slate-100 ${activeTab === 'emi' ? 'bg-purple-50 text-purple-600 font-bold border-l-4 border-l-purple-600' : 'text-slate-600'}`}>🏦 Loan EMI</button>
                    <button onClick={() => setActiveTab('retire')} className={`w-full text-left p-4 hover:bg-slate-50 transition border-b border-slate-100 ${activeTab === 'retire' ? 'bg-orange-50 text-orange-600 font-bold border-l-4 border-l-orange-600' : 'text-slate-600'}`}>👴 Retirement</button>
                    <button onClick={() => setActiveTab('fund')} className={`w-full text-left p-4 hover:bg-slate-50 transition ${activeTab === 'fund' ? 'bg-teal-50 text-teal-600 font-bold border-l-4 border-l-teal-600' : 'text-slate-600'}`}>🆘 Emergency Fund</button>
                </div>

                {/* CALCULATOR AREA */}
                <div className="w-full md:w-3/4 bg-white rounded-xl shadow-sm border border-slate-200 p-8 min-h-[400px]">
                    {renderActiveCalculator()}
                </div>
            </div>
        </div>
    );
};

export default Calculators;