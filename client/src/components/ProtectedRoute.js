// src/components/ProtectedRoute.js

import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ element }) => {
  const { isAuthenticated, checkAuthStatus, logout } = useAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        await checkAuthStatus();
      } catch (error) {
        if (error.response?.status === 403 || error.response?.status === 401) {
          logout(); // Clear session if 403 or 401
        }
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, [checkAuthStatus, logout]);

  if (loading) return <p>Loading...</p>;

  // Redirects to the login if not authenticated
  return isAuthenticated ? element : <Navigate to="/" replace />;
};

export default ProtectedRoute;
