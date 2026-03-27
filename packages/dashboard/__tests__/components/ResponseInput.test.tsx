import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResponseInput } from "../../src/components/ResponseInput";

describe("ResponseInput", () => {
  it("renders voice mode by default with wispr label", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    expect(screen.getByText("wispr")).toBeInTheDocument();
    expect(screen.getByText("type")).toBeInTheDocument();
  });

  it("shows voice placeholder by default", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    expect(screen.getByPlaceholderText("speak with wispr flow...")).toBeInTheDocument();
  });

  it("switches to type mode and updates placeholder", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    fireEvent.click(screen.getByText("type"));
    expect(screen.getByPlaceholderText("type a response...")).toBeInTheDocument();
  });

  it("renders a send button", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    expect(screen.getByText("send")).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    const button = screen.getByText("send");
    expect(button).toBeDisabled();
  });

  it("enables send button when input has text", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    const input = screen.getByPlaceholderText("speak with wispr flow...");
    fireEvent.change(input, { target: { value: "hello" } });
    const button = screen.getByText("send");
    expect(button).not.toBeDisabled();
  });

  it("calls onSend with trimmed message on button click", () => {
    const onSend = vi.fn();
    render(<ResponseInput onSend={onSend} />);
    const input = screen.getByPlaceholderText("speak with wispr flow...");
    fireEvent.change(input, { target: { value: "  hello world  " } });
    fireEvent.click(screen.getByText("send"));
    expect(onSend).toHaveBeenCalledWith("hello world");
  });

  it("calls onSend on Enter key press", () => {
    const onSend = vi.fn();
    render(<ResponseInput onSend={onSend} />);
    const input = screen.getByPlaceholderText("speak with wispr flow...");
    fireEvent.change(input, { target: { value: "fix the bug" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("fix the bug");
  });

  it("does not call onSend when input is empty or whitespace", () => {
    const onSend = vi.fn();
    render(<ResponseInput onSend={onSend} />);
    const input = screen.getByPlaceholderText("speak with wispr flow...");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("clears input after successful send", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    const input = screen.getByPlaceholderText("speak with wispr flow...") as HTMLTextAreaElement;
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(input.value).toBe("");
  });

  it("shows 'sent' state label after successful send", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    const input = screen.getByPlaceholderText("speak with wispr flow...");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("sent")).toBeInTheDocument();
  });

  it("shows 'err' state label when onSend throws", () => {
    const onSend = vi.fn(() => {
      throw new Error("network error");
    });
    render(<ResponseInput onSend={onSend} />);
    const input = screen.getByPlaceholderText("speak with wispr flow...");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("err")).toBeInTheDocument();
  });

  it("renders the voice prompt character in voice mode", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    expect(screen.getByText("◆")).toBeInTheDocument();
  });

  it("switches prompt character to > in type mode", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    fireEvent.click(screen.getByText("type"));
    expect(screen.getByText(">")).toBeInTheDocument();
  });

  it("Tab key switches between voice and type mode", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    const input = screen.getByPlaceholderText("speak with wispr flow...");
    fireEvent.keyDown(input, { key: "Tab" });
    expect(screen.getByPlaceholderText("type a response...")).toBeInTheDocument();
  });
});
