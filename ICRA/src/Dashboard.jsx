import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, ChevronRight, Trash2, CheckCircle, Star, ShieldCheck, TrendingUp, Shield, User, Bell, Clock } from 'lucide-react';
import Wishlist from './Wishlist';
import NotificationDrawer from './NotificationDrawer';

const Dashboard = ({ user, onLogout, onNavigate, welcomeShown, setWelcomeShown }) => {
  // --- STATES ---
  const [showWelcome, setShowWelcome] = useState(!welcomeShown);
  const [isPaused, setIsPaused] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // --- NOTIFICATION STATES ---
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

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

  // --- NOTIFICATION HANDLERS ---
  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await fetch('http://127.0.0.1:8000/notifications', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    } catch (err) { console.error("Failed to fetch notifications", err); }
  };

  const markNotificationsRead = async () => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch('http://127.0.0.1:8000/notifications/read', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) { console.error("Failed to mark read", err); }
  };

  const deleteNotification = async (id) => {
    try {
      const token = localStorage.getItem('access_token');
      await fetch(`http://127.0.0.1:8000/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const updated = notifications.filter(n => n.id !== id);
      setNotifications(updated);
      setUnreadCount(updated.filter(n => !n.is_read).length);
    } catch (err) { console.error("Failed to delete", err); }
  };

  // --- INITIAL DATA LOAD ---
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
    fetchNotifications();
  }, []);

  // --- RESTORED: AUTO SCROLL EFFECT ---
  useEffect(() => {
    let scrollInterval;
    if (!isPaused && !showWelcome) {
      scrollInterval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 1) {
            scrollRef.current.scrollLeft = 0;
          } else {
            scrollRef.current.scrollLeft += 2;
          }
        }
      }, 30);
    }
    return () => clearInterval(scrollInterval);
  }, [isPaused, showWelcome, recommendations]);

  // --- EFFECT: WELCOME TIMER & KEYS ---
  useEffect(() => {
    if (!welcomeShown) {
      const timer = setTimeout(() => {
        setShowWelcome(false);
        setWelcomeShown(true);
      }, 4000);
      return () => clearTimeout(timer);
    } else {
      setShowWelcome(false);
    }

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveCalc(null);
        setShowWishlistPage(false);
        setShowNotifications(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => { window.removeEventListener('keydown', handleKeyDown); };
  }, [welcomeShown, setWelcomeShown]);

  // --- CALCULATORS ---
  const calculators = [
    { id: 'prem', category: 'Finance', name: 'Premium Estimator', icon: '💲', desc: 'Estimate Life Insurance Premium.', inputs: [{ label: 'Cover Amount', key: 'c' }, { label: 'Age', key: 'a' }], logic: (v) => '₹' + ((v.c * 0.002) + (v.a * 500)).toLocaleString() + '/yr' },
    { id: 'emi', category: 'Finance', name: 'Home Loan EMI', icon: '🏠', desc: 'Find out your monthly mortgage payment by entering the loan amount, interest rate, and duration.', inputs: [{ label: 'Amount', key: 'p' }, { label: 'Rate %', key: 'r' }, { label: 'Years', key: 'n' }], logic: (v) => '₹' + ((v.p * v.r / 1200 * Math.pow(1 + v.r / 1200, v.n * 12)) / (Math.pow(1 + v.r / 1200, v.n * 12) - 1)).toFixed(0) },
    { id: 'sip', category: 'Finance', name: 'SIP Returns', icon: '📈', desc: 'See how your monthly investments grow over time with the power of compounding.', inputs: [{ label: 'Monthly Inv.', key: 'p' }, { label: 'Rate %', key: 'r' }, { label: 'Years', key: 'n' }], logic: (v) => '₹' + (v.p * ((Math.pow(1 + v.r / 1200, v.n * 12) - 1) / (v.r / 1200)) * (1 + v.r / 1200)).toFixed(0) },
    { id: 'gst', category: 'Finance', name: 'GST Calc', icon: '🧾', desc: 'Add GST to a base amount to find the final price inclusive of tax.', inputs: [{ label: 'Amount', key: 'a' }, { label: 'GST %', key: 'g' }], logic: (v) => '₹' + (v.a * (1 + v.g / 100)).toFixed(0) },
    { id: 'fd', category: 'Finance', name: 'FD Returns', icon: '🏦', desc: 'Calculate the maturity value of your fixed deposit after a specific tenure.', inputs: [{ label: 'Deposit', key: 'p' }, { label: 'Rate %', key: 'r' }, { label: 'Years', key: 't' }], logic: (v) => '₹' + (v.p * (1 + (v.r * v.t) / 100)).toFixed(0) },
    { id: 'retire', category: 'Finance', name: 'Retirement Fund', icon: '👴', desc: 'Estimate the corpus you need to save today to maintain your lifestyle after retirement.', inputs: [{ label: 'Monthly Exp.', key: 'e' }, { label: 'Years to Retire', key: 'y' }], logic: (v) => '₹' + (v.e * 12 * 25 * Math.pow(1.06, v.y)).toFixed(0) },
    { id: 'bmi', category: 'Health', name: 'BMI Calculator', icon: '⚖️', desc: 'Determine if you are in a healthy weight range based on your height and weight.', inputs: [{ label: 'Weight (kg)', key: 'w' }, { label: 'Height (m)', key: 'h' }], logic: (v) => (v.w / (v.h * v.h)).toFixed(2) + ' BMI' },
    { id: 'hlv', category: 'Health', name: 'Human Life Value', icon: '👤', desc: 'Calculate the financial value of your future earnings to determine ideal insurance cover.', inputs: [{ label: 'Annual Income', key: 'i' }, { label: 'Years to Retire', key: 'y' }], logic: (v) => '₹' + (v.i * v.y).toLocaleString() },
    { id: 'coverage', category: 'Health', name: 'Term Coverage', icon: '🛡️', desc: 'A quick rule-of-thumb calculation for how much life insurance cover you should have.', inputs: [{ label: 'Annual Income', key: 'i' }], logic: (v) => '₹' + (v.i * 20).toLocaleString() },
    { id: 'fat', category: 'Health', name: 'Body Fat %', icon: '🧬', desc: 'Estimate your body fat percentage using body measurements.', inputs: [{ label: 'Waist (cm)', key: 'w' }, { label: 'Neck (cm)', key: 'n' }, { label: 'Height (cm)', key: 'h' }], logic: (v) => 'Approx ' + (495 / (1.0324 - 0.19077 * Math.log10(v.w - v.n) + 0.15456 * Math.log10(v.h)) - 450).toFixed(1) + '%' },
    { id: 'calorie', category: 'Health', name: 'Calorie Count', icon: '🍎', desc: 'Find out the daily calorie intake required to maintain your current weight.', inputs: [{ label: 'Weight (kg)', key: 'w' }], logic: (v) => (v.w * 24 * 1.2).toFixed(0) + ' kcal/day' },
    { id: 'water', category: 'Health', name: 'Water Intake', icon: '💧', desc: 'Calculate the recommended daily water intake for your body weight.', inputs: [{ label: 'Weight (kg)', key: 'w' }], logic: (v) => (v.w * 0.033).toFixed(1) + ' Liters' },
    { id: 'car_dep', category: 'Auto', name: 'Car Value', icon: '🚗', desc: 'Estimate the current market value of your car after depreciation.', inputs: [{ label: 'Car Price', key: 'p' }, { label: 'Age (Years)', key: 'y' }], logic: (v) => '₹' + (v.p * Math.pow(0.85, v.y)).toFixed(0) },
    { id: 'fuel', category: 'Auto', name: 'Trip Cost', icon: '⛽', desc: 'Calculate the fuel cost for a trip based on distance, mileage, and fuel price.', inputs: [{ label: 'Distance (km)', key: 'd' }, { label: 'Mileage (km/l)', key: 'm' }, { label: 'Fuel Price', key: 'p' }], logic: (v) => '₹' + ((v.d / v.m) * v.p).toFixed(0) },
    { id: 'ncb', category: 'Auto', name: 'NCB Discount', icon: '🎁', desc: 'Check the No Claim Bonus discount percentage you are eligible for.', inputs: [{ label: 'Claim Free Years', key: 'y' }], logic: (v) => (Math.min(v.y * 10 + 20, 50)) + '% Discount' },
    { id: 'loan_car', category: 'Auto', name: 'Car Loan EMI', icon: '🚙', desc: 'Calculate the monthly EMI for your new car loan.', inputs: [{ label: 'Loan Amount', key: 'p' }, { label: 'Rate %', key: 'r' }], logic: (v) => '₹' + ((v.p * (v.r / 1200)) / (1 - Math.pow(1 + v.r / 1200, -60))).toFixed(0) + '/mo' },
    { id: 'speed', category: 'Auto', name: 'Travel Time', icon: '⏱️', desc: 'Estimate the time it will take to reach your destination at a specific speed.', inputs: [{ label: 'Distance (km)', key: 'd' }, { label: 'Speed (km/h)', key: 's' }], logic: (v) => (v.d / v.s).toFixed(1) + ' Hours' },
    { id: 'mileage', category: 'Auto', name: 'Mileage Calc', icon: '🛣️', desc: 'Calculate the exact fuel efficiency (mileage) of your vehicle.', inputs: [{ label: 'Distance (km)', key: 'd' }, { label: 'Fuel Used (L)', key: 'f' }], logic: (v) => (v.d / v.f).toFixed(1) + ' km/L' },
    { id: 'tax', category: 'Tax & Business', name: 'Income Tax', icon: '💼', desc: 'A rough estimate of your annual income tax liability based on basic slabs.', inputs: [{ label: 'Annual Income', key: 'i' }], logic: (v) => '₹' + (v.i > 700000 ? (v.i * 0.1).toFixed(0) : 0) },
    { id: 'hra', category: 'Tax & Business', name: 'HRA Exempt', icon: '🏙️', desc: 'Calculate the amount of House Rent Allowance that is exempt from tax.', inputs: [{ label: 'Rent Paid', key: 'r' }, { label: 'Basic Salary', key: 'b' }], logic: (v) => '₹' + Math.min(v.r - (v.b * 0.1), v.b * 0.5).toFixed(0) },
    { id: 'roi', category: 'Tax & Business', name: 'ROI Calc', icon: '📊', desc: 'Calculate the percentage return on an investment relative to its cost.', inputs: [{ label: 'Gain', key: 'g' }, { label: 'Cost', key: 'c' }], logic: (v) => (((v.g - v.c) / v.c) * 100).toFixed(2) + '%' },
    { id: 'break', category: 'Tax & Business', name: 'Break-Even', icon: '⚖️', desc: 'Find out how many units you need to sell to cover your costs.', inputs: [{ label: 'Fixed Cost', key: 'f' }, { label: 'Price/Unit', key: 'p' }, { label: 'Var Cost/Unit', key: 'v' }], logic: (v) => (v.f / (v.p - v.v)).toFixed(0) + ' Units' },
    { id: 'rev_gst', category: 'Tax & Business', name: 'Reverse GST', icon: '🏷️', desc: 'Remove the GST component from a total price to find the original value.', inputs: [{ label: 'Total Amount', key: 't' }, { label: 'GST %', key: 'g' }], logic: (v) => '₹' + (v.t / (1 + v.g / 100)).toFixed(0) },
    { id: 'margin', category: 'Tax & Business', name: 'Profit Margin', icon: '💹', desc: 'Calculate the profit margin percentage on a product sale.', inputs: [{ label: 'Cost Price', key: 'c' }, { label: 'Sale Price', key: 's' }], logic: (v) => (((v.s - v.c) / v.s) * 100).toFixed(2) + '%' },
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
  const loopItems = [...carouselItems, ...carouselItems, ...carouselItems, ...carouselItems];

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

      {/* NOTIFICATION DRAWER */}
      <NotificationDrawer
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        notifications={notifications}
        markRead={markNotificationsRead}
        onDelete={deleteNotification}
      />

      <style>{` .hide-scrollbar::-webkit-scrollbar { display: none; } .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; } `}</style>

      {/* NAVBAR */}
      <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg"><ShieldCheck size={20} /></div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">ICRA</span>
        </div>
        <div className="flex items-center gap-4">

          <div onClick={() => setShowNotifications(true)} className="relative p-2 rounded-full hover:bg-slate-100 cursor-pointer transition-colors text-slate-600">
            <Bell size={20} />
            {unreadCount > 0 && (<span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>)}
          </div>

          <div onClick={() => onNavigate('profile')} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 py-1 px-2 rounded-lg transition-colors group">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xs group-hover:bg-blue-200 transition-colors"><User size={16} /></div>
            <span className="text-slate-600 text-sm font-medium group-hover:text-slate-800">Hello, <strong>{user?.name || "User"}</strong></span>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto p-8">

        {/* CAROUSEL */}
        <div className="relative mb-8 transition-all duration-1000 -mx-8 px-8">
          <div className={`transition-all duration-1000 ease-in-out overflow-hidden ${showWelcome ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-slate-800 rounded-2xl p-10 text-white shadow-xl relative h-48 flex flex-col justify-center">
              <div className="relative z-10"><h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1><p className="text-blue-100 text-lg">We are here to help you protect what matters most.</p></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            </div>
          </div>

          <div className={`transition-all duration-1000 ease-in-out overflow-hidden relative group ${!showWelcome ? 'opacity-100 max-h-[500px] mt-4' : 'opacity-0 max-h-0 mt-0'}`} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <div className="h-[260px] rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative bg-white w-full">
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
                      <div className="w-full h-full p-4 flex flex-col justify-between bg-white hover:bg-slate-50 transition-colors cursor-pointer overflow-hidden" onClick={() => onNavigate('find-insurance', item.policy.id)}>
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${item.policy.category === 'Health' ? 'bg-red-100 text-red-700' : item.policy.category === 'Life' ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'}`}>{item.policy.category}</span>
                            <div className="flex items-center gap-1 bg-green-100 text-green-700 px-2 py-1 rounded-lg"><Star size={12} fill="currentColor" /><span className="text-[10px] font-bold">{item.score}% Match</span></div>
                          </div>
                          <h3 className="text-base font-bold text-slate-800 leading-tight mb-1 hover:text-blue-600 transition-colors truncate">{item.policy.policy_name}</h3>
                          <p className="text-slate-500 text-[10px] font-medium mb-1">{item.policy.provider}</p>
                          <div className="flex gap-2 text-[10px] text-slate-600 mb-2">
                            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">Cover: {item.policy.cover_amount?.toLocaleString()}</span>
                            <span className="bg-slate-100 px-2 py-1 rounded border border-slate-200">Term: 1 Year</span>
                          </div>
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
                        <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100">
                          <div><span className="text-[10px] text-slate-400 uppercase font-bold block">Premium</span><span className="text-sm font-bold text-slate-800">₹{item.policy.premium.toLocaleString()}</span></div>
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
          <div onClick={() => onNavigate('activity-log')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group">
            <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <Clock size={24} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Activity Log</h3>
            <p className="text-slate-500 text-sm">View full transaction & claim history.</p>
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
<<<<<<< HEAD
      
      {/* Hidden Admin Access Button (Bottom Right) */}
      <div 
        onClick={() => onNavigate('admin')} 
        className="fixed bottom-4 right-4 w-12 h-12 bg-slate-800 opacity-10 hover:opacity-30 rounded-full cursor-pointer transition-opacity flex items-center justify-center"
        title="Admin Dashboard"
      >
        <ShieldCheck size={20} className="text-white" />
      </div>
=======
>>>>>>> d3f807c35cd56039ec5d0b697a32adf89bb718d7
    </div>
  );
};

export default Dashboard;