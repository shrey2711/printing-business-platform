import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../services/api';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';
import useDocumentMeta from '../hooks/useDocumentMeta';

const valueProps = [
  { stat: '24/7', label: 'Online ordering & instant pricing' },
  { stat: '50', label: 'States shipped nationwide' },
  { stat: '1–2 days', label: 'Typical production time' },
  { stat: 'Free', label: 'Artwork file check on every order' }
];

export default function HomePage() {
  useDocumentMeta(
    'Wholesale Banners, Signs & Displays',
    'Get instant pricing on wholesale banners, custom signs, feather flags and trade-show displays. Choose your size, quantity and finishing online, with fast nationwide shipping.'
  );
  const [products, setProducts] = useState([]);

  useEffect(() => {
    let alive = true;
    getProducts()
      .then((prods) => alive && setProducts(prods))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  return (
    <>
      <div className="catalog-shell">
        <CategorySidebar />

        <main className="catalog-main">
          <div className="catalog-heading">
            <h1>Free Same-Day Turnaround Products</h1>
            <p>Order today before 6am PST — ships today. Wholesale pricing, blind shipping nationwide.</p>
          </div>

          <div className="pcard-grid">
            {products.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </main>
      </div>

      {/* Online value props band */}
      <section className="facilities">
        <h2>A fully online print shop — order anytime, ships to your door</h2>
        <div className="facility-row">
          {valueProps.map((f, i) => (
            <div className="facility" key={i}>
              <span className="facility-size">{f.stat}</span>
              <span className="facility-label">{f.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Turnaround messaging */}
      <section className="turnaround-band">
        <p className="turn-main">Orders placed by 4pm PST ship the next business day</p>
        <p className="turn-sub">Same-day service is also available if ordered by 12pm PST</p>
        <Link className="btn btn-red" to="/products">Shop All Products</Link>
      </section>
    </>
  );
}
