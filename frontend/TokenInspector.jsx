import React, { useState } from "react";
import { AuthAPI, decodeJWT, getExpirySecondsLeft } from "./auth";

function looksLikeJWT(val) {
  if (typeof val !== "string") return false;
  return /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/.test(val);
}

export default function TokenInspector() {
  const [report] = useState(() => {
    const local = [];
    for (const k of Object.keys(localStorage)) {
      try {
        const v = localStorage.getItem(k);
        if (looksLikeJWT(v) || /token|jwt|access|refresh/i.test(k)) local.push({ key: k, value: v });
      } catch { /* ignore */ }
    }
    const session = [];
    for (const k of Object.keys(sessionStorage)) {
      try {
        const v = sessionStorage.getItem(k);
        if (looksLikeJWT(v) || /token|jwt|access|refresh/i.test(k)) session.push({ key: k, value: v });
      } catch {}
    }
    const cookies = [];
    document.cookie.split(";").forEach((c) => {
      const [rawKey, ...rest] = c.split("=");
      const key = rawKey.trim();
      const v = rest.join("=").trim();
      if (!key) return;
      if (looksLikeJWT(v) || /token|jwt|access|refresh/i.test(key)) cookies.push({ key, value: v });
    });
    const access = localStorage.getItem("access_token");
    const refreshCookie = document.cookie.split(";").map(c => c.trim()).find(c => c.startsWith("refresh_token="));
    const special = [];
    if (access) special.push({ key: "access_token", value: access, decoded: decodeJWT(access), expiresInSec: getExpirySecondsLeft(access) });
    if (refreshCookie) special.push({ key: "refresh_token_cookie", value: refreshCookie.split("=")[1] });
    return { local, session, cookies, special };
  });

  const handleRevoke = async () => {
    try {
      await AuthAPI.revoke();
      localStorage.removeItem("access_token");
      alert("Refresh token revoked and cookie cleared.");
      window.location.reload();
    } catch (e) {
      alert("Failed to revoke: " + e?.message);
    }
  };
  const handleClear = () => {
    localStorage.removeItem("access_token");
    sessionStorage.clear();
    alert("Tokens cleared (localStorage/sessionStorage).");
    setReport((r) => ({ ...r }));
  };

  return (
    <div className="page-wrap">
      <h2>Token Inspector</h2>
      <div style={{ marginBottom: 12 }}>
        <button onClick={handleRevoke}>Revoke refresh token (cookie)</button>
        <button onClick={handleClear} style={{ marginLeft: 8 }}>Clear access token & storage</button>
      </div>
      <p>Searches localStorage, sessionStorage and cookies for token-like keys or JWT patterns.</p>

      <section>
        <h3>Standard tokens</h3>
        {report.special && report.special.length
          ? report.special.map((r) => (
              <div key={r.key}>
                <strong>{r.key}</strong>: {r.value}
                {r.decoded && <pre style={{ whiteSpace: "pre-wrap" }}>{JSON.stringify(r.decoded, null, 2)}</pre>}
                {typeof r.expiresInSec === "number" && <div>Expires in: {r.expiresInSec}s</div>}
              </div>
            ))
          : <div>None found</div>}
      </section>

      <section>
        <h3>localStorage</h3>
        {report.local.length ? report.local.map(r => <div key={r.key}><strong>{r.key}</strong>: {r.value}</div>) : <div>None found</div>}
      </section>

      <section>
        <h3>sessionStorage</h3>
        {report.session.length ? report.session.map(r => <div key={r.key}><strong>{r.key}</strong>: {r.value}</div>) : <div>None found</div>}
      </section>

      <section>
        <h3>cookies</h3>
        {report.cookies.length ? report.cookies.map(r => <div key={r.key}><strong>{r.key}</strong>: {r.value}</div>) : <div>None found</div>}
      </section>
    </div>
  );
}