import React, { createContext, useContext, useEffect, useState } from "react";
import { fetchSwaMe } from "../api/auth";

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState({
    isAuthenticated: false,
    roles: [],
    userId: null,
    userDetails: null,
  });

  async function refresh() {
    setLoading(true);
    try {
      const next = await fetchSwaMe();
      setMe(next);
    } catch {
      // Local dev without SWA CLI: treat as guest
      setMe({ isAuthenticated: false, roles: [], userId: null, userDetails: null });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  const value = {
    loading,
    me,
    refresh,
    isCreator: me.roles?.includes("Creator"),
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}
