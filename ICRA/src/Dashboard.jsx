import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, ChevronRight, Trash2, CheckCircle } from 'lucide-react';
import Wishlist from './Wishlist';

const Dashboard = ({ user, onLogout, onNavigate }) => {
  // --- STATES ---
  // Default showWelcome to TRUE so it shows immediately on refresh/login
  const [showWelcome, setShowWelcome] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  // Calculator States
  const [activeCalc, setActiveCalc] = useState(null);
  const [calcInputs, setCalcInputs] = useState({});
  const [calcErrors, setCalcErrors] = useState({});
  const [calcResult, setCalcResult] = useState(null);

  // Wishlist View State
  const [showWishlistPage, setShowWishlistPage] = useState(false);

  const scrollRef = useRef(null);

  // --- EFFECT: WELCOME MESSAGE & KEYS ---
  useEffect(() => {
    // 1. Welcome Timer: Always run on mount (Refresh/Login)
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 4000); // Shows for 4 seconds, then switches to Ads

    // 2. Global ESC Key
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setActiveCalc(null);
        setShowWishlistPage(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // --- CALCULATOR DATA ---
  const calculators = [
    // Category: Health
    {
      id: 'bmi', category: 'Health', name: 'BMI Calculator', icon: '⚖️',
      desc: 'Input: Your Weight (kg) and Height (m). Output: Your Body Mass Index (BMI) score to determine if you are underweight, normal, or overweight.',
      inputs: [{ label: 'Weight (kg)', key: 'w' }, { label: 'Height (m)', key: 'h' }],
      logic: (vals) => (vals.w / (vals.h * vals.h)).toFixed(2) + ' BMI'
    },
    {
      id: 'hlv', category: 'Health', name: 'Human Life Value', icon: '👤',
      desc: 'Input: Your Annual Income and Years remaining until retirement. Output: The total financial value of your remaining working years.',
      inputs: [{ label: 'Annual Income', key: 'i' }, { label: 'Years to Retire', key: 'y' }],
      logic: (vals) => '₹' + (vals.i * vals.y).toLocaleString()
    },
    {
      id: 'coverage', category: 'Health', name: 'Term Insurance Coverage', icon: '🛡️',
      desc: 'Input: Your Annual Income. Output: The recommended life insurance coverage amount (typically 20x your yearly earnings).',
      inputs: [{ label: 'Annual Income', key: 'i' }],
      logic: (vals) => '₹' + (vals.i * 20).toLocaleString()
    },
    {
      id: 'fat', category: 'Health', name: 'Body Fat Calculator', icon: '🧬',
      desc: 'Input: Waist, Neck, and Height measurements (cm). Output: Your estimated Body Fat Percentage based on the US Navy method.',
      inputs: [{ label: 'Waist (cm)', key: 'w' }, { label: 'Neck (cm)', key: 'n' }, { label: 'Height (cm)', key: 'h' }],
      logic: (vals) => 'Approx ' + (495 / (1.0324 - 0.19077 * Math.log10(vals.w - vals.n) + 0.15456 * Math.log10(vals.h)) - 450).toFixed(1) + '%'
    },
    {
      id: 'calorie', category: 'Health', name: 'Calorie Calculator', icon: '🍎',
      desc: 'Input: Your Weight (kg). Output: The estimated daily calories required to maintain your current weight.',
      inputs: [{ label: 'Weight (kg)', key: 'w' }],
      logic: (vals) => (vals.w * 24 * 1.2).toFixed(0) + ' kcal/day'
    },

    // Category: Auto
    {
      id: 'car_dep', category: 'Auto', name: 'Car Depreciation', icon: '🚗',
      desc: 'Input: Original Car Price and Car Age (Years). Output: The current estimated market value of your car after depreciation.',
      inputs: [{ label: 'Car Price', key: 'p' }, { label: 'Age (Years)', key: 'y' }],
      logic: (vals) => '₹' + (vals.p * Math.pow(0.85, vals.y)).toFixed(0)
    },
    {
      id: 'fuel', category: 'Auto', name: 'Fuel Cost Calculator', icon: '⛽',
      desc: 'Input: Trip Distance (km), Mileage (km/l), and Fuel Price. Output: The total cost of fuel for the trip.',
      inputs: [{ label: 'Distance (km)', key: 'd' }, { label: 'Mileage (km/l)', key: 'm' }, { label: 'Fuel Price', key: 'p' }],
      logic: (vals) => '₹' + ((vals.d / vals.m) * vals.p).toFixed(0)
    },
    {
      id: 'ncb', category: 'Auto', name: 'No Claim Bonus', icon: '🎁',
      desc: 'Input: Number of Claim-Free Years. Output: The percentage discount (NCB) you are eligible for on your next premium.',
      inputs: [{ label: 'Claim Free Years', key: 'y' }],
      logic: (vals) => (Math.min(vals.y * 10 + 20, 50)) + '% Discount'
    },
    {
      id: 'loan_car', category: 'Auto', name: 'Car Loan EMI', icon: '🚙',
      desc: 'Input: Loan Amount and Interest Rate. Output: The estimated monthly EMI payment for a standard 5-year tenure.',
      inputs: [{ label: 'Loan Amount', key: 'p' }, { label: 'Rate %', key: 'r' }],
      logic: (vals) => '₹' + ((vals.p * (vals.r / 1200)) / (1 - Math.pow(1 + vals.r / 1200, -60))).toFixed(0) + '/mo'
    },
    {
      id: 'speed', category: 'Auto', name: 'Travel Time', icon: '⏱️',
      desc: 'Input: Distance (km) and Average Speed (km/h). Output: The estimated time it will take to complete the journey.',
      inputs: [{ label: 'Distance (km)', key: 'd' }, { label: 'Speed (km/h)', key: 's' }],
      logic: (vals) => (vals.d / vals.s).toFixed(1) + ' Hours'
    },

    // Category: Finance
    {
      id: 'emi', category: 'Finance', name: 'Home Loan EMI', icon: '🏠',
      desc: 'Input: Loan Amount, Rate, and Tenure. Output: The fixed monthly amount you need to pay towards your home loan.',
      inputs: [{ label: 'Amount', key: 'p' }, { label: 'Rate %', key: 'r' }, { label: 'Years', key: 'n' }],
      logic: (vals) => '₹' + ((vals.p * vals.r / 1200 * Math.pow(1 + vals.r / 1200, vals.n * 12)) / (Math.pow(1 + vals.r / 1200, vals.n * 12) - 1)).toFixed(0)
    },
    {
      id: 'sip', category: 'Finance', name: 'SIP Calculator', icon: '📈',
      desc: 'Input: Monthly Investment, Expected Return Rate, and Duration. Output: The total value of your investment at maturity.',
      inputs: [{ label: 'Monthly Inv.', key: 'p' }, { label: 'Rate %', key: 'r' }, { label: 'Years', key: 'n' }],
      logic: (vals) => '₹' + (vals.p * ((Math.pow(1 + vals.r / 1200, vals.n * 12) - 1) / (vals.r / 1200)) * (1 + vals.r / 1200)).toFixed(0)
    },
    {
      id: 'gst', category: 'Finance', name: 'GST Calculator', icon: '🧾',
      desc: 'Input: Base Amount and GST %. Output: The total amount payable inclusive of the Goods and Services Tax.',
      inputs: [{ label: 'Amount', key: 'a' }, { label: 'GST %', key: 'g' }],
      logic: (vals) => '₹' + (vals.a * (1 + vals.g / 100)).toFixed(0) + ' Total'
    },
    {
      id: 'fd', category: 'Finance', name: 'FD Returns', icon: '🏦',
      desc: 'Input: Deposit Amount, Interest Rate, and Years. Output: The total maturity amount you will receive from the bank.',
      inputs: [{ label: 'Deposit', key: 'p' }, { label: 'Rate %', key: 'r' }, { label: 'Years', key: 't' }],
      logic: (vals) => '₹' + (vals.p * (1 + (vals.r * vals.t) / 100)).toFixed(0)
    },
    {
      id: 'retire', category: 'Finance', name: 'Retirement Corpus', icon: '👴',
      desc: 'Input: Monthly Expenses and Years to Retire. Output: The total corpus fund you need to accumulate for a stress-free retirement.',
      inputs: [{ label: 'Monthly Exp.', key: 'e' }, { label: 'Years to Retire', key: 'y' }],
      logic: (vals) => '₹' + (vals.e * 12 * 25 * Math.pow(1.06, vals.y)).toFixed(0)
    },

    // Category: Tax
    {
      id: 'tax', category: 'Tax & Business', name: 'Income Tax', icon: '💼',
      desc: 'Input: Annual Income. Output: Approximate tax liability based on the new tax regime slabs.',
      inputs: [{ label: 'Annual Income', key: 'i' }],
      logic: (vals) => '₹' + (vals.i > 700000 ? (vals.i * 0.1).toFixed(0) : 0)
    },
    {
      id: 'hra', category: 'Tax & Business', name: 'HRA Exemption', icon: '🏙️',
      desc: 'Input: Rent Paid and Basic Salary. Output: The amount of HRA that is exempt from your taxable income.',
      inputs: [{ label: 'Rent Paid', key: 'r' }, { label: 'Basic Salary', key: 'b' }],
      logic: (vals) => '₹' + Math.min(vals.r - (vals.b * 0.1), vals.b * 0.5).toFixed(0)
    },
    {
      id: 'roi', category: 'Tax & Business', name: 'ROI Calculator', icon: '📊',
      desc: 'Input: Gain Amount and Cost of Investment. Output: The percentage return on your investment.',
      inputs: [{ label: 'Gain', key: 'g' }, { label: 'Cost', key: 'c' }],
      logic: (vals) => (((vals.g - vals.c) / vals.c) * 100).toFixed(2) + '%'
    },
    {
      id: 'break', category: 'Tax & Business', name: 'Break-Even', icon: '⚖️',
      desc: 'Input: Fixed Costs, Price per Unit, and Variable Cost. Output: The number of units you need to sell to cover all costs.',
      inputs: [{ label: 'Fixed Cost', key: 'f' }, { label: 'Price/Unit', key: 'p' }, { label: 'Var Cost/Unit', key: 'v' }],
      logic: (vals) => (vals.f / (vals.p - vals.v)).toFixed(0) + ' Units'
    },
  ];

  // --- CALC LOGIC ---
  const handleCalcClick = (calc) => {
    setActiveCalc(calc);
    setCalcInputs({});
    setCalcErrors({});
    setCalcResult(null);
  };

  const calculate = () => {
    if (!activeCalc) return;
    const newErrors = {};
    let hasError = false;
    activeCalc.inputs.forEach(field => {
      const val = calcInputs[field.key];
      if (val === undefined || val === null || val === "" || isNaN(val)) {
        newErrors[field.key] = true;
        hasError = true;
      }
    });
    setCalcErrors(newErrors);
    if (hasError) { setCalcResult(null); return; }
    try { setCalcResult(activeCalc.logic(calcInputs)); } catch (e) { setCalcResult("Invalid"); }
  };

  const handleLogoClick = () => {
    if (showWishlistPage) { setShowWishlistPage(false); }
    else if (activeCalc) { setActiveCalc(null); }
    else { window.location.reload(); }
  };

  // --- AUTO SCROLL EFFECT ---
  const adImages = ["https://images.unsplash.com/photo-1548695607-9c73430ba065?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=800&q=80", "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80"];
  useEffect(() => {
    let scrollInterval;
    if (!isPaused && !showWelcome) {
      scrollInterval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
          if (scrollLeft + clientWidth >= scrollWidth - 1) { scrollRef.current.scrollLeft = 0; }
          else { scrollRef.current.scrollLeft += 1; }
        }
      }, 30);
    }
    return () => clearInterval(scrollInterval);
  }, [isPaused, showWelcome]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const getCategoryStyle = (category) => {
    switch (category) {
      case 'Finance': return { bg: 'bg-rose-50', text: 'text-rose-900', title: 'Investment Calculators', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-rose-200 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" /></svg> };
      case 'Health': return { bg: 'bg-emerald-50', text: 'text-emerald-900', title: 'Health & Wellness', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-emerald-200 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" /></svg> };
      case 'Tax & Business': return { bg: 'bg-purple-50', text: 'text-purple-900', title: 'Tax & Business Tools', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-purple-200 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9v-2h2v-1h2v1h2v2h-2v1h2v2h-2v1h-2v-1H9v-2h2v-1z" /></svg> };
      case 'Auto': default: return { bg: 'bg-sky-50', text: 'text-sky-900', title: 'Vehicle & Insurance', icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-sky-200 opacity-80" viewBox="0 0 24 24" fill="currentColor"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z" /></svg> };
    }
  };

  // --- RENDER CONDITIONAL VIEW ---
  if (showWishlistPage) {
    return <Wishlist onBack={() => setShowWishlistPage(false)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">

      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div onClick={handleLogoClick} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">ICRA</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-sm">Hello, <strong>{user?.name || "User"}</strong></span>
          <button onClick={onLogout} className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors border border-red-100 hover:border-red-200 px-3 py-1 rounded-full">Logout</button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto p-8">

        {/* Welcome & Ads Section */}
        <div className="relative mb-8 transition-all duration-1000">
          <div className={`transition-all duration-1000 ease-in-out overflow-hidden ${showWelcome ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}>
            <div className="bg-gradient-to-r from-blue-600 to-slate-800 rounded-2xl p-10 text-white shadow-xl relative h-48 flex flex-col justify-center">
              <div className="relative z-10"><h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1><p className="text-blue-100 text-lg">We are here to help you protect what matters most.</p></div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            </div>
          </div>
          <div className={`transition-all duration-1000 ease-in-out overflow-hidden relative group ${!showWelcome ? 'opacity-100 max-h-[500px] mt-4' : 'opacity-0 max-h-0 mt-0'}`} onMouseEnter={() => setIsPaused(true)} onMouseLeave={() => setIsPaused(false)}>
            <div className="h-80 rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative bg-white">
              <button onClick={() => scroll('left')} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></button>
              <button onClick={() => scroll('right')} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg></button>
              <div ref={scrollRef} className="flex items-center h-full overflow-x-auto scroll-smooth no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {[...adImages, ...adImages, ...adImages].map((imgUrl, index) => (
                  <div key={index} className="flex-shrink-0 h-full w-[400px] border-r border-white/20 relative">
                    <img src={imgUrl} alt="Offer" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6"><span className="text-white font-bold tracking-wider uppercase text-sm opacity-90 shadow-sm">Featured Plan</span></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Top Grid (4 Columns) with NEW RISK PROFILE CARD */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">

          {/* 1. Risk Profile (NEW) */}
          <div onClick={() => onNavigate('risk-profile')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group">
            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Risk Profile</h3>
            <p className="text-slate-500 text-sm">Update details for better recommendations.</p>
          </div>

          {/* 2. My Policies */}
          <div onClick={() => onNavigate('my-policies')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">My Policies</h3><p className="text-slate-500 text-sm">View active plans and renewals.</p>
          </div>

          {/* 3. Find Insurance */}
          <div onClick={() => onNavigate('find-insurance')} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Find Insurance</h3><p className="text-slate-500 text-sm">Compare quotes and recommendations.</p>
          </div>

          {/* 4. My Wishlist */}
          <div onClick={() => setShowWishlistPage(true)} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <div className="h-12 w-12 bg-pink-50 rounded-xl flex items-center justify-center text-pink-600 mb-4"><Heart size={24} /></div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">My Wishlist</h3><p className="text-slate-500 text-sm">View and manage saved policies.</p>
          </div>
        </div>

        <hr className="border-t border-slate-200 my-10" />

        {/* Calculators */}
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
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-slate-400 group-hover:text-blue-600 transition-colors transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
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
              <button onClick={() => setActiveCalc(null)} className="text-slate-400 hover:text-slate-600"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            {/* DETAILED DESCRIPTION RESTORED */}
            <p className="text-slate-600 text-sm mb-6 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 font-medium">
              {activeCalc.desc}
            </p>
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