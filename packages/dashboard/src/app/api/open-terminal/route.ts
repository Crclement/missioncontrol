import { NextRequest, NextResponse } from "next/server"
import { execSync } from "child_process"

export async function GET(req: NextRequest) {
  const cwd = req.nextUrl.searchParams.get("cwd")
  if (!cwd) {
    return NextResponse.json({ error: "missing cwd" }, { status: 400 })
  }

  // Find a local dev server running in this project's directory
  try {
    // Look for node processes with LISTEN ports whose cwd matches
    const lsof = execSync(
      `lsof -i -P -n 2>/dev/null | grep LISTEN | grep node`,
      { encoding: "utf-8", timeout: 3000 }
    )

    const dirName = cwd.split("/").pop() ?? ""

    for (const line of lsof.split("\n")) {
      if (!line.trim()) continue
      const parts = line.split(/\s+/)
      const pid = parts[1]
      if (!pid) continue

      // Check if this process's cwd contains our project
      try {
        const procCwd = execSync(`lsof -p ${pid} 2>/dev/null | grep cwd | awk '{print $NF}'`, {
          encoding: "utf-8",
          timeout: 2000,
        }).trim()

        if (procCwd.includes(dirName) || procCwd.includes(cwd)) {
          // Extract port
          const portMatch = line.match(/:(\d+)\s/)
          if (portMatch) {
            const port = portMatch[1]
            // Don't open the mission control dashboard itself or the agent
            if (port === "3005" || port === "45557") continue
            const url = `http://localhost:${port}`
            execSync(`open -a "Google Chrome" "${url}"`, { timeout: 2000 })
            return NextResponse.json({ ok: true, url })
          }
        }
      } catch {
        // skip this process
      }
    }

    // No dev server found — just open the directory in Finder or Terminal
    return NextResponse.json({ error: "no local server found for this project" }, { status: 404 })
  } catch {
    return NextResponse.json({ error: "could not find local servers" }, { status: 500 })
  }
}
