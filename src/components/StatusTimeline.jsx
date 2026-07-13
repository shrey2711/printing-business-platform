// Visual progress bar for an order's status (customer-facing).
const STEPS = [
  { key: 'submitted', label: 'Submitted' },
  { key: 'paid', label: 'Paid' },
  { key: 'in_production', label: 'In production' },
  { key: 'shipped', label: 'Shipped' }
];

export default function StatusTimeline({ status }) {
  if (status === 'cancelled') {
    return <div className="timeline-cancelled">This order was cancelled.</div>;
  }
  const current = Math.max(0, STEPS.findIndex((s) => s.key === status));
  return (
    <div className="timeline">
      {STEPS.map((step, i) => (
        <div className={`tl-step ${i <= current ? 'tl-done' : ''} ${i === current ? 'tl-current' : ''}`} key={step.key}>
          <span className="tl-dot">{i < current ? '✓' : i + 1}</span>
          <span className="tl-label">{step.label}</span>
          {i < STEPS.length - 1 && <span className="tl-bar" />}
        </div>
      ))}
    </div>
  );
}
