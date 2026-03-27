import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContextMeter } from "../../src/components/ContextMeter";

describe("ContextMeter", () => {
  it("renders token count and context limit", () => {
    render(<ContextMeter percentUsed={45} totalTokens={90000} contextLimit={1_000_000} />);
    expect(screen.getByText("90K / 1M")).toBeInTheDocument();
  });

  it("formats tokens in millions", () => {
    render(<ContextMeter percentUsed={50} totalTokens={1500000} contextLimit={1_000_000} />);
    expect(screen.getByText("1.5M / 1M")).toBeInTheDocument();
  });

  it("formats tokens in thousands", () => {
    render(<ContextMeter percentUsed={10} totalTokens={5000} contextLimit={1_000_000} />);
    expect(screen.getByText("5K / 1M")).toBeInTheDocument();
  });

  it("formats small token counts as plain numbers", () => {
    render(<ContextMeter percentUsed={1} totalTokens={500} contextLimit={1_000_000} />);
    expect(screen.getByText("500 / 1M")).toBeInTheDocument();
  });

  it("uses black fill color by default", () => {
    const { container } = render(<ContextMeter percentUsed={30} totalTokens={5000} contextLimit={1_000_000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("rgb(0, 0, 0)");
  });

  it("uses white fill color when isActive", () => {
    const { container } = render(<ContextMeter percentUsed={30} totalTokens={5000} contextLimit={1_000_000} isActive />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("rgb(255, 255, 255)");
  });

  it("sets fill width based on totalTokens / contextLimit", () => {
    const { container } = render(<ContextMeter percentUsed={0} totalTokens={500_000} contextLimit={1_000_000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("width: 50%");
  });

  it("clamps percentage at 0 minimum", () => {
    const { container } = render(<ContextMeter percentUsed={0} totalTokens={0} contextLimit={1_000_000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("width: 0%");
    expect(screen.getByText("0 / 1M")).toBeInTheDocument();
  });

  it("clamps percentage at 100 maximum", () => {
    const { container } = render(<ContextMeter percentUsed={150} totalTokens={1_500_000} contextLimit={1_000_000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("width: 100%");
  });

  it("defaults contextLimit to 1M", () => {
    const { container } = render(<ContextMeter percentUsed={0} totalTokens={500_000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("width: 50%");
    expect(screen.getByText("500K / 1M")).toBeInTheDocument();
  });

  it("uses dark background when isActive", () => {
    const { container } = render(<ContextMeter percentUsed={50} totalTokens={500_000} isActive />);
    const trackBar = container.querySelector(".w-full.h-1");
    expect(trackBar?.getAttribute("style")).toContain("rgb(51, 51, 51)");
  });

  it("uses light background when not active", () => {
    const { container } = render(<ContextMeter percentUsed={50} totalTokens={500_000} />);
    const trackBar = container.querySelector(".w-full.h-1");
    expect(trackBar?.getAttribute("style")).toContain("rgb(238, 238, 238)");
  });

  it("formats 1M exactly without decimal", () => {
    render(<ContextMeter percentUsed={100} totalTokens={1_000_000} contextLimit={1_000_000} />);
    expect(screen.getByText("1M / 1M")).toBeInTheDocument();
  });
});
