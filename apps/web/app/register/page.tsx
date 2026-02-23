"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { apiFetch } from "../../src/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    try {
      await apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      router.push("/me/profile");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Register failed");
    }
  }

  return (
    <div className="auth-wrap card">
      <h2 className="auth-title">Create Account</h2>
      <p className="auth-subtitle">Register employee credentials for name card management.</p>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" />
        </div>
        <div className="field">
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" />
        </div>
        <button type="submit" style={{ width: "100%" }}>Create account</button>
      </form>
      {error && <p className="error">{error}</p>}
    </div>
  );
}
