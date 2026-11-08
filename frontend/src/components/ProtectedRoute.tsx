import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { user, token, isReady } = useAuth();

  if (!isReady) {
    return <div role="status" className="p-8 text-sm font-semibold text-gray-500">Restoring your session...</div>;
  }

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // If used as a wrapper <ProtectedRoute><Component/></ProtectedRoute>
  if (children) {
    return <>{children}</>;
  }

  // If used as a Route element <Route element={<ProtectedRoute />}>...</Route>
  return <Outlet />;
};

export default ProtectedRoute;
