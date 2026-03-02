import { useEffect, useState, useCallback } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useTranslation } from "react-i18next";
import Board from "../components/kanban/Board";
import Navbar from "../components/layout/Navbar";
import IssueDetailModal from "../components/modals/IssueDetailModal";
import NewIssueModal from "../components/modals/NewIssueModal";
import Button from "../components/ui/Button";
import LanguageSwitcher from "../components/ui/LanguageSwitcher";

// Parse staff role IDs from environment variable (comma-separated)
const STAFF_ROLE_IDS = (process.env.NEXT_PUBLIC_DISCORD_STAFF_ROLE_IDS || "").split(",").filter(Boolean);

const DEBUG_MODE =
  process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_DEBUG_MODE === "true";

export default function Home() {
  const { t } = useTranslation();
  const { data: session, status } = useSession();

  const effectiveSession = DEBUG_MODE
    ? { user: { name: "Dev User", id: "dev-user-123", roles: STAFF_ROLE_IDS } }
    : session;
  const effectiveStatus = DEBUG_MODE ? "authenticated" : status;

  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewIssueModal, setShowNewIssueModal] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [availableLabels, setAvailableLabels] = useState([]);
  const [duplicateResults, setDuplicateResults] = useState([]);
  const [duplicateSearchTimeout, setDuplicateSearchTimeout] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const isStaff =
    DEBUG_MODE ||
    effectiveSession?.user?.roles?.some((role) => STAFF_ROLE_IDS.includes(role)) ||
    false;

  // Debug logging
  useEffect(() => {
  }, [isStaff, effectiveSession]);

  // Fetch issues
  useEffect(() => {

    const timeoutId = setTimeout(() => {
      setLoading(false);
    }, 10000);

    fetch("/api/issues")
      .then(async (res) => {
        clearTimeout(timeoutId);

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || `HTTP error! status: ${res.status} ${res.statusText}`);
        }

        return data;
      })
      .then((data) => {

        let fetchedIssues = [];
        if (data.data && data.data.issues && data.data.issues.nodes) {
          fetchedIssues = data.data.issues.nodes;
        } else if (data.issues && data.issues.nodes) {
          fetchedIssues = data.issues.nodes;
        } else if (Array.isArray(data)) {
          fetchedIssues = data;
        } else if (data.errors) {
          fetchedIssues = [];
        } else {
          fetchedIssues = [];
        }


        if (!isStaff) {
          fetchedIssues = fetchedIssues.filter((issue) => {
            const hasBuggLabel = issue.labels?.nodes?.some((label) => label.name === "Bugg");
            return hasBuggLabel;
          });
        } else {
        }

        setIssues(fetchedIssues);
        setLoading(false);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        setIssues([]);
        setLoading(false);
      });

    return () => clearTimeout(timeoutId);
  }, [isStaff]);

  // Fetch available labels
  useEffect(() => {
    if (isStaff) {
      fetch("/api/issues?labels=true")
        .then((res) => res.json())
        .then((data) => {
          setAvailableLabels(data || []);
        })
    }
  }, [isStaff]);

  // Handle opening ticket detail modal
  async function handleOpenDetail(issueId) {
    const res = await fetch(`/api/issues?id=${issueId}`);
    if (res.ok) {
      const issue = await res.json();
      setSelectedIssue(issue);
      setShowDetailModal(true);
    }
  }

  // Handle saving edits
  async function handleSaveEdits(updates) {
    if (!selectedIssue) return;

    const res = await fetch("/api/issues", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (res.ok) {
      const updatedIssue = await res.json();
      setSelectedIssue(updatedIssue);

      // Refresh issues list
      fetch("/api/issues")
        .then((res) => res.json())
        .then((data) => {
          let fetchedIssues = data.data.issues.nodes;
          if (!isStaff) {
            fetchedIssues = fetchedIssues.filter((issue) => {
              return issue.labels?.nodes?.some((label) => label.name === "Bugg");
            });
          }
          setIssues(fetchedIssues);
        });

      // Refresh detail view
      const detailRes = await fetch(`/api/issues?id=${selectedIssue.id}`);
      if (detailRes.ok) {
        const refreshedIssue = await detailRes.json();
        setSelectedIssue(refreshedIssue);
      }
    } else {
      alert(t('errors.save_failed'));
    }
  }

  // Handle duplicate search
  const handleDuplicateSearch = useCallback((title) => {
    if (duplicateSearchTimeout) {
      clearTimeout(duplicateSearchTimeout);
    }

    if (!title || title.length < 3) {
      setDuplicateResults([]);
      return;
    }

    const timeout = setTimeout(() => {
      fetch(`/api/issues?search=${encodeURIComponent(title)}`)
        .then((res) => res.json())
        .then((data) => {
          setDuplicateResults(data || []);
        })
        .catch((err) => {
          setDuplicateResults([]);
        });
    }, 500);

    setDuplicateSearchTimeout(timeout);
  }, [duplicateSearchTimeout]);

  // Handle adding new ticket
  async function handleAddTicket(formData) {
    const res = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: formData.title,
        description: formData.description,
        assignee: formData.assignee,
        imageUrl: formData.imageUrl,
        steps: formData.steps,
        priority: formData.priority,
      }),
    });

    if (res.ok) {
      setShowNewIssueModal(false);
      setDuplicateResults([]);
      if (duplicateSearchTimeout) {
        clearTimeout(duplicateSearchTimeout);
        setDuplicateSearchTimeout(null);
      }
      // Refetch issues
      setLoading(true);
      fetch("/api/issues")
        .then((res) => res.json())
        .then((data) => {
          let fetchedIssues = data.data.issues.nodes;
          if (!isStaff) {
            fetchedIssues = fetchedIssues.filter((issue) => {
              return issue.labels?.nodes?.some((label) => label.name === "Bugg");
            });
          }
          setIssues(fetchedIssues);
          setLoading(false);
        });
    } else {
      alert(t('errors.create_failed'));
    }
  }

  // Filter issues based on search query
  const filteredIssues = searchQuery.trim()
    ? issues.filter((issue) => {
        const query = searchQuery.toLowerCase();
        const title = (issue.title || "").toLowerCase();
        const description = (issue.description || "").toLowerCase();
        return title.includes(query) || description.includes(query);
      })
    : issues;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f12]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">{t('loading.text')}</p>
        </div>
      </div>
    );
  }

  // Unauthenticated state
  if (effectiveStatus === "unauthenticated") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0f0f12] via-[#1a1a1f] to-[#0f0f12]">
        <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-8">
          {t('app.title')}
        </h1>
        <Button variant="primary" size="lg" onClick={() => signIn("discord")}>
          {t('auth.login_button')}
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f12] via-[#1a1a1f] to-[#0f0f12]">
      <Navbar
        user={effectiveSession?.user}
        onSignIn={() => signIn("discord")}
        onSignOut={() => signOut({ callbackUrl: "/", redirect: true })}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isStaff={isStaff}
        onAddNew={() => setShowNewIssueModal(true)}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Language Switcher */}
        <div className="flex justify-end mb-6">
          <LanguageSwitcher />
        </div>

        {/* Search results info */}
        {searchQuery && (
          <div className="mb-6 text-center">
            <p className="text-sm text-gray-400">
              {t('board.showing')} <span className="font-semibold text-gray-300">{filteredIssues.length}</span> {t('board.of')}{" "}
              <span className="font-semibold text-gray-300">{issues.length}</span> {t('board.tasks')}
              <button
                onClick={() => setSearchQuery("")}
                className="ml-2 text-blue-400 hover:text-blue-300 underline transition-colors"
              >
                {t('board.clear_search')}
              </button>
            </p>
          </div>
        )}

        {/* Kanban Board */}
        <Board issues={filteredIssues} onCardClick={handleOpenDetail} />

        {/* New Issue Modal */}
        <NewIssueModal
          isOpen={showNewIssueModal}
          onClose={() => {
            setShowNewIssueModal(false);
            setDuplicateResults([]);
            if (duplicateSearchTimeout) {
              clearTimeout(duplicateSearchTimeout);
              setDuplicateSearchTimeout(null);
            }
          }}
          onSubmit={handleAddTicket}
          onDuplicateSearch={handleDuplicateSearch}
          duplicateResults={duplicateResults}
        />

        {/* Issue Detail Modal */}
        <IssueDetailModal
          isOpen={showDetailModal}
          onClose={() => {
            setShowDetailModal(false);
            setSelectedIssue(null);
          }}
          issue={selectedIssue}
          isStaff={isStaff}
          onSave={handleSaveEdits}
          availableLabels={availableLabels}
        />
      </main>
    </div>
  );
}
