import React, { useState } from 'react';
import './AuthPage.css';
import { loginUser, registerUser } from '../../api';

const AuthPage = () => {
  const [isRegister, setIsRegister] = useState(false);

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  const toggleView = () => setIsRegister(!isRegister);

  // --- HANDLE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser({ email: loginEmail, password: loginPassword });
      
      console.log("Login Response:", data); // Debug log

      if (data && data.access_token) {
        // SUCCESS
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) localStorage.setItem('refresh_token', data.refresh_token);
        
        // Save user info safely
        if (data.user) {
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }

        // Show success message
        if (window.showAppToast) {
          window.showAppToast(`Welcome back!`, 'success');
        } else {
          alert("Login Successful!");
        }

        // Reload to update the UI
        setTimeout(() => window.location.href = '/', 500);
      } else {
        // FAILURE
        const errorMsg = data.message || "Invalid Email or Password";
        if (window.showAppToast) window.showAppToast(errorMsg, 'error');
        else alert(errorMsg);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed. Check console for details.");
    }
  };

  // --- HANDLE REGISTER (FIXED) ---
  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Attempting to register:", regName, regEmail);

    try {
      const data = await registerUser({ name: regName, email: regEmail, password: regPassword });
      
      console.log("Register Response:", data); // Check this in your browser console!

      // CHECK: We accept 'Register successful' OR if the backend simply returns the user object
      if (data && (data.message === 'Register successful' || data.id || data.email)) {
        
        // SUCCESS
        const successMsg = 'Registration Successful! Please Login.';
        if (window.showAppToast) window.showAppToast(successMsg, 'success');
        else alert(successMsg); // Fallback if toast fails

        // Switch to Login View automatically
        setIsRegister(false); 
        
        // Clear form
        setRegName(''); 
        setRegEmail(''); 
        setRegPassword('');

      } else {
        // FAILURE (Backend returned an error message)
        const errorMsg = data.message || 'Registration Failed';
        if (window.showAppToast) window.showAppToast(errorMsg, 'error');
        else alert(errorMsg);
      }
    } catch (error) {
      // NETWORK/API ERROR
      console.error("Register Error:", error);
      alert("Registration failed. Server might be down or API is incorrect.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {!isRegister ? (
          /* LOGIN FORM */
          <>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={loginEmail} 
                  onChange={(e) => setLoginEmail(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  value={loginPassword} 
                  onChange={(e) => setLoginPassword(e.target.value)} 
                />
              </div>
              <button type="submit" className="btn">Log In</button>
            </form>
            <p className="link-text">New user? <span className="link" onClick={toggleView}>Register here</span></p>
          </>
        ) : (
          /* REGISTER FORM */
          <>
            <h1>Register</h1>
            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  required 
                  value={regName} 
                  onChange={(e) => setRegName(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  required 
                  value={regEmail} 
                  onChange={(e) => setRegEmail(e.target.value)} 
                />
              </div>
              <div className="input-group">
                <label>Password</label>
                <input 
                  type="password" 
                  required 
                  value={regPassword} 
                  onChange={(e) => setRegPassword(e.target.value)} 
                />
              </div>
              <button type="submit" className="btn">Create Account</button>
            </form>
            <p className="link-text">Already have an account? <span className="link" onClick={toggleView}>Login here</span></p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;