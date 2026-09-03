// Shared read cache for the CMS services.
//
// Two things matter more than hit rate here:
//
//   1. In-flight de-duplication. Several components mount at once and ask for
//      the same products; without this they each fire a request. Callers share
//      one promise instead.
//   2. Never serving a rejected promise from cache. A failed request that got
//      cached would keep failing for the rest of the session, long after the
//      network recovered.
//
// Content is baked at build time and revalidated by the CDN, so a short TTL is
// enough to collapse a burst of mounts without holding stale copy on screen.

const DEFAULT_TTL_MS = 60_000;

const store = new Map();   // key -> { value, expires }
const inflight = new Map(); // key -> Promise

/** Milliseconds since epoch, indirected so tests can control time. */
let now = () => Date.now();

/**
 * Read through the cache.
 *
 * @param {string} key
 * @param {() => Promise<any>} load  called only on a miss
 * @param {{ ttl?: number }} [opts]
 */
export async function cached(key, load, { ttl = DEFAULT_TTL_MS } = {}) {
  const hit = store.get(key);
  if (hit && hit.expires > now()) return hit.value;

  const pending = inflight.get(key);
  if (pending) return pending;

  const promise = (async () => {
    try {
      const value = await load();
      // Only successful reads are stored. A rejection must not be remembered.
      store.set(key, { value, expires: now() + ttl });
      return value;
    } finally {
      inflight.delete(key);
    }
  })();

  inflight.set(key, promise);
  return promise;
}

/**
 * Drop cached entries. With no argument, drops everything; with a string, drops
 * that key; with a prefix ending in ':', drops the whole family.
 */
export function invalidate(key) {
  if (key === undefined) {
    store.clear();
    return;
  }
  if (key.endsWith(':')) {
    for (const k of [...store.keys()]) if (k.startsWith(key)) store.delete(k);
    return;
  }
  store.delete(key);
}

/** Test seam: swap the clock. Returns a function that restores it. */
export function __setClock(fn) {
  const previous = now;
  now = fn;
  return () => { now = previous; };
}

/** Test seam: what is currently held. */
export function __stats() {
  return { entries: store.size, inflight: inflight.size };
}
