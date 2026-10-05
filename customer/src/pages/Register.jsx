import { useContext, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, User, Phone } from 'lucide-react';
import { AuthContext } from '../utils/AuthContext';
import { ToastContext } from '../utils/ToastContext';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';

const strengthMap = ['Too weak', 'Weak', 'Fair', 'Strong', 'Excellent'];

export function Register() {
  const navigate = useNavigate();
  const { register } = useContext(AuthContext);
  const { showToast } = useContext(ToastContext);
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', confirmPassword: '', terms: false });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const strength = useMemo(() => {
    const score = [/.{8,}/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].reduce((acc, regex) => acc + (regex.test(form.password) ? 1 : 0), 0);
    return score;
  }, [form.password]);

  const isValid = useMemo(() => {
    return (
      form.firstName &&
      form.lastName &&
      form.email.includes('@') &&
      form.phone.length >= 10 &&
      form.password.length >= 8 &&
      form.password === form.confirmPassword &&
      form.terms
    );
  }, [form]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.firstName) nextErrors.firstName = 'Enter your first name';
    if (!form.lastName) nextErrors.lastName = 'Enter your last name';
    if (!form.email) nextErrors.email = 'Enter your email address';
    else if (!form.email.includes('@')) nextErrors.email = 'Enter a valid email address';
    if (!form.phone) nextErrors.phone = 'Enter your mobile number';
    if (!form.password) nextErrors.password = 'Enter a password';
    else if (form.password.length < 8) nextErrors.password = 'Use at least 8 characters';
    if (form.password !== form.confirmPassword) nextErrors.confirmPassword = 'Passwords do not match';
    if (!form.terms) nextErrors.terms = 'You must accept terms and conditions';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setLoading(true);
    setServerError('');
    try {
      await register(form);
      showToast('Account created successfully');
      navigate('/account');
    } catch {
      setServerError('Unable to register at this time.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-section py-16">
      <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 lg:px-8">
        <Card className="space-y-8">
          <div className="space-y-2 text-center">
            <p className="text-sm uppercase tracking-[0.3em] text-secondary">Create your account</p>
            <h1 className="text-4xl font-heading font-semibold">Register with HomiesWardrobe</h1>
            <p className="text-sm text-secondary">Join now to save favorites, track orders, and manage your profile.</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            {serverError && <div className="rounded-3xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{serverError}</div>}
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="First Name"
                type="text"
                value={form.firstName}
                onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
                error={errors.firstName}
                icon={<User className="w-4 h-4" />}
              />
              <Input
                label="Last Name"
                type="text"
                value={form.lastName}
                onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
                error={errors.lastName}
                icon={<User className="w-4 h-4" />}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                error={errors.email}
                icon={<Mail className="w-4 h-4" />}
              />
              <Input
                label="Mobile Number"
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                error={errors.phone}
                icon={<Phone className="w-4 h-4" />}
              />
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                error={errors.password}
                icon={showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                onClick={() => setShowPassword((prev) => !prev)}
              />
              <Input
                label="Confirm Password"
                type={showConfirm ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                error={errors.confirmPassword}
                icon={showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                onClick={() => setShowConfirm((prev) => !prev)}
              />
            </div>
            <div className="space-y-3">
              <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-center justify-between text-sm uppercase tracking-[0.3em] text-secondary">Password strength</div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-gray-200">
                  <div className={`h-full rounded-full ${strength >= 4 ? 'bg-emerald-500' : strength >= 3 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${(strength / 4) * 100}%` }} />
                </div>
                <p className="mt-2 text-sm text-secondary">{strengthMap[strength]}</p>
              </div>
              <label className="inline-flex items-center gap-2 text-sm text-secondary">
                <input
                  type="checkbox"
                  checked={form.terms}
                  onChange={(e) => setForm((prev) => ({ ...prev, terms: e.target.checked }))}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                I agree to the <Link to="/terms" className="text-primary hover:text-brand">Terms & Conditions</Link>
              </label>
              {errors.terms && <p className="text-xs text-red-600">{errors.terms}</p>}
            </div>
            <Button type="submit" className="w-full py-4" disabled={!isValid || loading}>
              {loading ? 'Creating account…' : 'Register'}
            </Button>
          </form>

          <p className="text-center text-sm text-secondary">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-primary hover:text-brand">Login</Link>
          </p>
        </Card>
      </div>
    </div>
  );
}
