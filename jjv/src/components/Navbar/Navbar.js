/* eslint-disable jsx-a11y/anchor-is-valid */
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <div className="navbar">
      <nav className="nav-buttons">
        <button className="button">
            <Link className="link" to="/">Logout</Link>
        </button>
        <button className="button">
            <Link className="link" to="/home">Home</Link>
        </button>
        <button className="button">
          <Link className="link"to="/cadastro/pessoa">Cadastrar Pessoa</Link>
        </button>
      </nav>
    </div>
  );
}
export default Navbar;