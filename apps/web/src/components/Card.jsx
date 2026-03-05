function Card({ children, className = '' }) {
  const hasCustomBackground = /\bbg-/.test(className);
  const baseBackground = hasCustomBackground ? '' : 'bg-white/90';

  return <article className={`rounded-[28px] border border-white/70 ${baseBackground} p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur ${className}`}>{children}</article>;
}

export default Card;
