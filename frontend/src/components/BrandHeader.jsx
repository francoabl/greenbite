import { Link } from "react-router-dom";

export default function BrandHeader() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="brand">
          GreenBite
        </Link>
        <nav className="nav">
          <a href="#planes">Planes</a>
          <a href="#proceso">Proceso</a>
          <a href="#ecosistema">Ecosistema</a>
        </nav>
        <Link className="btn" to="/login">
          Acceso
        </Link>
      </div>
    </header>
  );
}
