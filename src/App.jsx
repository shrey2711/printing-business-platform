import { useState, lazy, Suspense } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage';
import ProductsPage from './pages/ProductsPage';
import ProductConfigurator from './pages/ProductConfigurator';
import QuotePage from './pages/QuotePage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import AccountPage from './pages/AccountPage';
import PlaceOrderPage from './pages/PlaceOrderPage';
import AdminPage from './pages/AdminPage';
import LocationsPage from './pages/LocationsPage';
import LocationPage from './pages/LocationPage';
import CityPage from './pages/CityPage';

// The Design Studio pulls in fabric.js (~250KB) — load it only when visited.
const DesignStudio = lazy(() => import('./pages/DesignStudio'));

const topNav = [
  { label: 'All Products', to: '/products' },
  { label: 'Banners', to: '/products?category=banners' },
  { label: 'Flags', to: '/products?category=flags' },
  { label: 'Banner Stands', to: '/products?category=displays' },
  { label: 'Trade Show', to: '/products?category=events' },
  { label: 'Rigids', to: '/products/rigid-signs' },
  { label: 'Design Studio', to: '/design' }
];

function HeaderAuth() {
  const { isAuthenticated, isAdmin, displayName, login, logout, isSupabaseReady } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState(false);

  if (isAuthenticated) {
    return (
      <div className="header-account">
        <Link to="/account" className="acct-link">👤 {displayName?.split(' ')[0] || 'Account'}</Link>
        {isAdmin && <Link to="/admin" className="btn btn-outline btn-sm">Admin</Link>}
        <Link to="/account" className="btn btn-blue btn-sm">My Orders</Link>
        <button className="btn btn-outline btn-sm" onClick={async () => { await logout(); navigate('/'); }}>
          Sign out
        </button>
      </div>
    );
  }

  const doLogin = async (e) => {
    e.preventDefault();
    setErr(false);
    try {
      await login(form);
      navigate('/account');
    } catch {
      setErr(true);
    }
  };

  return (
    <form className="login-inline" onSubmit={doLogin}>
      <input type="email" placeholder="Email" aria-label="Email" value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })} />
      <div className="pw-wrap">
        <input type="password" placeholder="Password" aria-label="Password" value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          className={err ? 'input-err' : ''} />
        <Link to="/login">Forgot?</Link>
      </div>
      <button type="submit" className="btn btn-blue btn-sm" disabled={!isSupabaseReady}>Sign In</button>
      <Link to="/register" className="btn btn-red btn-sm">Register</Link>
    </form>
  );
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-top">
        <Link className="logo" to="/">
          <span className="logo-mark">P2</span>
          <span className="logo-text">Print<b>USA</b></span>
        </Link>
        <span className="wl-badge">Online Print Shop</span>
        <div className="header-spacer" />
        <HeaderAuth />
      </div>
      <HeaderNav />
    </header>
  );
}

// Custom active state that also compares the ?category query — otherwise every
// "/products?category=..." link lights up at once on the /products page.
function HeaderNav() {
  const location = useLocation();
  const currentCategory = new URLSearchParams(location.search).get('category');

  const isActive = (to) => {
    const [path, query = ''] = to.split('?');
    if (path !== location.pathname) return false;
    const itemCategory = new URLSearchParams(query).get('category');
    return (itemCategory || null) === (currentCategory || null);
  };

  return (
    <nav className="header-nav">
      {topNav.map((item) => (
        <Link key={item.label} to={item.to} className={isActive(item.to) ? 'active' : ''}>
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-rainbow" />
      <div className="footer-grid">
        <div>
          <span className="logo-text" style={{ color: '#fff' }}>Print<b>USA</b></span>
          <p className="ft-blurb">A fully online wholesale print shop. Order banners, signs, flags and displays
            with instant pricing and nationwide shipping — no storefront visit required.</p>
        </div>
        <div>
          <h4>Shop</h4>
          <div className="ft-links">
            <Link to="/products">All Products</Link>
            <Link to="/products/vinyl-banners">Vinyl Banners</Link>
            <Link to="/products/yard-signs">Yard Signs</Link>
            <Link to="/design">Design Studio</Link>
            <Link to="/locations">Locations (All 50 States)</Link>
          </div>
        </div>
        <div>
          <h4>Account &amp; Support</h4>
          <div className="ft-links">
            <Link to="/login">Sign In</Link>
            <Link to="/register">Create Account</Link>
            <Link to="/account">My Orders</Link>
            <Link to="/quote">Request a Quote</Link>
            <Link to="/contact">Contact Us</Link>
          </div>
        </div>
        <div>
          <h4>Contact</h4>
          <p className="ft-muted">Customer Service Hours:</p>
          <p>Mon – Fri: 8:00am – 6:00pm ET</p>
          <p className="ft-muted">Email:</p>
          <p><a href="mailto:sales@printusa.com">sales@printusa.com</a></p>
          <p><a href="tel:+18005550148">1 (800) 555-0148</a></p>
        </div>
      </div>
      <div className="footer-legal">
        © {new Date().getFullYear()} PrintUSA • Online wholesale large-format printing • Ships nationwide
      </div>
    </footer>
  );
}

function App() {
  return (
    <div className="app-shell">
      <Header />
      <Suspense fallback={<main className="page"><p className="muted">Loading…</p></main>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductConfigurator />} />
        <Route path="/design" element={<DesignStudio />} />
        <Route path="/order" element={<PlaceOrderPage />} />
        <Route path="/quote" element={<QuotePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/locations" element={<LocationsPage />} />
        <Route path="/locations/:stateSlug" element={<LocationPage />} />
        <Route path="/locations/:stateSlug/:citySlug" element={<CityPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
