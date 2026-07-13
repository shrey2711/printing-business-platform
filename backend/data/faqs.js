// Generate useful, unique FAQs for each product from its own data
// (sizes, materials, finishing, turnaround). Used on the product page and
// prerendered as FAQPage structured data.
export function getProductFaqs(product) {
  const p = product.pricing;
  const name = product.name;
  const lower = name.toLowerCase();
  const faqs = [];

  // Sizes
  if (p.model === 'area') {
    faqs.push({
      q: `What sizes are available for ${lower}?`,
      a: `We print ${lower} in custom sizes from ${p.minWidthIn}"×${p.minHeightIn}" up to ${p.maxWidthIn}"×${p.maxHeightIn}". Enter your exact width and height on the product page to see instant pricing.`
    });
  } else if (p.variants?.length) {
    faqs.push({
      q: `What sizes does the ${lower} come in?`,
      a: `Available sizes: ${p.variants.map((v) => v.name).join(', ')}. Choose your size on the product page to see the price.`
    });
  }

  // Materials
  if (p.materials?.length > 1) {
    faqs.push({
      q: `What material options do you offer for ${lower}?`,
      a: `You can choose from ${p.materials.map((m) => m.name).join(', ')}.`
    });
  }

  // Turnaround + shipping
  faqs.push({
    q: `How fast is production and shipping?`,
    a: `${product.turnaround}. We ship nationwide to all 50 states, and free shipping applies to orders over $99.`
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

  // Artwork / files
  faqs.push({
    q: `What artwork file formats do you accept?`,
    a: `We accept print-ready PDF, AI, EPS, and high-resolution PNG or JPG files. No design yet? Create one free in our online Design Studio, or upload your file and we'll check it at no charge.`
  });

  // Bulk / wholesale discounts
  faqs.push({
    q: `Do you offer bulk or wholesale discounts on ${lower}?`,
    a: `Yes. Pricing is wholesale with automatic volume discounts — the more you order, the lower the per-piece price. The discount is applied instantly as you increase the quantity.`
  });

  return faqs;
}
