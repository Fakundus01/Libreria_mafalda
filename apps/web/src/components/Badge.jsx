function Badge({ children }) {
  return (
    <span className="inline-flex rounded-full bg-emerald-900/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-900">
      {children}
    </span>
  );
}

export default Badge;
