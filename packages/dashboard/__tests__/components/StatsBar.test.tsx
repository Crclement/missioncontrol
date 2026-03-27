import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatsBar } from "../../src/components/StatsBar";
import type { EnrichedSession } from "@missioncontrol/shared";

function makeSession(overrides: Partial<EnrichedSession> = {}): EnrichedSession {
  return {
    pid: 12345,
    sessionId: "abc-123",
    cwd: "/home/user/project",
    startedAt: Date.now(),
    configDir: "/home/user/.claude",
    alive: true,
    conversation: {
      lastUserMessage: "",
      lastAssistantText: "",
      lastMessageRole: "user",
      needsInput: false,
      messageCount: 0,
    },
    subagents: [],
    workType: "coding",
    creature: "o",
    ...overrides,
  };
}

describe("StatsBar", () => {
  it("displays connection status text", () => {
    render(<StatsBar sessions={[]} connectionState="connected" />);
    expect(screen.getByText("connected")).toBeInTheDocument();
  });

  it("shows black dot for connected state", () => {
    const { container } = render(
      <StatsBar sessions={[]} connectionState="connected" />
    );
    const dots = container.querySelectorAll("span.inline-block");
    const connectionDot = dots[0];
    expect(connectionDot?.getAttribute("style")).toContain("rgb(0, 0, 0)");
  });

  it("shows gray dot for non-connected state", () => {
    const { container } = render(
      <StatsBar sessions={[]} connectionState="connecting" />
    );
    const dots = container.querySelectorAll("span.inline-block");
    const connectionDot = dots[0];
    expect(connectionDot?.getAttribute("style")).toContain("rgb(136, 136, 136)");
  });

  it("shows gray dot for disconnected state", () => {
    const { container } = render(
      <StatsBar sessions={[]} connectionState="disconnected" />
    );
    const dots = container.querySelectorAll("span.inline-block");
    const connectionDot = dots[0];
    expect(connectionDot?.getAttribute("style")).toContain("rgb(136, 136, 136)");
  });

  it("shows active session count", () => {
    const sessions = [
      makeSession({ pid: 1, alive: true }),
      makeSession({ pid: 2, alive: true }),
      makeSession({ pid: 3, alive: false }),
    ];
    render(<StatsBar sessions={sessions} connectionState="connected" />);
    const sessionCountEl = screen.getByText("2");
    expect(sessionCountEl).toBeInTheDocument();
    expect(screen.getByText("sessions")).toBeInTheDocument();
  });

  it("shows zero sessions when none are active", () => {
    render(<StatsBar sessions={[]} connectionState="connected" />);
    const spans = screen.getAllByText("0");
    expect(spans.length).toBeGreaterThanOrEqual(1);
  });

  it("shows total token count across sessions", () => {
    const sessions = [
      makeSession({
        pid: 1,
        conversation: {
          lastUserMessage: "",
          lastAssistantText: "",
          lastMessageRole: "user",
          needsInput: false,
          messageCount: 1,
          tokenUsage: {
            inputTokens: 3000,
            outputTokens: 1000,
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
            totalTokens: 4000,
            estimatedCostUsd: 0.02,
            burnRatePerMinute: 0,
            contextPercentUsed: 20,
          },
        },
      }),
      makeSession({
        pid: 2,
        conversation: {
          lastUserMessage: "",
          lastAssistantText: "",
          lastMessageRole: "user",
          needsInput: false,
          messageCount: 2,
          tokenUsage: {
            inputTokens: 6000,
            outputTokens: 2000,
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
            totalTokens: 8000,
            estimatedCostUsd: 0.05,
            burnRatePerMinute: 0,
            contextPercentUsed: 40,
          },
        },
      }),
    ];
    render(<StatsBar sessions={sessions} connectionState="connected" />);
    expect(screen.getByText("12.0K")).toBeInTheDocument();
    expect(screen.getByText("tokens")).toBeInTheDocument();
  });

  it("shows total estimated cost", () => {
    const sessions = [
      makeSession({
        pid: 1,
        conversation: {
          lastUserMessage: "",
          lastAssistantText: "",
          lastMessageRole: "user",
          needsInput: false,
          messageCount: 1,
          tokenUsage: {
            inputTokens: 1000,
            outputTokens: 500,
            cacheCreationTokens: 0,
            cacheReadTokens: 0,
            totalTokens: 1500,
            estimatedCostUsd: 1.25,
            burnRatePerMinute: 0,
            contextPercentUsed: 5,
          },
        },
      }),
    ];
    render(<StatsBar sessions={sessions} connectionState="connected" />);
    expect(screen.getByText("$1.25")).toBeInTheDocument();
    expect(screen.getByText("est.")).toBeInTheDocument();
  });

  it("shows $0.00 cost when no token usage", () => {
    render(<StatsBar sessions={[makeSession()]} connectionState="connected" />);
    expect(screen.getByText("$0.00")).toBeInTheDocument();
  });

  it("shows 0 tokens when sessions have no token usage", () => {
    render(<StatsBar sessions={[makeSession()]} connectionState="connected" />);
    const zeroEls = screen.getAllByText("0");
    expect(zeroEls.length).toBeGreaterThanOrEqual(1);
  });

  it("formats large token counts in millions", () => {
    const sessions = [
      makeSession({
        pid: 1,
        conversation: {
          lastUserMessage: "",
          lastAssistantText: "",
          lastMessageRole: "user",
          needsInput: false,
          messageCount: 1,
          tokenUsage: {
            inputTokens: 800000,
            outputTokens: 200000,
            cacheCreationTokens: 500000,
            cacheReadTokens: 100000,
            totalTokens: 1600000,
            estimatedCostUsd: 10.5,
            burnRatePerMinute: 0,
            contextPercentUsed: 90,
          },
        },
      }),
    ];
    render(<StatsBar sessions={sessions} connectionState="connected" />);
    expect(screen.getByText("1.6M")).toBeInTheDocument();
  });
});
