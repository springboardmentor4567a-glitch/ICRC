import React, { useState, useEffect } from 'react';

const LoginPage = ({ onLoginSuccess }) => {
    // --- UI STATES (Visuals & Animations) ---
    const [showIntro, setShowIntro] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const [isSignUp, setIsSignUp] = useState(false); // Controls the sliding panel
    const [showForgot, setShowForgot] = useState(false); // Controls Forgot Password view
    const [resetSent, setResetSent] = useState(false); // Controls Reset Success view

    // --- FEEDBACK STATES (Errors & Loading) ---
    const [registerSuccess, setRegisterSuccess] = useState(false);
    const [backendError, setBackendError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    // --- FORM DATA STATES ---
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({ name: '', email: '', password: '', dob: '' });
    const [forgotEmail, setForgotEmail] = useState('');

    // 1. Intro Animation Logic
    useEffect(() => {
        const timer1 = setTimeout(() => setFadeOut(true), 2000);
        const timer2 = setTimeout(() => setShowIntro(false), 3500);
        return () => { clearTimeout(timer1); clearTimeout(timer2); };
    }, []);

    // 2. Forgot Password Auto-Redirect Logic
    useEffect(() => {
        let timeout;
        if (resetSent) {
            timeout = setTimeout(() => {
                handleBackToLogin();
            }, 3000);
        }
        return () => clearTimeout(timeout);
    }, [resetSent]);

    // --- INPUT HANDLERS ---
    const handleLoginChange = (e) => setLoginData({ ...loginData, [e.target.name]: e.target.value });
    const handleRegisterChange = (e) => setRegisterData({ ...registerData, [e.target.name]: e.target.value });

    // --- HELPER: Save Tokens to LocalStorage ---
    const saveAuthData = (data) => {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user_data', JSON.stringify(data.user));
    };

    // --- LOGIN SUBMIT (Real Backend Connection) ---
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setBackendError("");
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Login failed. Please check credentials.");
            }

            // SUCCESS: Save tokens and switch screen
            saveAuthData(data);
            onLoginSuccess(data.user);

        } catch (err) {
            console.error("Login Error:", err);
            setBackendError(err.message === "Load failed" ? "Cannot connect to server. Is Backend running?" : err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- REGISTER SUBMIT (Real Backend Connection) ---
    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        setBackendError("");
        setIsLoading(true);

        try {
            const response = await fetch('http://127.0.0.1:8000/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registerData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || "Registration failed");
            }

            // SUCCESS: Show success message first
            setRegisterSuccess(true);

            // Save tokens immediately so they are ready
            saveAuthData(data);

            // Wait 1.5s for user to read success message, then auto-login
            setTimeout(() => {
                onLoginSuccess(data.user);
            }, 1500);

        } catch (err) {
            console.error("Register Error:", err);
            setBackendError(err.message === "Load failed" ? "Cannot connect to server. Is Backend running?" : err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotSubmit = (e) => {
        e.preventDefault();
        setResetSent(true);
    };

    const handleBackToLogin = () => {
        setShowForgot(false);
        setResetSent(false);
        setForgotEmail('');
    };

    return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center relative overflow-hidden font-sans">

            {/* --- 1. INTRO ANIMATION LAYER --- */}
            {showIntro && (
                <div className={`fixed inset-0 z-50 flex items-center justify-center bg-slate-900 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                    <div className="text-center px-4">
                        <div className="animate-bounce mb-6 inline-block p-4 bg-blue-600 rounded-full shadow-lg shadow-blue-500/50">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                            </svg>
                        </div>
                        <h1 className="text-6xl font-bold text-white tracking-wider animate-pulse mb-4">ICRA</h1>
                        <p className="text-slate-400 text-sm tracking-[0.2em] uppercase font-medium">Insurance Comparison, Recommendation & Claim Assistant</p>
                    </div>
                </div>
            )}

            {/* --- 2. MAIN CARD CONTAINER --- */}
            {/* FIX: Added 'invisible' when showIntro is true to stop password managers from popping up over the intro */}
            <div className={`relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] overflow-hidden transition-all duration-1000 
            ${showIntro ? 'opacity-0 invisible' : 'opacity-100 visible'}`}>

                {/* --- REGISTER FORM (Left Side / Hidden initially) --- */}
                <div className={`absolute top-0 h-full w-1/2 transition-all duration-700 ease-in-out flex flex-col justify-center items-center p-10 bg-white
            ${isSignUp ? 'left-1/2 opacity-100 z-20' : 'left-0 opacity-0 z-10'}`}>

                    <form onSubmit={handleRegisterSubmit} className="w-full text-center">
                        <h2 className="text-3xl font-bold text-slate-800 mb-6">Create Account</h2>

                        <div className="space-y-4 text-left">
                            <input
                                name="name" type="text" placeholder="Full Name" required
                                value={registerData.name} onChange={handleRegisterChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <input
                                name="email" type="email" placeholder="Email Address" required
                                value={registerData.email} onChange={handleRegisterChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                            <input
                                name="password" type="password" placeholder="Password" required
                                value={registerData.password} onChange={handleRegisterChange}
                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />

                            <div>
                                <label className="block text-xs font-semibold text-slate-500 mb-1 ml-1">Date of Birth</label>
                                <input
                                    name="dob" type="date" required
                                    value={registerData.dob} onChange={handleRegisterChange}
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-500 transition-all"
                                />
                            </div>
                        </div>

                        {/* ERROR / SUCCESS MESSAGES */}
                        {backendError && (
                            <div className="mt-4 p-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg">
                                {backendError}
                            </div>
                        )}

                        {registerSuccess && (
                            <div className="mt-4 p-2 bg-green-100 text-green-700 text-sm font-semibold rounded-lg animate-pulse">
                                Registered Successfully! Entering Dashboard...
                            </div>
                        )}

                        <button disabled={isLoading} className="mt-6 w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wider hover:bg-blue-700 shadow-lg hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                            {isLoading ? "Processing..." : "Sign Up"}
                        </button>
                    </form>
                </div>

                {/* --- LOGIN FORM (Right Side / Visible initially) --- */}
                <div className={`absolute top-0 left-0 h-full w-1/2 transition-all duration-700 ease-in-out flex flex-col justify-center items-center p-10 bg-white z-20
            ${isSignUp ? '-translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}>

                    {!showForgot ? (
                        // NORMAL LOGIN VIEW
                        <form onSubmit={handleLoginSubmit} className="w-full text-center">
                            <div className="mb-6 flex justify-center">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </div>
                            </div>
                            <h2 className="text-3xl font-bold text-slate-800 mb-2">Welcome to ICRA</h2>
                            <p className="text-slate-400 mb-8 text-sm">Secure access to your insurance dashboard</p>

                            <div className="space-y-4 text-left">
                                <input
                                    name="email" type="email" placeholder="Email" required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    onChange={handleLoginChange}
                                />
                                <input
                                    name="password" type="password" placeholder="Password" required
                                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    onChange={handleLoginChange}
                                />
                            </div>

                            <div className="flex justify-end mt-2 mb-6">
                                <button type="button" onClick={() => setShowForgot(true)} className="text-xs font-semibold text-blue-600 hover:text-blue-800 focus:outline-none">
                                    Forgot Password?
                                </button>
                            </div>

                            {/* LOGIN ERRORS */}
                            {backendError && (
                                <div className="mb-4 p-2 bg-red-100 text-red-700 text-sm font-semibold rounded-lg">
                                    {backendError}
                                </div>
                            )}

                            <button disabled={isLoading} className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wider hover:bg-blue-700 shadow-lg hover:shadow-blue-500/40 transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed">
                                {isLoading ? "Signing In..." : "Sign In"}
                            </button>
                        </form>
                    ) : (
                        // FORGOT PASSWORD VIEW
                        <div className="w-full text-center">
                            {!resetSent ? (
                                <form onSubmit={handleForgotSubmit}>
                                    <h2 className="text-2xl font-bold text-slate-800 mb-4">Reset Password</h2>
                                    <p className="text-slate-500 mb-6 text-sm">Enter your email to receive a reset link.</p>
                                    <input
                                        type="email" placeholder="Enter your email" required
                                        value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)}
                                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-6"
                                    />
                                    <button className="w-full bg-blue-600 text-white font-bold py-3 px-4 rounded-lg uppercase tracking-wider hover:bg-blue-700 shadow-lg transition-all">
                                        Send Link
                                    </button>
                                    <button type="button" onClick={() => setShowForgot(false)} className="mt-4 text-sm text-slate-500 hover:text-slate-800">
                                        Cancel
                                    </button>
                                </form>
                            ) : (
                                <div className="animate-fade-in-up">
                                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">Check your mail</h3>
                                    <p className="text-slate-500 text-sm mb-6">If you are already a user password reset link is sent to your mail.</p>
                                    <p className="text-xs text-blue-500 animate-pulse">Redirecting to login...</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* --- SLIDING OVERLAY (The Moving Rectangle) --- */}
                <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 rounded-l-[100px] rounded-r-none
             ${isSignUp ? '-translate-x-full rounded-l-none rounded-r-[100px]' : ''}`}>

                    <div className={`bg-gradient-to-br from-blue-700 to-slate-900 text-white relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out flex items-center justify-center
               ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`}>

                        {/* Left Panel (Visible during Register -> Prompts Login) */}
                        <div className="w-1/2 h-full flex flex-col items-center justify-center px-10 text-center transform transition-transform duration-700 ease-in-out">
                            <h2 className="text-3xl font-bold mb-4">Let's Get Started!</h2>
                            <p className="mb-8 text-blue-100">Create your account to unlock the best insurance recommendations.</p>
                            <button
                                onClick={() => setIsSignUp(false)}
                                className="bg-transparent border-2 border-white text-white font-bold py-2 px-10 rounded-full hover:bg-white hover:text-blue-900 transition-all"
                            >
                                Sign In
                            </button>
                        </div>

                        {/* Right Panel (Visible during Login -> Prompts Register) */}
                        <div className="w-1/2 h-full flex flex-col items-center justify-center px-10 text-center transform transition-transform duration-700 ease-in-out">
                            <h2 className="text-3xl font-bold mb-4">New to ICRA?</h2>
                            <p className="mb-8 text-blue-100">Find your perfect coverage in minutes</p>
                            <button
                                onClick={() => setIsSignUp(true)}
                                className="bg-transparent border-2 border-white text-white font-bold py-2 px-10 rounded-full hover:bg-white hover:text-blue-900 transition-all"
                            >
                                Register
                            </button>
                        </div>

                    </div>
                </div>

            </div>
        </div>
    );
};

export default LoginPage;