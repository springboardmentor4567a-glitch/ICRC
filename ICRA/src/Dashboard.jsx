import React, { useState, useEffect, useRef } from 'react';

const Dashboard = ({ user, onLogout, onNavigate }) => {
  // --- STATES ---
  const [showWelcome, setShowWelcome] = useState(true);
  const [isPaused, setIsPaused] = useState(false); // Controls auto-scroll pause on hover
  const scrollRef = useRef(null);

  // --- SAMPLE DATA: Ad Images ---
  const adImages = [
    "https://images.unsplash.com/photo-1548695607-9c73430ba065?auto=format&fit=crop&w=800&q=80", // Family
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=80", // Car
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=800&q=80", // House
    "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80", // Business
    "https://images.unsplash.com/photo-1504198458649-3128b932f49e?auto=format&fit=crop&w=800&q=80", // Travel
    "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80", // Medical
  ];

  // --- EFFECT 1: Welcome Timer (10 Seconds) ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 10000);
    return () => clearTimeout(timer);
  }, []);

  // --- EFFECT 2: Auto-Scroll Logic ---
  useEffect(() => {
    let scrollInterval;

    // Only scroll if NOT paused and the Welcome message is gone
    if (!isPaused && !showWelcome) {
      scrollInterval = setInterval(() => {
        if (scrollRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

          // Infinite Loop: If at end, reset to 0. Otherwise, move 1px.
          if (scrollLeft + clientWidth >= scrollWidth - 1) {
            scrollRef.current.scrollLeft = 0;
          } else {
            scrollRef.current.scrollLeft += 1; // Speed of scroll
          }
        }
      }, 30); // Update every 30ms for smooth slow scroll
    }

    return () => clearInterval(scrollInterval);
  }, [isPaused, showWelcome]);

  // --- HELPER: Manual Scroll Buttons ---
  const scroll = (direction) => {
    if (scrollRef.current) {
      const { current } = scrollRef;
      const scrollAmount = 400;
      if (direction === 'left') {
        current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans overflow-x-hidden">

      {/* --- NAVBAR --- */}
      <nav className="bg-white shadow-sm border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-slate-800 tracking-tight">ICRA</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-600 text-sm">Hello, <strong>{user?.name || "User"}</strong></span>
          <button
            onClick={onLogout}
            className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors border border-red-100 hover:border-red-200 px-3 py-1 rounded-full"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* --- MAIN CONTENT --- */}
      <main className="max-w-6xl mx-auto p-8">

        {/* --- DYNAMIC SECTION: Welcome vs Ads --- */}
        <div className="relative mb-8 transition-all duration-1000">

          {/* 1. WELCOME BANNER (Height: h-48) */}
          <div
            className={`transition-all duration-1000 ease-in-out overflow-hidden
              ${showWelcome ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0'}`}
          >
            <div className="bg-gradient-to-r from-blue-600 to-slate-800 rounded-2xl p-10 text-white shadow-xl relative h-48 flex flex-col justify-center">
              <div className="relative z-10">
                <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                <p className="text-blue-100 text-lg">We are here to help you protect what matters most.</p>
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
            </div>
          </div>

          {/* 2. ADVERTISEMENT SCROLLER (Height: h-80) */}
          <div
            className={`transition-all duration-1000 ease-in-out overflow-hidden relative group
              ${!showWelcome ? 'opacity-100 max-h-[500px] mt-4' : 'opacity-0 max-h-0 mt-0'}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            <div className="h-80 rounded-2xl shadow-lg border border-slate-200 overflow-hidden relative bg-white">

              {/* Left Button */}
              <button
                onClick={() => scroll('left')}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Right Button */}
              <button
                onClick={() => scroll('right')}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Scrolling Track */}
              <div
                ref={scrollRef}
                className="flex items-center h-full overflow-x-auto scroll-smooth no-scrollbar"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {/* Images repeated 3 times for seamless looping */}
                {[...adImages, ...adImages, ...adImages].map((imgUrl, index) => (
                  <div key={index} className="flex-shrink-0 h-full w-[400px] border-r border-white/20 relative">
                    <img src={imgUrl} alt="Insurance Offer" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                      <span className="text-white font-bold tracking-wider uppercase text-sm opacity-90 shadow-sm">Featured Plan</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>

        {/* --- GRID LAYOUT: 4 Columns --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-4">

          {/* Card 1: My Policies */}
          <div
            onClick={() => onNavigate('my-policies')}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
          >
            <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">My Policies</h3>
            <p className="text-slate-500 text-sm leading-relaxed">View your active plans, download documents, and manage renewals easily.</p>
          </div>

          {/* Card 2: Find Insurance (CLICKABLE) */}
          <div
            onClick={() => onNavigate('find-insurance')}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
          >
            <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Find Insurance</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Compare quotes from top providers and get AI-powered recommendations.</p>
          </div>

          {/* Card 3: File a Claim */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
            <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">File a Claim</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Submit documents, track status, and get your claims settled faster.</p>
          </div>

          {/* Card 4: Calculators (CLICKABLE) */}
          <div
            onClick={() => onNavigate('calculators')}
            className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer"
          >
            <div className="h-12 w-12 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Calculators</h3>
            <p className="text-slate-500 text-sm leading-relaxed">Check BMI, Estimate Premiums, Plan Retirement & EMI.</p>
          </div>

        </div>

      </main>
    </div>
  );
};

export default Dashboard;