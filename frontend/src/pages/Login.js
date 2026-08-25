import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { formatApiError } from "../utils/formatApiError";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = useMemo(() => {
    if (!password) return { label: "Password strength", score: 0 };
    let score = 0;
    if (password.length >= 6) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/\d/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    const labels = ["Basic", "Fair", "Good", "Strong"];
    return { label: labels[Math.max(score - 1, 0)], score };
  }, [password]);

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) return setError(formatApiError(data.detail, "Invalid email or password"));

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("refresh_token", data.refresh_token);
      localStorage.setItem("role", data.role);

      setSuccess(true);
      const targetRoute = data.role === "admin" ? "/admin/dashboard" : "/dashboard";
      setTimeout(() => navigate(targetRoute), 350);
    } catch {
      setError("Server not reachable");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="auth-portal">
      <aside className="auth-info-panel">
        <div className="auth-shield-icon">
          <ShieldCheck size={34} />
        </div>
        <h1>
          Insurance Comparison,
          <br /> Recommendation &
          <br /> Claim Assistant
        </h1>
        <p>
          Compare insurance policies, receive recommendations, calculate
          premiums, and manage claims securely.
        </p>
        <div className="auth-info-note">Smart Insurance Management Platform</div>
      </aside>

      <div className="auth-card-panel">
        <form onSubmit={submit} className="auth-card-clean">
          <div className="auth-card-heading">
            <span className="auth-kicker">Secure access</span>
            <h2>Login</h2>
            <p>Sign in to continue to your insurance dashboard.</p>
          </div>

          {error && <div className="msg-error auth-alert">{error}</div>}
          {success && <div className="msg-success auth-alert">Login successful. Redirecting...</div>}

          <label className="auth-field">
            <span>Email Address</span>
            <div className="auth-input-wrap">
              <Mail size={18} />
              <input
                className="input-box"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </label>

          <label className="auth-field">
            <span>Password</span>
            <div className="auth-input-wrap">
              <LockKeyhole size={18} />
              <input
                className="input-box"
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            <div className={`password-strength score-${passwordStrength.score}`}>
              <span />
              <small>{passwordStrength.label}</small>
            </div>
          </label>

          <div className="form-actions">
            <button className="btn-purple auth-submit" disabled={loading}>
              {loading && <Loader2 className="auth-spinner" size={18} />}
              {loading ? "Signing in..." : "Login"}
            </button>
          </div>

          <p className="auth-switch-text">
            Don't have an account? <a href="/register">Register</a>
          </p>
        </form>
      </div>
    </section>
  );
}