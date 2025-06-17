import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
// Sidebar is rendered by the layout in App.jsx, no need to import here
// import Sidebar from '../components/Sidebar'; 
import ExpenseForm from '../components/ExpenseForm';
import ExpenseList from '../components/ExpenseList';
import '../styles.css';
import { PlusCircle } from 'lucide-react'; // Using an icon for the add button

const Dashboard = () => {
  const { user } = useAuth(); 
  const [expenses, setExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);
  const [error, setError] = useState('');
  // State to control the visibility of the expense form for adding new expenses
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);

  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const response = await axios.get('/api/expenses');
        setExpenses(response.data);
        // If there are no expenses, automatically show the form to add one.
        if (response.data.length === 0) {
          setShowAddExpenseForm(true);
        }
      } catch (err) {
        console.error('Failed to fetch expenses', err);
        setError('Could not load expenses.');
      }
    };

    fetchExpenses();
  }, []);

  const handleSaveExpense = async (expenseData) => {
    try {
      let response;
      if (editingExpense) {
        response = await axios.put(`/api/expenses/${editingExpense._id}`, expenseData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setExpenses(expenses.map(exp => exp._id === editingExpense._id ? response.data : exp));
        setEditingExpense(null); 
      } else {
        response = await axios.post('/api/expenses', expenseData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        setExpenses([...expenses, response.data]);
      }
      setShowAddExpenseForm(false); // Hide form after saving
      // If it was the first expense, and now we have one, ensure the form isn't stuck open if fetch was slow
      if (expenses.length === 0 && response.data) { // Check if we just added the first one
         // No need to explicitly setShowAddExpenseForm(false) again, it's done above.
         // But if expenses become non-empty, the main conditional rendering will take over.
      }
    } catch (err) {
      console.error('Failed to save expense', err);
      setError('Could not save expense.');
    }
  };

  const handleDeleteExpense = async (id) => {
    try {
      await axios.delete(`/api/expenses/${id}`);
      const updatedExpenses = expenses.filter(exp => exp._id !== id);
      setExpenses(updatedExpenses);
      // If all expenses are deleted, show the add expense form
      if (updatedExpenses.length === 0) {
        setShowAddExpenseForm(true);
      }
    } catch (err) {
      console.error('Failed to delete expense', err);
      setError('Could not delete expense.');
    }
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowAddExpenseForm(true); // Show form when editing an expense
  };

  const handleCancelAddOrEdit = () => {
    setEditingExpense(null);
    // Only hide the form if there are existing expenses.
    // If no expenses, the form should remain visible.
    if (expenses.length > 0) {
      setShowAddExpenseForm(false);
    }
  };

  const openAddExpenseForm = () => {
    setEditingExpense(null); // Ensure we are not in edit mode
    setShowAddExpenseForm(true);
  };

  // Return only the content for the main area, layout is handled by DashboardLayout in App.jsx
  return (
    <main className="dashboard-content">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Dashboard</h1>
        {expenses.length > 0 && !showAddExpenseForm && (
          <button onClick={openAddExpenseForm} className="add-expense-btn">
            <PlusCircle size={20} style={{ marginRight: '8px' }} />
            Add Expense
          </button>
        )}
      </div>
      <p className="dashboard-welcome">
        Welcome{user ? `, ${user.username}` : ''}! Manage your expenses below.
      </p>

      {error && <p className="error-message">{error}</p>} 

      {/* Conditional rendering based on expenses and form visibility */}
      {editingExpense || showAddExpenseForm ? (
        <div className="dashboard-card form-card">
          <h2>{editingExpense ? 'Edit Expense' : (expenses.length === 0 ? 'Add Your First Expense' : 'Add New Expense')}</h2>
          {expenses.length === 0 && !editingExpense && (
            <p className="info-message">You haven't logged any expenses yet. Please add your first one to get started!</p>
          )}
          <ExpenseForm 
            onSave={handleSaveExpense} 
            expenseToEdit={editingExpense} 
            onCancelEdit={handleCancelAddOrEdit} // Use the new cancel handler
          />
        </div>
      ) : null}

      {/* Show Expense List only if there are expenses AND the form for adding/editing isn't the primary focus (unless it's editing) */} 
      {expenses.length > 0 && (!showAddExpenseForm || editingExpense) && (
         <div className={`dashboard-card list-card ${editingExpense || showAddExpenseForm ? 'list-card-alongside-form' : ''}`}>
          <h2>Expenses</h2>
          <ExpenseList 
            expenses={expenses} 
            onEdit={handleEditExpense} 
            onDelete={handleDeleteExpense} 
          />
        </div>
      )}

      {/* If no expenses and form is not shown (e.g. initial load error before fetch completes), show a loading or alternative message */}
      {expenses.length === 0 && !showAddExpenseForm && !error && (
          <div className="dashboard-card">
            <p>Loading expenses or no expenses to show. If you have no expenses, the form to add one should appear shortly.</p>
          </div>
      )}

    </main>
  );
};

export default Dashboard; 