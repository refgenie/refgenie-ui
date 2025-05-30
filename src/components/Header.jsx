import { Link } from 'react-router-dom';
import logo from '../assets/refgenie_logo.svg';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="logo-container">
        <img src={logo} alt="Refgenie Logo" className="logo" />
      </div>
      <nav className="nav">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>
            <Link to="/about">About</Link>
          </li>
          <li>
            <a href="https://refgenie.org" target="_blank" rel="noopener noreferrer">Docs</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;