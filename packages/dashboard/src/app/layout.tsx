import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Mission Control",
  description: "Real-time dashboard for monitoring Claude Code sessions",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-mono antialiased">
        {children}
      </body>
    </html>
  )
}
