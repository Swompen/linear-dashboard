import { AlertCircle } from "lucide-react";
import Badge from "../ui/Badge";

export default function Card({ issue, onClick }) {
  const getPriorityLabel = (priority) => {
    if (priority === 1) return "Hög";
    if (priority === 2) return "Medel";
    return "Låg";
  };

  return (
    <div
      onClick={onClick}
      className="
        group bg-[#1f1f24] rounded-lg border border-gray-800/30 p-3
        cursor-pointer transition-all duration-200 ease-out
        hover:bg-[#25252a] hover:border-gray-700/50 
        hover:shadow-lg hover:shadow-black/30
        hover:-translate-y-1
        active:scale-[0.98]
      "
    >
      {/* Title */}
      <div className="mb-2">
        <h3 className="text-gray-100 font-medium text-sm leading-snug line-clamp-2 group-hover:text-white transition-colors">
          {issue.title}
        </h3>
      </div>

      {/* Labels */}
      {issue.labels?.nodes?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {issue.labels.nodes.slice(0, 3).map((label) => (
            <Badge key={label.id} variant="blue" className="text-xs py-0 px-2">
              {label.name}
            </Badge>
          ))}
          {issue.labels.nodes.length > 3 && (
            <Badge variant="default" className="text-xs py-0 px-2">
              +{issue.labels.nodes.length - 3}
            </Badge>
          )}
        </div>
      )}

      {/* Priority */}
      {issue.priority && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-gray-800/30">
          <AlertCircle
            size={12}
            className={
              issue.priority === 1
                ? "text-red-400"
                : issue.priority === 2
                ? "text-yellow-400"
                : "text-green-400"
            }
          />
          <span
            className={
              issue.priority === 1
                ? "text-xs text-red-400 font-medium"
                : issue.priority === 2
                ? "text-xs text-yellow-400 font-medium"
                : "text-xs text-green-400 font-medium"
            }
          >
            {getPriorityLabel(issue.priority)}
          </span>
        </div>
      )}
    </div>
  );
}
