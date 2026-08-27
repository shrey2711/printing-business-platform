// Lighthouse CI config. Run: `npm run lhci` (needs @lhci/cli installed and a
// Chrome available). Builds, serves dist, and audits representative URLs against
// the targets. Targets are assertions, not guarantees; tune per real field data.
module.exports = {
  ci: {
    collect: {
      staticDistDir: 'dist',
      url: [
        'http://localhost/index.html',
        'http://localhost/products/canopy-tent-10x10/index.html',
        'http://localhost/custom-canopies/index.html',
        'http://localhost/blog/trade-show-display-cost/index.html'
      ],
      numberOfRuns: 1
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.85 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.95 }],
        'categories:seo': ['warn', { minScore: 0.95 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }]
      }
    },
    upload: { target: 'temporary-public-storage' }
  }
};
