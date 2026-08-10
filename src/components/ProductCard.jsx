import { Link } from 'react-router-dom';
import ProductArt from './ProductArt';
import TentPhoto from './TentPhoto';
import TableCoverPhoto from './TableCoverPhoto';
import { useMoney } from '../context/CurrencyContext';

// Catalog card: corner ribbon, product mockup, bullet specs and a
// "Starting at $X" footer in the visitor's selected currency.
// Canopy products (slug canopy-tent-<size>) show their photo automatically;
// `previewSize` can override the detected size.
export default function ProductCard({ product, previewSize, previewFull, previewHalf }) {
  const money = useMoney();
  // Auto-detect the tent size from the slug so the photo shows on every page.
  const size = previewSize || (product.slug.startsWith('canopy-tent-') ? product.slug.replace('canopy-tent-', '') : null);
  return (
    <Link className="pcard" to={`/products/${product.slug}`}>
      <div className="pcard-media">
        {product.badge ? <span className="pcard-ribbon">{product.badge}</span> : null}
        {size ? (
          <TentPhoto size={size} walls={1} fullWalls={previewFull} halfWalls={previewHalf} label={product.name} />
        ) : product.slug === 'table-covers' ? (
          <TableCoverPhoto style="pleated" label={product.name} />
        ) : (
          <ProductArt slug={product.slug} />
        )}
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
        {product.startingPrice != null ? (
          <>
            <span className="pcard-price">
              Starting at <strong>{money(product.startingPrice, { cents: false })}</strong>
            </span>
            <span className="pcard-cta">Configure &amp; Price ›</span>
          </>
        ) : (
          <>
            <span className="pcard-price">Request a Quote</span>
            <span className="pcard-cta">Get a Quote ›</span>
          </>
        )}
      </div>
    </Link>
  );
}
