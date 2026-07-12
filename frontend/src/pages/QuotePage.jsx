export default function QuotePage() {
  return (
    <main>
      <h2>Request a Quote</h2>
      <form>
        <input placeholder="Your name" style={{ display: 'block', marginBottom: '0.75rem', padding: '0.6rem', width: '100%' }} />
        <input placeholder="Email" style={{ display: 'block', marginBottom: '0.75rem', padding: '0.6rem', width: '100%' }} />
        <textarea placeholder="Describe your print job" style={{ display: 'block', marginBottom: '0.75rem', padding: '0.6rem', width: '100%', minHeight: '120px' }} />
        <button type="submit">Submit</button>
      </form>
    </main>
  );
}
