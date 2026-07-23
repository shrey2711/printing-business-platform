import { Link } from 'react-router-dom';
import ProductArt from './ProductArt';
import { useMoney } from '../context/CurrencyContext';

// Catalog card: corner ribbon, product mockup, bullet specs and a
// "Starting at $X" footer in the visitor's selected currency.
export default function ProductCard({ product }) {
  const money = useMoney();
  return (
    <Link className="pcard" to={`/products/${product.slug}`}>
      <div className="pcard-media">
        {product.badge ? <span className="pcard-ribbon">{product.badge}</span> : null}
        <ProductArt slug={product.slug} />
      </div>
      <div className="pcard-body">
        <h3>{product.name}</h3>
        <ul className="pcard-specs">
          {(product.features || []).slice(0, 3).map((f) => (
            <li key={f}>{f}</li>
          ))}
        </ul>
      </div>
      <div className="pcard-foot">
        <span className="pcard-price">
          Starting at <strong>{money(product.startingPrice, { cents: false })}</strong>
        </span>
        <span className="pcard-cta">Configure &amp; Price ›</span>
      </div>
    </Link>
  );
}
