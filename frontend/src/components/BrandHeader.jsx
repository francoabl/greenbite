import { Link, useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth.js";

export default function BrandHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          GreenBite
        </Link>
        <nav className="nav">
          <Link to="/#planes">Planes</Link>
          <Link to="/#proceso">Proceso</Link>
          <Link to="/#ecosistema">Ecosistema</Link>
        </nav>
        {user ? (
          <div className="header-user">
            <span className="header-user-name">{user.nombre}</span>
            <Link className="btn" to="/pedidos">
              Mis pedidos
            </Link>
            <button className="btn btn-outline" onClick={handleLogout}>
              Salir
            </button>
          </div>
        ) : (
          <Link className="btn" to="/login">
            Acceso
          </Link>
        )}
      </div>
    </header>
  );
}
