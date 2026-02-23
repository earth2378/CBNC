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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      await apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      router.push("/me/profile");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Login failed");
    }
  }

  return (
    <div className="auth-wrap card">
      <h2 className="auth-title">Login</h2>
      <p className="auth-subtitle">Access your profile and manage localized card details.</p>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
        </div>
        <div className="field">
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" />
        </div>
        <div className="row" style={{ justifyContent: "space-between", marginBottom: 12 }}>
          <Link href="/reset-password">Forgot password?</Link>
        </div>
        <div className="row">
          <button type="submit">Login</button>
        </div>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
