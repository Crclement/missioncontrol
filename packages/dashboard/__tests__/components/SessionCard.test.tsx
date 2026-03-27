import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { SessionCard } from "../../src/components/SessionCard";
import type { EnrichedSession } from "@missioncontrol/shared";

function makeSession(overrides: Partial<EnrichedSession> = {}): EnrichedSession {
  return {
    pid: 12345,
    sessionId: "abc-def-123",
    cwd: "/home/user/my-project",
    startedAt: Date.now(),
    name: "test-session",
    configDir: "/home/user/.claude",
    alive: true,
    conversation: {
      lastUserMessage: "Fix the authentication bug",
      lastAssistantText: "I found the issue in auth.ts",
      lastMessageRole: "assistant",
      needsInput: false,
      messageCount: 4,
    },
    subagents: [],
    workType: "coding",
    creature: " o \n/|\\\n/ \\",
    ...overrides,
  };
}

// Mock Notification API
const mockNotification = vi.fn();
Object.defineProperty(window, "Notification", {
  value: mockNotification,
  writable: true,
});
Object.defineProperty(mockNotification, "permission", {
  value: "granted",
  writable: true,
});

describe("SessionCard", () => {
  const defaultProps = {
    index: 0,
    isFocused: false,
    inputOpen: false,
    onSendResponse: vi.fn(),
  };

  it("renders session name", () => {
    render(<SessionCard session={makeSession()} ref={null} {...defaultProps} />);
    expect(screen.getByText("test-session")).toBeInTheDocument();
  });

  it("renders session ID prefix when no name is provided", () => {
    const session = makeSession({ name: undefined });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText("abc-def-")).toBeInTheDocument();
  });

  it("renders repo name from git info", () => {
    const session = makeSession({
      git: {
        repo: "my-repo",
        branch: "feature/auth",
        remote: "git@github.com:Org/my-repo.git",
        isPersonal: false,
        org: "Org",
      },
    });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText(/my-repo/)).toBeInTheDocument();
    expect(screen.getByText(/feature\/auth/)).toBeInTheDocument();
  });

  it("falls back to cwd directory name when no git info", () => {
    const session = makeSession({ git: undefined });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText(/my-project/)).toBeInTheDocument();
  });

  it("shows the 1-indexed position", () => {
    render(
      <SessionCard session={makeSession()} ref={null} {...defaultProps} index={2} />
    );
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("shows user message in quotes", () => {
    const session = makeSession({
      conversation: {
        lastUserMessage: "Fix the authentication bug",
        lastAssistantText: "",
        lastMessageRole: "user",
        needsInput: false,
        messageCount: 1,
      },
    });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText(/Fix the authentication bug/)).toBeInTheDocument();
  });

  it("does not render message area when no user message", () => {
    const session = makeSession({
      conversation: {
        lastUserMessage: "",
        lastAssistantText: "",
        lastMessageRole: "user",
        needsInput: false,
        messageCount: 0,
      },
    });
    const { container } = render(
      <SessionCard session={session} ref={null} {...defaultProps} />
    );
    const messageAreas = container.querySelectorAll(".line-clamp-2");
    expect(messageAreas.length).toBe(0);
  });

  it("renders subagent list when subagents exist", () => {
    const session = makeSession({
      subagents: [
        { id: "a1", agentType: "coder", description: "Working on auth" },
        { id: "a2", agentType: "reviewer", description: "Reviewing PR" },
      ],
    });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText("coder")).toBeInTheDocument();
    expect(screen.getByText("reviewer")).toBeInTheDocument();
    expect(screen.getByText("Working on auth")).toBeInTheDocument();
  });

  it("renders context meter when token usage exists", () => {
    const session = makeSession({
      conversation: {
        lastUserMessage: "",
        lastAssistantText: "",
        lastMessageRole: "user",
        needsInput: false,
        messageCount: 2,
        tokenUsage: {
          inputTokens: 5000,
          outputTokens: 2000,
          cacheCreationTokens: 0,
          cacheReadTokens: 0,
          totalTokens: 7000,
          estimatedCostUsd: 0.05,
          burnRatePerMinute: 0,
          contextPercentUsed: 35,
        },
      },
    });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText(/35% context/)).toBeInTheDocument();
    expect(screen.getByText(/7\.0K tokens/)).toBeInTheDocument();
  });

  it("renders response input when needsInput is true", () => {
    const session = makeSession({
      conversation: {
        lastUserMessage: "Help",
        lastAssistantText: "Done!",
        lastMessageRole: "assistant",
        needsInput: true,
        messageCount: 2,
      },
    });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByPlaceholderText("speak with wispr flow...")).toBeInTheDocument();
  });

  it("does not render response input when not needing input", () => {
    const session = makeSession({
      conversation: {
        lastUserMessage: "Work on this",
        lastAssistantText: "On it!",
        lastMessageRole: "assistant",
        needsInput: false,
        messageCount: 2,
      },
    });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.queryByPlaceholderText("speak with wispr flow...")).not.toBeInTheDocument();
  });

  it("applies focused border color when focused", () => {
    const { container } = render(
      <SessionCard session={makeSession()} ref={null} {...defaultProps} isFocused={true} />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.border).toContain("rgb(107, 107, 107)");
  });

  it("applies ochre border when needsInput is true", () => {
    const session = makeSession({
      conversation: {
        lastUserMessage: "",
        lastAssistantText: "",
        lastMessageRole: "assistant",
        needsInput: true,
        messageCount: 1,
      },
    });
    const { container } = render(
      <SessionCard session={session} ref={null} {...defaultProps} />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.border).toContain("rgb(196, 149, 106)");
  });

  it("renders OrgBadge when git info has org", () => {
    const session = makeSession({
      git: {
        repo: "repo",
        branch: "main",
        remote: "git@github.com:MyOrg/repo.git",
        isPersonal: false,
        org: "MyOrg",
      },
    });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText(/MyOrg/)).toBeInTheDocument();
  });

  it("renders the creature ascii art", () => {
    const session = makeSession({ creature: "(*_*)" });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText("(*_*)")).toBeInTheDocument();
  });

  it("renders StatusBadge with correct work type", () => {
    const session = makeSession({ workType: "debugging" });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText("debugging")).toBeInTheDocument();
  });
});
