import { createContext, useEffect, useMemo, useState } from "react";
import { api, setAuthToken } from "../services/api.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("gb_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("gb_token"));
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState(null);

  useEffect(() => {
    setAuthToken(token);
    if (token) {
      localStorage.setItem("gb_token", token);
    } else {
      localStorage.removeItem("gb_token");
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem("gb_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("gb_user");
    }
  }, [user]);

  const login = async (email, password) => {
    setStatus("loading");
    setError(null);
    try {
      const response = await api.post("/api/usuarios/login", { email, password });
      setUser(response.data.user);
      setToken(response.data.token);
      setStatus("ready");
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || "Error de login";
      setError(message);
      setStatus("error");
      throw err;
    }
  };

  const register = async (payload) => {
    setStatus("loading");
    setError(null);
    try {
      const response = await api.post("/api/usuarios/register", payload);
      setUser(response.data.user);
      setToken(response.data.token);
      setStatus("ready");
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || "Error de registro";
      setError(message);
      setStatus("error");
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setStatus("idle");
    setError(null);
  };

  const value = useMemo(
    () => ({ user, token, status, error, login, register, logout }),
    [user, token, status, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
