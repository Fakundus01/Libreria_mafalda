function PageLoader({ title = 'Cargando', message = 'Estamos preparando la pantalla.' }) {
  return (
    <div className="rounded-[28px] border border-white/70 bg-white/85 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto h-14 w-14 animate-spin rounded-full border-4 border-coral/20 border-t-coral" />
      <h2 className="mt-5 font-display text-3xl text-ink">{title}</h2>
      <p className="mt-2 text-sm text-ink/65">{message}</p>
    </div>
  );
}

export default PageLoader;
