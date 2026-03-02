function Card({ children, className = '' }) {
  return <article className={`rounded-2xl border border-stone-200 bg-white p-6 shadow-sm ${className}`}>{children}</article>;
}

export default Card;
