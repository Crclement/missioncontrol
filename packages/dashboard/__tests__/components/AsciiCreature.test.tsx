import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AsciiCreature } from "../../src/components/AsciiCreature";
import type { WorkType } from "@missioncontrol/shared";

describe("AsciiCreature", () => {
  const testCreature = " o \n/|\\\n/ \\";

  it("renders the creature string", () => {
    render(<AsciiCreature creature={testCreature} workType="coding" />);
    const pre = screen.getByText(/o/);
    expect(pre).toBeInTheDocument();
    expect(pre.tagName).toBe("PRE");
  });

  it("applies coding color (sage green)", () => {
    const { container } = render(
      <AsciiCreature creature={testCreature} workType="coding" />
    );
    const pre = container.querySelector("pre");
    expect(pre?.style.color).toBe("rgb(124, 154, 114)");
  });

  it("applies exploring color (blue)", () => {
    const { container } = render(
      <AsciiCreature creature={testCreature} workType="exploring" />
    );
    const pre = container.querySelector("pre");
    expect(pre?.style.color).toBe("rgb(107, 140, 174)");
  });

  it("applies planning color (purple)", () => {
    const { container } = render(
      <AsciiCreature creature={testCreature} workType="planning" />
    );
    const pre = container.querySelector("pre");
    expect(pre?.style.color).toBe("rgb(155, 124, 184)");
  });

  it("applies debugging color (red)", () => {
    const { container } = render(
      <AsciiCreature creature={testCreature} workType="debugging" />
    );
    const pre = container.querySelector("pre");
    expect(pre?.style.color).toBe("rgb(184, 92, 92)");
  });

  it("applies idle color (gray)", () => {
    const { container } = render(
      <AsciiCreature creature={testCreature} workType="idle" />
    );
    const pre = container.querySelector("pre");
    expect(pre?.style.color).toBe("rgb(107, 107, 107)");
  });

  it("applies running color (teal)", () => {
    const { container } = render(
      <AsciiCreature creature={testCreature} workType="running" />
    );
    const pre = container.querySelector("pre");
    expect(pre?.style.color).toBe("rgb(107, 158, 158)");
  });

  it("applies reviewing color (blue)", () => {
    const { container } = render(
      <AsciiCreature creature={testCreature} workType="reviewing" />
    );
    const pre = container.querySelector("pre");
    expect(pre?.style.color).toBe("rgb(107, 140, 174)");
  });

  it("falls back to gray for unknown work types", () => {
    const { container } = render(
      <AsciiCreature creature={testCreature} workType={"unknown" as WorkType} />
    );
    const pre = container.querySelector("pre");
    expect(pre?.style.color).toBe("rgb(107, 107, 107)");
  });

  it("renders multi-line creatures correctly", () => {
    const multiLine = ".---.\n| o |\n'---'";
    render(<AsciiCreature creature={multiLine} workType="coding" />);
    expect(screen.getByText(/---/)).toBeInTheDocument();
  });
});
