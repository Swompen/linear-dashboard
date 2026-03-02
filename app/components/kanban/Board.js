import Column from "./Column";

const STATUS_ORDER = ["Backlog", "In Progress", "Done"];

const STATUS_CONFIG = {
  Backlog: { color: "blue", dotColor: "bg-blue-500", textColor: "text-blue-400" },
  "In Progress": { color: "yellow", dotColor: "bg-yellow-500", textColor: "text-yellow-400" },
  Done: { color: "green", dotColor: "bg-green-500", textColor: "text-green-400" },
};

export default function Board({ issues = [], onCardClick }) {
  // Group issues by status
  const grouped = STATUS_ORDER.reduce((acc, status) => {
    acc[status] = [];
    return acc;
  }, {});

  issues.forEach((issue) => {
    const status = issue.state?.name || "Backlog";
    if (grouped[status]) {
      grouped[status].push(issue);
    } else {
      grouped["Backlog"].push(issue);
    }
  });

  return (
    <div className="flex flex-wrap lg:flex-nowrap gap-4 overflow-x-auto pb-6 px-2 custom-scrollbar snap-x snap-mandatory">
      {STATUS_ORDER.map((status) => (
        <div key={status} className="snap-start flex-shrink-0 w-full lg:w-auto">
          <Column
            status={status}
            issues={grouped[status] || []}
            onCardClick={onCardClick}
            statusConfig={STATUS_CONFIG}
          />
        </div>
      ))}
    </div>
  );
}
