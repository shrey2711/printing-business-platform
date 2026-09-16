// Where the 1200x630 social-card variant of a published image lives.
// Shared by the generator (scripts/gen-og-images.mjs) and the prerenderer, so
// the two can never disagree about the path.
//
//   /images/tents/10x10-1wall.webp  ->  /images/og/tents__10x10-1wall.jpg
export const ogVariantPath = (imgPath) => {
  const rel = imgPath.replace(/^\/images\//, '').replace(/\.[a-z0-9]+$/i, '');
  return `/images/og/${rel.replace(/\//g, '__')}.jpg`;
};
