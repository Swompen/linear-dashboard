import { X } from "lucide-react";

export default function Dialog({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-4xl",
  showCloseButton = true,
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`
          bg-[#1a1a1f] rounded-xl shadow-2xl w-full ${maxWidth} max-h-[90vh] 
          overflow-hidden border border-gray-800/50
          transition-all duration-200 ease-out
          flex flex-col
        `}
        onClick={(e) => e.stopPropagation()}
        style={{
          animation: "modalEnter 0.2s ease-out",
        }}
      >
        {title && (
          <div className="sticky top-0 bg-[#1a1a1f] border-b border-gray-800/50 p-6 flex items-center justify-between z-10">
            <h2 className="text-2xl font-bold text-gray-100">{title}</h2>
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-800/50"
                aria-label="Close"
              >
                <X size={24} />
              </button>
            )}
          </div>
        )}
        {!title && showCloseButton && (
          <div className="sticky top-0 bg-[#1a1a1f] border-b border-gray-800/50 p-4 flex items-center justify-end z-10">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors p-1 rounded-lg hover:bg-gray-800/50"
              aria-label="Close"
            >
              <X size={24} />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
}
