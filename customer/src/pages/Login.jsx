import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Globe } from 'lucide-react';
import { AuthContext } from '../utils/AuthContext';
import { ToastContext } from '../utils/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

let googleIdentityScriptPromise;

const loadGoogleIdentityScript = () => {
  if (window.google?.accounts?.id) return Promise.resolve();
  if (!googleIdentityScriptPromise) {
    googleIdentityScriptPromise = new Promise((resolve, reject) => {
      let script = document.querySelector('script[data-google-identity]');
      const isNewScript = !script;
      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.googleIdentity = 'true';
      }
      script.addEventListener('load', resolve, { once: true });
      script.addEventListener('error', reject, { once: true });
      if (isNewScript) document.head.appendChild(script);
    }).catch((error) => {
      document.querySelector('script[data-google-identity]')?.remove();
      googleIdentityScriptPromise = undefined;
      throw error;
    });
  }
  return googleIdentityScriptPromise;
};

export function Login() {
  const navigate = useNavigate();
  const { login, googleLogin } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState('');
  const [googleReady, setGoogleReady] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const googleCredentialHandler = useRef(null);
  const googleErrorHandler = useRef(null);
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    googleCredentialHandler.current = async (response) => {
      if (!response?.credential) {
        setServerError('Google sign-in could not be verified. Please try again.');
        return;
      }
      setGoogleLoading(true);
      setServerError('');
      try {
        await googleLogin(response.credential);
        showToast('Logged in successfully');
        navigate('/account');
      } catch {
        setServerError('Google sign-in failed. Please try again.');
      } finally {
        setGoogleLoading(false);
      }
    };
    googleErrorHandler.current = () => {
      setGoogleLoading(false);
      setServerError('Google sign-in could not be opened. Please try again or use email.');
    };
  });

  useEffect(() => {
    if (!googleClientId) return undefined;
    let cancelled = false;
    loadGoogleIdentityScript()
      .then(() => {
        if (cancelled) return;
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: (response) => googleCredentialHandler.current?.(response),
          error_callback: () => googleErrorHandler.current?.(),
        });
        setGoogleReady(true);
      })
      .catch(() => {
        if (!cancelled) setServerError('Google sign-in is unavailable. Please use email and password.');
      });
    return () => {
      cancelled = true;
    };
  }, [googleClientId]);

  const isValid = useMemo(() => {
    return form.email.includes('@') && form.password.length >= 6;
  }, [form]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.email) nextErrors.email = 'Enter your email address';
    else if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email address';
    if (!form.password) nextErrors.password = 'Enter your password';
    else if (form.password.length < 6) nextErrors.password = 'Password must be at least 6 characters';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setServerError('');
    try {
      await login({ email: form.email, password: form.password, remember: form.remember });
      showToast('Logged in successfully');
      navigate('/account');
    } catch {
      setServerError('Unable to log in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    setServerError('');
    if (!googleClientId) {
      setServerError('Google sign-in is not configured. Please use email and password.');
      return;
    }
    if (!googleReady || !window.google?.accounts?.id) {
      setServerError('Google sign-in is still loading. Please try again.');
      return;
    }
    window.google.accounts.id.prompt((notification) => {
      if (notification.isDismissedMoment()) {
        setServerError('Google sign-in was cancelled. Please try again.');
      } else if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
        setServerError('Google sign-in is unavailable. Please try again or use email.');
      }
    });
  };

  return (
    <div className="min-h-screen bg-section py-16">
      <div className="mx-auto w-full max-w-2xl px-4 sm:px-6 lg:px-8">
        <Card className="space-y-8">
          <div className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-secondary">Welcome Back</p>
            <h1 className="text-4xl font-heading font-semibold">Login to your account</h1>
            <p className="text-sm text-secondary">Access your orders, wishlist, and account settings.</p>
          </div>

          <div className="grid gap-4">
            <Button variant="outline" className="w-full flex items-center justify-center gap-3 py-3 text-sm" onClick={handleGoogleSignIn} disabled={googleLoading}>
              <Globe className="w-5 h-5" /> {googleLoading ? 'Signing in with Google…' : 'Continue with Google'}
            </Button>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-secondary">
              <span className="h-px flex-1 bg-gray-200" />
              <span>or continue with email</span>
              <span className="h-px flex-1 bg-gray-200" />
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {serverError && <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}
            <div className="grid gap-4">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                error={errors.email}
                icon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                error={errors.password}
                icon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                onClick={() => setShowPassword((prev) => !prev)}
              />
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <label className="inline-flex items-center gap-2 text-sm text-secondary">
                <input
                  type="checkbox"
                  checked={form.remember}
                  onChange={(e) => setForm((prev) => ({ ...prev, remember: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="text-sm text-primary hover:text-brand">Forgot Password?</Link>
            </div>

            <Button type="submit" className="w-full py-4" disabled={!isValid || loading}>
              {loading ? 'Signing in…' : 'Login'}
            </Button>
          </form>

          <p className="text-center text-sm text-secondary">
            Don’t have an account?{' '}
            <Link to="/register" className="font-semibold text-primary hover:text-brand">Register</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
