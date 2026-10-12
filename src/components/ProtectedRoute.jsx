import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { isAuthed, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ink-900">
        <p className="text-4xl animate-pulse">🍌</p>
      </div>
    );
  }

  if (!isAuthed) return <Navigate to="/login" replace />;

  return children;
}
