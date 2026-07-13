import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';
import useDocumentMeta from '../hooks/useDocumentMeta';

export default function ProductsPage() {
  useDocumentMeta('Shop All Products & Get Instant Pricing', 'Browse banners, signs, flags, displays and decals. Configure size and quantity for live wholesale pricing.');
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get('category') || 'all';

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    Promise.all([getProducts(), getCategories()])
      .then(([prods, data]) => {
        if (!alive) return;
        setProducts(prods);
        setCategories(data.categories || []);
      })
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, []);

  const setCategory = (id) => {
    setSearchParams(id === 'all' ? {} : { category: id });
  };

  const visible =
    activeCategory === 'all' ? products : products.filter((p) => p.category === activeCategory);

  return (
    <div className="catalog-shell">
      <CategorySidebar />

      <main className="catalog-main">
        <div className="catalog-heading">
          <h1>Shop Products &amp; Get Instant Pricing</h1>
          <p>Pick a product, enter size and quantity, and see live wholesale pricing — no waiting on a rep.</p>
        </div>

        <div className="filter-bar">
          <button
            className={`chip ${activeCategory === 'all' ? 'chip-active' : ''}`}
            onClick={() => setCategory('all')}
          >
            All Products
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`chip ${activeCategory === cat.id ? 'chip-active' : ''}`}
              onClick={() => setCategory(cat.id)}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="muted">Loading products…</p>
        ) : (
          <div className="pcard-grid">
            {visible.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
