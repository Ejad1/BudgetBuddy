import React from 'react';
import { Link } from 'react-router-dom';
import '../styles.css';

const Home = () => {
  return (
    <div className="home">
      <div className="home-content">
        <h1 className="home-title">Manage Your Budget Easily</h1>
        <p className="home-subtitle">Take control of your finances with just a few clicks.</p>
        <div className="home-buttons">
          <Link to="/login" className="home-button">Get Started</Link>
          <Link to="/register" className="home-button home-button--secondary">Sign Up</Link>
        </div>
      </div>

      <div className="home-features-container">
        <h2 className="home-features-title">Why Choose BudgetBuddy?</h2>
        <div className="home-features">
          <div className="home-feature">
            <div className="home-feature-icon icon-plan">📊</div>
            <h3 className="home-feature-title">Plan Your Budget</h3>
            <p className="home-feature-text">Effortlessly set up your monthly budget and track your spending categories.</p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon icon-save">💰</div>
            <h3 className="home-feature-title">Save Money</h3>
            <p className="home-feature-text">Identify saving opportunities and reach your financial goals faster.</p>
          </div>
          <div className="home-feature">
            <div className="home-feature-icon icon-master">🏆</div>
            <h3 className="home-feature-title">Master Your Finances</h3>
            <p className="home-feature-text">Gain insights into your spending habits and make informed financial decisions.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home; 