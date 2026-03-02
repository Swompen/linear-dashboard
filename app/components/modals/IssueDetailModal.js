import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Edit2, X, Save, RotateCcw, Eye, EyeOff } from "lucide-react";
import Dialog from "../ui/Dialog";
import Button from "../ui/Button";
import Badge from "../ui/Badge";

function extractMediaUrls(text) {
  if (!text) return { images: [], videos: [] };
  const urlRegex = /(https?:\/\/[^\s\)]+)/g;
  const urls = text.match(urlRegex) || [];
  const images = urls.filter(
    (url) =>
      /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url) ||
      (url.includes("discord.com") &&
        (url.includes("/attachments/") || url.includes("/cdn.discordapp.com")))
  );
  const videos = urls.filter(
    (url) =>
      /youtube\.com\/watch|youtu\.be|discord\.com.*\.(mp4|webm|mov)(\?.*)?$/i.test(url)
  );
  return { images, videos };
}

function parseChangeHistory(comments) {
  if (!comments || !comments.nodes) return [];
  return comments.nodes
    .filter((comment) => comment.body && comment.body.startsWith("[Staff Edit]"))
    .map((comment) => {
      const lines = comment.body.split("\n");
      const editorMatch = lines.find((l) => l.startsWith("Editor:"));
      const timestampMatch = lines.find((l) => l.startsWith("Timestamp:"));
      const fieldsMatch = lines.find((l) => l.startsWith("Changed fields:"));

      let editor = "Unknown";
      if (editorMatch) {
        const editorLine = editorMatch.replace("Editor: ", "").trim();
        const parenMatch = editorLine.match(/\(([^)]+)\)/);
        if (parenMatch) {
          editor = parenMatch[1];
        } else {
          editor = editorLine;
        }
      }

      return {
        id: comment.id,
        editor: editor,
        timestamp: timestampMatch ? timestampMatch.replace("Timestamp: ", "") : comment.createdAt,
        fields: fieldsMatch ? fieldsMatch.replace("Changed fields: ", "").split(", ") : [],
        createdAt: comment.createdAt,
      };
    })
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

const insertMarkdown = (syntax, placeholder = "", textarea, currentValue, setValue) => {
  if (!textarea) return;

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selectedText = currentValue.substring(start, end);
  const before = currentValue.substring(0, start);
  const after = currentValue.substring(end);

  let insertText = "";
  if (selectedText) {
    insertText = syntax.replace("{text}", selectedText);
  } else {
    insertText = syntax.replace("{text}", placeholder);
  }

  const newText = before + insertText + after;
  setValue(newText);

  setTimeout(() => {
    const newPos = start + insertText.length;
    textarea.setSelectionRange(newPos, newPos);
    textarea.focus();
  }, 0);
};

export default function IssueDetailModal({
  isOpen,
  onClose,
  issue,
  isStaff,
  onSave,
  availableLabels = [],
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editLabelIds, setEditLabelIds] = useState([]);
  const [showDescriptionPreview, setShowDescriptionPreview] = useState(true);
  const [showLabelsDropdown, setShowLabelsDropdown] = useState(false);

  useEffect(() => {
    if (issue) {
      setEditTitle(issue.title || "");
      setEditDescription(issue.description || "");
      setEditLabelIds(issue.labels?.nodes?.map((l) => l.id) || []);
    }
  }, [issue]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLabelsDropdown && !event.target.closest(".labels-dropdown-container")) {
        setShowLabelsDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showLabelsDropdown]);

  if (!issue) return null;

  const hasChanges =
    editTitle !== issue.title ||
    editDescription !== issue.description ||
    JSON.stringify(editLabelIds.sort()) !==
      JSON.stringify((issue.labels?.nodes?.map((l) => l.id) || []).sort());

  const handleSave = async () => {
    if (!hasChanges) {
      alert("Inga ändringar att spara.");
      return;
    }

    if (!confirm("Är du säker på att du vill spara ändringarna?")) {
      return;
    }

    await onSave({
      id: issue.id,
      title: editTitle,
      description: editDescription,
      labelIds: editLabelIds,
    });

    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditTitle(issue.title || "");
    setEditDescription(issue.description || "");
    setEditLabelIds(issue.labels?.nodes?.map((l) => l.id) || []);
  };

  const { images, videos } = extractMediaUrls(editDescription || issue.description || "");

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl" showCloseButton={false}>
      <div className="p-6 space-y-6">
        {/* Header Actions */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-2xl font-bold text-gray-100">Ticket Detaljer</h2>
          <div className="flex gap-2 flex-wrap">
            {isStaff && !isEditing && (
              <Button variant="primary" size="sm" onClick={() => setIsEditing(true)}>
                <Edit2 size={16} className="mr-2" />
                <span className="hidden sm:inline">Redigera</span>
              </Button>
            )}
            {isEditing && (
              <>
                <Button variant="secondary" size="sm" onClick={handleCancel}>
                  <RotateCcw size={16} className="mr-2" />
                  <span className="hidden sm:inline">Avbryt</span>
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={handleSave}
                  disabled={!hasChanges}
                >
                  <Save size={16} className="mr-2" />
                  <span className="hidden sm:inline">Spara</span>
                </Button>
              </>
            )}
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X size={16} />
            </Button>
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Titel {isStaff && <span className="text-xs text-blue-400">(Redigerbar)</span>}
          </label>
          {isEditing && isStaff ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-[#0f0f12] text-gray-100 border-2 border-blue-500/50 focus:border-blue-500 focus:outline-none transition"
              style={{ color: '#e5e7eb' }}
            />
          ) : (
            <div className="p-3 rounded-lg bg-[#0f0f12] text-gray-100 border border-gray-800/50">
              {issue.title}
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Beskrivning{" "}
            {isStaff && <span className="text-xs text-blue-400">(Redigerbar - Markdown)</span>}
          </label>
          {isEditing && isStaff ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2 mb-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowDescriptionPreview(!showDescriptionPreview)}
                >
                  {showDescriptionPreview ? <EyeOff size={16} /> : <Eye size={16} />}
                  <span className="ml-2">
                    {showDescriptionPreview ? "Visa Redigering" : "Visa Förhandsgranskning"}
                  </span>
                </Button>
                {!showDescriptionPreview && (
                  <>
                    {[
                      { syntax: "**{text}**", label: "B", title: "Fet text" },
                      { syntax: "*{text}*", label: "I", title: "Kursiv text" },
                      { syntax: "`{text}`", label: "</>", title: "Kod" },
                      { syntax: "[{text}](url)", label: "Link", title: "Länk" },
                      { syntax: "- {text}", label: "•", title: "Punktlista" },
                      { syntax: "1. {text}", label: "1.", title: "Nummerlista" },
                      { syntax: "> {text}", label: '"', title: "Citat" },
                      { syntax: "# {text}", label: "H", title: "Rubrik" },
                    ].map((btn) => (
                      <Button
                        key={btn.label}
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const textarea = document.querySelector('textarea[placeholder*="Beskrivning"]');
                          insertMarkdown(btn.syntax, btn.title, textarea, editDescription, setEditDescription);
                        }}
                        title={btn.title}
                      >
                        {btn.label}
                      </Button>
                    ))}
                  </>
                )}
              </div>
              {showDescriptionPreview ? (
                <div className="p-4 rounded-lg bg-[#0f0f12] border border-gray-800/50 min-h-[200px] prose prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{editDescription}</ReactMarkdown>
                  {images.map((url, idx) => (
                    <div key={idx} className="my-4">
                      <img src={url} alt={`Attachment ${idx + 1}`} className="max-w-full rounded-lg" />
                    </div>
                  ))}
                  {videos.map((url, idx) => {
                    let embedUrl = url;
                    if (url.includes("youtube.com/watch")) {
                      const videoId = url.match(/[?&]v=([^&]+)/)?.[1];
                      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                    } else if (url.includes("youtu.be/")) {
                      const videoId = url.match(/youtu\.be\/([^?]+)/)?.[1];
                      embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                    }
                    return (
                      <div key={idx} className="my-4">
                        {embedUrl.includes("youtube.com/embed") ? (
                          <iframe
                            src={embedUrl}
                            className="w-full aspect-video rounded-lg"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <video src={url} controls className="max-w-full rounded-lg" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full p-3 rounded-lg bg-[#0f0f12] text-gray-100 border-2 border-blue-500/50 focus:border-blue-500 focus:outline-none min-h-[200px] font-mono text-sm transition placeholder:text-gray-500"
                  placeholder="Beskrivning (Markdown stöds)"
                  style={{ color: '#e5e7eb' }}
                />
              )}
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-[#0f0f12] border border-gray-800/50 min-h-[100px] prose prose-invert max-w-none text-gray-100">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{issue.description || "Ingen beskrivning"}</ReactMarkdown>
              {images.map((url, idx) => (
                <div key={idx} className="my-4">
                  <img src={url} alt={`Attachment ${idx + 1}`} className="max-w-full rounded-lg" />
                </div>
              ))}
              {videos.map((url, idx) => {
                let embedUrl = url;
                if (url.includes("youtube.com/watch")) {
                  const videoId = url.match(/[?&]v=([^&]+)/)?.[1];
                  embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                } else if (url.includes("youtu.be/")) {
                  const videoId = url.match(/youtu\.be\/([^?]+)/)?.[1];
                  embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : url;
                }
                return (
                  <div key={idx} className="my-4">
                    {embedUrl.includes("youtube.com/embed") ? (
                      <iframe
                        src={embedUrl}
                        className="w-full aspect-video rounded-lg"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <video src={url} controls className="max-w-full rounded-lg" />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Labels */}
        <div>
          <label className="block text-sm font-semibold text-gray-400 mb-2">
            Etiketter {isStaff && <span className="text-xs text-blue-400">(Redigerbar)</span>}
          </label>
          {isEditing && isStaff ? (
            <div className="relative labels-dropdown-container">
              <Button
                variant="secondary"
                onClick={() => setShowLabelsDropdown(!showLabelsDropdown)}
                className="w-full justify-between"
              >
                <span>
                  {editLabelIds.length > 0
                    ? `${editLabelIds.length} etikett${editLabelIds.length > 1 ? "er" : ""} valda`
                    : "Välj etiketter"}
                </span>
                <span>{showLabelsDropdown ? "▲" : "▼"}</span>
              </Button>
              {showLabelsDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-[#1a1a1f] border border-gray-800/50 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {availableLabels.map((label) => (
                    <label
                      key={label.id}
                      className="flex items-center gap-2 cursor-pointer p-3 hover:bg-[#0f0f12] border-b border-gray-800/50 last:border-b-0"
                    >
                      <input
                        type="checkbox"
                        checked={editLabelIds.includes(label.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setEditLabelIds([...editLabelIds, label.id]);
                          } else {
                            setEditLabelIds(editLabelIds.filter((id) => id !== label.id));
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-gray-300">{label.name}</span>
                    </label>
                  ))}
                  {availableLabels.length === 0 && (
                    <div className="p-3 text-gray-500 text-sm">Inga etiketter tillgängliga</div>
                  )}
                </div>
              )}
              {editLabelIds.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {editLabelIds.map((labelId) => {
                    const label = availableLabels.find((l) => l.id === labelId);
                    return label ? (
                      <Badge key={labelId} variant="blue" className="flex items-center gap-1">
                        {label.name}
                        <button
                          type="button"
                          onClick={() => setEditLabelIds(editLabelIds.filter((id) => id !== labelId))}
                          className="hover:text-blue-300"
                        >
                          <X size={12} />
                        </button>
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {issue.labels?.nodes?.length > 0 ? (
                issue.labels.nodes.map((label) => (
                  <Badge key={label.id} variant="blue">
                    {label.name}
                  </Badge>
                ))
              ) : (
                <span className="text-gray-500 text-sm">Inga etiketter</span>
              )}
            </div>
          )}
        </div>

        {/* Read-only fields */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Status <span className="text-xs text-gray-500">🔒 (Endast utvecklare)</span>
            </label>
            <div className="p-3 rounded-lg bg-[#0f0f12] text-gray-400 border border-gray-800/50 opacity-75">
              {issue.state?.name || "Okänd"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Prioritet <span className="text-xs text-gray-500">🔒 (Endast utvecklare)</span>
            </label>
            <div className="p-3 rounded-lg bg-[#0f0f12] text-gray-400 border border-gray-800/50 opacity-75">
              {issue.priority === 1 ? "Hög" : issue.priority === 2 ? "Medel" : "Låg"}
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">Skapad</label>
            <div className="p-3 rounded-lg bg-[#0f0f12] text-gray-400 border border-gray-800/50">
              {new Date(issue.createdAt).toLocaleString("sv-SE")}
            </div>
          </div>
        </div>

        {/* Change History */}
        {isStaff && issue.comments && (
          <div>
            <label className="block text-sm font-semibold text-gray-400 mb-2">
              Ändringshistorik (Staff Redigeringar)
            </label>
            <div className="space-y-2">
              {parseChangeHistory(issue.comments).length > 0 ? (
                parseChangeHistory(issue.comments).map((change) => (
                  <div
                    key={change.id}
                    className="p-3 rounded-lg bg-[#0f0f12] border border-gray-800/50 text-sm"
                  >
                    <div className="text-gray-300">
                      <span className="font-semibold">Redigerad av:</span> {change.editor}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      {new Date(change.timestamp).toLocaleString("sv-SE")}
                    </div>
                    <div className="text-gray-400 text-xs mt-1">
                      <span className="font-semibold">Ändrade fält:</span> {change.fields.join(", ")}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3 rounded-lg bg-[#0f0f12] border border-gray-800/50 text-sm text-gray-500">
                  Ingen ändringshistorik
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </Dialog>
  );
}
