import Link from "next/link";

export default function HomePage() {
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>Frontend Workspace</h2>
      <p style={{ color: "#475467", marginTop: 0 }}>
        Next.js implementation connected to your backend APIs. Use the screens below to test real flows.
      </p>

      <div className="hero-grid">
        <Link className="hero-tile" href="/register">
          <h3>Register</h3>
          <p>Create employee account</p>
        </Link>
        <Link className="hero-tile" href="/login">
          <h3>Login</h3>
          <p>Start authenticated session</p>
        </Link>
        <Link className="hero-tile" href="/me/profile">
          <h3>My Profile</h3>
          <p>Edit multilingual profile data</p>
        </Link>
        <Link className="hero-tile" href="/admin/users">
          <h3>Admin Users</h3>
          <p>Activate or deactivate accounts</p>
        </Link>
      </div>

      <div className="card-soft" style={{ marginTop: 12 }}>
        Public page URL format: <code>/p/{"{publicId}"}</code>
      </div>
    </div>
  );
}
