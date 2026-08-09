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
  useDocumentMeta('Custom Printed Canopy Tents — 10x10, 10x15 & 10x20', 'Shop custom printed pop-up canopy tents in 10x10, 10x15 and 10x20 with up to 3 printed walls and instant online pricing. Free artwork proof, ships across the US & Canada.');
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
          <h1>Custom Printed Canopy Tents</h1>
          <p>Pop-up canopy tents in 10×10, 10×15 and 10×20 — printed in full colour with your logo,
          up to 3 walls, priced instantly. Pick a size and see the price update as you configure it.</p>
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
