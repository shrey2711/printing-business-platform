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
import SizePage from './pages/SizePage';
import SolutionPage from './pages/SolutionPage';
import { brand, currencyCodes } from './config/brand';
import { useCurrency } from './context/CurrencyContext';

// The Design Studio pulls in fabric.js (~250KB) — load it only when visited.
const DesignStudio = lazy(() => import('./pages/DesignStudio'));

const topNav = [
  { label: 'Canopy Tents', to: '/products/canopy-tents' },
  { label: 'Packages', to: '/products/canopy-packages' },
  { label: 'Sidewalls', to: '/products/canopy-sidewalls' },
  { label: 'Replacement Tops', to: '/products/canopy-replacement-tops' },
  { label: 'Accessories', to: '/products/canopy-accessories' },
  { label: 'All Products', to: '/products' },
  { label: 'Design Studio', to: '/design' }
];

function CurrencySwitch() {
  const { currency, setCurrency } = useCurrency();
  return (
    <div className="currency-switch" role="group" aria-label="Display currency">
      {currencyCodes.map((code) => (
        <button
          key={code}
          type="button"
          className={currency === code ? 'cur-active' : ''}
          aria-pressed={currency === code}
          onClick={() => setCurrency(code)}
        >
          {code}
        </button>
      ))}
    </div>
  );
}

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
          <span className="logo-mark">⛺</span>
          <span className="logo-text">{brand.logoText.first}<b>{brand.logoText.accent}</b></span>
        </Link>
        <span className="wl-badge">{brand.tagline}</span>
        <div className="header-spacer" />
        <CurrencySwitch />
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
          <span className="logo-text" style={{ color: '#fff' }}>
            {brand.logoText.first}<b>{brand.logoText.accent}</b>
          </span>
          <p className="ft-blurb">{brand.description}</p>
        </div>
        <div>
          <h4>Shop</h4>
          <div className="ft-links">
            <Link to="/products/canopy-tents">Custom Canopy Tents</Link>
            <Link to="/products/canopy-packages">Canopy Packages</Link>
            <Link to="/products/canopy-sidewalls">Sidewalls</Link>
            <Link to="/products/canopy-replacement-tops">Replacement Tops</Link>
            <Link to="/design">Design Studio</Link>
            <Link to="/locations">Locations</Link>
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
          <p>{brand.hours}</p>
          <p className="ft-muted">Email:</p>
          <p><a href={`mailto:${brand.email}`}>{brand.email}</a></p>
          <p><a href={`tel:${brand.phoneHref}`}>{brand.phone}</a></p>
        </div>
      </div>
      <div className="footer-legal">
        © {new Date().getFullYear()} {brand.name} • Custom printed canopy tents • {brand.shippingBlurb}
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
        <Route path="/sizes/:size" element={<SizePage />} />
        <Route path="/solutions/:useCase" element={<SolutionPage />} />
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
