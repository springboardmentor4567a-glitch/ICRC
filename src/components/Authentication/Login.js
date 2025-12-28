import React, { useState } from 'react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("Login Success!", data);
        
        // CRITICAL STEP 1: Check if token exists
        if (data.access_token) {
            // CRITICAL STEP 2: Store token in LocalStorage
            localStorage.setItem('token', data.access_token);
            alert("Token saved! Check Application tab -> Local Storage");
        } else {
            console.error("Token not found in response:", data);
        }
      } else {
        alert(data.msg || "Login failed");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  // ... render form inputs ...
};

export default Login;