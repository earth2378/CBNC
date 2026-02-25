"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { apiFetch } from "../../src/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      router.push("/me/profile");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap card">
      <div className="auth-brand">
        <div className="auth-brand-chip">BOT</div>
        <span className="auth-brand-name">BOT Name Card</span>
      </div>

      <h2 className="auth-title">Welcome back</h2>
      <p className="auth-subtitle">Sign in to manage your digital name card.</p>

      <form onSubmit={onSubmit}>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
          />
        </div>
        <div className="field">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
          />
        </div>
        <div style={{ marginBottom: 16, textAlign: "right" }}>
          <Link href="/reset-password" style={{ fontSize: "0.875rem" }}>Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} style={{ width: "100%", padding: "12px" }}>
          {loading ? "Signing in…" : "Sign In"}
        </button>
      </form>

      {error && <p className="error" style={{ marginTop: 12 }}>{error}</p>}

      <p className="auth-footer">
        New here?{" "}
        <Link href="/register">Create an account</Link>
      </p>
    </div>
  );
}
