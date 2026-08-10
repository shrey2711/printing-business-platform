import { useState, useEffect, Suspense } from 'react';
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
import BlogIndex from './pages/BlogIndex';
import BlogPost from './pages/BlogPost';
import InfoPage from './pages/InfoPage';
import CategoryPage from './pages/CategoryPage';
import BoothPackagesPage from './pages/BoothPackagesPage';
import Logo from './components/Logo';
import { brand, currencyCodes } from './config/brand';
import { useCurrency } from './context/CurrencyContext';

// Shop menu — grouped by the real categories, one level deep, every link a real
// destination (category filter or product page). Shared by the desktop dropdown
// and the mobile accordion.
const shopMenu = [
  {
    label: 'Custom Canopies',
    to: '/custom-canopies',
    items: [
      { label: "10' × 10' Canopy", to: '/products/canopy-tent-10x10' },
      { label: "10' × 15' Canopy", to: '/products/canopy-tent-10x15' },
      { label: "10' × 20' Canopy", to: '/products/canopy-tent-10x20' },
      { label: 'Size guides', to: '/sizes/10x10' }
    ]
  },
  {
    label: 'Banner Stands',
    to: '/banner-stands',
    items: [
      { label: 'Standard Retractable', to: '/products/standard-retractable-banner' },
      { label: 'Deluxe Retractable', to: '/products/deluxe-retractable-banner' },
      { label: 'X-Stand Banner', to: '/products/x-stand-banner' },
      { label: 'Table Top Banner', to: '/products/table-top-banner-stand' }
    ]
  },
  {
    label: 'Backdrops',
    to: '/backdrops',
    items: [{ label: 'Step & Repeat Backdrop', to: '/products/step-and-repeat-backdrop' }]
  },
  {
    label: 'Table Covers',
    to: '/table-covers',
    items: [
      { label: 'Pleated Table Covers', to: '/products/pleated-table-covers' },
      { label: 'Stretch Table Covers', to: '/products/stretch-table-covers' }
    ]
  }
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
  const { isAuthenticated, canSeeAdmin, displayName, login, logout, isSupabaseReady } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [err, setErr] = useState(false);

  if (isAuthenticated) {
    return (
      <div className="header-account">
        <Link to="/account" className="acct-link">👤 {displayName?.split(' ')[0] || 'Account'}</Link>
        {canSeeAdmin && <Link to="/admin" className="btn btn-outline btn-sm">Dashboard</Link>}
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
        <Link className="logo" to="/" aria-label={brand.name}>
          <Logo />
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

// Desktop: a "Shop" mega-dropdown (CSS hover/focus) plus quick links + a
// prominent quote CTA. Mobile: a hamburger that opens an accordion with large
// tap targets, one level deep. Both reuse `shopMenu`.
function HeaderNav() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openGroup, setOpenGroup] = useState(null);

  // Close the mobile menu whenever the route changes.
  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <>
      {/* Desktop navigation */}
      <nav className="header-nav" aria-label="Primary">
        <div className="shop-dd">
          <Link className="shop-dd-trigger" to="/products">
            Shop <span aria-hidden="true">▾</span>
          </Link>
          <div className="shop-menu">
            {shopMenu.map((g) => (
              <div className="shop-col" key={g.label}>
                <Link className="shop-col-head" to={g.to}>{g.label}</Link>
                {g.items.map((it) => (
                  <Link key={it.to} to={it.to}>{it.label}</Link>
                ))}
              </div>
            ))}
            <Link className="shop-all" to="/products">Shop all products →</Link>
          </div>
        </div>
        <Link to="/trade-show-displays">Displays</Link>
        <Link to="/custom-canopies">Canopies</Link>
        <Link to="/trade-show-booth-packages">Booth Packages</Link>
        <Link to="/blog">Blog</Link>
        <span className="nav-spacer" />
        <Link className="btn btn-outline btn-sm" to="/products">Shop All</Link>
        <Link className="btn btn-red btn-sm" to="/quote">Get a Quote</Link>
      </nav>

      {/* Mobile navigation */}
      <div className="header-nav-m">
        <button
          type="button"
          className="nav-toggle"
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          onClick={() => setMobileOpen((o) => !o)}
        >
          <span aria-hidden="true">{mobileOpen ? '✕' : '☰'}</span> Menu
        </button>
        <Link className="btn btn-red btn-sm" to="/quote">Get a Quote</Link>
      </div>
      {mobileOpen && (
        <div className="m-menu" id="mobile-menu">
          <Link className="m-all" to="/products">Shop all products</Link>
          {shopMenu.map((g, i) => (
            <div className="m-group" key={g.label}>
              <button
                type="button"
                className="m-group-head"
                aria-expanded={openGroup === i}
                onClick={() => setOpenGroup(openGroup === i ? null : i)}
              >
                {g.label} <span aria-hidden="true">{openGroup === i ? '−' : '+'}</span>
              </button>
              {openGroup === i && (
                <div className="m-sub">
                  <Link to={g.to}>All {g.label}</Link>
                  {g.items.map((it) => (
                    <Link key={it.to} to={it.to}>{it.label}</Link>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Link className="m-link" to="/trade-show-booth-packages">Booth Packages</Link>
          <Link className="m-link" to="/locations">Locations</Link>
          <Link className="m-link" to="/blog">Blog</Link>
        </div>
      )}
    </>
  );
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-rainbow" />
      <div className="footer-grid">
        <div>
          <span className="ft-logo">
            <img src="/images/logo.webp" alt={brand.name} width="180" height="46" />
          </span>
          <p className="ft-blurb">{brand.description}</p>
        </div>
        <div>
          <h4>Shop</h4>
          <div className="ft-links">
            <Link to="/trade-show-displays">Trade Show Displays</Link>
            <Link to="/custom-canopies">Canopy Tents</Link>
            <Link to="/banner-stands">Banner Stands</Link>
            <Link to="/backdrops">Backdrops</Link>
            <Link to="/table-covers">Table Covers</Link>
            <Link to="/trade-show-booth-packages">Booth Packages</Link>
            <Link to="/blog">Blog</Link>
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
          <h4>Company</h4>
          <div className="ft-links">
            <Link to="/about">About Apex Trade Show</Link>
            <Link to="/artwork-guidelines">Artwork Guidelines</Link>
            <Link to="/shipping">Shipping</Link>
            <Link to="/returns">Returns</Link>
            <Link to="/warranty">Warranty</Link>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
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
        <Route path="/blog" element={<BlogIndex />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
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
        <Route path="/trade-show-displays" element={<CategoryPage slug="trade-show-displays" />} />
        <Route path="/custom-canopies" element={<CategoryPage slug="custom-canopies" />} />
        <Route path="/banner-stands" element={<CategoryPage slug="banner-stands" />} />
        <Route path="/table-covers" element={<CategoryPage slug="table-covers" />} />
        <Route path="/backdrops" element={<CategoryPage slug="backdrops" />} />
        <Route path="/trade-show-booth-packages" element={<BoothPackagesPage />} />
        <Route path="/about" element={<InfoPage slug="about" />} />
        <Route path="/artwork-guidelines" element={<InfoPage slug="artwork-guidelines" />} />
        <Route path="/shipping" element={<InfoPage slug="shipping" />} />
        <Route path="/returns" element={<InfoPage slug="returns" />} />
        <Route path="/warranty" element={<InfoPage slug="warranty" />} />
        <Route path="/privacy" element={<InfoPage slug="privacy" />} />
        <Route path="/terms" element={<InfoPage slug="terms" />} />
      </Routes>
      </Suspense>
      <Footer />
    </div>
  );
}

export default App;
