import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../../src/components/StatusBadge";

describe("StatusBadge", () => {
  it("shows 'active' for coding work type", () => {
    render(<StatusBadge workType="coding" needsInput={false} />);
    expect(screen.getByText("active")).toBeInTheDocument();
  });

  it("shows 'exploring' for exploring work type", () => {
    render(<StatusBadge workType="exploring" needsInput={false} />);
    expect(screen.getByText("exploring")).toBeInTheDocument();
  });

  it("shows 'planning' for planning work type", () => {
    render(<StatusBadge workType="planning" needsInput={false} />);
    expect(screen.getByText("planning")).toBeInTheDocument();
  });

  it("shows 'debugging' for debugging work type", () => {
    render(<StatusBadge workType="debugging" needsInput={false} />);
    expect(screen.getByText("debugging")).toBeInTheDocument();
  });

  it("shows 'idle' for idle work type", () => {
    render(<StatusBadge workType="idle" needsInput={false} />);
    expect(screen.getByText("idle")).toBeInTheDocument();
  });

  it("shows 'running' for running work type", () => {
    render(<StatusBadge workType="running" needsInput={false} />);
    expect(screen.getByText("running")).toBeInTheDocument();
  });

  it("shows 'reviewing' for reviewing work type", () => {
    render(<StatusBadge workType="reviewing" needsInput={false} />);
    expect(screen.getByText("reviewing")).toBeInTheDocument();
  });

  it("shows 'needs input' when needsInput is true regardless of workType", () => {
    render(<StatusBadge workType="coding" needsInput={true} />);
    expect(screen.getByText("needs input")).toBeInTheDocument();
    expect(screen.queryByText("active")).not.toBeInTheDocument();
  });

  it("applies correct color for coding (sage green)", () => {
    render(<StatusBadge workType="coding" needsInput={false} />);
    const label = screen.getByText("active");
    expect(label.style.color).toBe("rgb(124, 154, 114)");
  });

  it("applies correct color for needs-input (ochre)", () => {
    render(<StatusBadge workType="coding" needsInput={true} />);
    const label = screen.getByText("needs input");
    expect(label.style.color).toBe("rgb(196, 149, 106)");
  });

  it("applies correct color for debugging (red)", () => {
    render(<StatusBadge workType="debugging" needsInput={false} />);
    const label = screen.getByText("debugging");
    expect(label.style.color).toBe("rgb(184, 92, 92)");
  });

  it("renders a colored dot indicator", () => {
    const { container } = render(<StatusBadge workType="idle" needsInput={false} />);
    const dot = container.querySelector("span > span:first-child");
    expect(dot?.getAttribute("style")).toContain("rgb(107, 107, 107)");
  });
});
