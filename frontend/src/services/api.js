import axios from "axios";

const API_BASE = import.meta.env.VITE_BFF_URL || "http://localhost:4000";

export const api = axios.create({
  baseURL: API_BASE,
  timeout: 8000,
  headers: { "Content-Type": "application/json" }
});

export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
};

// Inicializa el header de autorizacion desde localStorage al cargar el modulo,
// para que las primeras peticiones (ej. cargar pedidos) ya viajen autenticadas
// aunque el efecto del AuthProvider aun no se haya ejecutado.
const storedToken = localStorage.getItem("gb_token");
if (storedToken) {
  setAuthToken(storedToken);
}
