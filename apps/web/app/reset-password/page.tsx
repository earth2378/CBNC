"use client";

import { FormEvent, useState } from "react";

import { apiFetch } from "../../src/lib/api";

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [renewPassword, setRenewPassword] = useState("");
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setOk("");

    try {
      await apiFetch<{ ok: boolean }>("/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({
          email,
          new_password: newPassword,
          re_new_password: renewPassword
        })
      });
      setOk("Password reset complete.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset failed");
    }
  }

  return (
    <div className="auth-wrap card">
      <h2 className="auth-title">Reset Password</h2>
      <p className="auth-subtitle">Prototype flow for password reset by email.</p>
      <form onSubmit={onSubmit}>
        <div className="field">
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
        </div>
        <div className="field">
          <label>New Password</label>
          <input value={newPassword} onChange={(e) => setNewPassword(e.target.value)} type="password" required />
        </div>
        <div className="field">
          <label>Re-enter New Password</label>
          <input value={renewPassword} onChange={(e) => setRenewPassword(e.target.value)} type="password" required />
        </div>
        <button type="submit" style={{ width: "100%" }}>Reset password</button>
      </form>
      {error && <p className="error">{error}</p>}
      {ok && <p className="ok">{ok}</p>}
    </div>
  );
}
