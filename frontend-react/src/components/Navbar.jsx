import React from "react";
import { useAuth } from "../state/AuthProvider";
import { login, logout } from "../api/auth";

export default function Navbar({ onNav }) {
  const { loading, me, isCreator, refresh } = useAuth();

  return (
    <div style={{ padding: 12, display: "flex", gap: 10, alignItems: "center", borderBottom: "1px solid #eee" }}>
      <b style={{ cursor: "pointer" }} onClick={() => onNav("feed")}>Media Mini</b>
      <div style={{ flex: 1 }} />

      {loading ? (
        <span>Checking session…</span>
      ) : (
        <>
          <span>{me.isAuthenticated ? "Signed in" : "Guest"}</span>
          <button onClick={refresh}>Refresh</button>

          {!me.isAuthenticated ? (
            <button onClick={login}>Login</button>
          ) : (
            <button onClick={logout}>Logout</button>
          )}

          {isCreator && <button onClick={() => onNav("upload")}>Upload</button>}
        </>
      )}
    </div>
  );
}
