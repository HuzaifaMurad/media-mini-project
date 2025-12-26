// import React, { createContext, useContext, useEffect, useState } from "react";
// // import { fetchSwaMe } from "../api/auth";

// import { jwtMe, jwtLogin, clearToken } from "../api/jwtAuth";



import React, { createContext, useContext, useEffect, useState } from "react";
import { jwtMe, jwtLogin, clearToken } from "../api/jwtAuth";

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
      const res = await jwtMe();

      if (res?.isAuthenticated) {
        setMe({
          isAuthenticated: true,
          roles: res.roles || [],
          userId: res.userId || null,
          userDetails: res.email || null,
        });
      } else {
        setMe({
          isAuthenticated: false,
          roles: [],
          userId: null,
          userDetails: null,
        });
      }
    } catch (err) {
      setMe({
        isAuthenticated: false,
        roles: [],
        userId: null,
        userDetails: null,
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  async function login(email) {
    setLoading(true);
    try {
      await jwtLogin(email);
      await refresh();
    } finally {
      setLoading(false);
    }
  }

  function logout() {
    clearToken();
    setMe({
      isAuthenticated: false,
      roles: [],
      userId: null,
      userDetails: null,
    });
  }

  const value = {
    loading,
    me,
    login,
    logout,
    refresh,
    isAuthenticated: me.isAuthenticated,
    isCreator: me.roles.includes("Creator"),
  };

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  return useContext(AuthCtx);
}



// const AuthCtx = createContext(null);

// export function AuthProvider({ children }) {
//   const [loading, setLoading] = useState(true);
//   const [me, setMe] = useState({
//     isAuthenticated: false,
//     roles: [],
//     userId: null,
//     userDetails: null,
//   });

//   async function refresh() {
//     setLoading(true);
//     try {
//       const next = await fetchSwaMe();
//       setMe(next);
//     } catch {
//       // Local dev without SWA CLI: treat as guest
//       setMe({ isAuthenticated: false, roles: [], userId: null, userDetails: null });
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     refresh();
//   }, []);

//   const value = {
//     loading,
//     me,
//     refresh,
//     isCreator: me.roles?.includes("Creator"),
//   };

//   return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
// }

// export function useAuth() {
//   return useContext(AuthCtx);
// }
