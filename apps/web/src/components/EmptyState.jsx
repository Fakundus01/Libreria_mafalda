import Button from './Button';

function EmptyState({ title, message, actionLabel, actionProps = {} }) {
  const { className = '', ...restActionProps } = actionProps;

  return (
    <div className="rounded-[28px] border border-dashed border-coral/30 bg-white/80 p-8 text-center shadow-[0_20px_60px_rgba(15,23,42,0.05)]">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sun/35 text-2xl">*</div>
      <h2 className="mt-5 font-display text-3xl text-ink">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm text-ink/65">{message}</p>
      {actionLabel ? (
        <Button className={`mt-6 bg-ink text-white ${className}`} {...restActionProps}>
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}

export default EmptyState;
