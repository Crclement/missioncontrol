import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StatusBadge } from "../../src/components/StatusBadge";

describe("StatusBadge", () => {
  it("shows 'Active' for coding work type", () => {
    render(<StatusBadge workType="coding" needsInput={false} />);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("shows 'Exploring' for exploring work type", () => {
    render(<StatusBadge workType="exploring" needsInput={false} />);
    expect(screen.getByText("Exploring")).toBeInTheDocument();
  });

  it("shows 'Planning' for planning work type", () => {
    render(<StatusBadge workType="planning" needsInput={false} />);
    expect(screen.getByText("Planning")).toBeInTheDocument();
  });

  it("shows 'Debugging' for debugging work type", () => {
    render(<StatusBadge workType="debugging" needsInput={false} />);
    expect(screen.getByText("Debugging")).toBeInTheDocument();
  });

  it("shows 'Idle' for idle work type", () => {
    render(<StatusBadge workType="idle" needsInput={false} />);
    expect(screen.getByText("Idle")).toBeInTheDocument();
  });

  it("shows 'Running' for running work type", () => {
    render(<StatusBadge workType="running" needsInput={false} />);
    expect(screen.getByText("Running")).toBeInTheDocument();
  });

  it("shows 'Reviewing' for reviewing work type", () => {
    render(<StatusBadge workType="reviewing" needsInput={false} />);
    expect(screen.getByText("Reviewing")).toBeInTheDocument();
  });

  it("shows 'Needs Input' when needsInput is true regardless of workType", () => {
    render(<StatusBadge workType="coding" needsInput={true} />);
    expect(screen.getByText("Needs Input")).toBeInTheDocument();
    expect(screen.queryByText("Active")).not.toBeInTheDocument();
  });

  it("applies black background and white text for needs-input", () => {
    render(<StatusBadge workType="coding" needsInput={true} />);
    const label = screen.getByText("Needs Input");
    expect(label.style.backgroundColor).toBe("rgb(0, 0, 0)");
    expect(label.style.color).toBe("rgb(255, 255, 255)");
  });

  it("applies transparent background for non-needs-input", () => {
    render(<StatusBadge workType="coding" needsInput={false} />);
    const label = screen.getByText("Active");
    expect(label.style.backgroundColor).toBe("transparent");
  });

  it("applies isActive styling when isActive is true", () => {
    render(<StatusBadge workType="coding" needsInput={false} isActive />);
    const label = screen.getByText("Active");
    expect(label.style.color).toBe("rgb(170, 170, 170)");
    expect(label.style.border).toContain("rgb(102, 102, 102)");
  });

  it("applies default styling when isActive is false", () => {
    render(<StatusBadge workType="idle" needsInput={false} />);
    const label = screen.getByText("Idle");
    expect(label.style.color).toBe("rgb(102, 102, 102)");
    expect(label.style.border).toContain("rgb(0, 0, 0)");
  });
});
