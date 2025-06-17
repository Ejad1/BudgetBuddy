import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles.css'; // Import main styles
import { useAuth } from '../context/AuthContext'; // To potentially add logout
import { useLanguage } from '../context/LanguageContext'; // Importing language context

const Sidebar = ({ isOpen }) => {
  const { logout } = useAuth(); 
  const { t } = useLanguage(); // Get translation function

  // Use NavLink for active styling
  const linkClass = ({ isActive }) => 
    isActive ? 'sidebar-link active-link' : 'sidebar-link';

  return (
    <aside className={`sidebar ${!isOpen ? 'sidebar-collapsed' : ''}`}>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass} end> 
          <span className="sidebar-icon">🏠</span> {isOpen && t('dashboard')}
        </NavLink>
        <NavLink to="/profile" className={linkClass}>
          <span className="sidebar-icon">👤</span> {isOpen && t('profile')}
        </NavLink>
        <NavLink to="/reports" className={linkClass}>
          <span className="sidebar-icon">📊</span> {isOpen && t('reports')}
        </NavLink>
        <NavLink to="/budgets" className={linkClass}>
          <span className="sidebar-icon">💰</span> {isOpen && t('budgets')}
        </NavLink>
        <NavLink to="/categories" className={linkClass}>
          <span className="sidebar-icon">🏷️</span> {isOpen && t('categories')}
        </NavLink>
        <NavLink to="/settings" className={linkClass}>
          <span className="sidebar-icon">⚙️</span> {isOpen && t('settings')}
        </NavLink>
      </nav>
      <div className="sidebar-logout">
        <button onClick={logout} className="sidebar-logout-button">
          <span className="sidebar-icon">➔</span> {isOpen && t('logout')}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;