import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';
import ThemeToggleButton from './ThemeToggleButton';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { token, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={token ? "/dashboard" : "/"} className="navbar-brand">BudgetBuddy</Link>
        
        {token && (
          <div className="navbar-search-wrapper">
            <input type="search" placeholder="Rechercher..." className="navbar-search-input" />
            <button className="navbar-search-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="search-icon"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
            </button>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div className="navbar-links">
            {!token ? (
              <>
                <Link to="/login" className="navbar-link">Login</Link>
                <Link to="/register" className="navbar-link">Register</Link>
              </>
            ) : (
              <button onClick={logout} className="navbar-link" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>Logout</button>
            )}
          </div>
          <ThemeToggleButton />
        </div>

      </div>
    </nav>
  );
};

export default Navbar;