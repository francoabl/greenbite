import { useState } from "react";
import { useNavigate } from "react-router-dom";
import BrandHeader from "../components/BrandHeader.jsx";
import useAuth from "../hooks/useAuth.js";

export default function Login() {
  const { login, register, status, error } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ nombre: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const submit = async (event) => {
    event.preventDefault();
    setFormError("");
    setSuccess("");
    try {
      if (mode === "login") {
        await login(form.email, form.password);
        setSuccess("Login exitoso. Redirigiendo...");
      } else {
        await register(form);
        setSuccess("Registro exitoso. Redirigiendo...");
      }
      setTimeout(() => navigate("/pedidos"), 400);
    } catch (err) {
      setFormError(err.response?.data?.message || "No se pudo completar la operacion");
    }
  };

  const displayError = formError || error;

  return (
    <div className="page">
      <BrandHeader />
      <section className="container section">
        <div className="order-panel">
          <div>
            <div className="hero-kicker">Acceso</div>
            <h2>{mode === "login" ? "Bienvenido de vuelta" : "Crea tu cuenta"}</h2>
            <p>
              El BFF centraliza autenticacion y pedidos con microservicios separados.
            </p>
            <button
              className="btn"
              type="button"
              onClick={() => setMode(mode === "login" ? "register" : "login")}
            >
              Cambiar a {mode === "login" ? "registro" : "login"}
            </button>
          </div>
          <form className="form-grid" onSubmit={submit}>
            {mode === "register" ? (
              <label>
                Nombre
                <input
                  className="input"
                  value={form.nombre}
                  onChange={(event) => setForm({ ...form, nombre: event.target.value })}
                  required
                />
              </label>
            ) : null}
            <label>
              Email
              <input
                className="input"
                type="email"
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
                required
              />
            </label>
            <label>
              Password
              <input
                className="input"
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                required
              />
            </label>
            <button className="btn primary" type="submit" disabled={status === "loading"}>
              {mode === "login" ? "Entrar" : "Registrarme"}
            </button>
            {success ? <div>{success}</div> : null}
            {displayError ? <div>{displayError}</div> : null}
          </form>
        </div>
      </section>
    </div>
  );
}
