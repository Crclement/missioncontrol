import { NextRequest, NextResponse } from "next/server"
import { execSync } from "child_process"

export async function GET(req: NextRequest) {
  const cwd = req.nextUrl.searchParams.get("cwd")
  if (!cwd) {
    return NextResponse.json({ error: "missing cwd" }, { status: 400 })
  }

  try {
    // Try to find and activate the Terminal.app window/tab running in this directory
    // First, try to activate by matching the window title or tab
    execSync(
      `osascript -e '
        tell application "Terminal"
          activate
          set found to false
          repeat with w in windows
            repeat with t in tabs of w
              if tty of t is not "" then
                try
                  set tabProcesses to do shell script "lsof -p " & (processes of t as text) & " 2>/dev/null | grep cwd | head -1"
                end try
              end if
            end repeat
          end repeat
        end tell
      '`,
      { encoding: "utf-8", timeout: 3000 }
    )
  } catch {
    // Fallback: just activate Terminal.app
    try {
      execSync(`osascript -e 'tell application "Terminal" to activate'`, {
        encoding: "utf-8",
        timeout: 2000,
      })
    } catch {
      // Last resort: open a new terminal at the cwd
      try {
        execSync(`open -a Terminal "${cwd}"`, { timeout: 2000 })
      } catch {
        return NextResponse.json({ error: "could not open terminal" }, { status: 500 })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
