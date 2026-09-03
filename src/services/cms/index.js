// One import for every CMS read:
//
//   import { productService, homepageService } from '../services/cms';
//
// Every service here reads through the storefront's own API and compiled data,
// not Directus in the browser. That is deliberate:
//
//   - The token that reads Directus would have to ship in client JavaScript,
//     where anyone can take it and read unpublished content.
//   - Every page would then depend on the CMS host being up, turning a CMS
//     outage into a site outage.
//   - Content fetched after mount is not in the prerendered HTML, so crawlers
//     would stop seeing the copy the SEO work depends on.
//
// Directus feeds this layer at build time through scripts/cms-pull.mjs, and the
// interfaces here are what a future runtime source would have to satisfy.

export * as productService from './productService';
export * as pageService from './pageService';
export * as seoService from './seoService';
export * as navigationService from './navigationService';
export * as homepageService from './homepageService';
export * as blogService from './blogService';
export { invalidate as clearCmsCache } from './cache';
