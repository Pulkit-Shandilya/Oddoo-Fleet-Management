// Auth imports — uncomment when re-enabling authentication
// import { Navigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
  // TODO: Re-enable auth guard before production
  // const { isAuthenticated, loading } = useAuth();
  // if (loading) return <div>Loading...</div>;
  // if (!isAuthenticated) return <Navigate to="/login" replace />;

  return children;
};

export default ProtectedRoute;
