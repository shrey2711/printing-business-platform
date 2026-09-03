// Homepage blocks: hero, promo strip, featured categories, best sellers,
// why-choose-us, reviews, closing CTA.
//
// These resolve through src/data/content.js, the same module the prerenderer
// uses, so what a visitor sees after hydration matches what a crawler was
// served. Reading Directus directly in the browser would guarantee they differ.

import { resolveContent, resolveList } from '../../data/content';
import { cached, invalidate } from './cache';

const KEY = 'home:';

/** Fetch the published override map once per page load. */
async function overrides() {
  return cached(`${KEY}overrides`, async () => {
    try {
      const res = await fetch('/api/content');
      if (!res.ok) return {};
      return (await res.json()).content || {};
    } catch {
      // Defaults are compiled in, so a failed read costs nothing.
      return {};
    }
  });
}

const text = async (key) => resolveContent(await overrides(), key);
const list = async (key) => resolveList(await overrides(), key);

export async function hero() {
  const o = await overrides();
  const c = (k) => resolveContent(o, k);
  return {
    eyebrow: c('home.hero.eyebrow'),
    title: c('home.hero.title'),
    subtitle: c('home.hero.subtitle'),
    image: c('home.hero.image'),
    imageAlt: c('home.hero.imageAlt') || c('home.hero.title'),
    cta: { label: c('home.hero.cta.label'), href: c('home.hero.cta.href') },
    cta2: { label: c('home.hero.cta2.label'), href: c('home.hero.cta2.href') }
  };
}

/** Null when there is no message: the strip renders only when it has content. */
export async function promo() {
  const o = await overrides();
  const c = (k) => resolveContent(o, k);
  const message = c('home.promo.message');
  return message ? { message, href: c('home.promo.href'), cta: c('home.promo.cta') } : null;
}

export async function featuredCategories() {
  return { title: await text('home.featured.title'), items: await list('home.featured.items') };
}

export async function bestSellers() {
  return {
    title: await text('home.bestsellers.title'),
    subtitle: await text('home.bestsellers.subtitle'),
    slugs: await list('home.bestsellers.items')
  };
}

export async function whyChooseUs() {
  return { title: await text('home.why.title'), items: await list('home.why.items') };
}

/** Empty unless real, permissioned reviews have been published — see
 *  src/data/socialProof.js. Callers must render nothing on an empty list and
 *  must not emit Review or AggregateRating schema. */
export async function reviews() {
  return { title: await text('home.reviews.title'), items: await list('home.reviews.items') };
}

export async function ctaBanner() {
  return {
    main: await text('home.cta.main'),
    sub: await text('home.cta.sub'),
    label: await text('home.cta.label'),
    href: await text('home.cta.href')
  };
}

export async function footer() {
  const o = await overrides();
  const c = (k) => resolveContent(o, k);
  return {
    blurb: c('footer.blurb'),
    hours: c('footer.hours'),
    phone: c('footer.phone'),
    email: c('footer.email'),
    social: resolveList(o, 'footer.social')
  };
}

export function clear() {
  invalidate(KEY);
}

export default { hero, promo, featuredCategories, bestSellers, whyChooseUs, reviews, ctaBanner, footer, clear };
