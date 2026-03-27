import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ResponseInput } from "../../src/components/ResponseInput";

describe("ResponseInput", () => {
  it("renders type mode by default (no voiceMode prop)", () => {
    render(<ResponseInput onSend={vi.fn()} />);
    // Default: typing=true (!voiceMode where voiceMode is undefined/false)
    expect(screen.getByPlaceholderText("type a response...")).toBeInTheDocument();
  });

  it("renders voice mode when voiceMode is true", () => {
    render(<ResponseInput onSend={vi.fn()} voiceMode={true} />);
    expect(screen.getByText(/Press spacebar and speak/)).toBeInTheDocument();
  });

  it("shows type input with placeholder in type mode", () => {
    render(<ResponseInput onSend={vi.fn()} voiceMode={false} />);
    expect(screen.getByPlaceholderText("type a response...")).toBeInTheDocument();
  });

  it("renders a send button in type mode", () => {
    render(<ResponseInput onSend={vi.fn()} voiceMode={false} />);
    expect(screen.getByText("Send")).toBeInTheDocument();
  });

  it("disables send button when input is empty", () => {
    render(<ResponseInput onSend={vi.fn()} voiceMode={false} />);
    const button = screen.getByText("Send");
    expect(button).toBeDisabled();
  });

  it("enables send button when input has text", () => {
    render(<ResponseInput onSend={vi.fn()} voiceMode={false} />);
    const input = screen.getByPlaceholderText("type a response...");
    fireEvent.change(input, { target: { value: "hello" } });
    const button = screen.getByText("Send");
    expect(button).not.toBeDisabled();
  });

  it("calls onSend with trimmed message on button click", () => {
    const onSend = vi.fn();
    render(<ResponseInput onSend={onSend} voiceMode={false} />);
    const input = screen.getByPlaceholderText("type a response...");
    fireEvent.change(input, { target: { value: "  hello world  " } });
    fireEvent.click(screen.getByText("Send"));
    expect(onSend).toHaveBeenCalledWith("hello world");
  });

  it("calls onSend on Enter key press", () => {
    const onSend = vi.fn();
    render(<ResponseInput onSend={onSend} voiceMode={false} />);
    const input = screen.getByPlaceholderText("type a response...");
    fireEvent.change(input, { target: { value: "fix the bug" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("fix the bug");
  });

  it("does not call onSend when input is empty or whitespace", () => {
    const onSend = vi.fn();
    render(<ResponseInput onSend={onSend} voiceMode={false} />);
    const input = screen.getByPlaceholderText("type a response...");
    fireEvent.change(input, { target: { value: "   " } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("calls onSend and switches to voice mode after send", () => {
    const onSend = vi.fn();
    render(<ResponseInput onSend={onSend} voiceMode={false} />);
    const input = screen.getByPlaceholderText("type a response...");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("hello");
    // After send, component switches to voice mode
    expect(screen.getByText(/Press spacebar and speak/)).toBeInTheDocument();
  });

  it("shows 'err' state label when onSend throws", () => {
    const onSend = vi.fn(() => {
      throw new Error("network error");
    });
    render(<ResponseInput onSend={onSend} voiceMode={false} />);
    const input = screen.getByPlaceholderText("type a response...");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });
    expect(screen.getByText("err")).toBeInTheDocument();
  });

  it("renders the > prompt character in type mode", () => {
    render(<ResponseInput onSend={vi.fn()} voiceMode={false} />);
    expect(screen.getByText(">")).toBeInTheDocument();
  });

  it("voice mode shows 'Press spacebar' text", () => {
    render(<ResponseInput onSend={vi.fn()} voiceMode={true} />);
    expect(screen.getByText(/Press spacebar and speak to respond/)).toBeInTheDocument();
  });

  it("voice mode has a hidden textarea for dictation", () => {
    const { container } = render(<ResponseInput onSend={vi.fn()} voiceMode={true} />);
    const hiddenTextarea = container.querySelector('textarea[style*="opacity: 0"]');
    expect(hiddenTextarea).toBeTruthy();
  });

  it("clicking voice prompt switches to type mode", () => {
    render(<ResponseInput onSend={vi.fn()} voiceMode={true} />);
    const voicePrompt = screen.getByText(/Press spacebar and speak/);
    fireEvent.click(voicePrompt);
    expect(screen.getByPlaceholderText("type a response...")).toBeInTheDocument();
  });
});
