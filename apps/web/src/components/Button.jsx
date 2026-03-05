function Button({ as: Component = 'button', className = '', children, ...props }) {
  return (
    <Component
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
}

export default Button;
