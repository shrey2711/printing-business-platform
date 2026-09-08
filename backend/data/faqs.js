// Generate useful, unique FAQs for each product from its own data
// (sizes, materials, finishing, turnaround). Used on the product page and
// prerendered as FAQPage structured data.
import { ARTWORK_SPEC } from '../../src/lib/artworkSpec.js';

export function getProductFaqs(product) {
  // A product may carry its own curated FAQs. They lead — they answer real
  // purchase objections — but they no longer REPLACE the generated ones, which
  // cover sizes, materials, finishing and turnaround straight from the pricing
  // config. Authored first, then any generated question the author did not
  // already cover (matched on the distinctive words of the question).
  const authored = Array.isArray(product.faqs) ? product.faqs : [];
  const p = product.pricing;
  const name = product.name;
  const lower = name.toLowerCase();
  const faqs = [];

  // A product with no published price shows "Request a quote" everywhere, so an
  // answer promising an instant price or a discount that updates as you type is
  // simply false on that page. Both generated answers below branch on this.
  const quoteOnly = !!p.quoteOnly || p.model === 'quote' || p.model === 'competitive';

  // Sizes
  const enterSizes = quoteOnly
    ? 'Enter your exact width and height on the product page and we will quote it.'
    : 'Enter your exact width and height on the product page to see instant pricing.';
  if (p.model === 'area') {
    // Only the rigid signs carry explicit min/max bounds. The banners never
    // have, and interpolating them anyway published
    // `from undefined"×undefined" up to undefined"×undefined"` into the visible
    // FAQ and the FAQPage schema of every banner page. Fall back to the
    // product's own verified `Sizes` spec row, and emit nothing at all rather
    // than a sentence with holes in it.
    const bounds = [p.minWidthIn, p.minHeightIn, p.maxWidthIn, p.maxHeightIn];
    const sizeRow = (product.specs || []).find(([k]) => /^sizes?$/i.test(String(k).trim()));
    if (bounds.every((n) => Number.isFinite(n))) {
      faqs.push({
        q: `What sizes are available for ${lower}?`,
        a: `We print ${lower} in custom sizes from ${p.minWidthIn}"×${p.minHeightIn}" up to ${p.maxWidthIn}"×${p.maxHeightIn}". ${enterSizes}`
      });
    } else if (sizeRow) {
      faqs.push({
        q: `What sizes are available for ${lower}?`,
        a: `${String(sizeRow[1]).replace(/\.$/, '')}. ${enterSizes}`
      });
    }
  } else if (p.variants?.length) {
    faqs.push({
      q: `What sizes does the ${lower} come in?`,
      a: `Available sizes: ${p.variants.map((v) => v.name).join(', ')}. ${quoteOnly
        ? 'Choose your size on the product page and we will quote it.'
        : 'Choose your size on the product page to see the price.'}`
    });
  }

  // Materials
  if (p.materials?.length > 1) {
    faqs.push({
      q: `What material options do you offer for ${lower}?`,
      a: `You can choose from ${p.materials.map((m) => m.name).join(', ')}.`
    });
  }

  // Turnaround + shipping.
  //
  // `turnaround` is authored per product and some values end without a full
  // stop, which ran two sentences together in the visible FAQ and in the
  // FAQPage schema: "Ships in 2-4 business days We ship across the United
  // States…". Close the sentence here rather than editing every record.
  const turnaround = String(product.turnaround || '').trim().replace(/[.\s]+$/, '');
  faqs.push({
    q: `How fast is production and shipping?`,
    a: `${turnaround ? `${turnaround}. ` : ''}We ship across the United States and Canada — see our Shipping page for delivery details.`
  });

  // Finishing / double-sided
  const finishing = p.finishing || [];
  const doubleSided = finishing.find((f) => (f.id || '').includes('double'));
  if (doubleSided) {
    faqs.push({
      q: `Can ${lower} be printed double-sided?`,
      a: `Yes — double-sided printing is available as a finishing option, priced automatically when you select it on the product page.`
    });
  } else if (finishing.length) {
    faqs.push({
      q: `What finishing options are available?`,
      a: `Finishing options include ${finishing.map((f) => f.name).join(', ')}.`
    });
  }

  // Artwork / files.
  //
  // Answered from the rules the uploader actually enforces. This used to say we
  // accept "PDF, AI, EPS, and high-resolution PNG or JPG", which the quote and
  // order forms reject: src/lib/artworkSpec.js allows PDF and JPEG only, single
  // page, up to MAX_LABEL. Telling a customer to send a file the form will not
  // take is worse than telling them nothing. Text is derived from ARTWORK_SPEC
  // so the two cannot drift apart again.
  const spec = Object.fromEntries(ARTWORK_SPEC);
  faqs.push({
    q: `What artwork file formats do you accept?`,
    a: `${spec['Accepted formats']}, up to ${spec['Maximum file size']}. ${spec['Colour space']}. ${spec['Resolution']}. ${spec['Size']}, and do not include bleed or crop marks. Convert live fonts to outlines. We check every file at no charge and send a free proof before printing.`
  });

  // Bulk / wholesale discounts
  faqs.push({
    q: `Do you offer bulk or wholesale discounts on ${lower}?`,
    a: quoteOnly
      ? `Yes. Pricing is wholesale and the per-piece price falls as the quantity rises. Send your quantity with your quote request and the volume price is included in the quote.`
      : `Yes. Pricing is wholesale with automatic volume discounts — the more you order, the lower the per-piece price. The discount is applied instantly as you increase the quantity.`
  });

  // Merge: authored questions win; a generated one is dropped when the authored
  // set already asks something close enough (same key terms).
  const key = (q) => q.toLowerCase().replace(/[^a-z ]/g, ' ').split(/\s+/)
    .filter((w) => w.length > 3 && !['what', 'does', 'your', 'with', 'this', 'that', 'have', 'from', 'they', 'will', 'when', 'long', 'take', 'come', 'available'].includes(w))
    .sort().join(' ');
  const seen = new Set(authored.map((f) => key(f.q)));
  const merged = [...authored];
  for (const f of faqs) {
    const k = key(f.q);
    if (seen.has(k)) continue;
    seen.add(k);
    merged.push(f);
  }
  return merged;
}
