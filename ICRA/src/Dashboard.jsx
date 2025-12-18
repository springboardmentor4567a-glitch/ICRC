import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, ChevronRight, Trash2, CheckCircle, Star, ShieldCheck, TrendingUp, Shield, User } from 'lucide-react';
import Wishlist from './Wishlist';

const Dashboard = ({ user, onLogout, onNavigate }) => {
  // --- STATES ---
  const [showWelcome, setShowWelcome] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Calculator States
  const [activeCalc, setActiveCalc] = useState(null);
  const [calcInputs, setCalcInputs] = useState({});
  const [calcErrors, setCalcErrors] = useState({});
  const [calcResult, setCalcResult] = useState(null);

  const [showWishlistPage, setShowWishlistPage] = useState(false);
  const scrollRef = useRef(null);

  // --- HELPER: SHUFFLE ARRAY ---
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // --- FETCH RECOMMENDATIONS ---
  useEffect(() => {
    const fetchRecs = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const res = await fetch('http://127.0.0.1:8000/recommendations', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const shuffled = shuffleArray([...data]);
          setRecommendations(shuffled.slice(0, 6));
        }
      } catch (err) {
        console.error("Failed to load recommendations", err);
      }
    };
    fetchRecs();
  }, []);

  // --- EFFECT: WELCOME TIMER ---
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 4000);
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') { setActiveCalc(null); setShowWishlistPage(false); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { clearTimeout(timer); window.removeEventListener('keydown', handleKeyDown); };
  }, []);

  // --- CALCULATORS (24 Total) ---
  const calculators = [
    // --- FINANCE ---
    { id: 'prem', category: 'Finance', name: 'Premium Estimator', icon: '💲', desc: 'Estimate Life Insurance Premium.', inputs: [{ label: 'Cover Amount', key: 'c' }, { label: 'Age', key: 'a' }], logic: (v) => '₹' + ((v.c * 0.002) + (v.a * 500)).toLocaleString() + '/yr' },
    { id: 'emi', category: 'Finance', name: 'Home Loan EMI', icon: '🏠', desc: 'Input: Amount, Rate, Years. Output: Monthly EMI.', inputs: [{ label: 'Amount', key: 'p' }, { label: 'Rate %', key: 'r' }, { label: 'Years', key: 'n' }], logic: (v) => '₹' + ((v.p * v.r / 1200 * Math.pow(1 + v.r / 1200, v.n * 12)) / (Math.pow(1 + v.r / 1200, v.n * 12) - 1)).toFixed(0) },
    { id: 'sip', category: 'Finance', name: 'SIP Returns', icon: '📈', desc: 'Input: Inv/mo, Rate, Years. Output: Maturity Value.', inputs: [{ label: 'Monthly Inv.', key: 'p' }, { label: 'Rate %', key: 'r' }, { label: 'Years', key: 'n' }], logic: (v) => '₹' + (v.p * ((Math.pow(1 + v.r / 1200, v.n * 12) - 1) / (v.r / 1200)) * (1 + v.r / 1200)).toFixed(0) },
    { id: 'gst', category: 'Finance', name: 'GST Calc', icon: '🧾', desc: 'Input: Amount, GST %. Output: Total with Tax.', inputs: [{ label: 'Amount', key: 'a' }, { label: 'GST %', key: 'g' }], logic: (v) => '₹' + (v.a * (1 + v.g / 100)).toFixed(0) },
    { id: 'fd', category: 'Finance', name: 'FD Returns', icon: '🏦', desc: 'Input: Deposit, Rate, Years. Output: Maturity Amount.', inputs: [{ label: 'Deposit', key: 'p' }, { label: 'Rate %', key: 'r' }, { label: 'Years', key: 't' }], logic: (v) => '₹' + (v.p * (1 + (v.r * v.t) / 100)).toFixed(0) },
    { id: 'retire', category: 'Finance', name: 'Retirement Fund', icon: '👴', desc: 'Input: Expenses, Years. Output: Corpus Needed.', inputs: [{ label: 'Monthly Exp.', key: 'e' }, { label: 'Years to Retire', key: 'y' }], logic: (v) => '₹' + (v.e * 12 * 25 * Math.pow(1.06, v.y)).toFixed(0) },

    // --- HEALTH ---
    { id: 'bmi', category: 'Health', name: 'BMI Calculator', icon: '⚖️', desc: 'Input: Weight (kg) & Height (m). Output: BMI Score.', inputs: [{ label: 'Weight (kg)', key: 'w' }, { label: 'Height (m)', key: 'h' }], logic: (v) => (v.w / (v.h * v.h)).toFixed(2) + ' BMI' },
    { id: 'hlv', category: 'Health', name: 'Human Life Value', icon: '👤', desc: 'Input: Income & Years to retire. Output: Future earnings value.', inputs: [{ label: 'Annual Income', key: 'i' }, { label: 'Years to Retire', key: 'y' }], logic: (v) => '₹' + (v.i * v.y).toLocaleString() },
    { id: 'coverage', category: 'Health', name: 'Term Coverage', icon: '🛡️', desc: 'Input: Income. Output: Recommended Life Cover (20x).', inputs: [{ label: 'Annual Income', key: 'i' }], logic: (v) => '₹' + (v.i * 20).toLocaleString() },
    { id: 'fat', category: 'Health', name: 'Body Fat %', icon: '🧬', desc: 'Input: Waist, Neck, Height (cm). Output: Body Fat %.', inputs: [{ label: 'Waist (cm)', key: 'w' }, { label: 'Neck (cm)', key: 'n' }, { label: 'Height (cm)', key: 'h' }], logic: (v) => 'Approx ' + (495 / (1.0324 - 0.19077 * Math.log10(v.w - v.n) + 0.15456 * Math.log10(v.h)) - 450).toFixed(1) + '%' },
    { id: 'calorie', category: 'Health', name: 'Calorie Count', icon: '🍎', desc: 'Input: Weight. Output: Daily maintenance calories.', inputs: [{ label: 'Weight (kg)', key: 'w' }], logic: (v) => (v.w * 24 * 1.2).toFixed(0) + ' kcal/day' },
    { id: 'water', category: 'Health', name: 'Water Intake', icon: '💧', desc: 'Input: Weight (kg). Output: Daily water needs.', inputs: [{ label: 'Weight (kg)', key: 'w' }], logic: (v) => (v.w * 0.033).toFixed(1) + ' Liters' },

    // --- AUTO ---
    { id: 'car_dep', category: 'Auto', name: 'Car Value', icon: '🚗', desc: 'Input: Price & Age. Output: Depreciated Value.', inputs: [{ label: 'Car Price', key: 'p' }, { label: 'Age (Years)', key: 'y' }], logic: (v) => '₹' + (v.p * Math.pow(0.85, v.y)).toFixed(0) },
    { id: 'fuel', category: 'Auto', name: 'Trip Cost', icon: '⛽', desc: 'Input: Dist, Mileage, Price. Output: Fuel Cost.', inputs: [{ label: 'Distance (km)', key: 'd' }, { label: 'Mileage (km/l)', key: 'm' }, { label: 'Fuel Price', key: 'p' }], logic: (v) => '₹' + ((v.d / v.m) * v.p).toFixed(0) },
    { id: 'ncb', category: 'Auto', name: 'NCB Discount', icon: '🎁', desc: 'Input: Claim-Free Years. Output: Discount %.', inputs: [{ label: 'Claim Free Years', key: 'y' }], logic: (v) => (Math.min(v.y * 10 + 20, 50)) + '% Discount' },
    { id: 'loan_car', category: 'Auto', name: 'Car Loan EMI', icon: '🚙', desc: 'Input: Loan & Rate. Output: Monthly EMI.', inputs: [{ label: 'Loan Amount', key: 'p' }, { label: 'Rate %', key: 'r' }, { label: 'Years', key: 'n' }], logic: (v) => '₹' + ((v.p * (v.r / 1200)) / (1 - Math.pow(1 + v.r / 1200, -60))).toFixed(0) + '/mo' },
    { id: 'speed', category: 'Auto', name: 'Travel Time', icon: '⏱️', desc: 'Input: Dist & Speed. Output: Time.', inputs: [{ label: 'Distance (km)', key: 'd' }, { label: 'Speed (km/h)', key: 's' }], logic: (v) => (v.d / v.s).toFixed(1) + ' Hours' },
    { id: 'mileage', category: 'Auto', name: 'Mileage Calc', icon: '🛣️', desc: 'Input: Dist & Fuel. Output: Vehicle Mileage.', inputs: [{ label: 'Distance (km)', key: 'd' }, { label: 'Fuel Used (L)', key: 'f' }], logic: (v) => (v.d / v.f).toFixed(1) + ' km/L' },

    // --- TAX & BUSINESS ---
    { id: 'tax', category: 'Tax & Business', name: 'Income Tax', icon: '💼', desc: 'Input: Income. Output: Est. Tax.', inputs: [{ label: 'Annual Income', key: 'i' }], logic: (v) => '₹' + (v.i > 700000 ? (v.i * 0.1).toFixed(0) : 0) },
    { id: 'hra', category: 'Tax & Business', name: 'HRA Exempt', icon: '🏙️', desc: 'Input: Rent, Basic. Output: Exempt Amount.', inputs: [{ label: 'Rent Paid', key: 'r' }, { label: 'Basic Salary', key: 'b' }], logic: (v) => '₹' + Math.min(v.r - (v.b * 0.1), v.b * 0.5).toFixed(0) },
    { id: 'roi', category: 'Tax & Business', name: 'ROI Calc', icon: '📊', desc: 'Input: Gain, Cost. Output: ROI %.', inputs: [{ label: 'Gain', key: 'g' }, { label: 'Cost', key: 'c' }], logic: (v) => (((v.g - v.c) / v.c) * 100).toFixed(2) + '%' },
    { id: 'break', category: 'Tax & Business', name: 'Break-Even', icon: '⚖️', desc: 'Input: Fixed, Price, Var Cost. Output: Units.', inputs: [{ label: 'Fixed Cost', key: 'f' }, { label: 'Price/Unit', key: 'p' }, { label: 'Var Cost/Unit', key: 'v' }], logic: (v) => (v.f / (v.p - v.v)).toFixed(0) + ' Units' },
    { id: 'rev_gst', category: 'Tax & Business', name: 'Reverse GST', icon: '🏷️', desc: 'Input: Total & Tax %. Output: Pre-Tax Value.', inputs: [{ label: 'Total Amount', key: 't' }, { label: 'GST %', key: 'g' }], logic: (v) => '₹' + (v.t / (1 + v.g / 100)).toFixed(0) },
    { id: 'margin', category: 'Tax & Business', name: 'Profit Margin', icon: '💹', desc: 'Input: Cost & Sales. Output: Margin %.', inputs: [{ label: 'Cost Price', key: 'c' }, { label: 'Sale Price', key: 's' }], logic: (v) => (((v.s - v.c) / v.s) * 100).toFixed(2) + '%' },
  ];

  const handleCalcClick = (calc) => { setActiveCalc(calc); setCalcInputs({}); setCalcErrors({}); setCalcResult(null); };
  const calculate = () => {
    if (!activeCalc) return;
    const newErrors = {}; let hasError = false;
    activeCalc.inputs.forEach(field => { if (calcInputs[field.key] === undefined || calcInputs[field.key] === null || calcInputs[field.key] === "" || isNaN(calcInputs[field.key])) { newErrors[field.key] = true; hasError = true; } });
    setCalcErrors(newErrors);
    if (hasError) { setCalcResult(null); return; }
    try { setCalcResult(activeCalc.logic(calcInputs)); } catch (e) { setCalcResult("Invalid"); }
  };
  const handleLogoClick = () => { if (showWishlistPage) { setShowWishlistPage(false); } else if (activeCalc) { setActiveCalc(null); } else { window.location.reload(); } };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Finance': return { bg: 'bg-rose-50', text: 'text-rose-900', title: 'Investment Calculators', icon: <TrendingUp size={48} className="text-rose-200" /> };
      case 'Health': return { bg: 'bg-emerald-50', text: 'text-emerald-900', title: 'Health & Wellness', icon: <Heart size={48} className="text-emerald-200" /> };
      case 'Tax & Business': return { bg: 'bg-purple-50', text: 'text-purple-900', title: 'Tax & Business Tools', icon: <Shield size={48} className="text-purple-200" /> };
      case 'Auto': default: return { bg: 'bg-sky-50', text: 'text-sky-900', title: 'Vehicle & Insurance', icon: <CheckCircle size={48} className="text-sky-200" /> };
    }
  };

  const adImages = ["https://images.unsplash.com/photo-1548695607-9c73430ba065?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"];
  const carouselItems = recommendations.length > 0 ? recommendations : adImages.map(img => ({ type: 'ad', img }));

  // Longer loop for smoother scroll
  const loopItems = [...carouselItems, ...carouselItems, ...carouselItems, ...carouselItems];

  useEffect(() => {
    let scrollInterval;
    if (!isPaused && !showWelcome) {
      scrollInterval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 1) { scrollRef.current.scrollLeft = 0; }
          else { scrollRef.current.scrollLeft += 2; }
        }
      }, 30);
    }
    return () => clearInterval(scrollInterval);
  }, [isPaused, showWelcome, recommendations]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const { clientWidth } = scrollRef.current;
      const scrollAmount = clientWidth / 2;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  if (showWishlistPage) return <Wishlist onBack={() => setShowWishlistPage(false)} />;

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>

      {/* Hide Scrollbar CSS Injection */}
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <ShieldCheck size={20} />
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">ICRA</span>
        </div>
        <div className="flex items-center gap-4">
          <div onClick={() => onNavigate('profile')} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 py-1 px-2 rounded-lg transition-colors group">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs group-hover:bg-blue-200 transition-colors">
              <User size={16} />
            </div>
            <span className="text-slate-600 text-sm font-medium group-hover:text-slate-800">Hello, <strong>{user?.name || "User"}</strong></span>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto p-8">

        {/* CAROUSEL SECTION */}
        <div className="relative mb-8 transition-all duration-1000 -mx-8 px-8">
          <div className={`transition-all duration-1000 ease-in-out overflow-hidden ${showWelcome ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-slate-800 rounded-2xl p-10 text-white shadow-xl relative h-48 flex flex-col justify-center">
              <div className="relative z-10"><h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1><p className="text-blue-100 text-lg">We are here to help you protect what matters most.</p></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            </div>
          </div>

          <div className={`transition-all duration-1000 ease-in-out overflow-hidden relative group ${!showWelcome ? 'opacity-100 max-h-[500px] mt-4' : 'opacity-0 max-h-0 mt-0'}`} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>

            {/* HEIGHT CHANGED TO h-96 (Professional Size) */}
            <div className="h-96 rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative bg-white w-full">
              <button onClick={() => scroll('left')} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"><ChevronRight className="rotate-180" size={24} /></button>
              <button onClick={() => scroll('right')} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"><ChevronRight size={24} /></button>

              <div ref={scrollRef} className="flex items-center h-full overflow-x-auto scroll-smooth hide-scrollbar overflow-y-hidden">
                {loopItems.map((item, index) => (
                  <div key={index} className="flex-shrink-0 h-full w-1/2 border-r-2 border-slate-200 relative">

                    {item.type === 'ad' ? (
                      <>
                        <img src={item.img} alt="Offer" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6"><span className="text-white font-bold tracking-wider uppercase text-sm opacity-90 shadow-sm">Featured Plan</span></div>
                      </>
                    ) : (
                      // CARD LAYOUT COMPACTED
                      <div className="w-full h-full p-5 flex flex-col justify-between bg-white hover:bg-slate-50 transition-colors cursor-pointer overflow-hidden" onClick={() => onNavigate('find-insurance', item.policy.id)}>
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${item.policy.category === 'Health' ? 'bg-red-100 text-red-700' : item.policy.category === 'Life' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{item.policy.category}</span>
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg"><Star size={14} fill="currentColor" /><span className="text-xs font-bold">{item.score}% Match</span></div>
                          </div>

                          <h3 className="text-lg font-bold text-slate-800 leading-tight mb-1 hover:text-blue-600 transition-colors truncate">{item.policy.policy_name}</h3>
                          <p className="text-slate-500 text-xs font-medium mb-3">{item.policy.provider}</p>

                          <div className="flex gap-2 text-[10px] text-slate-600 mb-2">
                            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">Cover: {item.policy.cover_amount?.toLocaleString()}</span>
                            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">Term: 1 Year</span>
                          </div>

                          <div className="bg-slate-100 p-2 rounded-lg border border-slate-200 mb-2"><p className="text-[10px] text-slate-600 italic truncate">" {item.reason} "</p></div>

                          {item.policy.features && (
                            <div className="mb-1">
                              <div className="flex flex-wrap gap-1">
                                {item.policy.features.split(';').slice(0, 2).map((feature, idx) => (
                                  <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-[10px] rounded-full border border-blue-100 truncate max-w-[120px]">{feature.trim()}</span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                          <div><span className="text-[10px] text-slate-400 uppercase font-bold block">Premium</span><span className="text-base font-bold text-slate-800">₹{item.policy.premium.toLocaleString()}</span></div>
                          <button className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 transition-colors shadow-blue-200 shadow-sm">View Details</button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* TILES */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">
          <div onClick={() => onNavigate('risk-profile')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group">
            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors"><Shield size={24} /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Risk Profile</h3><p className="text-slate-500 text-sm">Update details for better recommendations.</p>
          </div>
          <div onClick={() => onNavigate('my-policies')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4"><CheckCircle size={24} /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">My Policies</h3><p className="text-slate-500 text-sm">View active plans and renewals.</p>
          </div>
          <div onClick={() => onNavigate('find-insurance')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4"><Star size={24} /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Find Insurance</h3><p className="text-slate-500 text-sm">Compare quotes and recommendations.</p>
          </div>
          <div onClick={() => setShowWishlistPage(true)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <div className="h-12 w-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 mb-4"><Heart size={24} /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">My Wishlist</h3><p className="text-slate-500 text-sm">View and manage saved policies.</p>
          </div>
        </div>

        <hr className="border-t border-slate-200 my-10" />

        {/* CALCULATORS */}
        <div className="mb-8"><h2 className="text-2xl font-bold text-slate-800">Financial Planning & Insurance Tools</h2><p className="text-slate-500 mt-1">Calculate premiums, returns, and eligibility instantly.</p></div>

        {!activeCalc ? (
          <div className="animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {['Finance', 'Health', 'Auto', 'Tax & Business'].map((category) => {
                const styles = getCategoryStyle(category);
                return (
                  <div key={category} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow">
                    <div className={`${styles.bg} p-6 relative h-32 flex items-center`}>
                      <div className="relative z-10"><h2 className={`text-xl font-bold ${styles.text} w-3/4 leading-tight`}>{styles.title}</h2></div>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">{styles.icon}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                      {calculators.filter(c => c.category === category).map((calc) => (
                        <button key={calc.id} onClick={() => handleCalcClick(calc)} className="w-full text-left p-4 flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-slate-50 transition-colors group">
                          <span className="text-slate-700 font-medium text-sm group-hover:text-blue-600 transition-colors">{calc.name}</span>
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-600 transition-colors" />
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 max-w-2xl mx-auto animate-fade-in">
            <div className="flex items-center justify-between mb-8 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3"><span className="text-3xl">{activeCalc.icon}</span><h2 className="text-2xl font-bold text-slate-800">{activeCalc.name}</h2></div>
              <button onClick={() => setActiveCalc(null)} className="text-slate-400 hover:text-slate-600"><X size={24} /></button>
            </div>
            <p className="text-slate-600 text-sm mb-6 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 font-medium">{activeCalc.desc}</p>
            <div className="space-y-6">
              {activeCalc.inputs.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-2">{field.label}</label>
                  <input type="number" className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-colors ${calcErrors[field.key] ? 'border-red-500 bg-red-50' : 'border-slate-200'}`} placeholder={`Enter ${field.label}`} onKeyDown={(e) => e.key === 'Enter' && calculate()} onChange={(e) => { setCalcInputs({ ...calcInputs, [field.key]: parseFloat(e.target.value) }); if (calcErrors[field.key]) { const newErrors = { ...calcErrors }; delete newErrors[field.key]; setCalcErrors(newErrors); } }} />
                  {calcErrors[field.key] && (<p className="text-red-500 text-xs mt-1 flex items-center gap-1">Required</p>)}
                </div>
              ))}
              <button onClick={calculate} className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors mt-4 shadow-md">Calculate Result</button>
              {calcResult && (<div className="mt-6 p-4 bg-green-50 border border-green-100 rounded-xl text-center animate-fade-in"><span className="block text-sm text-green-600 uppercase tracking-wide font-semibold mb-1">Result</span><span className="text-3xl font-bold text-green-700">{calcResult}</span></div>)}
            </div>
          </div>
        )}

      </main>
    </div>
  );
};

export default Dashboard;