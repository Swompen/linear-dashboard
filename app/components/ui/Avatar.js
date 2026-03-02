export default function Avatar({ name, size = "md", className = "" }) {
  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const sizes = {
    sm: "w-6 h-6 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-10 h-10 text-base",
  };

  return (
    <div
      className={`
        ${sizes[size]} rounded-full bg-gradient-to-br from-blue-500 to-purple-600
        flex items-center justify-center font-semibold text-white
        shadow-lg border-2 border-gray-700/50
        ${className}
      `}
      title={name || "Unknown"}
    >
      {getInitials(name)}
    </div>
  );
}
