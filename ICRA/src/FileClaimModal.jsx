import React, { useState, useRef } from 'react';
import { X, Shield, Upload, CheckCircle, FileText, Loader, AlertCircle } from 'lucide-react';

const FileClaimModal = ({ policy, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const fileInputRef = useRef(null);

    const [formData, setFormData] = useState({
        incident_type: 'Medical Emergency',
        date: new Date().toISOString().split('T')[0],
        amount: '',
        description: '',
        file: null // Store file object
    });

    // Validation Check
    const isFormValid = formData.amount && formData.description && formData.file;

    const incidentOptions = policy.category === 'Auto'
        ? ['Accident', 'Theft', 'Natural Calamity', 'Third Party Damage']
        : policy.category === 'Health'
            ? ['Medical Emergency', 'Planned Surgery', 'Diagnostic Test', 'Post-Hospitalization']
            : ['Death of Insured', 'Terminal Illness', 'Critical Illness', 'Accidental Disability'];

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({ ...formData, file: e.target.files[0] });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormValid) return;
        setLoading(true);

        try {
            const token = localStorage.getItem('access_token');

            // Use FormData for File Upload
            const formDataPayload = new FormData();
            formDataPayload.append('purchase_id', policy.id);
            formDataPayload.append('incident_type', formData.incident_type);
            formDataPayload.append('description', formData.description);
            formDataPayload.append('claim_amount', formData.amount);
            formDataPayload.append('file', formData.file); // The actual file object

            const res = await fetch('http://127.0.0.1:8000/claims', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type here; browser sets it automatically for FormData
                },
                body: formDataPayload
            });

            if (res.ok) {
                setStep(2);
                setTimeout(() => { onSuccess(); }, 2000);
            } else {
                alert("Failed to submit claim.");
                setLoading(false);
            }
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">

                <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                            <Shield className="text-blue-600" size={20} /> File a Claim
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Policy: {policy.policyNumber}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors"><X size={20} className="text-slate-500" /></button>
                </div>

                <div className="p-6">
                    {step === 1 ? (
                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Incident Type</label>
                                    <select
                                        className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium"
                                        value={formData.incident_type}
                                        onChange={e => setFormData({ ...formData, incident_type: e.target.value })}
                                    >
                                        {incidentOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
                                    <input
                                        type="date" required
                                        className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Claim Amount (₹)</label>
                                <div className="relative">
                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₹</span>
                                    <input
                                        type="number" required placeholder="e.g. 50000"
                                        className="w-full pl-8 p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-slate-700"
                                        value={formData.amount}
                                        onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Description</label>
                                <textarea
                                    rows="3" required placeholder="Describe details..."
                                    className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>

                            {/* HIDDEN FILE INPUT TRIGGER */}
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".jpg,.png,.pdf"
                                onChange={handleFileChange}
                            />

                            <div
                                onClick={() => fileInputRef.current.click()}
                                className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${formData.file ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:bg-slate-50'}`}
                            >
                                {formData.file ? (
                                    <>
                                        <CheckCircle size={24} className="text-green-600 mb-2" />
                                        <p className="text-sm font-bold text-green-700">{formData.file.name}</p>
                                        <p className="text-xs text-green-600">File Selected</p>
                                    </>
                                ) : (
                                    <>
                                        <Upload size={24} className="text-slate-400 mb-2" />
                                        <p className="text-sm font-medium text-slate-600">Upload Proof (Bill/Report)</p>
                                        <p className="text-xs text-slate-400">JPG, PNG or PDF (Max 5MB)</p>
                                    </>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !isFormValid}
                                className={`w-full py-3 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${isFormValid ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : <FileText size={20} />}
                                {loading ? "Submitting..." : "Submit Claim"}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-8 animate-fade-in">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="text-green-600" size={40} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800">Claim Submitted!</h3>
                            <p className="text-slate-500 mt-2 text-sm">Your claim request has been received.<br />Reference ID: #CLM-{Math.floor(Math.random() * 10000)}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FileClaimModal;