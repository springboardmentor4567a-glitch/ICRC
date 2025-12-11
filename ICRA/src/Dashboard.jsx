import React, { useState, useEffect } from 'react';

const Dashboard = ({ user, onLogout }) => {
    // State to control the visibility of the Welcome Banner
    const [showWelcome, setShowWelcome] = useState(true);

    // Timer: Hide the welcome message after 10 seconds
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowWelcome(false);
        }, 10000); // 10000 milliseconds = 10 seconds

        // Cleanup timer if user leaves/logs out before 10s
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* --- Navbar --- */}
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

            {/* --- Main Content --- */}
            <main className="max-w-6xl mx-auto p-8">

                {/* WELCOME SECTION 
           Logic: We toggle opacity and max-height to create a smooth slide-up effect.
        */}
                <div
                    className={`transition-all duration-1000 ease-in-out overflow-hidden
            ${showWelcome ? 'opacity-100 max-h-96 mb-8' : 'opacity-0 max-h-0 mb-0'}`}
                >
                    <div className="bg-gradient-to-r from-blue-600 to-slate-800 rounded-2xl p-10 text-white shadow-xl relative">
                        <div className="relative z-10">
                            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name}!</h1>
                            <p className="text-blue-100 text-lg">Your insurance portfolio is looking healthy today.</p>
                            {/* Optional countdown bar or visual indicator could go here */}
                        </div>
                        {/* Decorative circles */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16"></div>
                        <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-400 opacity-10 rounded-full -ml-10 -mb-10"></div>
                    </div>
                </div>

                {/* --- Dashboard Grid --- */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Card 1: My Policies */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                        <div className="h-12 w-12 bg-green-50 rounded-xl flex items-center justify-center text-green-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">My Policies</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">View your active plans, download documents, and manage renewals easily.</p>
                    </div>

                    {/* Card 2: Find Insurance */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                        <div className="h-12 w-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Find Insurance</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Compare quotes from top providers and get AI-powered recommendations.</p>
                    </div>

                    {/* Card 3: File a Claim */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer">
                        <div className="h-12 w-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600 mb-4">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        </div>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">File a Claim</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">Submit documents, track status, and get your claims settled faster.</p>
                    </div>
                </div>

            </main>
        </div>
    );
};

export default Dashboard;