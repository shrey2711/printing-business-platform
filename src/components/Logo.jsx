import { useState } from 'react';
import { brand } from '../config/brand';

// Site logo. Uses the image at public/images/logo.(webp|png) if present, else
// falls back to the two-tone text logo so the header is never broken. Drop the
// official logo at one of those paths and it appears automatically.
const CANDIDATES = ['/images/logo.webp', '/images/logo.png', '/images/logo.svg'];

export default function Logo() {
  const [idx, setIdx] = useState(0);

  if (idx < CANDIDATES.length) {
    return (
      <img
        className="brand-logo"
        src={CANDIDATES[idx]}
        alt={brand.name}
        width="223"
        height="58"
        onError={() => setIdx((i) => i + 1)}
      />
    );
  }
  // Text fallback (original header logo).
  return (
    <>
      <span className="logo-mark">⛺</span>
      <span className="logo-text">{brand.logoText.first}<b>{brand.logoText.accent}</b></span>
    </>
  );
}
