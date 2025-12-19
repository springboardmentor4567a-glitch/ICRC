import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, Lock, CreditCard, Calendar, User, CheckCircle, AlertCircle, Loader } from 'lucide-react';

const CheckoutPage = ({ policy, onBack, onPurchaseComplete }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    // Form States
    const [cardNum, setCardNum] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvv, setCvv] = useState('');
    const [name, setName] = useState('');

    // --- SMART FORMATTERS ---
    const handleCardNum = (e) => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 16);
        v = v.replace(/(\d{4})/g, '$1 ').trim();
        setCardNum(v);
    };

    const handleExpiry = (e) => {
        let v = e.target.value.replace(/\D/g, '').substring(0, 4);
        if (v.length >= 2) v = v.substring(0, 2) + '/' + v.substring(2);
        setExpiry(v);
    };

    const handleCvv = (e) => {
        const v = e.target.value.replace(/\D/g, '').substring(0, 3);
        setCvv(v);
    };

    // --- CALCULATIONS ---
    const gstRate = 0.18;
    const basePremium = policy.premium;
    const gstAmount = basePremium * gstRate;
    const totalAmount = basePremium + gstAmount;

    // --- HANDLER ---
    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
            const token = localStorage.getItem('access_token');
            const res = await fetch(`http://127.0.0.1:8000/buy/${policy.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => { onPurchaseComplete(); }, 2000);
            } else {
                throw new Error("Transaction failed.");
            }
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 font-sans">
                <div className="bg-white p-10 rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100 animate-fade-in">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle className="text-green-600 w-10 h-10" /></div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Payment Successful!</h2>
                    <p className="text-slate-500 mb-6">Your transaction ID is <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded">TXN-{Math.floor(Math.random() * 100000)}</span>.</p>
                    <div className="animate-pulse text-sm text-blue-600 font-bold">Redirecting...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-12">
            <div className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-30 shadow-sm">
                <div className="max-w-5xl mx-auto flex items-center gap-3">
                    <button onClick={onBack} className="p-2 -ml-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"><ArrowLeft size={24} /></button>
                    <span className="text-xl font-bold text-slate-800 flex items-center gap-2"><Lock size={18} className="text-green-600" /> Secure Checkout</span>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4">
                        <div className="text-4xl bg-slate-50 w-16 h-16 flex items-center justify-center rounded-xl border border-slate-100">{policy.logo || "🛡️"}</div>
                        <div>
                            <h3 className="font-bold text-lg text-slate-800">{policy.policy_name}</h3>
                            <p className="text-slate-500 text-sm">{policy.provider} • {policy.category} Insurance</p>
                            <div className="flex gap-2 mt-2"><span className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100 font-medium">Cover: {policy.cover || "Standard"}</span></div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                        <div className="flex justify-between items-center mb-6"><h3 className="font-bold text-slate-800 text-lg">Payment Method</h3><div className="flex gap-2"><span className="w-8 h-5 bg-slate-200 rounded"></span><span className="w-8 h-5 bg-slate-200 rounded"></span></div></div>

                        <form onSubmit={handlePayment} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Card Number</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input required type="text" placeholder="0000 0000 0000 0000" className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-700" value={cardNum} onChange={handleCardNum} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Expiry Date</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input required type="text" placeholder="MM/YY" className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-700" value={expiry} onChange={handleExpiry} />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">CVV</label>
                                    <div className="relative">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                        <input required type="password" placeholder="123" maxLength="3" className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono text-slate-700" value={cvv} onChange={handleCvv} />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Cardholder Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                                    <input required type="text" placeholder="Name on Card" className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-slate-700" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                            </div>

                            {error && (<div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center gap-2"><AlertCircle size={16} /> {error}</div>)}

                            <button type="submit" disabled={loading || cardNum.length < 19 || expiry.length < 5 || cvv.length < 3} className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold shadow-lg hover:bg-slate-800 disabled:opacity-70 disabled:cursor-not-allowed mt-4 flex justify-center gap-3">
                                {loading ? <Loader className="animate-spin" /> : <ShieldCheck size={20} />} {loading ? "Processing..." : `Pay ₹${totalAmount.toLocaleString()}`}
                            </button>
                        </form>
                    </div>
                </div>
                {/* Order Summary (unchanged from previous) */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl sticky top-24">
                        <h3 className="font-bold text-slate-800 mb-6">Order Summary</h3>
                        <div className="space-y-4 mb-6 border-b border-slate-200 pb-6">
                            <div className="flex justify-between text-sm text-slate-600"><span>Base Premium</span><span className="font-medium">₹{basePremium.toLocaleString()}</span></div>
                            <div className="flex justify-between text-sm text-slate-600"><span>GST (18%)</span><span className="font-medium">₹{gstAmount.toLocaleString()}</span></div>
                        </div>
                        <div className="flex justify-between items-end mb-2"><span className="font-bold text-slate-800">Total</span><span className="text-2xl font-bold text-blue-600">₹{totalAmount.toLocaleString()}</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;