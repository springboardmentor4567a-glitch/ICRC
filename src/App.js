import React, { useState, useEffect } from 'react';

const styles = {
    // Page wrappers
    authPage: {
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#f4f7f9',
        padding: '20px',
        fontFamily: 'Inter, Arial, sans-serif'
    },
    dashboardPage: {
        minHeight: '100vh',
        backgroundColor: '#ffffff',           
        padding: '16px 32px 40px',
        fontFamily: 'Inter, Arial, sans-serif'
    },

    
    authCard: {
        padding: '32px',
        maxWidth: '420px',
        width: '100%',
        margin: '40px auto',
        backgroundColor: 'white',
        borderRadius: '12px',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        boxShadow: '0 10px 30px rgba(15, 23, 42, 0.12)'
    },

    title: {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: '#333',
        textAlign: 'center'
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px'
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #ddd',
        borderRadius: '6px',
        boxSizing: 'border-box',
        transition: 'border-color 0.2s, box-shadow 0.2s'
    },
    inputFocus: {
        borderColor: '#007bff',
        boxShadow: '0 0 0 3px rgba(0, 123, 255, 0.25)'
    },
    button: {
        width: '100%',
        padding: '12px',
        color: 'white',
        borderRadius: '6px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: '600',
        transition: 'background-color 0.2s, transform 0.1s',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)'
    },
    primaryButton: {
        backgroundColor: '#007bff',
    },
    primaryButtonHover: {
        backgroundColor: '#0056b3',
        transform: 'translateY(-1px)'
    },
    logoutButton: {
        backgroundColor: '#dc3545',
    },
    logoutButtonHover: {
        backgroundColor: '#c82333',
        transform: 'translateY(-1px)'
    },
    message: {
        textAlign: 'center',
        fontSize: '0.875rem'
    },
    successMessage: {
        color: '#28a745'
    },
    errorMessage: {
        color: '#dc3545'
    },
    link: {
        color: '#007bff',
        cursor: 'pointer',
        textDecoration: 'none',
        fontWeight: '600',
    },

    // ===== Insurance dashboard styles =====
    headerBar: {
        maxWidth: '1200px',
        margin: '0 auto',
        paddingBottom: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid #e5e7eb'
    },
    appBrand: {
        display: 'flex',
        flexDirection: 'column'
    },
    appTitleSmall: {
        fontSize: '0.9rem',
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: '#6b7280',
        fontWeight: 600
    },
    appTitleMain: {
        fontSize: '1.8rem',
        fontWeight: 800,
        color: '#111827',
    },
    userProfileChip: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '8px 16px',
        borderRadius: '999px',
        backgroundColor: '#f1f5f9',
        borderRadius: '999px',
        backgroundColor: '#f1f5f9',
        border: '1px solid #e2e8f0',   // ✅ FIXED LINE
        boxShadow: '0 4px 10px rgba(15, 23, 42, 0.08)'
    },
    avatarCircle: {
        width: '34px',
        height: '34px',
        borderRadius: '50%',
        backgroundColor: '#007bff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontWeight: 700,
        fontSize: '0.9rem'
    },
    userTextBlock: {
        display: 'flex',
        flexDirection: 'column',
        lineHeight: 1.1
    },
    userNameText: {
        fontSize: '0.9rem',
        fontWeight: 600,
        color: '#111827'
    },
    userStatusText: {
        fontSize: '0.75rem',
        color: '#6b7280'
    },

    // Main dashboard content – now just a normal section, not a big card
    dashboardContent: {
        maxWidth: '1200px',
        margin: '18px auto 0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px'
    },
    homeMainTitle: {
        fontSize: '2.2rem',
        fontWeight: 800,
        color: '#0f172a',
        marginBottom: '6px'
    },
    homeSubtitle: {
        fontSize: '0.98rem',
        color: '#6b7280',
        marginBottom: '18px'
    },
    homeHighlight: {
        fontWeight: 800,
        color: '#2563eb'
    },
    statsRow: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '10px',
        marginBottom: '10px'
    },
    statPill: {
        padding: '6px 10px',
        borderRadius: '999px',
        backgroundColor: '#eff6ff',
        fontSize: '0.78rem',
        color: '#1d4ed8',
        fontWeight: 600
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '16px',
        marginTop: '10px'
    },
    optionCard: {
        padding: '16px 18px',
        borderRadius: '14px',
        border: '1px solid #e5e7eb',
        backgroundColor: '#f9fafb',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '10px',
        boxShadow: '0 3px 8px rgba(15, 23, 42, 0.04)'
    },
    optionTitle: {
        fontSize: '1rem',
        fontWeight: 700,
        color: '#111827'
    },
    optionText: {
        fontSize: '0.88rem',
        color: '#6b7280'
    },
    miniButton: {
        marginTop: '6px',
        padding: '7px 12px',
        fontSize: '0.8rem',
        alignSelf: 'flex-start'
    },
    logoutBar: {
        maxWidth: '1200px',
        margin: '22px auto 0 auto',
        textAlign: 'right'
    }
};

const App = () => {
    const [view, setView] = useState('register');
    const [currentUser, setCurrentUser] = useState(null);

    const InteractiveButton = ({ onClick, style, children, hoverStyle, type = 'button' }) => {
        const [isHovered, setIsHovered] = useState(false);
        const finalStyle = { ...styles.button, ...style, ...(isHovered ? hoverStyle : {}) };

        return (
            <button
                type={type}
                onClick={onClick}
                style={finalStyle}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {children}
            </button>
        );
    };

    const saveTokens = (accessToken, refreshToken) => {
        if (accessToken) {
            localStorage.setItem('accessToken', accessToken);
        }
        if (refreshToken) {
            localStorage.setItem('refreshToken', refreshToken);
        }
    };

    /** Registration Form */
    const RegistrationForm = () => {
        const [name, setName] = useState('');
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [message, setMessage] = useState('');
        const [focusedInput, setFocusedInput] = useState(null);

        const handleRegister = async (e) => {
            e.preventDefault();
            setMessage('');

            if (!name || !email || !password) {
                setMessage('Please fill in all fields.');
                return;
            }

            try {
                const response = await fetch('http://localhost:5000/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, password })
                });

                const data = await response.json();

                if (!response.ok) {
                    setMessage(data.message || 'Registration failed.');
                    return;
                }

                setMessage('Registration successful! Redirecting to login...');

                setTimeout(() => {
                    setView('login');
                }, 1500);
            } catch (error) {
                console.error('Error during registration:', error);
                setMessage('Network error. Please try again.');
            }
        };

        const getInputStyle = (field) => ({
            ...styles.input,
            ...(focusedInput === field ? styles.inputFocus : {})
        });

        return (
            <div style={styles.authCard}>
                <h2 style={styles.title}>Create Account</h2>
                <form onSubmit={handleRegister} style={styles.form}>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        onFocus={() => setFocusedInput('name')}
                        onBlur={() => setFocusedInput(null)}
                        style={getInputStyle('name')}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        style={getInputStyle('email')}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        style={getInputStyle('password')}
                    />
                    <InteractiveButton
                        type="submit"
                        style={styles.primaryButton}
                        hoverStyle={styles.primaryButtonHover}
                    >
                        Register
                    </InteractiveButton>
                </form>
                {message && (
                    <p
                        style={{
                            ...styles.message,
                            ...(message.includes('successful')
                                ? styles.successMessage
                                : styles.errorMessage)
                        }}
                    >
                        {message}
                    </p>
                )}
                <p style={styles.message}>
                    Already have an account?{' '}
                    <a href="#" onClick={() => setView('login')} style={styles.link}>
                        Log in here
                    </a>
                </p>
            </div>
        );
    };

    /** Login Form */
    const LoginForm = () => {
        const [email, setEmail] = useState('');
        const [password, setPassword] = useState('');
        const [message, setMessage] = useState('');
        const [focusedInput, setFocusedInput] = useState(null);

        const handleLogin = async (e) => {
            e.preventDefault();
            setMessage('');

            try {
                const response = await fetch('http://localhost:5000/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                console.log('LOGIN RESPONSE:', data);

                if (!response.ok) {
                    setMessage(data.message || 'Login failed.');
                    return;
                }

                if (data.tokens) {
                    saveTokens(data.tokens.accessToken, data.tokens.refreshToken);
                }

                if (data.user && data.user.name) {
                    setCurrentUser(data.user.name);
                }

                setMessage('Login successful!');

                setTimeout(() => {
                    setView('success');
                }, 500);
            } catch (error) {
                console.error('Error during login:', error);
                setMessage('Network error. Please try again.');
            }
        };

        const getInputStyle = (field) => ({
            ...styles.input,
            ...(focusedInput === field ? styles.inputFocus : {})
        });

        return (
            <div style={styles.authCard}>
                <h2 style={styles.title}>Login</h2>
                <form onSubmit={handleLogin} style={styles.form}>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        onFocus={() => setFocusedInput('email')}
                        onBlur={() => setFocusedInput(null)}
                        style={getInputStyle('email')}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onFocus={() => setFocusedInput('password')}
                        onBlur={() => setFocusedInput(null)}
                        style={getInputStyle('password')}
                    />
                    <InteractiveButton
                        type="submit"
                        style={styles.primaryButton}
                        hoverStyle={styles.primaryButtonHover}
                    >
                        Login
                    </InteractiveButton>
                </form>
                {message && (
                    <p
                        style={{
                            ...styles.message,
                            ...(message.includes('successful')
                                ? styles.successMessage
                                : styles.errorMessage)
                        }}
                    >
                        {message}
                    </p>
                )}
                <p style={styles.message}>
                    Need an account?{' '}
                    <a href="#" onClick={() => setView('register')} style={styles.link}>
                        Register here
                    </a>
                </p>
            </div>
        );
    };

    /** Dashboard (Insurance Home Page) */
    const Dashboard = () => {
        const handleLogout = () => {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            setCurrentUser(null);
            setView('login');
        };

        const initial = currentUser ? currentUser.charAt(0).toUpperCase() : '?';

        // On dashboard load, automatically call /api/profile with Bearer token
        useEffect(() => {
            const callProfileWithAuth = async () => {
                let accessToken = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');

                if (!accessToken) {
                    console.warn('No access token found');
                    return;
                }

                const fetchProfile = async (tokenToUse) => {
                    const res = await fetch('http://localhost:5000/api/profile', {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${tokenToUse}`
                        }
                    });
                    return res;
                };

                try {
                    // 1st try with current access token
                    let res = await fetchProfile(accessToken);

                    // If access token expired / invalid → try refresh
                    if (res.status === 403 && refreshToken) {
                        console.log('Access token invalid, trying refresh token...');
                        const refreshRes = await fetch('http://localhost:5000/api/refresh-token', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ refreshToken })
                        });

                        const refreshData = await refreshRes.json();
                        console.log('REFRESH RESPONSE:', refreshData);

                        if (refreshRes.ok && refreshData.accessToken) {
                            accessToken = refreshData.accessToken;
                            localStorage.setItem('accessToken', accessToken);
                            res = await fetchProfile(accessToken);
                        }
                    }

                    const data = await res.json();
                    console.log('PROFILE DATA:', data);
                } catch (err) {
                    console.error('Error calling profile:', err);
                }
            };

            callProfileWithAuth();
        }, []);

        const handleViewPolicies = () => {
            alert('Here you would show all available insurance policies.');
        };

        const handleCurrentPolicy = () => {
            alert('Here you would show details of the user’s current policy.');
        };

        const handleFileClaim = () => {
            alert('Here you would open a claim filing form.');
        };

        const handleSupport = () => {
            alert('Here you would show customer support options.');
        };

        return (
            <>
                {/* Header bar */}
                <div style={styles.headerBar}>
                    <div style={styles.appBrand}>
                        <span style={styles.appTitleSmall}>SECURELIFE INSURANCE</span>
                        <span style={styles.appTitleMain}>Customer Dashboard</span>
                    </div>

                    <div style={styles.userProfileChip}>
                        <div style={styles.avatarCircle}>{initial}</div>
                        <div style={styles.userTextBlock}>
                            <span style={styles.userNameText}>{currentUser}</span>
                            <span style={styles.userStatusText}>Logged in • Policy Holder</span>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div style={styles.dashboardContent}>
                    <div>
                        <h1 style={styles.homeMainTitle}>
                            Your <span style={styles.homeHighlight}>Insurance Policies</span> in one place
                        </h1>
                        <p style={styles.homeSubtitle}>
                            View your active coverage, manage your policies, and quickly file claims from your
                            personal insurance dashboard.
                        </p>
                        <div style={styles.statsRow}>
                            <span style={styles.statPill}>Active Policy: Life Insurance</span>
                            <span style={styles.statPill}>Next Premium Due: 15 March 2025</span>
                            <span style={styles.statPill}>Claims Filed: 0</span>
                        </div>
                    </div>

                    <div style={styles.optionsGrid}>
                        <div style={styles.optionCard}>
                            <div>
                                <h3 style={styles.optionTitle}>View Insurance Policies</h3>
                                <p style={styles.optionText}>
                                    See all life, health, motor, and home policies linked to your account.
                                </p>
                            </div>
                            <InteractiveButton
                                onClick={handleViewPolicies}
                                style={{ ...styles.primaryButton, ...styles.miniButton }}
                                hoverStyle={styles.primaryButtonHover}
                            >
                                View Policies
                            </InteractiveButton>
                        </div>

                        <div style={styles.optionCard}>
                            <div>
                                <h3 style={styles.optionTitle}>Current Policy</h3>
                                <p style={styles.optionText}>
                                    Quickly review your active policy number, premium, and next due date.
                                </p>
                            </div>
                            <InteractiveButton
                                onClick={handleCurrentPolicy}
                                style={{ ...styles.primaryButton, ...styles.miniButton }}
                                hoverStyle={styles.primaryButtonHover}
                            >
                                View Current
                            </InteractiveButton>
                        </div>

                        <div style={styles.optionCard}>
                            <div>
                                <h3 style={styles.optionTitle}>File a Claim</h3>
                                <p style={styles.optionText}>
                                    Start a new claim request for accidents, medical events, or damages.
                                </p>
                            </div>
                            <InteractiveButton
                                onClick={handleFileClaim}
                                style={{ ...styles.primaryButton, ...styles.miniButton }}
                                hoverStyle={styles.primaryButtonHover}
                            >
                                File Claim
                            </InteractiveButton>
                        </div>

                        <div style={styles.optionCard}>
                            <div>
                                <h3 style={styles.optionTitle}>Help & Support</h3>
                                <p style={styles.optionText}>
                                    Contact our support team or check FAQs about your insurance policies.
                                </p>
                            </div>
                            <InteractiveButton
                                onClick={handleSupport}
                                style={{ ...styles.primaryButton, ...styles.miniButton }}
                                hoverStyle={styles.primaryButtonHover}
                            >
                                Get Support
                            </InteractiveButton>
                        </div>
                    </div>
                </div>

                {/* Logout bar */}
                <div style={styles.logoutBar}>
                    <InteractiveButton
                        onClick={handleLogout}
                        style={styles.logoutButton}
                        hoverStyle={styles.logoutButtonHover}
                    >
                        Logout
                    </InteractiveButton>
                </div>
            </>
        );
    };

    // View switch
    let CurrentComponent;
    switch (view) {
        case 'login':
            CurrentComponent = <LoginForm />;
            break;
        case 'success':
            CurrentComponent = <Dashboard />;
            break;
        case 'register':
        default:
            CurrentComponent = <RegistrationForm />;
    }

    const pageStyle = view === 'success' ? styles.dashboardPage : styles.authPage;

    return (
        <div style={pageStyle}>
            {CurrentComponent}
        </div>
    );
};

export default App;





