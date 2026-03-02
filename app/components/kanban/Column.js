import { Circle } from "lucide-react";
import Card from "./Card";

export default function Column({ status, issues = [], onCardClick, statusConfig }) {
  const config = statusConfig || {
    Backlog: { color: "blue", dotColor: "bg-blue-500", textColor: "text-blue-400" },
    "In Progress": { color: "yellow", dotColor: "bg-yellow-500", textColor: "text-yellow-400" },
    Done: { color: "green", dotColor: "bg-green-500", textColor: "text-green-400" },
  };

  const statusStyle = config[status] || config.Backlog;

  return (
    <div className="flex-shrink-0 w-full sm:w-[320px] lg:w-[360px] bg-[#18181c] rounded-xl border border-gray-800/30 shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[500px] max-h-[calc(100vh-120px)]">
      {/* Header */}
      <div className="sticky top-0 z-10 px-4 py-3 rounded-t-xl bg-[#18181c] border-b border-gray-800/30">
        <div className="flex items-center gap-2.5">
          <Circle size={10} className={`${statusStyle.textColor} fill-current`} />
          <h2 className={`font-semibold text-base ${statusStyle.textColor}`}>{status}</h2>
          <span className="ml-auto px-2 py-0.5 rounded-full bg-gray-800/40 text-gray-400 text-xs font-medium">
            {issues.length}
          </span>
        </div>
      </div>

      {/* Cards container */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
        {issues.length > 0 ? (
          issues.map((issue) => (
            <Card key={issue.id} issue={issue} onClick={() => onCardClick(issue.id)} />
          ))
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500 text-xs">
            Inga tickets
          </div>
        )}
      </div>
    </div>
  );
}
