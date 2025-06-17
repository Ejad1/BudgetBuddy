import React from 'react';
import '../styles.css';

const Budgets = () => {
  return (
    <>
      <h1 className="dashboard-title">Budgets</h1>
      <div className="page-content-centered budgets-page-container">
        <p className="budgets-intro-text">Create and manage your monthly or category-based budgets here.</p>
        
        <div className="create-budget-button-container">
           <button className="expense-form-button" disabled>+ Create Budget (Coming Soon)</button>
        </div>

        <div className="budget-list-placeholder">
            Budget List Area (Coming Soon)
        </div>
        
      </div>
    </>
  );
};

export default Budgets;