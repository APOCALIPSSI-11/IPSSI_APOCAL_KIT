import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { ReactNode } from 'react';

/**
 * Route guard pour l'espace enseignant.
 * - Pas connecté -> /login
 * - Connecté mais non teacher -> page 403
 */
export default function RequireTeacher({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="text-center text-slate-500 py-12">Chargement…</div>;
  }
  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  if (user.role !== 'teacher') {
    return (
      <div className="max-w-xl mx-auto card text-center py-10">
        <div className="text-4xl mb-3">🚫</div>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Accès interdit</h1>
        <p className="text-slate-600">
          Cette page est réservée aux enseignants.
        </p>
      </div>
    );
  }
  return <>{children}</>;
}
