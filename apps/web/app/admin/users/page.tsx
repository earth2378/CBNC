"use client";

import { useEffect, useMemo, useState } from "react";

import { apiFetch } from "../../../src/lib/api";

type UserSummary = {
  id: string;
  email: string;
  role: "employee" | "admin";
  is_active: boolean;
  created_at: string;
};

type MeProfileResponse = {
  user: { id: string };
};

type ResetPasswordResult = {
  email: string;
  temp_password: string;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [error, setError] = useState("");
  const [resetResult, setResetResult] = useState<ResetPasswordResult | null>(null);
  const [resettingId, setResettingId] = useState<string | null>(null);

  async function load() {
    setError("");
    try {
      const data = await apiFetch<{ items: UserSummary[] }>("/admin/users");
      setUsers(data.items);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load users");
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    apiFetch<MeProfileResponse>("/me/profile")
      .then((data) => setCurrentUserId(data.user.id))
      .catch(() => {
        // Keep admin list usable even if current-user lookup fails.
        setCurrentUserId("");
      });
  }, []);

  const stats = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.is_active).length,
      inactive: users.filter((u) => !u.is_active).length
    };
  }, [users]);

  async function handleResetPassword(user: UserSummary) {
    setResettingId(user.id);
    setError("");
    try {
      const result = await apiFetch<{ temp_password: string }>(`/admin/users/${user.id}/reset-password`, {
        method: "POST"
      });
      setResetResult({ email: user.email, temp_password: result.temp_password });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Reset password failed");
    } finally {
      setResettingId(null);
    }
  }

  return (
    <div className="card">
      {resetResult && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000
          }}
        >
          <div className="card" style={{ maxWidth: 420, width: "100%", margin: 0 }}>
            <h3 style={{ marginTop: 0 }}>Password Reset</h3>
            <p>
              Temporary password for <strong>{resetResult.email}</strong>:
            </p>
            <div
              className="card-soft"
              style={{ fontFamily: "monospace", fontSize: 18, padding: "12px 16px", letterSpacing: 2 }}
            >
              {resetResult.temp_password}
            </div>
            <p style={{ color: "#475467", fontSize: 13 }}>
              Share this password with the user. They should change it after logging in.
            </p>
            <button className="secondary" onClick={() => setResetResult(null)}>
              Close
            </button>
          </div>
        </div>
      )}
      <div className="row" style={{ justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h2 style={{ margin: 0 }}>Admin Users</h2>
          <p style={{ color: "#475467", margin: "6px 0 0" }}>Activate or deactivate accounts for platform access.</p>
        </div>
        <button className="secondary" onClick={load}>Refresh</button>
      </div>

      <div className="row" style={{ margin: "12px 0" }}>
        <span className="pill">Total: {stats.total}</span>
        <span className="pill">Active: {stats.active}</span>
        <span className="pill">Inactive: {stats.inactive}</span>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="card-soft" style={{ overflowX: "auto" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Created</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => {
              const isCurrentUser = user.id === currentUserId;
              const isSelfDeactivateAction = isCurrentUser && user.is_active;

              return (
              <tr key={user.id}>
                <td>{user.email}</td>
                <td>
                  <span className={`badge ${user.role}`}>{user.role}</span>
                </td>
                <td>
                  <span className={`badge ${user.is_active ? "active" : "inactive"}`}>
                    {user.is_active ? "active" : "inactive"}
                  </span>
                </td>
                <td>{new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className={isSelfDeactivateAction ? "secondary" : user.is_active ? "danger" : "secondary"}
                      disabled={isSelfDeactivateAction}
                      title={isSelfDeactivateAction ? "You cannot deactivate your own account" : undefined}
                      onClick={async () => {
                        try {
                          await apiFetch(`/admin/users/${user.id}`, {
                            method: "PATCH",
                            body: JSON.stringify({ is_active: !user.is_active })
                          });
                          await load();
                        } catch (e) {
                          setError(e instanceof Error ? e.message : "Update failed");
                        }
                      }}
                    >
                      {isSelfDeactivateAction ? "Current Account" : user.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      className="secondary"
                      disabled={resettingId === user.id}
                      onClick={() => handleResetPassword(user)}
                    >
                      {resettingId === user.id ? "Resetting…" : "Reset Password"}
                    </button>
                  </div>
                </td>
              </tr>
            )})}
          </tbody>
        </table>
      </div>
    </div>
  );
}
