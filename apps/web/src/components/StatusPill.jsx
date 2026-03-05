import { formatStatus } from '../lib/format';

const STYLE_MAP = {
  APPROVED: 'bg-mint/20 text-lagoon',
  PAID: 'bg-mint/20 text-lagoon',
  PREPARING: 'bg-sun/35 text-ink',
  READY: 'bg-sky/20 text-sky-900',
  READY_FOR_PICKUP: 'bg-sky/20 text-sky-900',
  OUT_FOR_DELIVERY: 'bg-sky/20 text-sky-900',
  COMPLETED: 'bg-ink text-white',
  FAILED: 'bg-berry/15 text-berry',
  REJECTED: 'bg-berry/15 text-berry',
  CANCELED: 'bg-stone-200 text-stone-700',
  PENDING: 'bg-stone-200 text-stone-700',
  PENDING_PAYMENT: 'bg-stone-200 text-stone-700',
  RECEIVED: 'bg-sun/35 text-ink',
  IN_PROGRESS: 'bg-coral/15 text-coral',
  DELIVERED: 'bg-mint/20 text-lagoon',
};

function StatusPill({ status }) {
  const key = String(status || '').toUpperCase();
  const classes = STYLE_MAP[key] || 'bg-stone-200 text-stone-700';

  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${classes}`}>
      {formatStatus(key)}
    </span>
  );
}

export default StatusPill;
