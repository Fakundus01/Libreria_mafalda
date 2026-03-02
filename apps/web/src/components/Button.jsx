function Button({ as: Component = 'a', className = '', children, ...props }) {
  return (
    <Component
      className={`inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition hover:-translate-y-0.5 hover:shadow-lg ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
