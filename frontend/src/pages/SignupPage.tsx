import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signup } from '@/api/auth';
import { useAuth } from '@/contexts/AuthContext';
import { useSiteConfig } from '@/contexts/SiteConfigContext';
import { getApiErrorMessage } from '@/api/errors';

export default function SignupPage() {
  const { refresh } = useAuth();
  const { config } = useSiteConfig();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signup({
        email,
        password,
        first_name: firstName || undefined,
        last_name: lastName || undefined,
      });
      await refresh();
      // Un bandeau (dans le Layout) invitera ensuite à confirmer l'email.
      navigate('/upload', { replace: true });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Inscription impossible.'));
    } finally {
      setLoading(false);
    }
  };

  // L'admin peut fermer les inscriptions (Lot 8).
  if (!config.allow_signups) {
    return (
      <div className="max-w-md mx-auto">
        <div className="card text-center">
          <div className="text-4xl mb-3">🔒</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Inscriptions fermées</h1>
          <p className="text-sm text-slate-500 mb-4">
            Les inscriptions sont actuellement désactivées. Revenez plus tard.
          </p>
          <Link to="/login" className="text-indigo-600 hover:underline">
            Déjà un compte ? Se connecter
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="card">
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Créer un compte</h1>
        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 mb-2">
            Choisir votre profil
          </p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-2 font-medium text-indigo-700">
              Je suis étudiant
            </div>
            <Link
              to="/signup-enseignant"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-slate-700 hover:border-indigo-300 hover:text-indigo-700"
            >
              Je suis enseignant
            </Link>
          </div>
        </div>
        <div className="text-sm text-slate-500 mb-6 space-y-2">
          <p>
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-indigo-600 hover:underline">
              Se connecter
            </Link>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border-l-4 border-rose-500 text-sm text-rose-900 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="signup-first-name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Prénom <span className="text-slate-400 font-normal">(facultatif)</span>
              </label>
              <input
                id="signup-first-name"
                type="text"
                autoComplete="given-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input"
              />
            </div>
            <div>
              <label
                htmlFor="signup-last-name"
                className="block text-sm font-medium text-slate-700 mb-1"
              >
                Nom <span className="text-slate-400 font-normal">(facultatif)</span>
              </label>
              <input
                id="signup-last-name"
                type="text"
                autoComplete="family-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Mot de passe
              <span className="text-slate-400 font-normal"> (≥ 8 caractères)</span>
            </label>
            <input
              id="signup-password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
            />
          </div>

          <div className="flex items-start gap-2">
            <input
              id="rgpd-consent"
              type="checkbox"
              required
              disabled={loading}
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="mt-1"
            />
            <label htmlFor="rgpd-consent" className="text-sm text-slate-700">
              J'accepte les{' '}
              <Link to="/legal/cgu" className="text-indigo-600 hover:underline">
                CGU
              </Link>{' '}
              et la{' '}
              <Link to="/legal/confidentialite" className="text-indigo-600 hover:underline">
                Politique de confidentialité
              </Link>{' '}
              d'EduTutor IA.
            </label>
          </div>

          <button type="submit" disabled={loading || !acceptedTerms} className="btn-primary w-full">
            {loading ? 'Création du compte…' : 'Créer mon compte'}
          </button>
        </form>
      </div>
    </div>
  );
}
