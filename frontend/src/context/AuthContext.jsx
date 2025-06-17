import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios'; // Assuming axios is used for API calls

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Initialize user state from localStorage potentially, or null
  // This is a simplified example; decoding token might be better
  const [user, setUser] = useState(null); 
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  // Start loading true only on initial mount to check token
  const [loading, setLoading] = useState(true); 

  // Effect for side-effects when token changes (headers, local storage)
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      localStorage.setItem('authToken', token);
      // User fetching logic will be handled in the initial load effect
    } else {
      delete axios.defaults.headers.common['Authorization'];
      localStorage.removeItem('authToken');
      setUser(null); // Clear user state if token is removed
    }
  }, [token]);

  // Effect for initial loading - check token and fetch user profile
  useEffect(() => {
    const verifyTokenAndFetchUser = async () => {
      const storedToken = localStorage.getItem('authToken');
      if (storedToken) {
        setToken(storedToken); // Ensure token state is set for axios default header
        // Note: The above useEffect for 'token' will run and set the axios header.
        // To be absolutely sure the header is set before the GET request,
        // you could also set it explicitly here if there's a race condition concern,
        // but typically the state update and subsequent effect should handle it.
        try {
          // Ensure axios defaults are applied if this runs before the token effect
          // This is a bit redundant if the token effect always runs first, but safe.
          if (!axios.defaults.headers.common['Authorization']) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          }
          const response = await axios.get('/api/auth/me'); // Endpoint to get current user
          setUser(response.data.user); 
        } catch (error) {
          console.error('Failed to fetch user profile with token:', error);
          localStorage.removeItem('authToken'); // Invalid/expired token
          setToken(null);
          setUser(null);
        }
      }
      setLoading(false);
    };

    verifyTokenAndFetchUser();
  }, []); // Empty dependency array means run only once on mount

  const login = async (email, password) => {
    setLoading(true);
    console.log('Attempting login for:', email);
    try {
      const response = await axios.post('/api/auth/login', { email, password });
      const { data } = response;
      console.log('Login response:', data);
      // Fix: Accept both old and new backend response formats
      if (data.user && data.token) {
        setUser(data.user);
        setToken(data.token);
      } else if (data._id && data.token) {
        setUser({
          id: data._id,
          username: data.username,
          email: data.email,
          // Optionally add other fields if needed
        });
        setToken(data.token);
      } else {
        throw new Error('Unexpected login response format');
      }
      // setLoading(false); // setLoading will be handled by the initial load effect or here
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
        console.error('Error response headers:', error.response.headers);
      } else if (error.request) {
        console.error('Error request:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      setUser(null); // Clear user on failed login
      setToken(null); // Clear token on failed login
      // setLoading(false);
      return false;
    }
  };

  const register = async (username, email, password) => {
    // setLoading(true); // setLoading will be handled by the initial load effect or here
    try {
      const response = await axios.post('/api/auth/register', { username, email, password });
      const { data } = response;
      setUser(data.user); // Set user state
      setToken(data.token); // Set token state
      // setLoading(false); 
      return true;
    } catch (error) {
      console.error('Register failed', error);
      setUser(null);
      setToken(null);
      // setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    console.log('AuthContext logout');
    setToken(null); // This will trigger the useEffect to clear user, headers, storage
    setUser(null); // Explicitly clear user
    // No need to set loading here unless logout involves an async backend call
  };

  const value = {
    user,
    token,
    login,
    register,
    logout,
    setUser, // <-- Expose setUser
    isAuthenticated: !!user && !!token, // Check both user and token
    isLoading: loading,
  };

  // Render Provider only after initial loading check is potentially done, or handle loading inside consumer
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};