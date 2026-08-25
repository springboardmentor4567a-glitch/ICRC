import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import { formatApiError } from "../utils/formatApiError";

export default function Register() {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
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
    setSuccess("");

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name, email, phone, password, confirm }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(formatApiError(data.detail, "Registration Failed"));
        return;
      }

      setSuccess("Registration Successful - Redirecting...");

      setTimeout(() => navigate("/login"), 1500);
    } catch {
      setError("Backend Server Not Reachable");
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
            <span className="auth-kicker">New user registration</span>
            <h2>Create Account</h2>
            <p>Enter your details to create a secure insurance profile.</p>
          </div>

          {error && <p className="msg-error auth-alert">{error}</p>}
          {success && (
            <p className="msg-success auth-alert">
              <CheckCircle2 size={18} /> {success}
            </p>
          )}

          <label className="auth-field">
            <span>Full Name</span>
            <div className="auth-input-wrap">
              <User size={18} />
              <input
                className="input-box"
                type="text"
                placeholder="Enter full name"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
          </label>

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
            <span>Phone</span>
            <div className="auth-input-wrap">
              <Phone size={18} />
              <input
                className="input-box"
                type="text"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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
                placeholder="Create password"
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

          <label className="auth-field">
            <span>Confirm Password</span>
            <div className="auth-input-wrap">
              <LockKeyhole size={18} />
              <input
                className="input-box"
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
              <button
                className="password-toggle"
                type="button"
                onClick={() => setShowConfirm((value) => !value)}
                aria-label={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          <div className="form-actions">
            <button className="btn-purple auth-submit" disabled={loading}>
              {loading && <Loader2 className="auth-spinner" size={18} />}
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </div>

          <p className="auth-switch-text">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </section>
  );
}