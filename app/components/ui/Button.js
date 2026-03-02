export default function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  disabled = false,
  type = "button",
  className = "",
}) {
  const variants = {
    primary: "bg-blue-600/90 hover:bg-blue-600 text-white",
    secondary: "bg-gray-700/80 hover:bg-gray-700 text-white",
    success: "bg-green-600/90 hover:bg-green-600 text-white",
    danger: "bg-red-600/90 hover:bg-red-600 text-white",
    ghost: "bg-transparent hover:bg-gray-800/50 text-gray-300 hover:text-white",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-4 py-2 text-sm",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`
        font-medium rounded-lg transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-gray-900
        flex items-center justify-center whitespace-nowrap
        ${variants[variant]} ${sizes[size]} ${className}
      `}
    >
      {children}
    </button>
  );
}
