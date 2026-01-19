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

  const toggleView = () => {
    setIsRegister(prev => !prev);
  };

  // --- HANDLE LOGIN ---
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const data = await loginUser({
        email: loginEmail,
        password: loginPassword
      });

      console.log("Login Response:", data);

      if (data && data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        if (data.refresh_token) {
          localStorage.setItem('refresh_token', data.refresh_token);
        }

        if (data.user) {
          sessionStorage.setItem('user', JSON.stringify(data.user));
        }

        if (window.showAppToast) {
          window.showAppToast(`Welcome back!`, 'success');
        } else {
          alert("Login Successful!");
        }

        setTimeout(() => {
          window.location.href = '/';
        }, 500);
      } else {
        const errorMsg = data.message || "Invalid Email or Password";
        if (window.showAppToast) window.showAppToast(errorMsg, 'error');
        else alert(errorMsg);
      }
    } catch (error) {
      console.error("Login Error:", error);
      alert("Login failed. Check console for details.");
    }
  };

  // --- HANDLE REGISTER ---
  const handleRegister = async (e) => {
    e.preventDefault();
    console.log("Attempting to register:", regName, regEmail);

    try {
      const data = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword
      });

      console.log("Register Response:", data);

      if (data && (data.message === 'Register successful' || data.id || data.email)) {
        const successMsg = 'Registration Successful! Please Login.';
        if (window.showAppToast) window.showAppToast(successMsg, 'success');
        else alert(successMsg);

        setIsRegister(false);
        setRegName('');
        setRegEmail('');
        setRegPassword('');
      } else {
        const errorMsg = data.message || 'Registration Failed';
        if (window.showAppToast) window.showAppToast(errorMsg, 'error');
        else alert(errorMsg);
      }
    } catch (error) {
      console.error("Register Error:", error);
      alert("Registration failed.");
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        {!isRegister ? (
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
            <p className="link-text">
              Dont have an account? <span className="link" onClick={toggleView}>Register</span>
            </p>
          </>
        ) : (
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
                <label>Email ID</label>
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
            <p className="link-text">
              Already have an account? <span className="link" onClick={toggleView}>Login here</span>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
