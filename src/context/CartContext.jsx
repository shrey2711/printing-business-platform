import { createContext, useContext, useEffect, useMemo, useState } from 'react';

// The cart holds CONFIGURATIONS, not prices.
//
// Each line stores the same `config` object the configurator would have sent to
// /api/checkout, and the server re-prices every line from that config at
// checkout exactly as the single-item path already does. The unit price kept
// here is for display only: a stale or edited price in localStorage can change
// what the customer *sees*, never what they are *charged*.
//
// Lines live in localStorage so a cart survives a refresh, a closed tab and the
// sign-in round trip — losing a configured booth's worth of items because
// someone had to log in is how carts get abandoned.

const KEY = 'apex.cart.v1';
const CartContext = createContext(null);

const read = () => {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((l) => l && l.slug && l.config) : [];
  } catch {
    // A corrupt or unreadable cart is an empty cart, never a crash on load.
    return [];
  }
};

export function CartProvider({ children }) {
  const [lines, setLines] = useState(read);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(lines)); } catch { /* private mode */ }
  }, [lines]);

  // Another tab changed the cart — keep them in step rather than letting one
  // overwrite the other's work on its next write.
  useEffect(() => {
    const sync = (e) => { if (e.key === KEY) setLines(read()); };
    window.addEventListener('storage', sync);
    return () => window.removeEventListener('storage', sync);
  }, []);

  const value = useMemo(() => {
    const add = (line) => {
      setLines((prev) => [
        ...prev,
        {
          // Every add is its own line. Two 10x10 canopies with different artwork
          // are two different things to print, so merging by slug would be wrong.
          lineId: (crypto?.randomUUID?.() || `l-${Date.now()}-${Math.random().toString(36).slice(2)}`),
          slug: line.slug,
          name: line.name,
          specs: line.specs || '',
          image: line.image || null,
          config: line.config,
          quantity: Math.max(1, Number(line.quantity) || 1),
          unitPrice: Number.isFinite(line.unitPrice) ? line.unitPrice : null,
          currency: line.currency || 'USD',
          addedAt: new Date().toISOString()
        }
      ]);
    };
    const remove = (lineId) => setLines((prev) => prev.filter((l) => l.lineId !== lineId));
    const setQuantity = (lineId, quantity) =>
      setLines((prev) => prev.map((l) => (
        l.lineId === lineId
          ? { ...l, quantity: Math.max(1, Math.min(100000, Number(quantity) || 1)),
              config: { ...l.config, quantity: Math.max(1, Number(quantity) || 1) } }
          : l
      )));
    const clear = () => setLines([]);

    const count = lines.reduce((n, l) => n + (Number(l.quantity) || 1), 0);
    // Display only. The authoritative figure comes back from the server.
    const subtotal = lines.reduce(
      (n, l) => n + (Number.isFinite(l.unitPrice) ? l.unitPrice * (Number(l.quantity) || 1) : 0),
      0
    );
    const anyUnpriced = lines.some((l) => !Number.isFinite(l.unitPrice));

    return { lines, add, remove, setQuantity, clear, count, subtotal, anyUnpriced };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside a CartProvider');
  return ctx;
}
