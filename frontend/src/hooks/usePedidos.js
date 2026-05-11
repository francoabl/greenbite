import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function usePedidos() {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPedidos = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/pedidos");
      setPedidos(response.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudieron cargar pedidos");
    } finally {
      setLoading(false);
    }
  }, []);

  const createPedido = useCallback(async (payload) => {
    setError(null);
    const response = await api.post("/api/pedidos", payload);
    await loadPedidos();
    return response.data;
  }, [loadPedidos]);

  useEffect(() => {
    loadPedidos();
  }, [loadPedidos]);

  return { pedidos, loading, error, loadPedidos, createPedido };
}
