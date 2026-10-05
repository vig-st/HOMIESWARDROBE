import { useState, useEffect, useContext } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Search, Heart, ShoppingBag, User, Menu, X } from 'lucide-react';
import { cn } from '../utils/cn';
import { CartContext } from '../utils/CartContext';
import { WishlistContext } from '../utils/WishlistContext';
import { AuthContext } from '../utils/AuthContext';
import { useNavigate } from 'react-router-dom';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { items: cartItems } = useContext(CartContext);
  const { items: wishlistItems } = useContext(WishlistContext);
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Men', path: '/men' },
    { name: 'Women', path: '/women' },
    { name: 'Shop', path: '/shop' },
    { name: 'AI Stylist', path: '/ai-stylist' },
  ];

  return (
    <>
      <header
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white border-b',
          isScrolled ? 'border-border py-4' : 'border-transparent py-6'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Mobile Menu Toggle */}
            <button
              className="lg:hidden p-2 -ml-2 text-primary"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <Link to="/" className="text-xl md:text-2xl font-bold font-heading tracking-tighter uppercase shrink-0">
              Homies<span className="text-brand">Wardrobe</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  className={({ isActive }) =>
                    cn(
                      'text-sm font-medium uppercase tracking-wide transition-colors hover:text-brand',
                      isActive ? 'text-primary' : 'text-secondary'
                    )
                  }
                >
                  {link.name}
                </NavLink>
              ))}
            </nav>

            {/* Icons */}
            <div className="relative flex items-center space-x-4 md:space-x-6">
              <button className="text-primary hover:text-brand transition-colors">
                <Search className="w-5 h-5" />
              </button>

              <Link to="/wishlist" className="hidden sm:block relative text-primary hover:text-brand transition-colors">
                <Heart className="w-5 h-5" />
                {wishlistItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {wishlistItems.length}
                  </span>
                )}
              </Link>

              <Link to="/cart" className="relative text-primary hover:text-brand transition-colors">
                <ShoppingBag className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </Link>

              {/* Auth area */}
              {!isAuthenticated ? (
                <div className="hidden sm:flex items-center gap-3">
                  <Link to="/login" className="text-sm text-primary hover:text-brand">Login</Link>
                  <Link to="/register" className="text-sm text-secondary">Register</Link>
                </div>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setProfileOpen((s) => !s)}
                    className="flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-sm"
                  >
                    <User className="w-5 h-5" />
                    <span className="hidden sm:inline-block">{user?.firstName}</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-200 bg-white p-3 shadow-lg">
                      <Link to="/account" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm hover:bg-gray-50">My Account</Link>
                      <Link to="/account/orders" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm hover:bg-gray-50">Orders</Link>
                      <Link to="/wishlist" onClick={() => setProfileOpen(false)} className="block px-3 py-2 text-sm hover:bg-gray-50">Wishlist</Link>
                      <button onClick={() => { logout(); setProfileOpen(false); navigate('/'); }} className="mt-2 w-full rounded-md bg-white px-3 py-2 text-left text-sm text-red-600 hover:bg-gray-50">Logout</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          <div className="p-4 flex items-center justify-between border-b border-border">
            <Link to="/" className="text-xl font-bold font-heading tracking-tighter uppercase" onClick={() => setIsMobileMenuOpen(false)}>
              Homies<span className="text-brand">Wardrobe</span>
            </Link>
            <button
              className="p-2 text-primary"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <nav className="flex flex-col p-6 space-y-6">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-2xl font-medium uppercase tracking-wider text-primary hover:text-brand"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-6 border-t border-border flex flex-col space-y-4">
              <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-secondary hover:text-primary">Account</Link>
              <Link to="/wishlist" onClick={() => setIsMobileMenuOpen(false)} className="text-lg text-secondary hover:text-primary">Wishlist</Link>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
