import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Import the useAuth hook

const PrivateRoute = () => {
  // Get token and loading state. User object might update slightly later.
  const { token, isLoading, user } = useAuth(); 

  console.log('PrivateRoute Check:', { isLoading, user: !!user, token: !!token }); 

  if (isLoading) {
    console.log('PrivateRoute: Still loading...'); 
    return <div>Loading...</div>; 
  }

  // If loading is finished, check for the token existence primarily
  if (!token) {
     console.log('PrivateRoute: No token found, redirecting to login.'); 
     return <Navigate to="/login" replace />;
  }

  // If token exists, allow access. User object should be available soon after.
  console.log('PrivateRoute: Token found, allowing access.');
  return <Outlet />;
};

export default PrivateRoute; 