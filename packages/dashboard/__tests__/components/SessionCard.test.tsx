import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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
    voiceMode: false,
    onSendResponse: vi.fn(),
    onSelect: vi.fn(),
  };

  it("renders humanized session name", () => {
    render(<SessionCard session={makeSession()} ref={null} {...defaultProps} />);
    // humanizeTitle("test-session") -> removes "claude-code-" prefix (not present), then capitalizes
    expect(screen.getByText("Test Session")).toBeInTheDocument();
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

  it("shows user message as summary", () => {
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

  it("shows 'Ready to go' when no messages", () => {
    const session = makeSession({
      conversation: {
        lastUserMessage: "",
        lastAssistantText: "",
        lastMessageRole: "user",
        needsInput: false,
        messageCount: 0,
      },
    });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText("Ready to go")).toBeInTheDocument();
  });

  it("shows summary when session has summary field", () => {
    const session = makeSession({
      summary: "Working on auth module refactor",
    });
    render(<SessionCard session={session} ref={null} {...defaultProps} />);
    expect(screen.getByText("Working on auth module refactor")).toBeInTheDocument();
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
    // ContextMeter now shows "7K / 1M"
    expect(screen.getByText("7K / 1M")).toBeInTheDocument();
  });

  it("renders response input when needsInput, isFocused, and inputOpen", () => {
    const session = makeSession({
      conversation: {
        lastUserMessage: "Help",
        lastAssistantText: "Done!",
        lastMessageRole: "assistant",
        needsInput: true,
        messageCount: 2,
      },
    });
    render(
      <SessionCard
        session={session}
        ref={null}
        {...defaultProps}
        isFocused={true}
        inputOpen={true}
        voiceMode={false}
      />
    );
    expect(screen.getByPlaceholderText("type a response...")).toBeInTheDocument();
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
    expect(screen.queryByPlaceholderText("type a response...")).not.toBeInTheDocument();
  });

  it("applies focused style (black background) when focused", () => {
    const { container } = render(
      <SessionCard session={makeSession()} ref={null} {...defaultProps} isFocused={true} />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.backgroundColor).toBe("rgb(0, 0, 0)");
    expect(card.style.color).toBe("rgb(255, 255, 255)");
  });

  it("applies unfocused style (white background) when not focused", () => {
    const { container } = render(
      <SessionCard session={makeSession()} ref={null} {...defaultProps} isFocused={false} />
    );
    const card = container.firstChild as HTMLElement;
    expect(card.style.backgroundColor).toBe("rgb(255, 255, 255)");
    expect(card.style.color).toBe("rgb(0, 0, 0)");
  });

  it("calls onSelect with index when clicked", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <SessionCard session={makeSession()} ref={null} {...defaultProps} index={3} onSelect={onSelect} />
    );
    fireEvent.click(container.firstChild as HTMLElement);
    expect(onSelect).toHaveBeenCalledWith(3);
  });

  it("shows prompt text when focused but input not open", () => {
    render(
      <SessionCard session={makeSession()} ref={null} {...defaultProps} isFocused={true} inputOpen={false} />
    );
    expect(screen.getByText(/Spacebar to speak/)).toBeInTheDocument();
  });
});
