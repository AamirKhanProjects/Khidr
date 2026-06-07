"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        window.location.href = "/admin";
        return;
      }
      if (res.status === 429) setErr("Too many attempts. Try again later.");
      else setErr("Incorrect password.");
    } catch {
      setErr("Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="loginwrap">
      <div className="brand">Khidr.</div>
      <p className="muted" style={{ marginBottom: 24, fontSize: 14 }}>
        Operator sign-in.
      </p>
      <form onSubmit={submit}>
        <label className="label">Password</label>
        <input
          className="field"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          autoComplete="current-password"
        />
        <button className="btn btn-solid" style={{ width: "100%", marginTop: 16 }} disabled={busy || !password}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <div className="err">{err}</div>
      </form>
    </div>
  );
}
