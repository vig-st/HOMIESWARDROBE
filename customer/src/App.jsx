import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { Home } from './pages/Home';
import { Product } from './pages/Product';
import { Shop } from './pages/Shop';
import { Cart } from './pages/Cart';
import { Checkout } from './pages/Checkout';
import { Wishlist } from './pages/Wishlist';
import { AIStylist } from './pages/AIStylist';
import { CartProvider } from './utils/CartProvider';
import { WishlistProvider } from './utils/WishlistProvider';
import { ToastProvider } from './utils/ToastProvider';
import { AuthProvider } from './utils/AuthProvider';
import { ProtectedRoute } from './utils/ProtectedRoute';
import { PublicRoute } from './utils/PublicRoute';
import { AccountLayout } from './components/AccountLayout';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/account/Dashboard';
import { Profile } from './pages/account/Profile';
import { Orders } from './pages/account/Orders';
import { Addresses } from './pages/account/Addresses';
import { Settings } from './pages/account/Settings';
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { FAQ } from './pages/FAQ';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Shipping } from './pages/Shipping';
import { Returns } from './pages/Returns';
import { Stores } from './pages/Stores';
import { Careers } from './pages/Careers';
import { Sustainability } from './pages/Sustainability';
import { SizeGuide } from './pages/SizeGuide';

const Placeholder = ({ title }) => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <h1 className="text-3xl font-heading uppercase tracking-widest">{title}</h1>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <Routes>
                <Route path="/" element={<MainLayout />}>
                  <Route index element={<Home />} />
                  <Route path="shop" element={<Shop />} />
                  <Route path="men" element={<Shop initialGender="men" />} />
                  <Route path="women" element={<Shop initialGender="women" />} />
                  <Route path="product/:id" element={<Product />} />
                  <Route path="cart" element={<Cart />} />
                  <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                  <Route path="wishlist" element={<Wishlist />} />
                  <Route path="ai-stylist" element={<AIStylist />} />
                  <Route path="about" element={<About />} />
                  <Route path="stores" element={<Stores />} />
                  <Route path="careers" element={<Careers />} />
                  <Route path="sustainability" element={<Sustainability />} />
                  <Route path="contact" element={<Contact />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="privacy" element={<Privacy />} />
                  <Route path="terms" element={<Terms />} />
                  <Route path="shipping" element={<Shipping />} />
                  <Route path="shipping-returns" element={<Shipping />} />
                  <Route path="size-guide" element={<SizeGuide />} />
                  <Route path="returns" element={<Returns />} />

                  <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
                  <Route path="register" element={<PublicRoute><Register /></PublicRoute>} />
                  <Route path="forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
                  <Route path="reset-password" element={<PublicRoute><ResetPassword /></PublicRoute>} />

                  <Route path="account" element={<ProtectedRoute><AccountLayout /></ProtectedRoute>}>
                    <Route index element={<Dashboard />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="orders" element={<Orders />} />
                    <Route path="addresses" element={<Addresses />} />
                    <Route path="settings" element={<Settings />} />
                  </Route>

                  <Route path="*" element={<Placeholder title="404 - Not Found" />} />
                </Route>
              </Routes>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}

export default App;
