import { useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const res = await response.json();

      // ✅ Persist login
      localStorage.setItem("token", res.token);
      localStorage.setItem("role", res.role);

      if (res.role === "admin") {
        navigate("/admin/claims");
      } else {
        navigate("/dashboard");
      }
    } catch (e) {
      alert("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-100 to-blue-200">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96">
        <h2 className="text-3xl font-bold text-center text-blue-600 mb-2">
          Welcome Back
        </h2>

        <input
          className="border w-full p-3 mb-4 rounded"
          placeholder="Email Address"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          className="border w-full p-3 mb-6 rounded"
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          onClick={handleLogin}
          className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-lg font-semibold"
        >
          Login
        </button>
      </div>
    </div>
  );
}
