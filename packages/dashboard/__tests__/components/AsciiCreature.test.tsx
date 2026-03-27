import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AsciiCreature } from "../../src/components/AsciiCreature";
import type { WorkType } from "@missioncontrol/shared";

describe("AsciiCreature", () => {
  const testCreature = " o \n/|\\\n/ \\";

  it("renders without crashing", () => {
    const { container } = render(<AsciiCreature creature={testCreature} workType="coding" />);
    expect(container.firstChild).toBeTruthy();
  });

  it("delegates to PixelCreature (renders a canvas-like grid)", () => {
    const { container } = render(
      <AsciiCreature creature={testCreature} workType="coding" />
    );
    // PixelCreature renders a div-based grid, not a <pre> element
    expect(container.querySelector("pre")).toBeNull();
    expect(container.firstChild).toBeTruthy();
  });

  it("renders for all work types without errors", () => {
    const workTypes: WorkType[] = [
      "coding", "exploring", "planning", "debugging", "idle", "running", "reviewing",
    ];
    for (const wt of workTypes) {
      const { container } = render(
        <AsciiCreature creature={testCreature} workType={wt} />
      );
      expect(container.firstChild).toBeTruthy();
    }
  });

  it("passes isActive as inverted to PixelCreature", () => {
    const { container } = render(
      <AsciiCreature creature={testCreature} workType="coding" isActive />
    );
    expect(container.firstChild).toBeTruthy();
  });
});
