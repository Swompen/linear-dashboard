import fetch from "node-fetch";
import { getServerSession } from "next-auth/next";
import { authOptions } from "./auth/[...nextauth]";

const LINEAR_API_URL = "https://api.linear.app/graphql";
const LINEAR_HEADERS = {
  "Content-Type": "application/json",
  "Authorization": process.env.LINEAR_API_KEY,
};

async function linearRequest(query, variables = {}) {
  try {
    if (!LINEAR_HEADERS.Authorization) {
      throw new Error("LINEAR_API_KEY is not set in environment variables");
    }

    const response = await fetch(LINEAR_API_URL, {
      method: "POST",
      headers: LINEAR_HEADERS,
      body: JSON.stringify({ query, variables }),
    });

    if (!response.ok) {
      throw new Error(`Linear API returned status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
}

export default async function handler(req, res) {
  // Check if Linear API key is configured
  if (!process.env.LINEAR_API_KEY) {
    return res.status(500).json({
      error: "Server configuration error",
      message: "LINEAR_API_KEY environment variable is not set"
    });
  }

  if (req.method === "POST") {
    // Create a new issue in Linear
    const { title, description, assignee, imageUrl, steps, priority } = req.body;

    const teamId = process.env.LINEAR_TEAM_ID;

    const mutation = `
      mutation CreateIssue($input: IssueCreateInput!) {
        issueCreate(input: $input) {
          issue {
            id
            title
            state { name }
            assignee { name }
            createdAt
            description
            priority
            labels {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    `;

    const input = {
      title,
      description: [
        description,
        imageUrl ? `\n\n**Bild/Video:** ${imageUrl}` : "",
        steps ? `\n\n**Steg för att reproducera:**\n${steps}` : "",
      ].filter(Boolean).join(""),
      teamId,
      priority: priority === "High" ? 1 : priority === "Medium" ? 2 : 3,
      assigneeId: assignee ? assignee : undefined,
    };

    const data = await linearRequest(mutation, { input });
    if (data.errors) {
      return res.status(400).json({ error: data.errors });
    }
    return res.status(200).json(data.data.issueCreate.issue);
  }

  if (req.method === "PATCH") {
    // Update an issue (staff can only edit title, description, labels)
    const { id, title, description, labelIds } = req.body;

    if (!id) {
      return res.status(400).json({ error: "Issue ID is required" });
    }

    // Get session for change tracking (bypass in dev mode)
    const isDev = process.env.NODE_ENV === 'development';
    let session;
    let editorInfo;

    if (isDev) {
      // In dev mode, use a dev user identifier
      session = { user: { id: "dev-user", name: "Dev User" } };
      editorInfo = "Dev User (Development Mode)";
    } else {
      session = await getServerSession(req, res, authOptions);
      const userName = session?.user?.name || "Unknown User";
      editorInfo = userName;
    }

    // Build update input (only allow title, description, labelIds)
    const updateInput = {};
    if (title !== undefined) updateInput.title = title;
    if (description !== undefined) updateInput.description = description;
    if (labelIds !== undefined) updateInput.labelIds = labelIds;

    const mutation = `
      mutation UpdateIssue($id: String!, $input: IssueUpdateInput!) {
        issueUpdate(id: $id, input: $input) {
          issue {
            id
            title
            description
            state { name }
            assignee { name }
            createdAt
            updatedAt
            priority
            labels {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    `;

    const data = await linearRequest(mutation, { id, input: updateInput });
    if (data.errors) {
      return res.status(400).json({ error: data.errors });
    }

    // Track changes in a Linear comment
    const changes = [];
    if (title !== undefined) changes.push("title");
    if (description !== undefined) changes.push("description");
    if (labelIds !== undefined) changes.push("labels");

    if (changes.length > 0) {
      const commentBody = `[Staff Edit]\n\nEditor: ${editorInfo}\nTimestamp: ${new Date().toISOString()}\nChanged fields: ${changes.join(", ")}`;

      const commentMutation = `
        mutation CreateComment($input: CommentCreateInput!) {
          commentCreate(input: $input) {
            comment {
              id
              body
              createdAt
            }
          }
        }
      `;

      await linearRequest(commentMutation, {
        input: {
          issueId: id,
          body: commentBody,
        },
      });
    }

    return res.status(200).json(data.data.issueUpdate.issue);
  }

  // GET: fetch issues, single issue, search, or labels
  const { id, search, labels } = req.query;

  if (id) {
    // Fetch single issue with full details including comments
    const query = `
      query GetIssue($id: String!) {
        issue(id: $id) {
          id
          title
          description
          state { name }
          assignee { name }
          createdAt
          updatedAt
          priority
          labels {
            nodes {
              id
              name
            }
          }
          comments {
            nodes {
              id
              body
              createdAt
              user {
                name
              }
            }
          }
        }
      }
    `;

    const data = await linearRequest(query, { id });
    if (data.errors) {
      return res.status(400).json({ error: data.errors });
    }
    return res.status(200).json(data.data.issue);
  }

  if (search) {
    // Search for potential duplicates by title similarity
    const query = `
      query SearchIssues($filter: IssueFilter) {
        issues(first: 10, filter: $filter) {
          nodes {
            id
            title
            state { name }
            createdAt
          }
        }
      }
    `;

    const filter = {
      title: { containsIgnoreCase: search },
    };

    const data = await linearRequest(query, { filter });
    if (data.errors) {
      return res.status(400).json({ error: data.errors });
    }
    return res.status(200).json(data.data.issues.nodes);
  }

  if (labels) {
    // Fetch all available team labels
    const teamId = process.env.LINEAR_TEAM_ID;
    const query = `
      query GetTeamLabels($teamId: String!) {
        team(id: $teamId) {
          labels {
            nodes {
              id
              name
              color
            }
          }
        }
      }
    `;

    const data = await linearRequest(query, { teamId });
    if (data.errors) {
      return res.status(400).json({ error: data.errors });
    }
    return res.status(200).json(data.data.team?.labels?.nodes || []);
  }

  // Default: fetch all issues (existing behavior)
  try {
    const query = `
      query {
        issues(first: 250) {
          nodes {
            id
            title
            state { name }
            assignee { name }
            createdAt
            updatedAt
            description
            priority
            labels {
              nodes {
                id
                name
              }
            }
          }
        }
      }
    `;

    const data = await linearRequest(query);

    if (data.errors) {
      return res.status(500).json({ error: "Linear API error", details: data.errors });
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch issues", message: error.message });
  }
}
