import { useState } from "react";
import { useAuth } from "../state/AuthProvider";

export default function Login() {
  const { login, loading, me } = useAuth();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    try {
      await login(email);
    } catch (err) {
      setError("Login failed");
    }
  }

  if (me.isAuthenticated) {
    return <div style={{ padding: 16 }}>Logged in as {me.userDetails}</div>;
  }

  return (
    <div style={{ padding: 16, maxWidth: 360 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input
          type="email"
          placeholder="email@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button disabled={loading} style={{ width: "100%" }}>
          {loading ? "Signing in…" : "Login"}
        </button>
        {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      </form>
    </div>
  );
}
