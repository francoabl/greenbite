import { useCallback, useEffect, useState } from "react";
import { api } from "../services/api.js";

export default function usePedidos(userId) {
  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadPedidos = useCallback(async () => {
    if (!userId) {
      setPedidos([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.get("/api/pedidos", { params: { userId } });
      setPedidos(response.data.items || []);
    } catch (err) {
      setError(err.response?.data?.message || "No se pudieron cargar pedidos");
    } finally {
      setLoading(false);
    }
  }, [userId]);

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
