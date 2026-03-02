import { useState, useEffect } from "react";
import { Plus, X } from "lucide-react";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

export default function NewIssueModal({
  isOpen,
  onClose,
  onSubmit,
  onDuplicateSearch,
  duplicateResults = [],
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [steps, setSteps] = useState("");
  const [priority, setPriority] = useState("Medium");

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setTitle("");
      setDescription("");
      setImageUrl("");
      setSteps("");
      setPriority("Medium");
    }
  }, [isOpen]);

  useEffect(() => {
    if (title && title.length >= 3) {
      const timeout = setTimeout(() => {
        onDuplicateSearch?.(title);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [title, onDuplicateSearch]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim(),
      steps: steps.trim(),
      priority,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setImageUrl("");
    setSteps("");
    setPriority("Medium");
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="Ny Backlog Ticket" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
        {/* Title */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-semibold text-gray-400">Titel *</label>
          <input
            type="text"
            placeholder="Titel"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 rounded-lg bg-[#0f0f12] text-gray-100 border-2 border-gray-800/50 focus:border-blue-500 focus:outline-none transition"
            required
          />
          {duplicateResults.length > 0 && (
            <div className="bg-yellow-900/30 border border-yellow-700/50 rounded-lg p-3 text-sm mt-2">
              <div className="font-semibold text-yellow-400 mb-2">Möjliga dubbletter:</div>
              <ul className="list-disc list-inside text-yellow-300 space-y-1">
                {duplicateResults.slice(0, 3).map((dup) => (
                  <li key={dup.id}>
                    {dup.title} ({dup.state?.name})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-semibold text-gray-400">Beskrivning</label>
          <textarea
            placeholder="Beskrivning"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-3 rounded-lg bg-[#0f0f12] text-gray-100 border-2 border-gray-800/50 focus:border-blue-500 focus:outline-none transition min-h-[100px] resize-y"
          />
        </div>

        {/* Priority */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-semibold text-gray-400">Prioritet</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="p-3 rounded-lg bg-[#0f0f12] text-gray-100 border-2 border-gray-800/50 focus:border-blue-500 focus:outline-none transition"
          >
            <option value="Low">Låg prioritet</option>
            <option value="Medium">Medel prioritet</option>
            <option value="High">Hög prioritet</option>
          </select>
        </div>

        {/* Image URL */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-semibold text-gray-400">
            URL till bild eller video (valfritt)
          </label>
          <input
            type="text"
            placeholder="https://..."
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="p-3 rounded-lg bg-[#0f0f12] text-gray-100 border-2 border-gray-800/50 focus:border-blue-500 focus:outline-none transition"
          />
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-2">
          <label className="block text-sm font-semibold text-gray-400">
            Steg för att reproducera (valfritt)
          </label>
          <textarea
            placeholder="Steg för att reproducera"
            value={steps}
            onChange={(e) => setSteps(e.target.value)}
            className="p-3 rounded-lg bg-[#0f0f12] text-gray-100 border-2 border-gray-800/50 focus:border-blue-500 focus:outline-none transition min-h-[80px] resize-y"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pt-4 border-t border-gray-800/50">
          <Button type="button" variant="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button type="submit" variant="primary">
            <Plus size={16} className="mr-2" />
            Skapa ticket
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
