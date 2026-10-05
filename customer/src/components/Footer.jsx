import { Link } from 'react-router-dom';
import { Button } from './ui/Button';
import { useState } from 'react';
import { subscribe, validateEmail } from '../utils/newsletterService';
import { useToast } from '../utils/ToastContext';

export function Footer() {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!validateEmail(email)) return toast.showToast('Please enter a valid email', 'error');
    setLoading(true);
    try {
      subscribe(email);
      setEmail('');
      toast.showToast('Subscribed — check your inbox!', 'success');
    } catch (err) {
      toast.showToast(err.message || 'Subscription failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="border-t border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-2">
            <Link to="/" className="text-lg font-semibold">HomiesWardrobe</Link>
            <p className="text-sm text-secondary mt-3">Elevated essentials for modern living.</p>
            <div className="flex min-w-0 flex-col gap-2 sm:flex-row">
              <input placeholder="Email address" className="min-w-0 flex-1 rounded-3xl border border-gray-200 px-4 py-2 text-sm" value={email} onChange={(e) => setEmail(e.target.value)} />
              <Button onClick={handleSubscribe} disabled={loading}>{loading ? '...' : 'Subscribe'}</Button>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-4">
              <li><Link to="/about" className="text-gray-400 hover:text-white text-sm transition-colors">About Us</Link></li>
              <li><Link to="/stores" className="text-gray-400 hover:text-white text-sm transition-colors">Store Locator</Link></li>
              <li><Link to="/careers" className="text-gray-400 hover:text-white text-sm transition-colors">Careers</Link></li>
              <li><Link to="/sustainability" className="text-gray-400 hover:text-white text-sm transition-colors">Sustainability</Link></li>
            </ul>
          </div>

          {/* Help Links */}
          <div>
            <h4 className="text-sm font-semibold uppercase tracking-wider mb-6">Help</h4>
            <ul className="space-y-4">
              <li><Link to="/contact" className="text-gray-400 hover:text-white text-sm transition-colors">Contact Us</Link></li>
              <li><Link to="/faq" className="text-gray-400 hover:text-white text-sm transition-colors">FAQ</Link></li>
              <li><Link to="/shipping-returns" className="text-gray-400 hover:text-white text-sm transition-colors">Shipping & Returns</Link></li>
              <li><Link to="/size-guide" className="text-gray-400 hover:text-white text-sm transition-colors">Size Guide</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6 text-sm">
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Instagram</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-white transition-colors">YouTube</a>
          </div>
          <div className="flex flex-wrap gap-4 text-xs text-gray-500">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <p className="text-gray-500 text-xs">
            © {new Date().getFullYear()} HOMIESWARDROBE. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
