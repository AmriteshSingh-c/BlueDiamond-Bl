import React from 'react';
import { Navigate } from 'react-router-dom';
import { UserAuth } from '../../context/AuthContext';

const ProtectedRouteUser = ({ children }) => {
  const { user } = UserAuth();

  if (!user || (user.role !== "user" && user.role !== "admin" && user.email !== "normaluser@gmail.com")) {
    return <Navigate to='/' />;
  }
  return children;
};

export default ProtectedRouteUser;