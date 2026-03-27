import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ContextMeter } from "../../src/components/ContextMeter";

describe("ContextMeter", () => {
  it("renders percentage and token count", () => {
    render(<ContextMeter percentUsed={45} totalTokens={90000} />);
    expect(screen.getByText("45% context | 90.0K tokens")).toBeInTheDocument();
  });

  it("formats tokens in millions", () => {
    render(<ContextMeter percentUsed={50} totalTokens={1500000} />);
    expect(screen.getByText("50% context | 1.5M tokens")).toBeInTheDocument();
  });

  it("formats tokens in thousands", () => {
    render(<ContextMeter percentUsed={10} totalTokens={5000} />);
    expect(screen.getByText("10% context | 5.0K tokens")).toBeInTheDocument();
  });

  it("formats small token counts as plain numbers", () => {
    render(<ContextMeter percentUsed={1} totalTokens={500} />);
    expect(screen.getByText("1% context | 500 tokens")).toBeInTheDocument();
  });

  it("applies sage green fill color when under 50%", () => {
    const { container } = render(<ContextMeter percentUsed={30} totalTokens={5000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("rgb(124, 154, 114)");
  });

  it("applies ochre fill color between 50% and 80%", () => {
    const { container } = render(<ContextMeter percentUsed={65} totalTokens={10000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("rgb(196, 149, 106)");
  });

  it("applies red fill color when above 80%", () => {
    const { container } = render(<ContextMeter percentUsed={90} totalTokens={180000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("rgb(184, 92, 92)");
  });

  it("sets fill width to match percentage", () => {
    const { container } = render(<ContextMeter percentUsed={42} totalTokens={5000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("width: 42%");
  });

  it("clamps percentage at 0 minimum", () => {
    const { container } = render(<ContextMeter percentUsed={-10} totalTokens={0} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("width: 0%");
    expect(screen.getByText("0% context | 0 tokens")).toBeInTheDocument();
  });

  it("clamps percentage at 100 maximum", () => {
    const { container } = render(<ContextMeter percentUsed={150} totalTokens={300000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("width: 100%");
    expect(screen.getByText("100% context | 300.0K tokens")).toBeInTheDocument();
  });

  it("applies exactly 50% threshold as ochre", () => {
    const { container } = render(<ContextMeter percentUsed={50} totalTokens={10000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("rgb(196, 149, 106)");
  });

  it("applies exactly 80% threshold as red", () => {
    const { container } = render(<ContextMeter percentUsed={80} totalTokens={160000} />);
    const fillBar = container.querySelector("div.h-full");
    expect(fillBar?.getAttribute("style")).toContain("rgb(184, 92, 92)");
  });

  it("rounds percentage display", () => {
    render(<ContextMeter percentUsed={33.7} totalTokens={5000} />);
    expect(screen.getByText("34% context | 5.0K tokens")).toBeInTheDocument();
  });
});
