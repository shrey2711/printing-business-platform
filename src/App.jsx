import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import HomePage from './pages/HomePage'; // eager — the landing page / LCP route
// Route-level code-splitting: every other page loads as its own chunk on demand,
// shrinking the initial bundle. The Suspense boundary below shows a fallback.
const ProductsPage = lazy(() => import('./pages/ProductsPage'));
const ProductConfigurator = lazy(() => import('./pages/ProductConfigurator'));
const QuotePage = lazy(() => import('./pages/QuotePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const PlaceOrderPage = lazy(() => import('./pages/PlaceOrderPage'));
const AdminPage = lazy(() => import('./pages/AdminPage'));
const LocationsPage = lazy(() => import('./pages/LocationsPage'));
const LocationPage = lazy(() => import('./pages/LocationPage'));
const CityPage = lazy(() => import('./pages/CityPage'));
const SizePage = lazy(() => import('./pages/SizePage'));
const SolutionPage = lazy(() => import('./pages/SolutionPage'));
const BlogIndex = lazy(() => import('./pages/BlogIndex'));
const ResourcesPage = lazy(() => import('./pages/ResourcesPage'));
const BlogPost = lazy(() => import('./pages/BlogPost'));
const InfoPage = lazy(() => import('./pages/InfoPage'));
const CategoryPage = lazy(() => import('./pages/CategoryPage'));
const BoothPackagesPage = lazy(() => import('./pages/BoothPackagesPage'));
const CityCategoryPage = lazy(() => import('./pages/CityCategoryPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
import Logo from './components/Logo';
import ChunkErrorBoundary from './components/ChunkErrorBoundary';
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
    label: 'Banners',
    to: '/banners',
    items: [
      { label: '13oz Vinyl Banner', to: '/products/13oz-vinyl-banner' },
      { label: '18oz Blockout Banner', to: '/products/18oz-blockout-banner' },
      { label: 'Mesh Banner', to: '/products/mesh-banner' },
      { label: '9oz Fabric Banner', to: '/products/fabric-banner-9oz-wrinkle-free' }
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
  },
  {
    label: 'Flags',
    to: '/products?category=flags',
    items: [
      { label: 'Feather Angled Flag', to: '/products/feather-angled-flag' },
      { label: 'Feather Convex Flag', to: '/products/feather-convex-flag' },
      { label: 'Teardrop Flag', to: '/products/teardrop-flag' }
    ]
  },
  {
    label: 'SEG Modular Kits',
    to: '/products?category=seg-kits',
    items: [
      { label: 'SEG Modular Kit A', to: '/products/seg-modular-trade-show-kit-a' },
      { label: 'SEG Modular Kit B', to: '/products/seg-modular-trade-show-kit-b' },
      { label: 'SEG Modular Kit C', to: '/products/seg-modular-trade-show-kit-c' }
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
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <header className={`site-header${scrolled ? ' scrolled' : ''}`}>
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
  // The desktop Shop menu opens on hover/focus (CSS). After an SPA click the
  // cursor/focus stays over it, so it would stay open — this flag force-closes
  // it on click and resets when the pointer leaves so hover works again.
  const [shopClosed, setShopClosed] = useState(false);
  const closeShop = () => {
    setShopClosed(true);
    if (typeof document !== 'undefined' && document.activeElement?.blur) document.activeElement.blur();
  };

  // Close the mobile menu whenever the route changes.
  useEffect(() => { setMobileOpen(false); }, [location]);

  return (
    <>
      {/* Desktop navigation */}
      <nav className="header-nav" aria-label="Primary">
        <div
          className={`shop-dd ${shopClosed ? 'shop-dd-collapsed' : ''}`}
          onMouseLeave={() => setShopClosed(false)}
        >
          <Link className="shop-dd-trigger" to="/products" onClick={closeShop}>
            Shop <span aria-hidden="true">▾</span>
          </Link>
          <div className="shop-menu">
            {shopMenu.map((g) => (
              <div className="shop-col" key={g.label}>
                <Link className="shop-col-head" to={g.to} onClick={closeShop}>{g.label}</Link>
                {g.items.map((it) => (
                  <Link key={it.to} to={it.to} onClick={closeShop}>{it.label}</Link>
                ))}
              </div>
            ))}
            <Link className="shop-all" to="/products" onClick={closeShop}>Shop all products →</Link>
          </div>
        </div>
        <Link to="/trade-show-displays">Displays</Link>
        <Link to="/custom-canopies">Canopies</Link>
        <Link to="/banners">Banners</Link>
        <Link to="/products?category=flags">Flags</Link>
        <Link to="/products?category=seg-kits">SEG Kits</Link>
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
            <img src="/images/logo.webp" alt={brand.name} width="203" height="46" />
          </span>
          <p className="ft-blurb">{brand.description}</p>
        </div>
        <div>
          <h4>Shop</h4>
          <div className="ft-links">
            <Link to="/trade-show-displays">Trade Show Displays</Link>
            <Link to="/custom-canopies">Canopy Tents</Link>
            <Link to="/banner-stands">Banner Stands</Link>
            <Link to="/banners">Banners</Link>
            <Link to="/backdrops">Backdrops</Link>
            <Link to="/table-covers">Table Covers</Link>
            <Link to="/seg-displays">SEG Displays</Link>
            <Link to="/tension-fabric-displays">Tension Fabric Displays</Link>
            <Link to="/pop-up-displays">Pop-Up Displays</Link>
            <Link to="/flags">Flags</Link>
            <Link to="/trade-show-booth-packages">Booth Packages</Link>
            <Link to="/resources">Learning Center</Link>
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
            <Link to="/free-artwork-proof">Free Artwork Proof</Link>
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

// On every route change, jump back to the top — otherwise a link clicked from
// the footer leaves the new page scrolled to the bottom.
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

function App() {
  const { pathname } = useLocation();
  return (
    <div className="app-shell">
      <ScrollToTop />
      <Header />
      <ChunkErrorBoundary resetKey={pathname}>
      <Suspense fallback={<main className="page"><p className="muted">Loading…</p></main>}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductConfigurator />} />
        <Route path="/sizes/:size" element={<SizePage />} />
        <Route path="/solutions/:useCase" element={<SolutionPage />} />
        <Route path="/resources" element={<ResourcesPage />} />
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
        <Route path="/banners" element={<CategoryPage slug="banners" />} />
        <Route path="/table-covers" element={<CategoryPage slug="table-covers" />} />
        <Route path="/backdrops" element={<CategoryPage slug="backdrops" />} />
        <Route path="/trade-show-booth-packages" element={<BoothPackagesPage />} />
        {/* Display-type SEO landing pages (quote-based, no invented pricing) */}
        <Route path="/seg-displays" element={<LandingPage slug="seg-displays" />} />
        <Route path="/tension-fabric-displays" element={<LandingPage slug="tension-fabric-displays" />} />
        <Route path="/pop-up-displays" element={<LandingPage slug="pop-up-displays" />} />
        <Route path="/flags" element={<LandingPage slug="flags" />} />
        {/* City × category local landing pages (option A canonical local pages) */}
        <Route path="/trade-show-canopies/:city" element={<CityCategoryPage categoryKey="canopies" />} />
        <Route path="/trade-show-displays/:city" element={<CityCategoryPage categoryKey="displays" />} />
        <Route path="/banner-stands/:city" element={<CityCategoryPage categoryKey="banner-stands" />} />
        <Route path="/about" element={<InfoPage slug="about" />} />
        <Route path="/artwork-guidelines" element={<InfoPage slug="artwork-guidelines" />} />
        <Route path="/free-artwork-proof" element={<InfoPage slug="free-artwork-proof" />} />
        <Route path="/shipping" element={<InfoPage slug="shipping" />} />
        <Route path="/returns" element={<InfoPage slug="returns" />} />
        <Route path="/warranty" element={<InfoPage slug="warranty" />} />
        <Route path="/privacy" element={<InfoPage slug="privacy" />} />
        <Route path="/terms" element={<InfoPage slug="terms" />} />
      </Routes>
      </Suspense>
      </ChunkErrorBoundary>
      <Footer />
    </div>
  );
}

export default App;
