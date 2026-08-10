import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProducts, getCategories } from '../services/api';
import CategorySidebar from '../components/CategorySidebar';
import ProductCard from '../components/ProductCard';
import AccessoriesSection from '../components/AccessoriesSection';
import useDocumentMeta from '../hooks/useDocumentMeta';

// Vary the wall configuration per tent so cards don't look identical.
const cardPreview = {
  'canopy-tent-10x10': { full: 3, half: 0 },
  'canopy-tent-10x15': { full: 0, half: 2 },
  'canopy-tent-10x20': { full: 1, half: 0 }
};

export default function ProductsPage() {
  useDocumentMeta('Trade Show Displays, Canopies & Banner Stands', 'Shop the complete trade show booth from Apex — custom canopy tents (instant pricing), retractable banner stands, step & repeat backdrops and table covers. Free artwork proof, US & Canada.');
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
          <h1>Trade Show Displays &amp; Custom Canopies</h1>
          <p>Everything for a professional booth from one supplier — canopy tents, banner stands,
          backdrops and table covers. Filter by category, then configure and price your product.</p>
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
            {visible.map((product) => {
              const cfg = cardPreview[product.slug] || {};
              return (
                <ProductCard
                  key={product.slug}
                  product={product}
                  previewFull={cfg.full}
                  previewHalf={cfg.half}
                />
              );
            })}
          </div>
        )}

        <AccessoriesSection />
      </main>
    </div>
  );
}
