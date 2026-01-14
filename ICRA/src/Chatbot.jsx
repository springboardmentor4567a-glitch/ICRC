import React, { useState, useRef, useEffect } from 'react';
import { 
    MessageCircle, X, Send, Bot, MinusCircle, ChevronRight, 
    User, Shield, Zap, Trash2, FileText, AlertTriangle, 
    Ticket, Activity, CheckCircle, Clock, XCircle, Calculator,
    DollarSign, TrendingUp, Umbrella, Home, MapPin, Phone, 
    Download, Star, HelpCircle, Globe, Briefcase, RefreshCw,
    PieChart, Calendar, CreditCard, Heart, AlertOctagon, ThumbsUp
} from 'lucide-react';

const Chatbot = ({ onNavigate, user }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [isTyping, setIsTyping] = useState(false);
    
    // --- STATE MACHINE FOR INTERACTIVE CONVERSATIONS ---
    const [interactionMode, setInteractionMode] = useState({ mode: 'normal', data: {} });

    const [contextData, setContextData] = useState({
        claims: [],
        policies: [],
        profile: null,
        loading: true
    });

    const messagesEndRef = useRef(null);
    const chatWindowRef = useRef(null);

    // --- KNOWLEDGE BASE (EXPANDED) ---
    const glossary = {
        "idv": "Insured Declared Value (IDV) is the maximum sum assured for your vehicle in case of theft or total loss.",
        "ncb": "No Claim Bonus (NCB) is a discount on premium (20%-50%) for every claim-free year.",
        "deductible": "The amount you pay out-of-pocket before insurance covers the rest.",
        "copay": "A percentage of the claim amount that you must pay (common in senior citizen plans).",
        "premium": "The amount you pay to keep your policy active.",
        "floater": "A single policy covering the entire family under one sum insured.",
        "rider": "An add-on benefit (like Accidental Cover) purchased over the base policy.",
        "grace": "The extra time (usually 15-30 days) allowed to pay premium after the due date.",
        "tpa": "Third Party Administrator (TPA) processes insurance claims on behalf of the insurer.",
        "cashless": "Treatment where the insurer pays the hospital directly, so you don't pay cash upfront.",
        "exclusion": "Conditions or situations not covered by your insurance policy."
    };

    const hospitals = {
        "mumbai": ["Lilavati Hospital", "Breach Candy", "Kokilaben Ambani", "Tata Memorial", "Nanavati Max"],
        "delhi": ["AIIMS", "Max Super Speciality", "Apollo Indraprastha", "Fortis Escorts", "Sir Ganga Ram"],
        "bangalore": ["Manipal Hospital", "Narayana Health", "Fortis", "Aster CMI", "Sakra World"],
        "hyderabad": ["Apollo Jubilee Hills", "Yashoda Hospital", "KIMS", "Care Hospitals", "Continental"],
        "chennai": ["Apollo Greams Road", "Fortis Malar", "MIOT International", "Gleneagles Global", "Kauvery"]
    };

    const garages = {
        "mumbai": ["Autobahn Enterprises", "Modi Hyundai", "Sai Service Maruti"],
        "delhi": ["Competent Automobiles", "Galaxy Toyota", "Magic Auto"],
        "bangalore": ["Advaith Hyundai", "Prerana Motors", "Trident Renault"]
    };

    // 1. CLICK OUTSIDE TO CLOSE
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chatWindowRef.current && !chatWindowRef.current.contains(event.target) && isOpen) {
                if (!event.target.closest('.chatbot-toggle-btn')) {
                    setIsOpen(false);
                }
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    // 2. FETCH CONTEXT
    useEffect(() => {
        const fetchContext = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                const [claimsRes, policiesRes, userRes] = await Promise.all([
                    fetch('http://127.0.0.1:8000/claims', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://127.0.0.1:8000/my-policies', { headers: { 'Authorization': `Bearer ${token}` } }),
                    fetch('http://127.0.0.1:8000/user/me', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                
                const claims = claimsRes.ok ? await claimsRes.json() : [];
                const policies = policiesRes.ok ? await policiesRes.json() : [];
                const profile = userRes.ok ? await userRes.json() : {};

                // Sort data for "Last/Recent" queries
                claims.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                policies.sort((a, b) => new Date(b.purchase_date) - new Date(a.purchase_date));

                setContextData({ claims, policies, profile, loading: false });
                setMessages([{ 
                    type: 'bot', 
                    text: `Hello, ${profile.name?.split(' ')[0] || 'User'}! I'm your expanded ICRA Assistant.\n\nI can help with Policy Management, Calculations, Claims, and more.\n\nTry asking:\n• "Show my last claim"\n• "Calculate Tax Savings"\n• "Find hospital in Mumbai"\n• "Raise a ticket"`, 
                    options: ["My Policies", "Claims", "Tools"] 
                }]);
            } catch (e) { console.error("Bot error", e); }
        };
        if (user) fetchContext();
    }, [user, isOpen]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, isOpen, isTyping]);

    // --- HELPER: ROBUST MATCHER ---
    const matches = (text, keywords) => keywords.some(keyword => text.includes(keyword));
    const hasAll = (text, words) => words.every(w => text.includes(w));

    // --- INTELLIGENT LOGIC ENGINE ---
    const processMessage = async (text) => {
        setIsTyping(true);
        const lowerText = text.toLowerCase().trim();
        let response = { text: "", options: [], action: null, type: 'normal', widget: null, data: null };

        const { claims, policies, profile } = contextData;

        await new Promise(resolve => setTimeout(resolve, 600)); // Simulate thinking

        // ============================================================
        // 1. STATE MACHINE: HANDLING INTERACTIVE INPUTS
        // ============================================================
        if (interactionMode.mode !== 'normal') {
            const num = parseFloat(text.replace(/,/g, '')); 
            const data = interactionMode.data;

            // --- TICKET SYSTEM ---
            if (interactionMode.mode === 'ticket_desc') {
                const ticketId = `TKT-${Math.floor(Math.random() * 100000)}`;
                response.text = `Ticket #${ticketId} created: "${text}"\nWe will contact you shortly.`;
                response.widget = 'ticket_card';
                response.data = { id: ticketId, status: 'Open', issue: text };
                response.options = ["Main Menu"];
                setInteractionMode({ mode: 'normal', data: {} });
            }
            // --- HOSPITAL SEARCH ---
            else if (interactionMode.mode === 'search_hospital_city') {
                if (hospitals[lowerText]) {
                    response.text = `Found ${hospitals[lowerText].length} network hospitals in ${text}:`;
                    response.widget = 'list_widget';
                    response.data = { title: "Network Hospitals", items: hospitals[lowerText], icon: "hospital" };
                } else {
                    response.text = `No data for ${text}. Try Mumbai, Delhi, or Bangalore.`;
                }
                response.options = ["Search Again", "Main Menu"];
                setInteractionMode({ mode: 'normal', data: {} });
            }
            // --- GARAGE SEARCH ---
            else if (interactionMode.mode === 'search_garage_city') {
                if (garages[lowerText]) {
                    response.text = `Found ${garages[lowerText].length} authorized garages in ${text}:`;
                    response.widget = 'list_widget';
                    response.data = { title: "Network Garages", items: garages[lowerText], icon: "garage" };
                } else {
                    response.text = `No data for ${text}. Try Mumbai, Delhi, or Bangalore.`;
                }
                setInteractionMode({ mode: 'normal', data: {} });
            }
            // --- CURRENCY CONVERTER ---
            else if (interactionMode.mode === 'usd_convert') {
                if (isNaN(num)) response.text = "Invalid amount.";
                else {
                    response.text = `$${num} = ₹${(num * 83.50).toFixed(2)}`;
                    setInteractionMode({ mode: 'normal', data: {} });
                }
            }
            // --- CALLBACK SCHEDULER ---
            else if (interactionMode.mode === 'callback_time') {
                response.text = `Callback scheduled for ${text}.`;
                response.options = ["Main Menu"];
                setInteractionMode({ mode: 'normal', data: {} });
            }
            // --- BMI CALC ---
            else if (interactionMode.mode === 'bmi_weight') {
                if (isNaN(num)) response.text = "Invalid weight.";
                else {
                    setInteractionMode({ mode: 'bmi_height', data: { weight: num } });
                    response.text = "Enter height (cm):";
                }
            } else if (interactionMode.mode === 'bmi_height') {
                const hM = num / 100;
                const bmi = (data.weight / (hM * hM)).toFixed(1);
                let status = "Normal", color = "text-green-600";
                if (bmi < 18.5) { status = "Underweight"; color = "text-blue-600"; }
                else if (bmi >= 25) { status = "Overweight"; color = "text-orange-600"; }
                response.text = `BMI: ${bmi}`;
                response.widget = 'bmi_result';
                response.data = { bmi, status, color };
                response.options = ["Calculate Again", "Main Menu"];
                setInteractionMode({ mode: 'normal', data: {} });
            }
            // --- EMI CALC ---
            else if (interactionMode.mode === 'emi_amount') {
                setInteractionMode({ mode: 'emi_rate', data: { ...data, amount: num } });
                response.text = `Loan: ₹${num}. Interest Rate (%)?`;
            } else if (interactionMode.mode === 'emi_rate') {
                setInteractionMode({ mode: 'emi_tenure', data: { ...data, rate: num } });
                response.text = `Rate: ${num}%. Tenure (Years)?`;
            } else if (interactionMode.mode === 'emi_tenure') {
                const P = data.amount, r = data.rate / 1200, n = num * 12;
                const emi = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
                response.text = "Estimated EMI:";
                response.widget = 'emi_result';
                response.data = { emi: Math.round(emi), amount: P, rate: data.rate, years: num };
                response.options = ["Main Menu"];
                setInteractionMode({ mode: 'normal', data: {} });
            }
            // --- TAX SAVER ---
            else if (interactionMode.mode === 'tax_income') {
                const oldTax = num > 1500000 ? num * 0.3 : num * 0.2; // Simplified
                response.text = `With ₹${num} income, you can save approx ₹46,800 in tax by investing in:\n\n• Life Insurance (80C)\n• Health Insurance (80D)`;
                response.widget = 'tax_card';
                response.data = { income: num, saving: 46800 };
                response.options = ["View Tax Saving Plans"];
                setInteractionMode({ mode: 'normal', data: {} });
            }
            // --- QUIZ GAME ---
            else if (interactionMode.mode === 'quiz_answer') {
                if (matches(lowerText, ['third', 'motor'])) {
                    response.text = "✅ Correct! Third-party motor insurance is mandatory by law in India.";
                    response.widget = 'success_toast';
                    response.data = { msg: "Correct Answer!" };
                } else {
                    response.text = "❌ Incorrect. The answer is Motor Third-Party Insurance.";
                }
                response.options = ["Play Again", "Main Menu"];
                setInteractionMode({ mode: 'normal', data: {} });
            }

            setIsTyping(false);
            return response;
        }

        // ============================================================
        // 2. CONTEXT AWARE QUERIES (SPECIFIC DATA)
        // ============================================================

        // --- SPECIFIC: LAST/NEW ---
        if (hasAll(lowerText, ['last', 'claim']) || hasAll(lowerText, ['recent', 'claim'])) {
            if (claims.length > 0) {
                const lastClaim = claims[0]; 
                response.text = `Your last claim for **${lastClaim.incident_type}** is currently **${lastClaim.status}**.`;
                response.widget = 'single_claim_card';
                response.data = lastClaim;
            } else {
                response.text = "You haven't filed any claims yet.";
                response.options = ["File Claim"];
            }
        }
        else if (hasAll(lowerText, ['new', 'policy']) || hasAll(lowerText, ['latest', 'policy']) || hasAll(lowerText, ['last', 'purchas'])) {
            if (policies.length > 0) {
                const lastPolicy = policies[0]; 
                response.text = `Your latest policy is **${lastPolicy.policy.policy_name}** (${lastPolicy.policy.category}).\nCover: ₹${lastPolicy.policy.cover_amount.toLocaleString()}`;
                response.widget = 'single_policy_card';
                response.data = lastPolicy;
            } else {
                response.text = "No active policies found.";
                response.action = 'navigate_find';
            }
        }

        // --- SPECIFIC: STATUS FILTERING ---
        else if (hasAll(lowerText, ['rejected', 'claim'])) {
            const rejected = claims.filter(c => c.status === 'Rejected');
            if (rejected.length > 0) {
                response.text = `I found ${rejected.length} rejected claims in your history.`;
                response.widget = 'claim_list';
                response.data = rejected;
            } else {
                response.text = "You have no rejected claims.";
            }
        }
        else if (hasAll(lowerText, ['pending', 'claim']) || hasAll(lowerText, ['under', 'review'])) {
            const pending = claims.filter(c => c.status === 'Pending');
            if (pending.length > 0) {
                response.text = `You have ${pending.length} claims currently under review.`;
                response.widget = 'claim_list';
                response.data = pending;
            } else {
                response.text = "No claims are pending at the moment.";
            }
        }

        // --- SPECIFIC: FINANCIAL SUMMARY ---
        else if (hasAll(lowerText, ['total', 'premium']) || hasAll(lowerText, ['how much', 'pay'])) {
            const total = policies.reduce((sum, p) => sum + p.policy.premium, 0);
            response.text = `Your total annual premium commitment is **₹${total.toLocaleString()}** across ${policies.length} policies.`;
            response.widget = 'success_toast';
            response.data = { msg: `Total Premium: ₹${total.toLocaleString()}` };
        }
        else if (hasAll(lowerText, ['total', 'claim']) || hasAll(lowerText, ['claim', 'amount'])) {
            const total = claims.reduce((sum, c) => sum + c.claim_amount, 0);
            response.text = `You have claimed a total of **₹${total.toLocaleString()}** across all incidents.`;
        }

        // --- SPECIFIC: PROFILE & STATS ---
        else if (hasAll(lowerText, ['my', 'profile']) || matches(lowerText, ['who am i'])) {
            response.text = `**Profile Details**:\nName: ${profile.name}\nEmail: ${profile.email}\nRole: ${profile.role}\nJoined: 2024`;
            response.options = ["Edit Profile", "Logout"];
        }
        else if (hasAll(lowerText, ['summary', 'overview']) || matches(lowerText, ['portfolio'])) {
            response.text = `**Portfolio Snapshot**:\n• Active Policies: ${policies.length}\n• Total Claims: ${claims.length}\n• Risk Profile: ${profile.risk_profile ? 'Completed' : 'Pending'}`;
            response.widget = 'score_card';
            response.data = { score: 85 }; 
        }

        // ============================================================
        // 3. FEATURE SET: TOOLS & INFO
        // ============================================================
        
        // 1. GLOSSARY
        else if (matches(lowerText, ['what is', 'define', 'meaning', 'explain'])) {
            const term = Object.keys(glossary).find(k => lowerText.includes(k));
            if (term) {
                response.text = `📖 **${term.toUpperCase()}**: ${glossary[term]}`;
                response.options = ["More Terms", "Main Menu"];
            } else {
                response.text = "I can explain insurance jargon. Try 'What is Co-pay?' or 'Define TPA'.";
            }
        }

        // 2. LOCATORS
        else if (matches(lowerText, ['hospital', 'clinic'])) {
            response.text = "I can locate network hospitals. Which city?";
            setInteractionMode({ mode: 'search_hospital_city', data: {} });
        }
        else if (matches(lowerText, ['garage', 'mechanic', 'repair'])) {
            response.text = "Finding network garages. Enter your city:";
            setInteractionMode({ mode: 'search_garage_city', data: {} });
        }

        // 3. SUPPORT
        else if (matches(lowerText, ['ticket', 'complaint', 'issue', 'problem'])) {
            response.text = "Let's log this. Describe the issue briefly:";
            setInteractionMode({ mode: 'ticket_desc', data: {} });
        }
        else if (matches(lowerText, ['call', 'agent', 'human'])) {
            response.text = "Connecting to agent...\n\n⚠️ Lines are busy. Schedule a callback?";
            response.options = ["Schedule Callback", "Raise Ticket"];
        }
        else if (matches(lowerText, ['callback', 'schedule'])) {
            response.text = "When should we call you? (e.g., 'Tomorrow 2 PM')";
            setInteractionMode({ mode: 'callback_time', data: {} });
        }

        // 4. DOCUMENTS & FINANCE
        else if (matches(lowerText, ['invoice', 'receipt', 'bill'])) {
            response.text = "Latest receipt has been emailed to you.";
            response.widget = 'success_toast';
            response.data = { msg: "Invoice Sent" };
        }
        else if (matches(lowerText, ['download', 'document', 'pdf', 'policy doc'])) {
            response.text = "Access your policy documents here:";
            response.widget = 'doc_list';
            response.data = policies;
        }
        else if (matches(lowerText, ['tax', '80c', 'save tax'])) {
            response.text = "Let's check your tax saving potential. Enter Annual Income (₹):";
            setInteractionMode({ mode: 'tax_income', data: {} });
        }
        else if (matches(lowerText, ['convert', 'usd', 'forex'])) {
            response.text = "Enter amount in USD ($):";
            setInteractionMode({ mode: 'usd_convert', data: {} });
        }

        // 5. UTILITIES
        else if (matches(lowerText, ['renew', 'expire', 'due'])) {
            const next = policies[0]; 
            if (next) {
                response.text = `Renewal Alert: **${next.policy.policy_name}** expires on ${new Date(next.purchase_date).toLocaleDateString()}.`;
                response.options = ["Renew Now"];
            } else {
                response.text = "You have no upcoming renewals.";
            }
        }
        else if (matches(lowerText, ['nominee', 'beneficiary'])) {
            response.text = "To change nominee details, go to **Profile > Policy Settings**.";
            response.options = ["Go to Profile"];
            response.action = 'navigate_profile';
        }
        else if (matches(lowerText, ['port', 'switch', 'portability'])) {
            response.text = "🔄 **Portability Guide**:\n1. Notify current insurer 45 days before expiry.\n2. Fill proposal form with new insurer.\n3. Submit portability form & previous policy docs.";
        }
        else if (matches(lowerText, ['grievance', 'ombudsman'])) {
            response.text = "For escalations:\n📧 grievance@icra.com\n📞 1800-123-4567\n\nStill unresolved? Contact IRDAI Ombudsman.";
        }

        // 6. FUN & SAFETY
        else if (matches(lowerText, ['offer', 'coupon', 'promo', 'discount'])) {
            response.text = "🎉 **Exclusive Offers**:\n• **ICRA20**: 20% off Health\n• **AUTO10**: 10% off Car Insurance";
            response.widget = 'coupon_card';
        }
        else if (matches(lowerText, ['quiz', 'game', 'trivia'])) {
            response.text = "🎲 **Risk IQ Quiz**\n\nWhich insurance is mandatory in India?";
            response.options = ["Life Insurance", "Motor Third-Party", "Health Insurance"];
            setInteractionMode({ mode: 'quiz_answer', data: {} });
        }
        else if (matches(lowerText, ['emergency', 'sos', 'help', 'police', 'ambulance'])) {
            response.text = "🚨 **EMERGENCY ASSISTANCE** 🚨";
            response.widget = 'emergency_sos';
        }
        else if (matches(lowerText, ['claim process', 'guide', 'steps'])) {
            response.text = "Here is the 3-step claim process:";
            response.widget = 'process_steps';
        }
        else if (matches(lowerText, ['feedback', 'rate'])) {
            response.text = "Rate your experience with ICRA:";
            response.widget = 'rating_card';
        }

        // 7. CALCULATORS
        else if (matches(lowerText, ['bmi'])) {
            response.text = "Enter weight (kg):";
            setInteractionMode({ mode: 'bmi_weight', data: {} });
        }
        else if (matches(lowerText, ['emi', 'loan'])) {
            response.text = "Enter Loan Amount (₹):";
            setInteractionMode({ mode: 'emi_amount', data: {} });
        }

        // --- FALLBACK: CATEGORY MATCHING ---
        else if (matches(lowerText, ['claim', 'status'])) {
            response.text = "Here are your recent claims:";
            response.widget = 'claim_list';
            response.data = claims.slice(0, 3);
        }
        else if (matches(lowerText, ['polic', 'plan', 'insurance'])) {
            if (policies.length > 0) {
                response.text = "Your active policies:";
                response.widget = 'policy_carousel';
                response.data = policies;
            } else {
                response.text = "You don't have any policies yet.";
                response.options = ["Buy Insurance"];
                response.action = 'navigate_find';
            }
        }
        else {
            response.text = "I didn't quite get that. Try:\n\n• 'My last claim'\n• 'My new policy'\n• 'Find Hospital'\n• 'Emergency Help'";
            response.options = ["Show Policies", "Claims", "Tools", "Emergency"];
        }

        setIsTyping(false);
        return response;
    };

    const handleSend = async (textOverride = null) => {
        const textToSend = textOverride || input;
        if (!textToSend.trim()) return;

        setMessages(prev => [...prev, { type: 'user', text: textToSend }]);
        setInput("");

        const data = await processMessage(textToSend);

        setMessages(prev => [...prev, { 
            type: 'bot', 
            text: data.text, 
            options: data.options || [],
            msgType: data.type,
            widget: data.widget,
            data: data.data
        }]);

        if (data.action && onNavigate) {
            setTimeout(() => {
                switch(data.action) {
                    case 'navigate_find': onNavigate('find-insurance'); break;
                    case 'navigate_policies': onNavigate('my-policies'); break; 
                    case 'navigate_risk': onNavigate('risk-profile'); break;
                    case 'navigate_profile': onNavigate('profile'); break;
                    default: break;
                }
            }, 1000);
        }
    };

    // --- EXTENDED WIDGET RENDERER ---
    const renderWidget = (msg) => {
        if (!msg.widget) return null;

        // 1. EMERGENCY SOS
        if (msg.widget === 'emergency_sos') {
            return (
                <div className="mt-2 space-y-2 animate-pulse">
                    <a href="tel:100" className="flex items-center gap-3 bg-red-100 p-3 rounded-xl border border-red-200 hover:bg-red-200 transition-colors">
                        <div className="bg-red-600 text-white p-2 rounded-full"><AlertTriangle size={18}/></div>
                        <div><h4 className="font-bold text-red-900">Police</h4><p className="text-xs text-red-700">Dial 100</p></div>
                    </a>
                    <a href="tel:102" className="flex items-center gap-3 bg-red-100 p-3 rounded-xl border border-red-200 hover:bg-red-200 transition-colors">
                        <div className="bg-red-600 text-white p-2 rounded-full"><Heart size={18}/></div>
                        <div><h4 className="font-bold text-red-900">Ambulance</h4><p className="text-xs text-red-700">Dial 102</p></div>
                    </a>
                </div>
            );
        }

        // 2. PROCESS STEPS
        if (msg.widget === 'process_steps') {
            return (
                <div className="mt-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {[
                        {step: 1, title: "Notify", desc: "Inform insurer within 24hrs"},
                        {step: 2, title: "Survey", desc: "Surveyor inspects damage"},
                        {step: 3, title: "Settlement", desc: "Claim approved & paid"}
                    ].map(s => (
                        <div key={s.step} className="flex gap-3 mb-3 last:mb-0">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold shrink-0">{s.step}</div>
                            <div><h4 className="text-sm font-bold text-slate-800">{s.title}</h4><p className="text-xs text-slate-500">{s.desc}</p></div>
                        </div>
                    ))}
                </div>
            );
        }

        // 3. TAX CARD
        if (msg.widget === 'tax_card') {
            return (
                <div className="mt-2 bg-green-50 border border-green-200 rounded-xl p-4">
                    <p className="text-xs text-green-700 font-bold uppercase mb-1">Potential Savings</p>
                    <h3 className="text-2xl font-bold text-green-800">₹{msg.data.saving.toLocaleString()}</h3>
                    <p className="text-xs text-green-600 mt-1">Based on income of ₹{(msg.data.income/100000).toFixed(1)}L</p>
                </div>
            );
        }

        // 4. SINGLE CLAIM CARD
        if (msg.widget === 'single_claim_card') {
            return (
                <div className="mt-2 bg-white border border-slate-200 rounded-xl p-4 shadow-sm animate-fade-in">
                    <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold ${msg.data.status === 'Approved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{msg.data.status}</span>
                        <span className="text-xs text-slate-400">{new Date(msg.data.created_at).toLocaleDateString()}</span>
                    </div>
                    <h3 className="font-bold text-slate-800 text-sm">{msg.data.incident_type}</h3>
                    <p className="text-xs text-slate-500 mt-1 italic">"{msg.data.description}"</p>
                    <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-500 uppercase">Amount</span>
                        <span className="text-lg font-bold text-slate-800">₹{msg.data.claim_amount.toLocaleString()}</span>
                    </div>
                </div>
            );
        }

        // 5. SINGLE POLICY CARD
        if (msg.widget === 'single_policy_card') {
            return (
                <div className="mt-2 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="text-2xl">{msg.data.policy.category === 'Health' ? '🏥' : '🛡️'}</div>
                        <div>
                            <h3 className="font-bold text-blue-900 text-sm">{msg.data.policy.policy_name}</h3>
                            <p className="text-[10px] text-blue-600">{msg.data.policy.provider}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="bg-white/50 p-2 rounded">
                            <span className="block text-slate-400 text-[9px] uppercase">Premium</span>
                            <span className="font-bold text-slate-700">₹{msg.data.policy.premium.toLocaleString()}</span>
                        </div>
                        <div className="bg-white/50 p-2 rounded">
                            <span className="block text-slate-400 text-[9px] uppercase">Cover</span>
                            <span className="font-bold text-slate-700">₹{msg.data.policy.cover_amount.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            );
        }

        // 6. CLAIM LIST
        if (msg.widget === 'claim_list') {
            return (
                <div className="space-y-2 mt-2">
                    {msg.data.map((c, i) => (
                        <div key={i} className="bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-between shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className={`p-1.5 rounded-full ${c.status === 'Approved' ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                    {c.status === 'Approved' ? <CheckCircle size={14} className="text-green-600"/> : <Clock size={14} className="text-yellow-600"/>}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-xs">{c.incident_type}</h4>
                                    <p className="text-[10px] text-slate-500">₹{c.claim_amount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            );
        }

        // 7. POLICY CAROUSEL
        if (msg.widget === 'policy_carousel') {
            return (
                <div className="flex gap-3 overflow-x-auto py-2 -mx-2 px-2 hide-scrollbar snap-x">
                    {msg.data.map((p, i) => (
                        <div key={i} className="min-w-[200px] bg-white border border-slate-200 rounded-xl p-3 shadow-sm snap-center flex flex-col justify-between">
                            <div>
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-2xl">{p.policy.category === 'Health' ? '🏥' : p.policy.category === 'Auto' ? '🚗' : '🛡️'}</span>
                                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${p.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{p.status}</span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{p.policy.policy_name}</h4>
                            </div>
                            <button onClick={() => onNavigate('my-policies')} className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold py-1.5 rounded transition-colors mt-2">View Details</button>
                        </div>
                    ))}
                </div>
            );
        }

        // 8. LIST WIDGET
        if (msg.widget === 'list_widget') {
            return (
                <div className="mt-2 bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-slate-50 p-2 border-b text-xs font-bold text-slate-600 flex items-center gap-2">
                        {msg.data.icon === 'hospital' ? <Activity size={14}/> : <Briefcase size={14}/>} {msg.data.title}
                    </div>
                    <ul className="divide-y divide-slate-100">
                        {msg.data.items.map((item, i) => (
                            <li key={i} className="p-2 text-sm text-slate-700 flex items-center gap-2">
                                <MapPin size={12} className="text-blue-500"/> {item}
                            </li>
                        ))}
                    </ul>
                </div>
            );
        }

        // 9. TICKET CARD
        if (msg.widget === 'ticket_card') {
            return (
                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded-xl p-3 flex gap-3 items-start">
                    <Ticket className="text-yellow-600 mt-1" size={20}/>
                    <div>
                        <h4 className="font-bold text-yellow-800 text-sm">Ticket {msg.data.id}</h4>
                        <p className="text-xs text-yellow-700 mt-1">{msg.data.issue}</p>
                    </div>
                </div>
            );
        }

        // 10. COUPON CARD
        if (msg.widget === 'coupon_card') {
            return (
                <div className="mt-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-3 rounded-lg shadow-md flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold opacity-90">ICRA20</p>
                        <p className="text-lg font-bold">20% OFF</p>
                    </div>
                    <button className="bg-white text-purple-600 text-[10px] font-bold px-3 py-1 rounded-full">COPY</button>
                </div>
            );
        }

        // 11. DOC LIST
        if (msg.widget === 'doc_list') {
            return (
                <div className="mt-2 space-y-2">
                    {msg.data.map((p, i) => (
                        <div key={i} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-lg">
                            <div className="flex items-center gap-2 overflow-hidden">
                                <FileText size={16} className="text-red-500 flex-shrink-0" />
                                <span className="text-xs font-medium truncate">{p.policy.policy_name}.pdf</span>
                            </div>
                            <Download size={16} className="text-blue-500 cursor-pointer"/>
                        </div>
                    ))}
                </div>
            );
        }

        // 12. RATING
        if (msg.widget === 'rating_card') {
            return (
                <div className="mt-2 flex gap-1 justify-center bg-slate-50 p-3 rounded-xl border border-slate-200">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => handleSend(`${star} Stars`)} className="text-yellow-400 hover:scale-110 transition-transform">
                            <Star size={24} fill="currentColor" />
                        </button>
                    ))}
                </div>
            );
        }

        // 13. SUCCESS TOAST
        if (msg.widget === 'success_toast') {
            return (
                <div className="mt-2 bg-green-100 text-green-700 text-xs font-bold p-2 rounded-lg flex items-center gap-2 justify-center">
                    <CheckCircle size={14}/> {msg.data.msg}
                </div>
            );
        }

        // 14. SCORE CARD
        if (msg.widget === 'score_card') {
             return (
                 <div className="mt-2 bg-slate-800 rounded-xl p-4 text-white relative overflow-hidden">
                     <div className="flex justify-between items-end mb-2 relative z-10">
                         <div>
                             <p className="text-[10px] uppercase tracking-wider text-slate-400">Health Score</p>
                             <h3 className="text-3xl font-bold">{msg.data.score}<span className="text-sm text-slate-500 font-normal">/100</span></h3>
                         </div>
                         <Activity size={24} className="text-blue-400" />
                     </div>
                 </div>
             );
        }

        // 15. BMI RESULT
        if (msg.widget === 'bmi_result') {
            return (
                <div className="mt-2 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center">
                    <span className={`text-xl font-bold ${msg.data.color}`}>{msg.data.bmi}</span>
                    <h3 className={`font-bold ${msg.data.color}`}>{msg.data.status}</h3>
                </div>
            );
        }

        // 16. EMI RESULT
        if (msg.widget === 'emi_result') {
            return (
                <div className="mt-2 bg-indigo-50 border border-indigo-100 rounded-xl p-4">
                    <p className="text-xs text-indigo-500 font-bold uppercase">Monthly EMI</p>
                    <h3 className="text-3xl font-bold text-indigo-700">₹{msg.data.emi.toLocaleString()}</h3>
                </div>
            );
        }

        return null;
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end font-sans">
            {isOpen && (
                <div ref={chatWindowRef} className="bg-white w-80 sm:w-96 h-[600px] rounded-2xl shadow-2xl border border-slate-200 flex flex-col mb-4 overflow-hidden animate-fade-in-up ring-1 ring-black/5">
                    
                    {/* HEADER */}
                    <div className="bg-slate-900 p-4 flex justify-between items-center text-white shadow-md relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-600 rounded-full blur-2xl opacity-20"></div>
                        <div className="flex items-center gap-3 z-10">
                            <div className="bg-blue-600/20 p-2 rounded-full border border-blue-500/30 backdrop-blur-md"><Zap size={20} className="text-blue-400" fill="currentColor" /></div>
                            <div>
                                <span className="font-bold text-base block tracking-tight text-white">ICRA Pro</span>
                                <span className="text-[10px] text-slate-400 flex items-center gap-1"><span className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-[0_0_5px_rgba(34,197,94,0.5)]"></span> Online</span>
                            </div>
                        </div>
                        <div className="flex gap-1 z-10">
                             <button onClick={() => setMessages([{ type: 'bot', text: "Chat cleared.", options: ["Show Policies"] }])} className="hover:bg-white/10 p-2 rounded-full text-slate-400 hover:text-white"><Trash2 size={18}/></button>
                             <button onClick={() => setIsOpen(false)} className="hover:bg-white/10 p-2 rounded-full text-slate-400 hover:text-white"><MinusCircle size={18}/></button>
                        </div>
                    </div>

                    {/* MESSAGES */}
                    <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-5 scroll-smooth relative">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col ${msg.type === 'user' ? 'items-end' : 'items-start'} animate-fade-in relative z-10`}>
                                <div className={`flex items-end gap-2 max-w-[90%] ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-xs shadow-sm border ${msg.type === 'user' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-blue-600'}`}>{msg.type === 'user' ? <User size={14}/> : <Bot size={16}/>}</div>
                                    <div className="flex flex-col gap-2 w-full">
                                        <div className={`p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm whitespace-pre-wrap ${msg.type === 'user' ? 'bg-slate-800 text-white rounded-br-sm' : 'bg-white text-slate-700 border border-slate-200 rounded-bl-sm'}`}>{msg.text}</div>
                                        {msg.type === 'bot' && renderWidget(msg)}
                                    </div>
                                </div>
                                {msg.type === 'bot' && msg.options && msg.options.length > 0 && (
                                    <div className="flex flex-wrap gap-2 mt-2 ml-10 max-w-[90%]">
                                        {msg.options.map((opt, i) => (
                                            <button key={i} onClick={() => handleSend(opt)} className="text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all shadow-sm hover:shadow-md flex items-center gap-1 active:scale-95 bg-white border border-blue-200 text-blue-600 hover:bg-blue-50 group">
                                                {opt} <ChevronRight size={10} className="opacity-50 group-hover:translate-x-0.5 transition-transform" />
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                        {isTyping && <div className="flex items-center gap-2 ml-1"><div className="w-8 h-8 bg-white rounded-xl flex items-center justify-center border border-slate-200 shadow-sm"><Bot size={16} className="text-blue-500"/></div><div className="bg-white border border-slate-200 px-4 py-3 rounded-2xl rounded-bl-sm shadow-sm flex gap-1.5 items-center h-10"><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.15s]"></span><span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce [animation-delay:0.3s]"></span></div></div>}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* INPUT */}
                    <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="p-3 bg-white border-t border-slate-100 flex gap-2 shadow-[0_-4px_10px_-1px_rgba(0,0,0,0.03)] z-20">
                        <div className="flex-1 relative">
                            <input type="text" placeholder={interactionMode.mode !== 'normal' ? "Enter details..." : "Ask about claims, policies..."} className="w-full text-sm p-3 pr-10 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400" value={input} onChange={(e) => setInput(e.target.value)} />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"><FileText size={16} /></div>
                        </div>
                        <button type="submit" disabled={!input.trim() || isTyping} className="bg-blue-600 text-white w-12 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 flex items-center justify-center"><Send size={20} /></button>
                    </form>
                </div>
            )}
            <button onClick={() => setIsOpen(!isOpen)} className={`chatbot-toggle-btn group p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 z-50 border-[3px] border-white relative ${isOpen ? 'bg-slate-800 text-white rotate-90' : 'bg-blue-600 text-white'}`}>{isOpen ? <X size={28} /> : <><MessageCircle size={30} fill="currentColor" className="text-white" /><span className="absolute top-0 right-0 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-blue-600 animate-pulse"></span></>}</button>
        </div>
    );
};

export default Chatbot;