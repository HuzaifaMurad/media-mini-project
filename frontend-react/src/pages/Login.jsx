import { useState } from "react";
import { useAuth } from "../state/AuthProvider";
import { Link } from "react-router-dom";

export default function Login() {
  const { login, logout, loading, me, isCreator } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");

    const clean = email.trim().toLowerCase();
    if (!clean.includes("@")) return setError("Enter a valid email.");

    try {
      await login(clean);
    } catch (err) {
      setError("Login failed. Check backend settings (JWT_SECRET / CREATOR_EMAILS).");
    }
  }

  if (me.isAuthenticated) {
    return (
      <div className="stack">
        <h1 className="title">Account</h1>
        <div className="card cardPad stack">
          <div className="row">
            <span className="badge">
              <span className={`dot ${isCreator ? "primary" : ""}`} />
              {isCreator ? "Creator" : "Consumer"}
            </span>
            <span className="badge">
              <span className="dot ok" />
              Logged in
            </span>
          </div>

          <div className="help">
            Email: <b style={{ color: "var(--text)" }}>{me.userDetails}</b>
          </div>

          <div className="row">
            <button className="btn btnGhost" onClick={logout} disabled={loading}>
              Logout
            </button>
            <Link className="btn btnPrimary" to="/">
              Go to Feed
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack" style={{ maxWidth: 520 }}>
      <h1 className="title">Login</h1>
      <p className="subtitle">
        Enter your email. If your email exists in <code>CREATOR_EMAILS</code>, you become <b>Creator</b>. Otherwise you are <b>Consumer</b>.
      </p>

      <div className="card cardPad">
        <form onSubmit={submit} className="stack">
          <label className="label" htmlFor="email">
            Email
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          {error ? <div className="error">{error}</div> : null}

          <button className="btn btnPrimary" disabled={loading} type="submit">
            {loading ? "Signing in…" : "Login"}
          </button>

          <div className="help">
            After login, you can rate/comment. Creator accounts can upload.
          </div>
        </form>
      </div>
    </div>
  );
}
