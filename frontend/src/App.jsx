import React, { useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet // Needed for nested routes within PrivateRoute
} from 'react-router-dom';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar'; // Assuming Sidebar is independent of specific pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { AuthProvider } from './context/AuthContext'; // Import useAuth
import { ThemeProvider } from './context/ThemeContext'; // Import ThemeProvider
import PrivateRoute from './components/PrivateRoute';
import './styles.css';

// Import the actual page components
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Budgets from './pages/Budgets';
import Categories from './pages/Categories';
import Settings from './pages/Settings';

// Import Chatbot components
import ChatbotIcon from './components/ChatbotIcon';
import ChatbotWindow from './components/ChatbotWindow';

// Layout component for routes that include the Sidebar
const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    // The class on dashboard-layout helps adjust main-content-wrapper margin
    <div className="dashboard-layout"> {/* Removed conditional class here */}
      <Sidebar isOpen={isSidebarOpen} />
      {/* Apply conditional class here for margin adjustment */}
      <div className={`main-content-wrapper ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
        <button 
          onClick={toggleSidebar} 
          className="sidebar-toggle-btn"
          aria-label={isSidebarOpen ? "Close sidebar" : "Open sidebar"}
          aria-expanded={isSidebarOpen}
        >
          {isSidebarOpen ? '✕' : '☰'} {/* Changed icons to X and Hamburger */}
        </button>
        {/* Outlet renders the matched child route component */}
        <Outlet /> 
      </div>
    </div>
  );
};

function App() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  const toggleChatbot = () => {
    setIsChatbotOpen(!isChatbotOpen);
  };

  return (
    <AuthProvider>
      <ThemeProvider>
        <Router>
          {/* Navbar is always visible */}
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Private Routes - Use a Layout Route */}
            <Route element={<PrivateRoute />}>
              <Route element={<DashboardLayout />}> {/* Nested layout for sidebar routes */}
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/reports" element={<Reports />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/settings" element={<Settings />} />
                {/* Add other private routes needing the sidebar here */}
              </Route>
               {/* Add other private routes NOT needing the sidebar here (if any) */}
            </Route>

            {/* Optional: Add a 404 Not Found route */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
          {/* Chatbot Icon and Window */}
          <ChatbotIcon onClick={toggleChatbot} />
          {isChatbotOpen && <ChatbotWindow onClose={toggleChatbot} />}
          {/* Optional: Add a Footer component here */}
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
