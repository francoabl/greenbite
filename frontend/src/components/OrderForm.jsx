import { useState } from "react";
export default function OrderForm({ onCreate }) {
  const [userId, setUserId] = useState("");
  const [plan, setPlan] = useState("1");
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");
    try {
      await onCreate({ userId, plan: Number(plan) });
      setStatus("ready");
      setMessage("Pedido creado");
    } catch (err) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Error al crear pedido");
    }
  };

  return (
    <form className="form-grid" onSubmit={submit}>
      <label>
        Usuario ID
        <input
          className="input"
          value={userId}
          onChange={(event) => setUserId(event.target.value)}
          placeholder="UUID de usuario"
          required
        />
      </label>
      <label>
        Plan
        <select
          className="input"
          value={plan}
          onChange={(event) => setPlan(event.target.value)}
        >
          <option value="1">1 persona</option>
          <option value="2">2 personas</option>
          <option value="4">4 personas</option>
        </select>
      </label>
      <button className="btn primary" type="submit" disabled={status === "loading"}>
        Crear pedido
      </button>
      {message ? <div>{message}</div> : null}
    </form>
  );
}
