"use client"

import { useState, useEffect, useRef } from "react"
import { BarChart } from "@/components/whitepaper/BarChart"
import { ComparisonTable } from "@/components/whitepaper/ComparisonTable"
import { SWOTAnalysis } from "@/components/whitepaper/SWOTAnalysis"
import { PortersFiveForces } from "@/components/whitepaper/PortersFiveForces"
import { PersonaCard } from "@/components/whitepaper/PersonaCard"
import { RiskItem } from "@/components/whitepaper/RiskItem"
import { InfoTooltip } from "@/components/whitepaper/InfoTooltip"

// ---------------------------------------------------------------------------
// Password Gate
// ---------------------------------------------------------------------------
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password.toLowerCase() === "apollo") {
      localStorage.setItem("wp_access", "1")
      localStorage.setItem("wp_email", email)
      try {
        fetch("/api/whitepaper-visit", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, ts: Date.now() }),
        }).catch(() => {})
      } catch {
        // silent
      }
      onUnlock()
    } else {
      setError("incorrect password")
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#f5f5f5" }}>
      <div
        className="w-full max-w-sm p-6"
        style={{
          backgroundColor: "#ffffff",
          border: "1px solid #000000",
        }}
      >
        <h1 className="text-sm font-mono text-[#666666] tracking-widest uppercase mb-1">
          mission control
        </h1>
        <h2 className="text-xs font-mono text-[#000000] mb-6">
          Investment Thesis &mdash; Confidential
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-1">
              Email
            </label>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 text-xs font-mono text-[#000000]"
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #000000",
              }}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError("")
              }}
              required
              className="w-full p-2 text-xs font-mono text-[#000000]"
              style={{
                backgroundColor: "#f5f5f5",
                border: "1px solid #000000",
              }}
              placeholder="enter access code"
            />
          </div>
          {error && (
            <p className="text-xs font-mono text-[#000000]">{error}</p>
          )}
          <button
            type="submit"
            className="w-full p-2 text-xs font-mono uppercase tracking-widest"
            style={{
              backgroundColor: "#000000",
              border: "1px solid #000000",
              color: "#ffffff",
              cursor: "pointer",
            }}
          >
            access thesis
          </button>
        </form>
        <p className="text-[10px] font-mono text-[#666666] mt-4 text-center">
          This document is confidential. By entering you agree to NDA terms.
        </p>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Section wrapper
// ---------------------------------------------------------------------------
function Section({
  id,
  number,
  title,
  children,
}: {
  id: string
  number: string
  title: string
  children: React.ReactNode
}) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <div className="flex items-baseline gap-3 mb-6">
        <span className="text-xs font-mono text-[#666666]">{number}</span>
        <h2 className="text-sm font-mono text-[#000000] uppercase tracking-widest">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Table of contents nav
// ---------------------------------------------------------------------------
const TOC = [
  { id: "market-sizing", label: "Market Sizing & TAM" },
  { id: "competitive-landscape", label: "Competitive Landscape" },
  { id: "customer-personas", label: "Customer Personas" },
  { id: "industry-trends", label: "Industry Trends" },
  { id: "swot-porters", label: "SWOT & Porter's" },
  { id: "pricing", label: "Pricing Strategy" },
  { id: "gtm", label: "Go-to-Market" },
  { id: "customer-journey", label: "Customer Journey" },
  { id: "financials", label: "Financial Model" },
  { id: "risk", label: "Risk Assessment" },
  { id: "expansion", label: "Market Entry & Expansion" },
  { id: "synthesis", label: "Executive Synthesis" },
]

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------
export default function WhitepaperPage() {
  const [unlocked, setUnlocked] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [contactEmail, setContactEmail] = useState("")
  const [contactSent, setContactSent] = useState(false)

  useEffect(() => {
    setMounted(true)
    if (localStorage.getItem("wp_access") === "1") {
      setUnlocked(true)
    }
  }, [])

  if (!mounted) return null
  if (!unlocked) return <PasswordGate onUnlock={() => setUnlocked(true)} />

  return (
    <div className="fixed inset-0 overflow-auto" style={{ backgroundColor: "#f5f5f5" }}>
      <div className="p-4 md:p-12 font-mono max-w-5xl mx-auto">
        {/* ---- Header ---- */}
        <header className="mb-12">
          <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-2">
            confidential &mdash; march 2026
          </p>
          <h1 className="text-lg font-mono text-[#000000] uppercase tracking-widest mb-2">
            Mission Control
          </h1>
          <p className="text-xs font-mono text-[#666666] leading-relaxed max-w-2xl">
            Investment thesis for the first real-time monitoring dashboard
            purpose-built for AI coding agent sessions. A working product with
            160+ tests, a monorepo architecture, and a Dieter Rams-inspired
            interface. 12-section analysis covering market opportunity,
            competitive positioning, financial projections, and strategic roadmap.
          </p>
        </header>

        {/* ---- Table of contents ---- */}
        <nav
          className="mb-16 p-4"
          style={{
            backgroundColor: "#ffffff",
            border: "1px solid #000000",
          }}
        >
          <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-3">
            Contents
          </p>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {TOC.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-xs font-mono text-[#000000] hover:text-[#666666] flex gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <span className="text-[#666666] w-6 text-right shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ================================================================
            SECTION 1 -- Market Sizing & TAM Analysis
            ================================================================ */}
        <Section id="market-sizing" number="01" title="Market Sizing & TAM Analysis">
          <div className="space-y-4">
            <p className="text-xs font-mono text-[#000000] leading-relaxed">
              The AI developer tools market is projected to reach{" "}
              <InfoTooltip term="$51.8B" definition="Combined AI-assisted coding, DevOps AI, and developer productivity tooling markets by 2030. Sources: Grand View Research (AI developer tools, 2024), Gartner (AI-augmented development, 2025), IDC (worldwide AI software forecast, 2025)." />{" "}
              by 2030, growing at a 35.9% CAGR from $7.4B in 2024. The AI
              coding assistant segment alone -- Claude Code, GitHub Copilot,
              Cursor, Windsurf, Codeium -- represents $14.1B of this by 2028
              (MarketsandMarkets, 2025). Mission Control sits at the
              intersection of two markets: AI agent monitoring and developer
              workflow optimization.
            </p>
            <p className="text-xs font-mono text-[#000000] leading-relaxed">
              The concrete signal: GitHub reported that 97% of developers have
              used AI coding tools as of early 2026 (GitHub Developer Survey,
              2026). Claude Code crossed{" "}
              <InfoTooltip term="1M+ weekly active users" definition="Anthropic reported 1M+ weekly active Claude Code users in their Q1 2026 update. Cursor reported 700K+ paying subscribers. GitHub Copilot has 1.8M+ paid users (Microsoft Q2 FY26 earnings). The total addressable user base across all AI coding tools exceeds 5M active developers." />{" "}
              in Q1 2026. Power users are running 5-10+ concurrent AI
              coding sessions daily, processing 100M+ tokens per month. This
              creates an acute need for monitoring, cost tracking, and
              session orchestration that no tool currently addresses.
            </p>

            <BarChart
              title="TAM / SAM / SOM Breakdown ($B)"
              items={[
                { label: "TAM -- AI Dev Tools (2030)", value: 51.8, color: "#000000", suffix: "B" },
                { label: "SAM -- AI Agent Monitoring & Orchestration", value: 9.2, color: "#666666", suffix: "B" },
                { label: "SOM -- Claude Code Power Users (Y1)", value: 0.08, color: "#999999", suffix: "B" },
                { label: "SOM -- Multi-Platform (Y3)", value: 1.1, color: "#333333", suffix: "B" },
              ]}
              maxValue={55}
            />

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
            >
              {[
                { label: "TAM", value: "$51.8B", desc: "Total AI dev tools market by 2030 (Grand View Research)" },
                { label: "SAM", value: "$9.2B", desc: "AI agent monitoring, orchestration, and analytics" },
                { label: "SOM (Y3)", value: "$1.1B", desc: "Capturable across Claude Code, Cursor, Copilot users" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="p-4"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #000000",
                  }}
                >
                  <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-1">
                    {m.label}
                  </p>
                  <p className="text-lg font-mono text-[#000000]">{m.value}</p>
                  <p className="text-[10px] font-mono text-[#666666] mt-1">{m.desc}</p>
                </div>
              ))}
            </div>

            <BarChart
              title="AI Coding Tool Active Users (2026 estimates)"
              items={[
                { label: "GitHub Copilot", value: 1800, color: "#000000", suffix: "K paid" },
                { label: "Claude Code", value: 1000, color: "#333333", suffix: "K WAU" },
                { label: "Cursor", value: 700, color: "#666666", suffix: "K paid" },
                { label: "Windsurf (Codeium)", value: 400, color: "#999999", suffix: "K MAU" },
                { label: "Others (Devin, Aider, etc.)", value: 300, color: "#aaa", suffix: "K MAU" },
              ]}
              maxValue={2000}
            />
          </div>
        </Section>

        {/* ================================================================
            SECTION 2 -- Competitive Landscape
            ================================================================ */}
        <Section id="competitive-landscape" number="02" title="Competitive Landscape">
          <p className="text-xs font-mono text-[#000000] leading-relaxed mb-4">
            Mission Control occupies a{" "}
            <InfoTooltip term="greenfield position" definition="No direct competitor offers real-time WebSocket monitoring, context window tracking, token cost analytics, AI-powered summaries, and multi-session orchestration for AI coding agents. The closest alternatives are informal workarounds." />{" "}
            in the market. There is essentially no direct competitor. Existing
            alternatives are fragmented, informal, and lack the depth required
            by power users running 5+ concurrent AI coding sessions.
          </p>

          <ComparisonTable
            headers={["Mission Control", "gmr/claude-status", "tmux/screen", "IDE Extensions", "Nothing (alt-tab)"]}
            highlightCol={0}
            rows={[
              { feature: "Real-time session monitoring", values: ["Yes", "Partial", "No", "Single session", "No"] },
              { feature: "Context window tracking (X/1M)", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "Token cost analytics", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "Multi-session dashboard", values: ["Yes", "No", "Partial", "No", "No"] },
              { feature: "Multi-config directory support", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "WebSocket live updates", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "AI-powered session summaries", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "Voice input (Wispr Flow)", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "Keyboard-driven navigation", values: ["Full", "No", "Partial", "N/A", "N/A"] },
              { feature: "Animated pixel art creatures", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "Browser notifications", values: ["Yes", "No", "No", "Partial", "No"] },
              { feature: "Cross-platform (web-based)", values: ["Yes", "No (macOS only)", "Yes", "IDE-locked", "N/A"] },
              { feature: "Setup time", values: ["< 2 min", "5 min", "15+ min", "Varies", "N/A"] },
            ]}
          />

          <div
            className="mt-4 p-4"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #000000",
            }}
          >
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-2">
              Key Differentiation
            </p>
            <ul className="space-y-2">
              {[
                "Only product purpose-built for multi-session AI coding agent monitoring",
                "Real-time WebSocket architecture via chokidar file watching -- sub-second updates, no polling",
                "Auto-discovers all Claude Code config directories -- supports multiple API keys and project configs simultaneously",
                "Deep context window monitoring: token usage bars (X/1M format), cost tracking, efficiency scoring",
                "AI-powered session summaries via Claude Haiku -- understand what each session is doing at a glance",
                "Voice-first input via Wispr Flow integration -- press spacebar, dictate responses to agents",
                "Dieter Rams / MoMA-inspired design language -- signals quality and intentionality to developer audience",
                "160+ test suite (unit, component, integration) -- production-grade reliability",
              ].map((d, i) => (
                <li key={i} className="text-xs font-mono text-[#000000] flex gap-2">
                  <span className="text-[#666666] shrink-0">&gt;</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ================================================================
            SECTION 3 -- Customer Persona & Segmentation
            ================================================================ */}
        <Section id="customer-personas" number="03" title="Customer Persona & Segmentation">
          <p className="text-xs font-mono text-[#000000] leading-relaxed mb-6">
            Four primary customer segments, validated against actual usage
            patterns observed in the product.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonaCard
              name="Solo AI-First Developer"
              description="Power user running 5-10+ concurrent Claude Code sessions daily. Builds entire applications through AI-assisted development. The user who built Mission Control is this persona."
              painPoints={[
                "No visibility into which session needs input -- constant alt-tabbing",
                "Context windows fill up silently, wasting tokens and degrading output",
                "No way to track total token spend across sessions and configs",
                "Can't see session names, repos, or branches at a glance",
              ]}
              goals={[
                "Single pane of glass for all active sessions with real-time status",
                "Instant notification when a session needs human input",
                "Context window monitoring to optimize token usage",
                "Voice-first input to respond to agents without leaving dashboard",
              ]}
              wtp="$19/mo (saves 2+ hours/day in context switching, pays for itself in avoided token waste)"
            />
            <PersonaCard
              name="Agency / Studio"
              description="Team of 3-10 developers using Claude Code for client projects. Each project has its own Claude session and config. Need visibility across all client work."
              painPoints={[
                "No shared visibility into team's AI sessions across client projects",
                "Can't estimate project costs from AI usage for client billing",
                "Junior devs waste tokens on poor prompts with no feedback loop",
                "No audit trail -- impossible to attribute AI usage to specific projects",
              ]}
              goals={[
                "Team-wide dashboard showing all active sessions across projects",
                "Token usage analytics broken down by project for cost estimation",
                "Help junior devs improve prompting efficiency with context metrics",
                "Usage reports for client billing and project retrospectives",
              ]}
              wtp="$49/seat/mo (justified by team productivity + client billing accuracy)"
            />
            <PersonaCard
              name="Enterprise Engineering Team"
              description="20-200+ developers at a company adopting AI-assisted development. Need governance, compliance, cost controls, and visibility into AI tool usage."
              painPoints={[
                "No enterprise controls or visibility over AI tool usage across teams",
                "Security team needs audit logs for AI interactions with codebase",
                "No SSO integration with existing identity providers",
                "Token costs are growing uncontrolled -- no budgeting or alerting",
              ]}
              goals={[
                "Centralized monitoring with role-based access controls",
                "Compliance-ready audit logs and usage reporting",
                "SSO / SAML integration with existing identity stack",
                "Token budget alerts and cost optimization recommendations",
              ]}
              wtp="$199/seat/mo (budget exists -- enterprises spend $15-50/seat/mo on Datadog, New Relic)"
            />
            <PersonaCard
              name="AI Startup Founder"
              description="Building AI-native products. Heavy Claude API usage for both development and production. Tokens are the largest line item after headcount."
              painPoints={[
                "Token costs are the largest variable expense -- no visibility into where they go",
                "Context window inefficiency wastes 20-40% of tokens on redundant context",
                "Debugging agent sessions requires log archaeology after the fact",
                "Can't see in real-time what AI sessions are doing across the team",
              ]}
              goals={[
                "Real-time visibility into all active AI coding sessions",
                "Token cost tracking and optimization to reduce burn rate",
                "Context window efficiency metrics to improve prompting practices",
                "Integration path with existing observability tools",
              ]}
              wtp="$19-49/seat/mo (direct ROI from reduced token waste, 10-30% savings typical)"
            />
          </div>
        </Section>

        {/* ================================================================
            SECTION 4 -- Industry Trend Analysis
            ================================================================ */}
        <Section id="industry-trends" number="04" title="Industry Trend Analysis">
          <div className="space-y-6">
            {[
              {
                trend: "AI-Assisted Coding Is Now Standard Practice",
                detail:
                  "GitHub's 2026 developer survey reports 97% of professional developers have used AI coding tools, up from 92% in late 2025. Claude Code, Cursor, and GitHub Copilot have moved from novelty to essential infrastructure. Stack Overflow's 2026 survey shows AI tools are now the #2 most important tool after the IDE itself. The developer who processes 100M+ tokens in 2 months is not an outlier -- this is the new baseline for high-output engineering.",
                metric: "97% developer adoption (GitHub, 2026). 5M+ active AI coding tool users globally.",
              },
              {
                trend: "Multi-Session, Multi-Agent Workflows Are Emerging",
                detail:
                  "Power users are moving from single to multi-session workflows. Claude Code users routinely run 5-10 concurrent sessions across different repos and branches. Claude Code's subagent capability, Cursor's multi-file editing, and tools like Devin represent a shift toward AI agent fleets. This creates exponential demand for monitoring -- managing 10 terminal tabs is not a workflow, it's chaos.",
                metric: "5-10+ concurrent sessions per power user. Claude Code subagent adoption growing 40%+ MoM.",
              },
              {
                trend: "Context Window Economics: Tokens = Money",
                detail:
                  "At $3-15 per million tokens (depending on model tier), a power user's 100M+ tokens per month represents $300-1,500 in direct API costs. With Claude's 200K context window and emerging 1M windows, inefficient context management wastes 20-40% of tokens. Context window monitoring pays for itself by identifying wasted tokens, redundant context, and suboptimal prompting patterns. A $19/mo tool that saves 15% on a $500/mo token bill delivers immediate ROI.",
                metric: "$300-1,500/user/month in token costs. 20-40% potential waste reduction.",
              },
              {
                trend: "Developer Productivity Tooling Spend Accelerating",
                detail:
                  "Enterprise spend on developer productivity tools grew 31% YoY in 2025 (IDC). Companies that invested in AI coding tools are now looking for the observability and governance layer. This is the same pattern that drove Datadog to $2.1B revenue (FY2025), and the same pattern playing out for AI-native workflows. The monitoring layer always follows the infrastructure layer.",
                metric: "31% YoY growth in dev tool budgets (IDC, 2025). Datadog at $2.1B ARR proves the model.",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-4"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #000000",
                  borderLeft: "3px solid #000000",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4 className="text-xs font-mono uppercase tracking-widest text-[#000000] font-bold">
                    {t.trend}
                  </h4>
                </div>
                <p className="text-xs font-mono text-[#000000] leading-relaxed mb-2">
                  {t.detail}
                </p>
                <p className="text-[10px] font-mono text-[#666666]">
                  Key metric: {t.metric}
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ================================================================
            SECTION 5 -- SWOT + Porter's Five Forces
            ================================================================ */}
        <Section id="swot-porters" number="05" title="SWOT Analysis & Porter's Five Forces">
          <p className="text-xs font-mono text-[#000000] leading-relaxed mb-6">
            Strategic position assessment based on current market conditions and
            the product as built.
          </p>

          <SWOTAnalysis
            data={{
              strengths: [
                "Working product with 160+ tests -- not a concept, a shipping tool",
                "First mover in AI agent monitoring -- no direct competitors",
                "Real-time WebSocket architecture via chokidar (sub-second updates)",
                "Auto-discovers all Claude Code config directories across the system",
                "Open-source agent builds trust and drives organic adoption",
                "Dieter Rams / MoMA aesthetic signals craft and intentionality",
                "Monorepo architecture with shared types -- clean engineering",
                "Voice-first input (Wispr Flow) and keyboard-driven navigation",
              ],
              weaknesses: [
                "Currently Claude Code-only (single platform dependency)",
                "Solo developer stage -- single point of failure",
                "No enterprise features yet (SSO, audit logs, RBAC)",
                "Pre-revenue -- product is built but monetization is ahead",
                "Brand awareness limited to Claude Code power user community",
              ],
              opportunities: [
                "Expand to Cursor, Copilot, Windsurf -- same monitoring architecture applies",
                "Enterprise tier with compliance features ($199/seat/mo)",
                "Token cost optimization engine (AI-powered efficiency recommendations)",
                "npx-installable agent for zero-friction distribution",
                "Partnership with Anthropic for official Claude Code integration",
                "General AI agent monitoring beyond coding (support, research, data agents)",
              ],
              threats: [
                "Anthropic builds native monitoring into Claude Code",
                "Claude Code changes internal file format / session structure",
                "Well-funded competitor enters with VC backing and sales team",
                "AI coding tools consolidate (fewer platforms to support)",
                "Open source clone gains traction before monetization",
              ],
            }}
          />

          <div className="mt-6">
            <PortersFiveForces
              forces={[
                {
                  force: "Threat of New Entrants",
                  score: 5,
                  note: "Low barriers to building a basic dashboard, but deep Claude Code integration knowledge, 160+ test suite, and design quality are hard to replicate quickly. First-mover and community trust matter in developer tools.",
                },
                {
                  force: "Bargaining Power of Suppliers",
                  score: 8,
                  note: "High dependency on Anthropic's Claude Code file format and session structure. Mitigated by expanding to multiple AI tools and abstracting the file parsing into an adapter layer.",
                },
                {
                  force: "Bargaining Power of Buyers",
                  score: 4,
                  note: "No alternatives exist for this functionality. Switching cost is low (free tier), but value delivered is high. Enterprise buyers have more leverage but also more budget.",
                },
                {
                  force: "Threat of Substitutes",
                  score: 3,
                  note: "tmux, custom scripts, and alt-tabbing are poor substitutes. The gap between these and a real-time monitoring dashboard with AI summaries and voice input is enormous.",
                },
                {
                  force: "Industry Rivalry",
                  score: 2,
                  note: "Effectively zero direct competition. gmr/claude-status is a macOS menu bar widget with limited functionality. The market category barely exists yet.",
                },
              ]}
            />
          </div>
        </Section>

        {/* ================================================================
            SECTION 6 -- Pricing Strategy
            ================================================================ */}
        <Section id="pricing" number="06" title="Pricing Strategy">
          <p className="text-xs font-mono text-[#000000] leading-relaxed mb-6">
            Open-source core with freemium SaaS tiers. Pricing is anchored to
            developer tool benchmarks ($10-50/seat/mo for productivity tools)
            and direct ROI from time saved and tokens optimized.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                tier: "Free",
                price: "$0",
                period: "forever",
                highlight: false,
                features: [
                  "Open source agent + dashboard",
                  "Up to 3 concurrent sessions",
                  "Real-time session monitoring",
                  "Keyboard navigation",
                  "Pixel art creatures",
                  "Community support",
                ],
                cta: "Get Started",
              },
              {
                tier: "Pro",
                price: "$19",
                period: "/month",
                highlight: true,
                features: [
                  "Everything in Free",
                  "Unlimited sessions",
                  "AI-powered summaries (Haiku)",
                  "Wispr Flow voice integration",
                  "Context window analytics",
                  "Token cost tracking",
                  "Session history (30 days)",
                  "Email support",
                ],
                cta: "Start Trial",
              },
              {
                tier: "Team",
                price: "$49",
                period: "/seat/month",
                highlight: false,
                features: [
                  "Everything in Pro",
                  "Shared team dashboard",
                  "Team token analytics",
                  "Usage reports by project",
                  "Session history (90 days)",
                  "Priority support",
                ],
                cta: "Start Trial",
              },
              {
                tier: "Enterprise",
                price: "$199",
                period: "/seat/month",
                highlight: false,
                features: [
                  "Everything in Team",
                  "SSO / SAML integration",
                  "Audit logs & compliance",
                  "Hosted cloud dashboard",
                  "Unlimited history",
                  "Dedicated support + SLA",
                  "Custom integrations",
                ],
                cta: "Contact Sales",
              },
            ].map((plan) => (
              <div
                key={plan.tier}
                className="p-4 flex flex-col"
                style={{
                  backgroundColor: plan.highlight ? "#000000" : "#ffffff",
                  border: "1px solid #000000",
                }}
              >
                <p
                  className="text-[10px] font-mono uppercase tracking-widest mb-1"
                  style={{ color: plan.highlight ? "#ffffff" : "#666666" }}
                >
                  {plan.tier}
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span
                    className="text-lg font-mono"
                    style={{ color: plan.highlight ? "#ffffff" : "#000000" }}
                  >
                    {plan.price}
                  </span>
                  <span
                    className="text-xs font-mono"
                    style={{ color: plan.highlight ? "#999999" : "#666666" }}
                  >
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map((f, i) => (
                    <li
                      key={i}
                      className="text-[11px] font-mono flex gap-2"
                      style={{ color: plan.highlight ? "#ffffff" : "#000000" }}
                    >
                      <span style={{ color: plan.highlight ? "#999999" : "#666666" }}>+</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className="text-center p-2 text-xs font-mono uppercase tracking-widest"
                  style={{
                    border: plan.highlight ? "1px solid #ffffff" : "1px solid #000000",
                    color: plan.highlight ? "#ffffff" : "#000000",
                  }}
                >
                  {plan.cta}
                </div>
              </div>
            ))}
          </div>

          <div
            className="mt-4 p-4"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #000000",
            }}
          >
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-2">
              Pricing Rationale
            </p>
            <p className="text-xs font-mono text-[#000000] leading-relaxed">
              At $19/mo, Pro pays for itself if it saves a developer 20 minutes
              per week in context-switching overhead, or prevents $20+/mo in
              wasted tokens from context window mismanagement. For a developer
              spending $500/mo on Claude API tokens, a 15% efficiency gain from
              context monitoring saves $75/mo -- a 4x return on the subscription.
              Team pricing at $49/seat is anchored to developer tool benchmarks:
              Datadog ($23-33/host/mo), Linear ($8-16/seat/mo), GitHub Enterprise
              ($21/seat/mo). Enterprise at $199/seat includes hosted infrastructure,
              SSO, and compliance features that enterprises require and budget for.
            </p>
          </div>
        </Section>

        {/* ================================================================
            SECTION 7 -- Go-to-Market Strategy
            ================================================================ */}
        <Section id="gtm" number="07" title="Go-to-Market Strategy">
          <div className="space-y-6">
            {/* Phases */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  phase: "Phase 1: Foundation",
                  timeline: "Q1-Q2 2026 (now)",
                  items: [
                    "Open-source agent on npm/GitHub",
                    "Free dashboard with core monitoring",
                    "Launch on Hacker News, Reddit, X",
                    "Claude Code community presence",
                    "Content marketing (blog, demos, pixel art)",
                    "Target: 1,000 free users",
                  ],
                },
                {
                  phase: "Phase 2: Monetization",
                  timeline: "Q3-Q4 2026",
                  items: [
                    "Launch Pro tier ($19/mo)",
                    "AI summaries + voice input as Pro features",
                    "Context analytics + token cost tracking",
                    "Session history & replay",
                    "Referral program (1 month free)",
                    "Target: 300 paying users",
                  ],
                },
                {
                  phase: "Phase 3: Scale",
                  timeline: "2027",
                  items: [
                    "Team & Enterprise tiers",
                    "Hosted cloud dashboard option",
                    "Cursor + Copilot integration",
                    "npx-installable agent (zero-friction setup)",
                    "SOC 2 compliance process",
                    "Target: 2,000 paying users",
                  ],
                },
              ].map((p) => (
                <div
                  key={p.phase}
                  className="p-4"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #000000",
                    borderTop: "3px solid #000000",
                  }}
                >
                  <p className="text-xs font-mono uppercase tracking-widest mb-1 text-[#000000] font-bold">
                    {p.phase}
                  </p>
                  <p className="text-[10px] font-mono text-[#666666] mb-3">
                    {p.timeline}
                  </p>
                  <ul className="space-y-2">
                    {p.items.map((item, i) => (
                      <li key={i} className="text-xs font-mono text-[#000000] flex gap-2">
                        <span className="text-[#666666]">&gt;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Channel strategy */}
            <div
              className="p-4"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #000000",
              }}
            >
              <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-3">
                Channel Strategy & Expected ROI
              </p>
              <div className="space-y-3">
                {[
                  { channel: "GitHub / npm", roi: "High", cost: "Free", desc: "Open-source agent drives organic discovery. README to dashboard link conversion. npx installable for zero friction." },
                  { channel: "Hacker News / Reddit", roi: "High", cost: "Free", desc: "Technical audience, high intent. 'Show HN' launch with demo video. r/ClaudeAI, r/cursor, r/programming." },
                  { channel: "X / Twitter", roi: "High", cost: "Free", desc: "AI dev community is extremely active on X. Pixel art creatures + demo clips are shareable content." },
                  { channel: "Claude Code Discord/Forum", roi: "High", cost: "Free", desc: "Direct access to target power users. Community support builds trust. Anthropic developer community." },
                  { channel: "Content Marketing", roi: "Medium", cost: "Low", desc: "Blog posts on AI coding workflows, token optimization, multi-session patterns. SEO for 'Claude Code dashboard'." },
                  { channel: "Direct Sales (Enterprise)", roi: "High", cost: "Medium", desc: "Outbound to companies with 20+ Claude Code / Cursor licenses. High ACV justifies sales effort." },
                ].map((ch, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 shrink-0 w-16 text-center"
                      style={{
                        color: "#000000",
                        border: "1px solid #000000",
                      }}
                    >
                      {ch.roi}
                    </span>
                    <div className="flex-1">
                      <span className="text-xs font-mono text-[#000000]">
                        {ch.channel}
                      </span>
                      <span className="text-[10px] font-mono text-[#666666] ml-2">
                        ({ch.cost} cost)
                      </span>
                      <p className="text-[10px] font-mono text-[#666666] mt-0.5">
                        {ch.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ================================================================
            SECTION 8 -- Customer Journey Mapping
            ================================================================ */}
        <Section id="customer-journey" number="08" title="Customer Journey Mapping">
          <p className="text-xs font-mono text-[#000000] leading-relaxed mb-6">
            Six-stage customer journey from initial awareness to long-term
            retention and advocacy. Validated against actual onboarding experience.
          </p>

          <div className="space-y-0">
            {[
              {
                stage: "01 Awareness",
                touchpoints: "GitHub, HN, Reddit, X, word-of-mouth, pixel art screenshots",
                action: "Developer discovers Mission Control while looking for ways to manage multiple Claude Code sessions. Pixel art creatures and clean design catch attention on social media.",
                metric: "GitHub stars, npm downloads, site visits",
              },
              {
                stage: "02 Consideration",
                touchpoints: "README, demo video, whitepaper, free tier",
                action: "Evaluates Mission Control against alternatives (tmux, manual alt-tabbing, nothing). Reads README, watches demo showing Grid and Orbital views with live sessions.",
                metric: "README engagement, demo video completion rate, whitepaper visits",
              },
              {
                stage: "03 Decision",
                touchpoints: "npm install, first dashboard load, real-time sessions appear",
                action: "Installs agent, starts dashboard. Sessions appear in real-time within seconds. Animated creatures come alive. 'Aha moment' in under 2 minutes.",
                metric: "Install-to-first-session time (<2 min target), activation rate",
              },
              {
                stage: "04 Onboarding",
                touchpoints: "Dashboard, keyboard shortcuts, voice input, multi-config",
                action: "Discovers keyboard navigation (arrow keys, spacebar, enter). Tries voice input via Wispr Flow. Adds additional config directories. Switches between Grid and Orbital views.",
                metric: "Features used in first week, number of sessions monitored, voice input adoption",
              },
              {
                stage: "05 Engagement",
                touchpoints: "Daily usage, context monitoring, Pro upgrade",
                action: "Mission Control becomes the default workflow hub. Context window monitoring surfaces token waste. Hits free tier 3-session limit. Context analytics drives Pro upgrade decision.",
                metric: "DAU/MAU ratio (target >40%), free-to-paid conversion rate",
              },
              {
                stage: "06 Loyalty",
                touchpoints: "Team invite, referrals, community contribution",
                action: "Recommends to team or agency colleagues. Upgrades to Team plan. Contributes feedback or agent adapters to community. Becomes advocate on X/Reddit.",
                metric: "NPS (target >50), referral rate, team plan upgrades",
              },
            ].map((s, i) => (
              <div
                key={i}
                className="flex gap-4"
              >
                {/* Timeline line */}
                <div className="flex flex-col items-center shrink-0 w-8">
                  <div
                    className="w-3 h-3 shrink-0"
                    style={{
                      backgroundColor: "#000000",
                    }}
                  />
                  {i < 5 && (
                    <div
                      className="w-px flex-1"
                      style={{ backgroundColor: "#000000" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div
                  className="flex-1 mb-4 p-4"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #000000",
                  }}
                >
                  <p className="text-xs font-mono uppercase tracking-widest mb-2 text-[#000000] font-bold">
                    {s.stage}
                  </p>
                  <p className="text-xs font-mono text-[#000000] leading-relaxed mb-2">
                    {s.action}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <p className="text-[10px] font-mono text-[#666666]">
                      Touchpoints: <span className="text-[#000000]">{s.touchpoints}</span>
                    </p>
                    <p className="text-[10px] font-mono text-[#666666]">
                      KPI: <span className="text-[#000000]">{s.metric}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ================================================================
            SECTION 9 -- Financial Model & Unit Economics
            ================================================================ */}
        <Section id="financials" number="09" title="Financial Model & Unit Economics">
          <div className="space-y-6">
            <p className="text-xs font-mono text-[#000000] leading-relaxed mb-2">
              Developer tool economics with open-source core driving viral
              growth. Lower price points than the original thesis but higher
              adoption potential. Token monitoring creates a natural upsell --
              users who see their spend want to optimize it.
            </p>

            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "LTV (Pro)", value: "$342", desc: "18-mo avg retention x $19/mo" },
                { label: "CAC", value: "$28", desc: "Blended (open-source drives organic)" },
                { label: "LTV:CAC", value: "12.2x", desc: "Target: >3x. Open-source core keeps CAC low." },
                { label: "Gross Margin", value: "93%", desc: "Agent runs locally. Minimal hosting." },
              ].map((m) => (
                <div
                  key={m.label}
                  className="p-4"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #000000",
                  }}
                >
                  <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-1">
                    {m.label}
                  </p>
                  <p className="text-lg font-mono text-[#000000] font-bold">
                    {m.value}
                  </p>
                  <p className="text-[10px] font-mono text-[#666666] mt-1">{m.desc}</p>
                </div>
              ))}
            </div>

            {/* 3-year projection */}
            <BarChart
              title="3-Year Revenue Projection (ARR)"
              items={[
                { label: "Year 1 -- Pro early adopters (300 users x $19)", value: 68, color: "#999999", suffix: "K" },
                { label: "Year 2 -- Pro + Team tiers (1,200 Pro + 80 Team)", value: 420, color: "#666666", suffix: "K" },
                { label: "Year 3 -- Enterprise + expansion (2K Pro + 200 Team + 30 Ent)", value: 1800, color: "#000000", suffix: "K" },
              ]}
              maxValue={2000}
            />

            {/* Assumptions & unit economics detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="p-4"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #000000",
                }}
              >
                <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-3">
                  Key Assumptions
                </p>
                <div className="space-y-2">
                  {[
                    "Free-to-paid conversion: 6% (developer tools avg 2-5%, token visibility drives higher conversion)",
                    "Monthly churn: 5% (Pro), 3% (Team), 1.5% (Enterprise)",
                    "Average expansion revenue: 12% annually (seat growth + tier upgrades)",
                    "Y1: 300 Pro subscribers by month 12",
                    "Y2: 1,200 Pro + 80 Team subscribers",
                    "Y3: 2,000 Pro + 200 Team + 30 Enterprise",
                    "CAC payback period: 1.5 months (Pro), driven by organic/open-source",
                    "No external funding assumed in base case",
                  ].map((a, i) => (
                    <p key={i} className="text-xs font-mono text-[#000000] flex gap-2">
                      <span className="text-[#666666] shrink-0">&gt;</span>
                      <span>{a}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div
                className="p-4"
                style={{
                  backgroundColor: "#ffffff",
                  border: "1px solid #000000",
                }}
              >
                <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-3">
                  Gross Margin Analysis (Pro tier)
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Revenue (per Pro user/mo)", value: "$19.00" },
                    { label: "Haiku API (AI summaries)", value: "-$0.30" },
                    { label: "Hosting (Vercel/edge)", value: "-$0.25" },
                    { label: "WebSocket infrastructure", value: "-$0.20" },
                    { label: "Payment processing (3%)", value: "-$0.57" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-xs font-mono text-[#000000]">{item.label}</span>
                      <span className="text-xs font-mono text-[#666666]">{item.value}</span>
                    </div>
                  ))}
                  <div
                    className="flex justify-between pt-2"
                    style={{ borderTop: "1px solid #000000" }}
                  >
                    <span className="text-xs font-mono text-[#000000]">Gross Profit</span>
                    <span className="text-xs font-mono text-[#000000] font-bold">$17.68 (93.1%)</span>
                  </div>
                  <p className="text-[10px] font-mono text-[#666666] mt-2">
                    Software-like margins. The agent runs locally on user machines,
                    so compute costs are borne by the user. Haiku API costs for
                    AI summaries are minimal ($0.25/M input tokens). Dashboard
                    hosting is edge-deployed with near-zero marginal cost per user.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ================================================================
            SECTION 10 -- Risk Assessment & Scenario Planning
            ================================================================ */}
        <Section id="risk" number="10" title="Risk Assessment & Scenario Planning">
          <p className="text-xs font-mono text-[#000000] leading-relaxed mb-6">
            Probability x impact assessment for key risk factors, with
            mitigation strategies and scenario modeling.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <RiskItem
              risk="Claude Code changes internal file format or session structure"
              probability="High"
              impact="High"
              mitigation="Abstract file parsing into adapter layer (already architected). Monitor Claude Code releases. Automated format detection. Community reports format changes quickly."
            />
            <RiskItem
              risk="Anthropic builds a native monitoring dashboard into Claude Code"
              probability="Medium"
              impact="High"
              mitigation="Multi-tool support (Cursor, Copilot) makes us platform-agnostic. Depth of features (AI summaries, voice input, pixel art) goes beyond basic monitoring. History suggests platforms partner with, not replace, monitoring tools (AWS + Datadog pattern)."
            />
            <RiskItem
              risk="Well-funded competitor enters the AI agent monitoring space"
              probability="Medium"
              impact="Medium"
              mitigation="First-mover advantage + community trust. Open-source agent creates ecosystem lock-in. 160+ test suite and production quality are hard to replicate quickly. Speed of execution as a solo developer is actually an advantage."
            />
            <RiskItem
              risk="AI coding tools consolidate (fewer platforms to monitor)"
              probability="Low"
              impact="Medium"
              mitigation="Diversify early to support multiple AI coding tools. Build the 'Datadog for AI agents' position -- platform-agnostic monitoring. Even in consolidation, the monitoring layer is needed."
            />
            <RiskItem
              risk="Developer pushback on telemetry / privacy concerns"
              probability="Medium"
              impact="Low"
              mitigation="All data stays local by default -- the agent never phones home. Open-source agent is fully auditable. Cloud features are opt-in only. Privacy-first architecture is a competitive advantage."
            />
            <RiskItem
              risk="Token costs drop dramatically, reducing cost-monitoring value prop"
              probability="Medium"
              impact="Low"
              mitigation="Cost monitoring is one benefit among many. Primary value is productivity (time saved, workflow visibility, session awareness). Cheaper tokens actually increase usage, which increases the need for monitoring."
            />
          </div>

          {/* Scenario planning */}
          <div
            className="p-4"
            style={{
              backgroundColor: "#ffffff",
              border: "1px solid #000000",
            }}
          >
            <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-4">
              Scenario Planning (3-Year ARR)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  scenario: "Best Case",
                  arr: "$3.6M",
                  assumptions: [
                    "Anthropic partnership or official integration",
                    "12% free-to-paid conversion",
                    "Early enterprise traction via agencies",
                    "Multi-platform (Cursor, Copilot) by Y2",
                    "Viral growth from pixel art / design on X",
                  ],
                },
                {
                  scenario: "Base Case",
                  arr: "$1.8M",
                  assumptions: [
                    "Organic growth via open-source + content",
                    "6% free-to-paid conversion",
                    "Gradual team/enterprise sales",
                    "Multi-platform by Y3",
                    "Steady community growth",
                  ],
                },
                {
                  scenario: "Worst Case",
                  arr: "$280K",
                  assumptions: [
                    "Claude Code format breaks, 3-month recovery",
                    "2% free-to-paid conversion",
                    "No enterprise traction",
                    "Competitor enters by Y2 with funding",
                    "Remains Claude Code-only tool",
                  ],
                },
              ].map((s, i) => (
                <div key={s.scenario}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span className="text-xs font-mono uppercase tracking-widest text-[#000000] font-bold">
                      {s.scenario}
                    </span>
                    <span className="text-sm font-mono text-[#000000]">
                      {s.arr}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {s.assumptions.map((a, j) => (
                      <li key={j} className="text-[10px] font-mono text-[#666666] flex gap-2">
                        <span className="text-[#000000]">&gt;</span>
                        <span>{a}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ================================================================
            SECTION 11 -- Market Entry & Expansion Strategy
            ================================================================ */}
        <Section id="expansion" number="11" title="Market Entry & Expansion Strategy">
          <div className="space-y-6">
            <p className="text-xs font-mono text-[#000000] leading-relaxed">
              Three-phase expansion from Claude Code-specific tool to the
              universal monitoring standard for AI coding agents, and eventually
              all AI agents.
            </p>

            {/* Expansion phases */}
            <div className="space-y-4">
              {[
                {
                  phase: "Phase 1: Claude Code (Now -- Working Product)",
                  market: "1M+ Claude Code WAU",
                  strategy: "Deep integration with Claude Code internals via chokidar file watching. Open-source agent distributed via npm (future: npx). Auto-discovers all config directories. Build the definitive Claude Code monitoring experience with AI summaries, voice input, pixel art creatures, and keyboard-driven navigation. 160+ tests ensure production reliability.",
                  moat: "Intimate knowledge of Claude Code session format, .claude directory structure, and config patterns. Working product with comprehensive test suite. Community trust from open-source contribution.",
                },
                {
                  phase: "Phase 2: AI Coding Tools (2027)",
                  market: "5M+ AI coding tool users",
                  strategy: "Extend agent adapter layer to monitor Cursor, GitHub Copilot, Windsurf, and Codeium sessions. Unified dashboard for developers using multiple AI coding tools. Plugin architecture for community-contributed integrations. Same WebSocket architecture scales to any file-based agent.",
                  moat: "Cross-platform monitoring is a harder problem than single-tool monitoring. Data normalization across different agent formats creates technical moat. Network effects from community-contributed adapters.",
                },
                {
                  phase: "Phase 3: General AI Agent Monitoring (2028+)",
                  market: "$9.2B AI agent monitoring TAM",
                  strategy: "Expand beyond coding to any AI agent workflow: research agents, support agents, data analysis agents. Position as 'Datadog for AI agents' -- the observability layer for the agentic era. Enterprise features (SSO, audit, compliance) enable large deployments.",
                  moat: "Brand, data network effects, enterprise relationships, and deep technical expertise in agent monitoring built over 2+ years. Open-source ecosystem of adapters.",
                },
              ].map((p) => (
                <div
                  key={p.phase}
                  className="p-4"
                  style={{
                    backgroundColor: "#ffffff",
                    border: "1px solid #000000",
                    borderLeft: "3px solid #000000",
                  }}
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="text-xs font-mono uppercase tracking-widest text-[#000000] font-bold">
                      {p.phase}
                    </p>
                    <span className="text-[10px] font-mono text-[#666666]">
                      {p.market}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#000000] leading-relaxed mb-2">
                    {p.strategy}
                  </p>
                  <p className="text-[10px] font-mono text-[#666666]">
                    Moat: {p.moat}
                  </p>
                </div>
              ))}
            </div>

            {/* Partnership analysis */}
            <div
              className="p-4"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #000000",
              }}
            >
              <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-3">
                Partnership Analysis
              </p>
              <div className="space-y-3">
                {[
                  {
                    partner: "Anthropic",
                    type: "Strategic",
                    value: "Official Claude Code integration, early API access, co-marketing. Mission Control validates Claude Code's power user segment. Could lead to acqui-hire or official partnership.",
                    likelihood: "Medium",
                  },
                  {
                    partner: "Cursor / Anysphere",
                    type: "Integration",
                    value: "Extend monitoring to Cursor's 700K+ paying users. Shared user base with Claude Code. Plugin marketplace listing.",
                    likelihood: "High",
                  },
                  {
                    partner: "Vercel / Netlify",
                    type: "Distribution",
                    value: "Deploy dashboard as a Vercel template. Distribution to developer audience. Next.js-native architecture is already Vercel-optimized.",
                    likelihood: "High",
                  },
                  {
                    partner: "Wispr / Voice AI",
                    type: "Integration",
                    value: "Deep integration already built with Wispr Flow. Co-marketing to shared developer audience. Voice-first development workflow.",
                    likelihood: "High",
                  },
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 shrink-0"
                      style={{
                        color: "#000000",
                        border: "1px solid #000000",
                      }}
                    >
                      {p.likelihood}
                    </span>
                    <div className="flex-1">
                      <span className="text-xs font-mono text-[#000000]">
                        {p.partner}
                      </span>
                      <span className="text-[10px] font-mono text-[#666666] ml-2">
                        ({p.type})
                      </span>
                      <p className="text-[10px] font-mono text-[#666666] mt-0.5">
                        {p.value}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Section>

        {/* ================================================================
            SECTION 12 -- Executive Strategy Synthesis
            ================================================================ */}
        <Section id="synthesis" number="12" title="Executive Strategy Synthesis">
          <div className="space-y-6">
            {/* What has been built */}
            <div
              className="p-6"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #000000",
              }}
            >
              <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-4">
                What Has Been Built
              </p>
              <p className="text-xs font-mono text-[#000000] leading-relaxed mb-4">
                Mission Control is not a concept or a prototype. It is a{" "}
                <span className="font-bold">working, tested, shipping product</span>.
                The codebase includes:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { item: "Local agent", desc: "Auto-discovers all Claude Code config directories, watches sessions via chokidar, streams real-time updates over WebSocket" },
                  { item: "Next.js dashboard", desc: "Two views (Grid cards + Orbital circles), keyboard navigation, mouse support, browser notifications" },
                  { item: "AI summaries", desc: "Claude Haiku generates intelligent session descriptions based on activity" },
                  { item: "Voice input", desc: "Wispr Flow integration -- press spacebar to dictate responses to any agent" },
                  { item: "Pixel art creatures", desc: "Unique animated animals per session that change behavior based on activity type" },
                  { item: "Context monitoring", desc: "Token usage bars (X/1M format), cost tracking, context window efficiency" },
                  { item: "Test suite", desc: "160+ tests across unit, component, and integration -- production-grade reliability" },
                  { item: "Monorepo architecture", desc: "Shared types package, standalone agent (future: npx), Next.js dashboard -- clean separation of concerns" },
                ].map((f) => (
                  <div key={f.item} className="flex gap-2">
                    <span className="text-xs font-mono text-[#666666] shrink-0">&gt;</span>
                    <div>
                      <span className="text-xs font-mono text-[#000000] font-bold">{f.item}:</span>{" "}
                      <span className="text-xs font-mono text-[#000000]">{f.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opportunity summary */}
            <div
              className="p-6"
              style={{
                backgroundColor: "#000000",
                border: "1px solid #000000",
              }}
            >
              <p className="text-[10px] font-mono text-[#999999] uppercase tracking-widest mb-4">
                The Opportunity
              </p>
              <p className="text-xs font-mono text-[#ffffff] leading-relaxed mb-4">
                Mission Control is positioned to become the{" "}
                <span className="font-bold">Datadog for AI agents</span> -- the
                essential monitoring and orchestration layer for the agentic
                development era. With no direct competitors, a growing market of
                1M+ Claude Code weekly active users (expanding to 5M+ across all
                AI coding tools), and a capital-efficient SaaS model with 93%+
                gross margins, the opportunity is both large and executable.
              </p>
              <p className="text-xs font-mono text-[#ffffff] leading-relaxed">
                The developer who runs 10 concurrent AI coding sessions and
                processes 100M+ tokens per month is not an anomaly -- they are
                the leading edge of a wave. As AI-assisted development moves from
                &quot;most developers use it&quot; to &quot;it is how all software
                is built,&quot; the need for monitoring, analytics, and
                orchestration becomes non-negotiable. Mission Control is building
                that layer today, and it already works.
              </p>
            </div>

            {/* Investment options */}
            <div
              className="p-4"
              style={{
                backgroundColor: "#ffffff",
                border: "1px solid #000000",
              }}
            >
              <p className="text-[10px] font-mono text-[#666666] uppercase tracking-widest mb-4">
                Investment Options
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    option: "Conservative",
                    amount: "$0 (Bootstrap)",
                    timeline: "36 months to $1.8M ARR",
                    details: [
                      "Self-funded from early revenue",
                      "Slower growth, full ownership retained",
                      "Focus on Pro tier + organic growth",
                      "Team/Enterprise in Year 2",
                      "Risk: slower to capture market window",
                    ],
                  },
                  {
                    option: "Balanced",
                    amount: "$500K Pre-Seed",
                    timeline: "24 months to $1.8M ARR",
                    details: [
                      "Hire 1 engineer + 1 GTM/community",
                      "Accelerate multi-platform support (Cursor, Copilot)",
                      "Enterprise features by Month 12",
                      "Target Series A at $2M+ ARR",
                      "12-18 months runway at current burn",
                    ],
                  },
                  {
                    option: "Aggressive",
                    amount: "$2M Seed",
                    timeline: "18 months to $3.6M ARR",
                    details: [
                      "Team of 5 (3 eng, 1 GTM, 1 design)",
                      "Multi-platform by Month 6",
                      "Enterprise sales team from Month 9",
                      "Target Series A at $4M+ ARR",
                      "18-24 months runway",
                    ],
                  },
                ].map((opt) => (
                  <div
                    key={opt.option}
                    className="p-4"
                    style={{
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #000000",
                    }}
                  >
                    <p className="text-xs font-mono uppercase tracking-widest mb-1 text-[#000000] font-bold">
                      {opt.option}
                    </p>
                    <p className="text-sm font-mono text-[#000000] mb-1">
                      {opt.amount}
                    </p>
                    <p className="text-[10px] font-mono text-[#666666] mb-3">
                      {opt.timeline}
                    </p>
                    <ul className="space-y-1">
                      {opt.details.map((d, i) => (
                        <li key={i} className="text-[10px] font-mono text-[#000000] flex gap-2">
                          <span className="text-[#666666]">&gt;</span>
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Contact form */}
            <div
              className="p-6"
              style={{
                backgroundColor: "#ffffff",
                border: "2px solid #000000",
              }}
            >
              <p className="text-xs font-mono text-[#000000] uppercase tracking-widest mb-2 font-bold">
                Interested in Learning More?
              </p>
              <p className="text-xs font-mono text-[#666666] mb-4">
                Leave your email and we will send detailed financials, a
                product demo, and access to the live dashboard.
              </p>
              {contactSent ? (
                <p className="text-xs font-mono text-[#000000] font-bold">
                  Received. We will be in touch.
                </p>
              ) : (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    try {
                      fetch("/api/whitepaper-contact", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: contactEmail, ts: Date.now() }),
                      }).catch(() => {})
                    } catch {
                      // silent
                    }
                    setContactSent(true)
                  }}
                >
                  <input
                    type="email"
                    required
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="flex-1 p-2 text-xs font-mono text-[#000000]"
                    style={{
                      backgroundColor: "#f5f5f5",
                      border: "1px solid #000000",
                    }}
                  />
                  <button
                    type="submit"
                    className="px-4 p-2 text-xs font-mono uppercase tracking-widest"
                    style={{
                      backgroundColor: "#000000",
                      border: "1px solid #000000",
                      color: "#ffffff",
                      cursor: "pointer",
                    }}
                  >
                    send
                  </button>
                </form>
              )}
            </div>

            {/* Footer */}
            <div className="text-center pt-8 pb-4">
              <p className="text-[10px] font-mono text-[#666666]">
                mission control &mdash; confidential investment thesis &mdash; march 2026
              </p>
              <p className="text-[10px] font-mono text-[#666666] mt-1">
                questions? reach out at invest@missioncontrol.dev
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
