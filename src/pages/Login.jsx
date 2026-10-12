import { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login, isAuthed, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  if (!loading && isAuthed) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email.trim(), password);
      navigate('/', { replace: true });
    } catch (err) {
      if (err?.response) {
        // The server answered (got CORS-cleared) — a real auth rejection.
        toast.error(err.response.data?.message || 'Invalid admin credentials.');
      } else if (err?.request) {
        // Request went out but no response came back at all — this is a
        // network/CORS/unreachable-backend failure, not bad credentials.
        toast.error('Could not reach the server. Check your connection or try again shortly.');
      } else {
        toast.error('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-900 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <p className="text-5xl mb-3">🍌</p>
          <h1 className="font-display text-2xl font-bold text-banana-50">KELA.com Admin</h1>
          <p className="text-banana-200/50 text-sm mt-1">Sign in to manage the site</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl card-shadow p-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold text-ink-900 mb-1.5">
              Admin email
            </label>
            <input
              id="email"
              type="email"
              autoFocus
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-banana-300 bg-white px-4 py-2.5 text-ink-900 placeholder:text-ink-700/50 focus-ring"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-bold text-ink-900 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-banana-300 bg-white px-4 py-2.5 text-ink-900 placeholder:text-ink-700/50 focus-ring"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 rounded-xl bg-banana-500 hover:bg-banana-400 text-ink-900 font-display font-bold transition active:scale-[0.99] disabled:opacity-60 focus-ring"
          >
            {submitting ? 'Signing in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}
