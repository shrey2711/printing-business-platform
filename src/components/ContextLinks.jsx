import { Link } from 'react-router-dom';
import { contextLinksFor } from '../data/contextualLinks';

// Short in-body paragraph(s) of contextual links (src/data/contextualLinks.js).
// The same text is prerendered by scripts/prerender.mjs.
export default function ContextLinks({ path, className = 'context-links' }) {
  const paras = contextLinksFor(path);
  if (!paras.length) return null;
  return (
    <>
      {paras.map((segs, i) => (
        <p className={className} key={i}>
          {segs.map((s, j) => (typeof s === 'string' ? s : <Link key={j} to={s.to}>{s.label}</Link>))}
        </p>
      ))}
    </>
  );
}
