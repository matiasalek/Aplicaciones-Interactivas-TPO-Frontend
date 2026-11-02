import { createContext, useContext, useEffect, useState } from "react";
import { api, getToken, setToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(Boolean(getToken()));
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);

  function clear() {
    setToken(null);
    setUser(null);
  }
  async function verify() {
    setChecking(true);
    setError(null);
    try {
      const result = await api("/profile", { authenticated: true });
      setUser(result.data);
    } catch (failure) {
      if (failure.status === 401) clear();
      else setError(failure);
    } finally {
      setChecking(false);
    }
  }
  useEffect(() => {
    if (getToken()) verify();
    const handleExpired = () => {
      clear();
      setExpired(true);
    };
    window.addEventListener("session-expired", handleExpired);
    return () => window.removeEventListener("session-expired", handleExpired);
  }, []);

  async function authenticate(mode, values) {
    const result = await api(`/auth/${mode}`, { method: "POST", body: values });
    setToken(result.data.token);
    setUser(result.data.user);
    setExpired(false);
    setError(null);
  }
  async function logout() {
    try {
      await api("/auth/logout", { method: "POST", authenticated: true });
    } catch (failure) {
      if (failure.status !== 401) throw failure;
    }
    clear();
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        checking,
        error,
        expired,
        authenticate,
        logout,
        verify,
        setUser,
        clear,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
