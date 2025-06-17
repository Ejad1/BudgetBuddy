import React, { useState, useEffect } from 'react';
// No need to import styles.css here if imported in Dashboard/App

const ExpenseForm = ({ onSave, expenseToEdit, onCancelEdit }) => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    note: '',
    date: '',
  });
  const [receipt, setReceipt] = useState(null);
  const [fileName, setFileName] = useState('No file chosen');

  // Effect to populate form when editing
  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        amount: expenseToEdit.amount || '',
        category: expenseToEdit.category || '',
        note: expenseToEdit.note || '',
        // Format date for input type="date" (YYYY-MM-DD)
        date: expenseToEdit.date ? new Date(expenseToEdit.date).toISOString().split('T')[0] : '',
      });
      // Don't reset receipt file when editing, user must re-select if they want to change it
      setFileName(expenseToEdit.receipt ? expenseToEdit.receipt.split('/').pop() : 'No file chosen'); 
      setReceipt(null); // Clear any previously selected new file
    } else {
      // Reset form when not editing (or after saving)
      setFormData({ amount: '', category: '', note: '', date: '' });
      setReceipt(null);
      setFileName('No file chosen');
    }
  }, [expenseToEdit]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Use FormData to handle file uploads
    const data = new FormData();
    data.append('amount', formData.amount);
    data.append('category', formData.category);
    data.append('date', formData.date);
    data.append('note', formData.note);
    if (receipt) {
      data.append('receipt', receipt); // Append the file object
    }

    onSave(data); // Pass FormData to the onSave handler in Dashboard

    // Reset form after submission if NOT editing
    if (!expenseToEdit) {
       setFormData({ amount: '', category: '', note: '', date: '' });
       setReceipt(null);
       setFileName('No file chosen');
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setReceipt(file);
      setFileName(file.name);
    } else {
      setReceipt(null);
      setFileName('No file chosen');
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    // Use the new card class for the form
    <form onSubmit={handleSubmit} className="expense-form-card">
      {/* Wrap label/input pairs in form-grid divs */}
      <div className="form-grid">
        <label htmlFor="amount">Amount</label>
        <input 
          type="number" 
          id="amount" 
          name="amount" 
          value={formData.amount} 
          onChange={handleChange} 
          required 
          placeholder="e.g., 50.00"
          step="0.01" // Allow decimals
        />
      </div>

      <div className="form-grid">
        <label htmlFor="category">Category</label>
        <input 
          type="text" 
          id="category" 
          name="category" 
          value={formData.category} 
          onChange={handleChange} 
          required 
          placeholder="e.g., Groceries"
        />
      </div>

      <div className="form-grid">
        <label htmlFor="date">Date</label>
        <input 
          type="date" 
          id="date" 
          name="date" 
          value={formData.date} 
          onChange={handleChange} 
          required 
        />
      </div>

      <div className="form-grid">
        <label htmlFor="note">Note</label>
        <textarea 
          id="note" 
          name="note" 
          rows="3" 
          value={formData.note} 
          onChange={handleChange} 
          placeholder="Optional details..."
        ></textarea>
      </div>

      <div className="form-grid">
        <label htmlFor="receipt">Receipt</label>
        {/* Custom file input styling can be tricky, basic for now */}
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="file"
            id="receipt"
            name="receipt"
            accept="image/*"
            onChange={handleFileChange}
            style={{ display: 'none' }} // Hide default input
          />
          <label htmlFor="receipt" className="file-input-button">
            Choose File
          </label>
          <span style={{ marginLeft: '10px', fontSize: '0.9em', color: '#6c757d' }}>
            {fileName}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '1rem' }}>
        {expenseToEdit && (
          <button 
            type="button" 
            onClick={onCancelEdit} 
            className="cancel-button" // Add style for cancel button
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          className="expense-form-button"
        >
          {expenseToEdit ? 'Update Expense' : 'Add Expense'}
        </button>
      </div>
    </form>
  );
};

export default ExpenseForm; 