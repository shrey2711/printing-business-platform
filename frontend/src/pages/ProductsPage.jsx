const products = [
  { name: 'Business Cards', description: 'Premium business cards with fast turnaround.' },
  { name: 'Posters', description: 'High-quality posters for promotions and events.' },
  { name: 'Banners', description: 'Durable banners for retail and exhibitions.' },
  { name: 'Stickers', description: 'Custom labels and stickers for branding.' }
];

export default function ProductsPage() {
  return (
    <main>
      <h2>Popular Products</h2>
      {products.map((product) => (
        <div className="card" key={product.name}>
          <h3>{product.name}</h3>
          <p>{product.description}</p>
        </div>
      ))}
    </main>
  );
}
