import React from 'react';
// No need to import styles.css here if imported in Dashboard/App

const ExpenseList = ({ expenses, onEdit, onDelete }) => {
  // Placeholder list - iteration and display logic later

  if (!expenses || expenses.length === 0) {
    return (
      <div>
        <p className="text-gray-600 text-center py-4">No expenses logged yet.</p>
      </div>
    );
  }

  return (
    <div>
      <ul className="expense-list"> {/* Added class for potential specific list styling */}
        {expenses.map(expense => (
          <li key={expense._id}> {/* Use _id from MongoDB */}
            <div className="expense-info">
              <span>{expense.category}:</span> 
              <span className="amount">${expense.amount.toFixed(2)}</span>
              {/* Format date more nicely */}
              <p>{new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p> 
              {expense.note && <p><i>Note: {expense.note}</i></p>}
              {expense.receipt && 
                <p className="receipt-link">
                  <a href={expense.receipt} target="_blank" rel="noopener noreferrer">View Receipt</a>
                </p>
              }
            </div>
            <div className="expense-actions">
              {/* Call onEdit prop with the expense object */}
              <button onClick={() => onEdit(expense)} className="edit-button">Edit</button> 
              {/* Call onDelete prop with the expense ID */}
              <button onClick={() => onDelete(expense._id)} className="delete-button">Delete</button> 
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ExpenseList; 