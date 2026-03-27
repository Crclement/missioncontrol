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
      // Stub: track visit
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
    <div className="fixed inset-0 flex items-center justify-center" style={{ backgroundColor: "#0c0c0c" }}>
      <div
        className="w-full max-w-sm p-6"
        style={{
          backgroundColor: "#161616",
          border: "1px solid #2a2a2a",
          borderRadius: "2px",
        }}
      >
        <h1 className="text-sm font-mono text-muted tracking-widest uppercase mb-1">
          mission control
        </h1>
        <h2 className="text-xs font-mono text-[#e0e0e0] mb-6">
          Investment Thesis &mdash; Confidential
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-[10px] font-mono text-muted uppercase tracking-widest mb-1">
              Email
            </label>
            <input
              ref={inputRef}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2 text-xs font-mono text-[#e0e0e0]"
              style={{
                backgroundColor: "#0c0c0c",
                border: "1px solid #2a2a2a",
                borderRadius: "2px",
              }}
              placeholder="you@company.com"
            />
          </div>
          <div>
            <label className="block text-[10px] font-mono text-muted uppercase tracking-widest mb-1">
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
              className="w-full p-2 text-xs font-mono text-[#e0e0e0]"
              style={{
                backgroundColor: "#0c0c0c",
                border: "1px solid #2a2a2a",
                borderRadius: "2px",
              }}
              placeholder="enter access code"
            />
          </div>
          {error && (
            <p className="text-xs font-mono text-danger">{error}</p>
          )}
          <button
            type="submit"
            className="w-full p-2 text-xs font-mono uppercase tracking-widest"
            style={{
              backgroundColor: "#2a2a2a",
              border: "1px solid #2a2a2a",
              borderRadius: "2px",
              color: "#e0e0e0",
              cursor: "pointer",
            }}
          >
            access thesis
          </button>
        </form>
        <p className="text-[10px] font-mono text-muted mt-4 text-center">
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
        <span className="text-xs font-mono text-muted">{number}</span>
        <h2 className="text-sm font-mono text-[#e0e0e0] uppercase tracking-widest">
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
    <div className="fixed inset-0 overflow-auto">
      <div className="p-4 md:p-12 font-mono max-w-5xl mx-auto">
        {/* ---- Header ---- */}
        <header className="mb-12">
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">
            confidential &mdash; march 2026
          </p>
          <h1 className="text-lg font-mono text-[#e0e0e0] uppercase tracking-widest mb-2">
            Mission Control
          </h1>
          <p className="text-xs font-mono text-muted leading-relaxed max-w-2xl">
            Investment thesis for the first real-time monitoring and orchestration
            dashboard purpose-built for AI coding agents. A 12-section analysis
            covering market opportunity, competitive positioning, financial
            projections, and strategic roadmap.
          </p>
        </header>

        {/* ---- Table of contents ---- */}
        <nav
          className="mb-16 p-4"
          style={{
            backgroundColor: "#161616",
            border: "1px solid #2a2a2a",
            borderRadius: "2px",
          }}
        >
          <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3">
            Contents
          </p>
          <ol className="grid grid-cols-1 md:grid-cols-2 gap-1">
            {TOC.map((item, i) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className="text-xs font-mono text-[#e0e0e0] hover:text-slate flex gap-2"
                  style={{ textDecoration: "none" }}
                >
                  <span className="text-muted w-6 text-right shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        {/* ================================================================
            SECTION 1 — Market Sizing & TAM Analysis
            ================================================================ */}
        <Section id="market-sizing" number="01" title="Market Sizing & TAM Analysis">
          <div className="space-y-4">
            <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed">
              The AI developer tools market is projected to reach{" "}
              <InfoTooltip term="$47.2B" definition="Combined AI-assisted coding, DevOps AI, and developer productivity tooling markets by 2030 (Grand View Research, Gartner estimates)." />{" "}
              by 2030, growing at a 34.1% CAGR from $6.8B in 2024. Within this,
              the DevOps monitoring and observability segment alone represents
              $12.4B by 2028. Mission Control sits at the intersection of these
              two markets: AI agent monitoring for developer workflows.
            </p>
            <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed">
              Claude Code adoption provides a concrete signal. A single power user
              processes{" "}
              <InfoTooltip term="120M tokens" definition="Actual tracked usage: 120M tokens consumed across Claude Code sessions in a 2-month period by one user, implying heavy daily usage and willingness to invest in AI-assisted development." />{" "}
              in 2 months. Extrapolating across Anthropic&apos;s estimated 400K+
              Claude Code monthly active users (growing 30% MoM in early 2026),
              the addressable usage base is substantial.
            </p>

            <BarChart
              title="TAM / SAM / SOM Breakdown ($B)"
              items={[
                { label: "TAM — AI Dev Tools (2030)", value: 47.2, color: "#6b8cae", suffix: "B" },
                { label: "SAM — AI Agent Monitoring", value: 8.6, color: "#9b7cb8", suffix: "B" },
                { label: "SOM — Claude Code Users (Y1)", value: 0.12, color: "#7c9a72", suffix: "B" },
                { label: "SOM — Multi-Agent (Y3)", value: 1.4, color: "#c4956a", suffix: "B" },
              ]}
              maxValue={50}
            />

            <div
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4"
            >
              {[
                { label: "TAM", value: "$47.2B", desc: "Total AI dev tools market by 2030" },
                { label: "SAM", value: "$8.6B", desc: "AI agent monitoring + orchestration tools" },
                { label: "SOM (Y3)", value: "$1.4B", desc: "Capturable market across AI coding tools" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="p-4"
                  style={{
                    backgroundColor: "#161616",
                    border: "1px solid #2a2a2a",
                    borderRadius: "2px",
                  }}
                >
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">
                    {m.label}
                  </p>
                  <p className="text-lg font-mono text-[#e0e0e0]">{m.value}</p>
                  <p className="text-[10px] font-mono text-muted mt-1">{m.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </Section>

        {/* ================================================================
            SECTION 2 — Competitive Landscape
            ================================================================ */}
        <Section id="competitive-landscape" number="02" title="Competitive Landscape">
          <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed mb-4">
            Mission Control occupies a{" "}
            <InfoTooltip term="greenfield position" definition="No direct competitor offers real-time WebSocket monitoring, context tracking, and multi-session orchestration for AI coding agents." />{" "}
            in the market. Existing alternatives are fragmented, informal, and
            lack the depth required by power users running 5+ concurrent AI
            coding sessions.
          </p>

          <ComparisonTable
            headers={["Mission Control", "claude-status", "tmux/screen", "Custom Scripts", "Nothing"]}
            highlightCol={0}
            rows={[
              { feature: "Real-time session monitoring", values: ["Yes", "Partial", "No", "Partial", "No"] },
              { feature: "Context window tracking", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "Token usage analytics", values: ["Yes", "No", "No", "Partial", "No"] },
              { feature: "Multi-session dashboard", values: ["Yes", "No", "Partial", "No", "No"] },
              { feature: "WebSocket live updates", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "Input prompt routing", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "Multi-config directory", values: ["Yes", "No", "No", "Partial", "No"] },
              { feature: "Subagent visibility", values: ["Yes", "No", "No", "No", "No"] },
              { feature: "Cross-platform (web)", values: ["Yes", "No (macOS)", "Yes", "Varies", "N/A"] },
              { feature: "Setup time", values: ["< 2 min", "5 min", "15+ min", "Hours", "N/A"] },
            ]}
          />

          <div
            className="mt-4 p-4"
            style={{
              backgroundColor: "#161616",
              border: "1px solid #2a2a2a",
              borderRadius: "2px",
            }}
          >
            <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">
              Key Differentiation
            </p>
            <ul className="space-y-2">
              {[
                "First-mover advantage: no direct competitor in AI agent monitoring dashboards",
                "Real-time WebSocket architecture vs polling or manual refresh",
                "Deep context window monitoring: token counts, efficiency scoring, cost tracking",
                "Multi-config support: monitor sessions across different project directories simultaneously",
                "Subagent tree visibility: see spawned child agents and their status in real-time",
              ].map((d, i) => (
                <li key={i} className="text-xs font-mono text-[#e0e0e0] flex gap-2">
                  <span className="text-sage shrink-0">&gt;</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </div>
        </Section>

        {/* ================================================================
            SECTION 3 — Customer Persona & Segmentation
            ================================================================ */}
        <Section id="customer-personas" number="03" title="Customer Persona & Segmentation">
          <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed mb-6">
            Four primary customer segments have been identified, each with
            distinct pain points, usage patterns, and willingness to pay.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <PersonaCard
              name="Solo AI-First Developer"
              description="Power user running 5+ concurrent Claude Code sessions daily. Builds entire applications through AI-assisted development."
              painPoints={[
                "No visibility into which session needs input",
                "Context windows fill up silently, wasting tokens",
                "Alt-tabbing between terminal windows is chaotic",
                "No way to track total token spend across sessions",
              ]}
              goals={[
                "Single pane of glass for all active sessions",
                "Know exactly when a session needs human input",
                "Optimize context usage to reduce API costs",
              ]}
              wtp="$29/mo (saves 2+ hours/day in context switching)"
              color="#6b8cae"
            />
            <PersonaCard
              name="Agency / Studio"
              description="Team of 3-8 developers using Claude Code for client work. Need to monitor team productivity and resource usage."
              painPoints={[
                "No shared visibility into team's AI sessions",
                "Can't estimate project costs from AI usage",
                "Junior devs waste tokens on poor prompts",
                "No audit trail for client billing",
              ]}
              goals={[
                "Team-wide dashboard showing all active sessions",
                "Usage analytics for project cost estimation",
                "Help junior devs improve prompting efficiency",
              ]}
              wtp="$99/mo (justified by team productivity + billing accuracy)"
              color="#9b7cb8"
            />
            <PersonaCard
              name="Enterprise Engineering Team"
              description="20-100+ developers at a company adopting AI-assisted development. Need governance, compliance, and scalability."
              painPoints={[
                "No enterprise controls over AI tool usage",
                "Security team needs audit logs for AI interactions",
                "No SSO integration with existing identity providers",
                "Can't enforce AI usage policies across teams",
              ]}
              goals={[
                "Centralized monitoring with role-based access",
                "Compliance-ready audit logs",
                "SSO and enterprise identity integration",
              ]}
              wtp="$299+/mo (budget exists for developer productivity tooling)"
              color="#c4956a"
            />
            <PersonaCard
              name="AI Startup"
              description="Building AI-native products with heavy Claude API usage. Running multi-agent workflows in production and development."
              painPoints={[
                "Multi-agent orchestration is a black box",
                "Can't monitor agent trees in real-time",
                "Token costs are the largest line item",
                "Debugging agent failures requires log archaeology",
              ]}
              goals={[
                "Real-time visibility into agent hierarchies",
                "Token cost optimization and alerting",
                "Integration with existing observability stack",
              ]}
              wtp="$99-299/mo (direct ROI from reduced token waste)"
              color="#7c9a72"
            />
          </div>
        </Section>

        {/* ================================================================
            SECTION 4 — Industry Trend Analysis
            ================================================================ */}
        <Section id="industry-trends" number="04" title="Industry Trend Analysis">
          <div className="space-y-6">
            {[
              {
                trend: "AI-Assisted Coding Reaches Mainstream Adoption",
                detail:
                  "GitHub reports 92% of developers use AI coding tools as of late 2025. Claude Code, Cursor, and GitHub Copilot have moved from novelty to essential infrastructure. The developer who processes 120M tokens in 2 months is not an outlier -- this is becoming the baseline for high-output engineering.",
                metric: "92% adoption among professional developers",
                color: "#6b8cae",
              },
              {
                trend: "Multi-Agent Orchestration Becoming Standard",
                detail:
                  "Developers are moving from single-agent to multi-agent workflows. Claude Code's subagent spawning, Cursor's multi-file editing, and tools like Devin represent a shift toward AI agent fleets. This creates exponential demand for monitoring -- you can't manage what you can't see.",
                metric: "5-15 concurrent agents per power user session",
                color: "#9b7cb8",
              },
              {
                trend: "Context Window Economics: Tokens = Money",
                detail:
                  "At $3-15 per million tokens (depending on model and tier), a power user's 120M tokens over 2 months represents $360-1,800 in direct API costs. Context window efficiency monitoring pays for itself by identifying wasted tokens, redundant context, and suboptimal prompting patterns.",
                metric: "$360-1,800/user/month in token costs",
                color: "#c4956a",
              },
              {
                trend: "Developer Productivity Tooling Spend Accelerating",
                detail:
                  "Enterprise spend on developer productivity tools grew 28% YoY in 2025. Companies that invested in AI coding tools are now looking for the observability and governance layer. This is the same pattern that drove Datadog ($20B+), New Relic, and Grafana in traditional DevOps.",
                metric: "28% YoY growth in dev tool budgets",
                color: "#7c9a72",
              },
            ].map((t, i) => (
              <div
                key={i}
                className="p-4"
                style={{
                  backgroundColor: "#161616",
                  border: "1px solid #2a2a2a",
                  borderLeft: `3px solid ${t.color}`,
                  borderRadius: "2px",
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4
                    className="text-xs font-mono uppercase tracking-widest"
                    style={{ color: t.color }}
                  >
                    {t.trend}
                  </h4>
                </div>
                <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed mb-2">
                  {t.detail}
                </p>
                <p className="text-[10px] font-mono text-muted">
                  Key metric: <span style={{ color: t.color }}>{t.metric}</span>
                </p>
              </div>
            ))}
          </div>
        </Section>

        {/* ================================================================
            SECTION 5 — SWOT + Porter's Five Forces
            ================================================================ */}
        <Section id="swot-porters" number="05" title="SWOT Analysis & Porter's Five Forces">
          <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed mb-6">
            Strategic position assessment based on current market conditions and
            product capabilities.
          </p>

          <SWOTAnalysis
            data={{
              strengths: [
                "First mover in AI agent monitoring -- no direct competitors",
                "Real-time WebSocket architecture (sub-second updates)",
                "Deep integration with Claude Code internals",
                "Minimal infrastructure costs (local agent + lightweight dashboard)",
                "Open-source agent builds trust and drives adoption",
                "Dieter Rams aesthetic signals quality and intentionality",
              ],
              weaknesses: [
                "Currently Claude Code-only (single platform dependency)",
                "Small team / solo developer stage",
                "No enterprise features yet (SSO, audit, RBAC)",
                "Revenue: pre-revenue / early stage",
                "Brand awareness limited to Claude Code community",
              ],
              opportunities: [
                "Expand to Cursor, Copilot, Windsurf, and other AI coding tools",
                "Enterprise tier with compliance features ($299+/mo)",
                "Token cost optimization engine (AI-powered efficiency suggestions)",
                "Marketplace for AI workflow templates and configurations",
                "Partnership with Anthropic for official integration",
                "General AI agent monitoring beyond coding (support, research, etc.)",
              ],
              threats: [
                "Anthropic builds native dashboard into Claude Code",
                "Claude Code changes internal file format / APIs",
                "AI coding tools consolidate (fewer platforms to support)",
                "Well-funded competitor enters with VC backing",
                "Open source alternatives gain traction",
              ],
            }}
          />

          <div className="mt-6">
            <PortersFiveForces
              forces={[
                {
                  force: "Threat of New Entrants",
                  score: 6,
                  note: "Low barriers to building a basic dashboard, but deep Claude Code integration knowledge is hard to replicate. First-mover advantage and community trust matter.",
                },
                {
                  force: "Bargaining Power of Suppliers",
                  score: 8,
                  note: "High dependency on Anthropic's Claude Code. File format changes or API shifts could break integration. Mitigated by expanding to multiple AI tools.",
                },
                {
                  force: "Bargaining Power of Buyers",
                  score: 4,
                  note: "No alternatives exist. Switching cost is low (free tier), but value delivered is high. Enterprise buyers have more leverage but also more budget.",
                },
                {
                  force: "Threat of Substitutes",
                  score: 3,
                  note: "tmux, custom scripts, and manual monitoring are poor substitutes. The gap between these and Mission Control is substantial.",
                },
                {
                  force: "Industry Rivalry",
                  score: 2,
                  note: "Effectively zero direct competition. The market is nascent. This will increase as the category matures.",
                },
              ]}
            />
          </div>
        </Section>

        {/* ================================================================
            SECTION 6 — Pricing Strategy
            ================================================================ */}
        <Section id="pricing" number="06" title="Pricing Strategy">
          <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed mb-6">
            Freemium model designed to maximize adoption while capturing value
            from power users and teams. Pricing anchored to the value of time
            saved and tokens optimized.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {[
              {
                tier: "Free",
                price: "$0",
                period: "forever",
                color: "#6b6b6b",
                features: [
                  "1 config directory",
                  "3 concurrent sessions",
                  "Basic dashboard",
                  "Session status monitoring",
                  "Community support",
                ],
                cta: "Get Started",
              },
              {
                tier: "Pro",
                price: "$29",
                period: "/month",
                color: "#6b8cae",
                features: [
                  "Unlimited config directories",
                  "Unlimited sessions",
                  "Context window monitoring",
                  "Token usage analytics",
                  "Efficiency suggestions",
                  "Session history (30 days)",
                  "Email support",
                ],
                cta: "Start Trial",
              },
              {
                tier: "Team",
                price: "$99",
                period: "/month",
                color: "#9b7cb8",
                features: [
                  "Everything in Pro",
                  "5 team seats included",
                  "Shared team dashboard",
                  "Team analytics & reports",
                  "Project-level cost tracking",
                  "Session history (90 days)",
                  "Priority support",
                ],
                cta: "Start Trial",
              },
              {
                tier: "Enterprise",
                price: "$299+",
                period: "/month",
                color: "#c4956a",
                features: [
                  "Everything in Team",
                  "Unlimited seats",
                  "SSO / SAML integration",
                  "Audit logs & compliance",
                  "Custom integrations",
                  "Unlimited history",
                  "Dedicated support",
                  "SLA guarantee",
                ],
                cta: "Contact Sales",
              },
            ].map((plan) => (
              <div
                key={plan.tier}
                className="p-4 flex flex-col"
                style={{
                  backgroundColor: "#161616",
                  border: `1px solid ${plan.color === "#6b6b6b" ? "#2a2a2a" : plan.color}`,
                  borderRadius: "2px",
                }}
              >
                <p
                  className="text-[10px] font-mono uppercase tracking-widest mb-1"
                  style={{ color: plan.color }}
                >
                  {plan.tier}
                </p>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-lg font-mono text-[#e0e0e0]">
                    {plan.price}
                  </span>
                  <span className="text-xs font-mono text-muted">
                    {plan.period}
                  </span>
                </div>
                <ul className="space-y-2 flex-1 mb-4">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-[11px] font-mono text-[#e0e0e0] flex gap-2">
                      <span style={{ color: plan.color }}>+</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div
                  className="text-center p-2 text-xs font-mono uppercase tracking-widest"
                  style={{
                    border: `1px solid ${plan.color}`,
                    borderRadius: "2px",
                    color: plan.color,
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
              backgroundColor: "#161616",
              border: "1px solid #2a2a2a",
              borderRadius: "2px",
            }}
          >
            <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-2">
              Pricing Rationale
            </p>
            <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed">
              At $29/mo, Pro pays for itself if it saves a developer 30 minutes
              per week in context-switching overhead, or prevents $30+/mo in
              wasted tokens from context window mismanagement. For teams at $99/mo
              ($20/seat), the value proposition compounds: shared visibility
              reduces duplicated work, and analytics help junior developers
              improve prompting efficiency. Enterprise pricing is anchored to
              existing developer tooling budgets ($15-50/seat/mo for observability
              tools like Datadog, New Relic).
            </p>
          </div>
        </Section>

        {/* ================================================================
            SECTION 7 — Go-to-Market Strategy
            ================================================================ */}
        <Section id="gtm" number="07" title="Go-to-Market Strategy">
          <div className="space-y-6">
            {/* Phases */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  phase: "Phase 1: Foundation",
                  timeline: "Q1-Q2 2026",
                  color: "#7c9a72",
                  items: [
                    "Open-source agent on npm/GitHub",
                    "Free dashboard with core monitoring",
                    "Launch on Hacker News, Reddit, X",
                    "Claude Code community presence",
                    "Content marketing (blog, demos)",
                    "Target: 1,000 free users",
                  ],
                },
                {
                  phase: "Phase 2: Monetization",
                  timeline: "Q3-Q4 2026",
                  color: "#6b8cae",
                  items: [
                    "Launch Pro tier ($29/mo)",
                    "Context monitoring features",
                    "Token efficiency analytics",
                    "Session history & replay",
                    "Referral program (1 month free)",
                    "Target: 200 paying users",
                  ],
                },
                {
                  phase: "Phase 3: Scale",
                  timeline: "2027",
                  color: "#9b7cb8",
                  items: [
                    "Team & Enterprise tiers",
                    "Hosted cloud dashboard",
                    "Cursor + Copilot integration",
                    "Sales team for enterprise",
                    "SOC 2 compliance",
                    "Target: 2,000 paying users",
                  ],
                },
              ].map((p) => (
                <div
                  key={p.phase}
                  className="p-4"
                  style={{
                    backgroundColor: "#161616",
                    border: "1px solid #2a2a2a",
                    borderTop: `3px solid ${p.color}`,
                    borderRadius: "2px",
                  }}
                >
                  <p
                    className="text-xs font-mono uppercase tracking-widest mb-1"
                    style={{ color: p.color }}
                  >
                    {p.phase}
                  </p>
                  <p className="text-[10px] font-mono text-muted mb-3">
                    {p.timeline}
                  </p>
                  <ul className="space-y-2">
                    {p.items.map((item, i) => (
                      <li key={i} className="text-xs font-mono text-[#e0e0e0] flex gap-2">
                        <span style={{ color: p.color }}>&gt;</span>
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
                backgroundColor: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: "2px",
              }}
            >
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3">
                Channel Strategy & Expected ROI
              </p>
              <div className="space-y-3">
                {[
                  { channel: "GitHub / npm", roi: "High", cost: "Free", desc: "Open-source agent drives organic discovery. README -> dashboard link conversion.", color: "#7c9a72" },
                  { channel: "Hacker News / Reddit", roi: "High", cost: "Free", desc: "Technical audience, high intent. Launch posts with demo videos.", color: "#7c9a72" },
                  { channel: "X / Twitter", roi: "Medium", cost: "Free", desc: "AI dev community is active. Demo clips and usage threads.", color: "#6b8cae" },
                  { channel: "Claude Code Discord", roi: "High", cost: "Free", desc: "Direct access to target users. Community support builds trust.", color: "#7c9a72" },
                  { channel: "Content Marketing", roi: "Medium", cost: "Low", desc: "Blog posts on AI coding workflows, token optimization, multi-agent patterns.", color: "#6b8cae" },
                  { channel: "Direct Sales (Enterprise)", roi: "High", cost: "Medium", desc: "Outbound to companies with 20+ Claude Code licenses. High ACV.", color: "#7c9a72" },
                  { channel: "Partnerships", roi: "Medium", cost: "Low", desc: "Integration partnerships with AI tool vendors, IDE plugin marketplaces.", color: "#6b8cae" },
                ].map((ch, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 shrink-0 w-16 text-center"
                      style={{
                        color: ch.color,
                        border: `1px solid ${ch.color}`,
                        borderRadius: "1px",
                      }}
                    >
                      {ch.roi}
                    </span>
                    <div className="flex-1">
                      <span className="text-xs font-mono text-[#e0e0e0]">
                        {ch.channel}
                      </span>
                      <span className="text-[10px] font-mono text-muted ml-2">
                        ({ch.cost} cost)
                      </span>
                      <p className="text-[10px] font-mono text-muted mt-0.5">
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
            SECTION 8 — Customer Journey Mapping
            ================================================================ */}
        <Section id="customer-journey" number="08" title="Customer Journey Mapping">
          <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed mb-6">
            Six-stage customer journey from initial awareness to long-term
            retention and advocacy.
          </p>

          <div className="space-y-0">
            {[
              {
                stage: "01 Awareness",
                color: "#6b8cae",
                touchpoints: "GitHub, HN, Reddit, X, word-of-mouth",
                action: "Developer discovers Mission Control while looking for ways to manage multiple Claude Code sessions.",
                metric: "GitHub stars, npm downloads, site visits",
              },
              {
                stage: "02 Consideration",
                color: "#9b7cb8",
                touchpoints: "README, demo video, docs, free tier",
                action: "Evaluates Mission Control against alternatives (tmux, manual monitoring). Reads docs, watches demo.",
                metric: "README engagement, demo video completion rate",
              },
              {
                stage: "03 Decision",
                color: "#7c9a72",
                touchpoints: "npm install, first dashboard load",
                action: "Installs agent via npm, starts dashboard. Sees sessions appear in real-time. 'Aha moment' in < 2 minutes.",
                metric: "Install-to-first-session time, activation rate",
              },
              {
                stage: "04 Onboarding",
                color: "#c4956a",
                touchpoints: "Dashboard, keyboard shortcuts, multi-config",
                action: "Configures multiple project directories, learns keyboard nav, sends first input response through dashboard.",
                metric: "Features used in first week, sessions monitored",
              },
              {
                stage: "05 Engagement",
                color: "#6b8cae",
                touchpoints: "Daily usage, context monitoring, Pro upgrade",
                action: "Mission Control becomes default workflow. Hits free tier limits. Context monitoring drives Pro upgrade decision.",
                metric: "DAU/MAU ratio, free-to-paid conversion rate",
              },
              {
                stage: "06 Loyalty",
                color: "#9b7cb8",
                touchpoints: "Team invite, referrals, community",
                action: "Recommends to team. Upgrades to Team plan. Contributes to community. Becomes advocate.",
                metric: "NPS, referral rate, team plan upgrades",
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
                      backgroundColor: s.color,
                      borderRadius: "1px",
                    }}
                  />
                  {i < 5 && (
                    <div
                      className="w-px flex-1"
                      style={{ backgroundColor: "#2a2a2a" }}
                    />
                  )}
                </div>

                {/* Content */}
                <div
                  className="flex-1 mb-4 p-4"
                  style={{
                    backgroundColor: "#161616",
                    border: "1px solid #2a2a2a",
                    borderRadius: "2px",
                  }}
                >
                  <p
                    className="text-xs font-mono uppercase tracking-widest mb-2"
                    style={{ color: s.color }}
                  >
                    {s.stage}
                  </p>
                  <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed mb-2">
                    {s.action}
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <p className="text-[10px] font-mono text-muted">
                      Touchpoints: <span className="text-[#e0e0e0]">{s.touchpoints}</span>
                    </p>
                    <p className="text-[10px] font-mono text-muted">
                      KPI: <span className="text-[#e0e0e0]">{s.metric}</span>
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* ================================================================
            SECTION 9 — Financial Model & Unit Economics
            ================================================================ */}
        <Section id="financials" number="09" title="Financial Model & Unit Economics">
          <div className="space-y-6">
            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "LTV (Pro)", value: "$696", desc: "24-mo avg retention x $29/mo", color: "#7c9a72" },
                { label: "CAC", value: "$45", desc: "Blended across channels", color: "#6b8cae" },
                { label: "LTV:CAC", value: "15.5x", desc: "Target: >3x", color: "#9b7cb8" },
                { label: "Gross Margin", value: "92%", desc: "Minimal hosting costs", color: "#c4956a" },
              ].map((m) => (
                <div
                  key={m.label}
                  className="p-4"
                  style={{
                    backgroundColor: "#161616",
                    border: "1px solid #2a2a2a",
                    borderRadius: "2px",
                  }}
                >
                  <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-1">
                    {m.label}
                  </p>
                  <p className="text-lg font-mono" style={{ color: m.color }}>
                    {m.value}
                  </p>
                  <p className="text-[10px] font-mono text-muted mt-1">{m.desc}</p>
                </div>
              ))}
            </div>

            {/* 3-year projection */}
            <BarChart
              title="3-Year Revenue Projection (ARR)"
              items={[
                { label: "Year 1 — Pro early adopters", value: 72, color: "#6b8cae", suffix: "K" },
                { label: "Year 2 — Pro + Team tiers", value: 480, color: "#9b7cb8", suffix: "K" },
                { label: "Year 3 — Enterprise + expansion", value: 2400, color: "#7c9a72", suffix: "K" },
              ]}
              maxValue={2500}
            />

            {/* Assumptions & unit economics detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div
                className="p-4"
                style={{
                  backgroundColor: "#161616",
                  border: "1px solid #2a2a2a",
                  borderRadius: "2px",
                }}
              >
                <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3">
                  Key Assumptions
                </p>
                <div className="space-y-2">
                  {[
                    "Free-to-paid conversion: 8% (industry avg 2-5%)",
                    "Monthly churn: 4% (Pro), 2% (Team), 1% (Enterprise)",
                    "Average expansion revenue: 15% annually",
                    "Y1: 200 Pro subscribers by month 12",
                    "Y2: 800 Pro + 40 Team subscribers",
                    "Y3: 2,000 Pro + 150 Team + 20 Enterprise",
                    "CAC payback period: 1.6 months (Pro)",
                    "No external funding assumed in base case",
                  ].map((a, i) => (
                    <p key={i} className="text-xs font-mono text-[#e0e0e0] flex gap-2">
                      <span className="text-muted shrink-0">&gt;</span>
                      <span>{a}</span>
                    </p>
                  ))}
                </div>
              </div>

              <div
                className="p-4"
                style={{
                  backgroundColor: "#161616",
                  border: "1px solid #2a2a2a",
                  borderRadius: "2px",
                }}
              >
                <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3">
                  Gross Margin Analysis
                </p>
                <div className="space-y-3">
                  {[
                    { label: "Revenue (per Pro user/mo)", value: "$29.00" },
                    { label: "Hosting (Vercel/AWS)", value: "-$0.80" },
                    { label: "WebSocket infrastructure", value: "-$0.40" },
                    { label: "Payment processing (3%)", value: "-$0.87" },
                    { label: "Support allocation", value: "-$0.50" },
                  ].map((item, i) => (
                    <div key={i} className="flex justify-between">
                      <span className="text-xs font-mono text-[#e0e0e0]">{item.label}</span>
                      <span className="text-xs font-mono text-muted">{item.value}</span>
                    </div>
                  ))}
                  <div
                    className="flex justify-between pt-2"
                    style={{ borderTop: "1px solid #2a2a2a" }}
                  >
                    <span className="text-xs font-mono text-[#e0e0e0]">Gross Profit</span>
                    <span className="text-xs font-mono text-sage">$26.43 (91.1%)</span>
                  </div>
                  <p className="text-[10px] font-mono text-muted mt-2">
                    Software-like margins. The agent runs locally on user machines,
                    so compute costs are borne by the user. Dashboard hosting and
                    WebSocket relay are the primary infrastructure costs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* ================================================================
            SECTION 10 — Risk Assessment & Scenario Planning
            ================================================================ */}
        <Section id="risk" number="10" title="Risk Assessment & Scenario Planning">
          <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed mb-6">
            Probability x impact assessment for key risk factors, with
            mitigation strategies and scenario modeling.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <RiskItem
              risk="Claude Code changes internal file format or session structure"
              probability="High"
              impact="High"
              mitigation="Abstract file parsing into adapter layer. Monitor Claude Code releases. Maintain relationships with Anthropic devs. Build automated format detection."
            />
            <RiskItem
              risk="Anthropic builds a native monitoring dashboard into Claude Code"
              probability="Medium"
              impact="High"
              mitigation="Stay ahead on features (multi-tool support, advanced analytics). Position as the cross-platform standard, not Claude-only. Build switching costs through data/history."
            />
            <RiskItem
              risk="Well-funded competitor enters the AI agent monitoring space"
              probability="Medium"
              impact="Medium"
              mitigation="First-mover advantage + community trust. Open-source agent creates lock-in. Speed of execution. Focus on depth of integration over breadth."
            />
            <RiskItem
              risk="AI coding tools consolidate (fewer platforms to monitor)"
              probability="Low"
              impact="Medium"
              mitigation="Diversify early to support multiple AI coding tools. Build the 'Datadog for AI agents' narrative -- platform-agnostic monitoring."
            />
            <RiskItem
              risk="Developer pushback on telemetry / privacy concerns"
              probability="Medium"
              impact="Low"
              mitigation="All data stays local by default. Open-source agent is fully auditable. Cloud features are opt-in. Clear privacy policy."
            />
            <RiskItem
              risk="Token costs drop dramatically, reducing monitoring value prop"
              probability="Low"
              impact="Low"
              mitigation="Pivot value prop from cost savings to productivity (time saved, workflow visibility). Token costs are one benefit among many."
            />
          </div>

          {/* Scenario planning */}
          <div
            className="p-4"
            style={{
              backgroundColor: "#161616",
              border: "1px solid #2a2a2a",
              borderRadius: "2px",
            }}
          >
            <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-4">
              Scenario Planning (3-Year ARR)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  scenario: "Best Case",
                  arr: "$4.8M",
                  color: "#7c9a72",
                  assumptions: [
                    "Anthropic partnership / official integration",
                    "15% free-to-paid conversion",
                    "Early enterprise traction",
                    "Multi-platform (Cursor, Copilot) by Y2",
                  ],
                },
                {
                  scenario: "Base Case",
                  arr: "$2.4M",
                  color: "#6b8cae",
                  assumptions: [
                    "Organic growth via open-source",
                    "8% free-to-paid conversion",
                    "Gradual enterprise sales",
                    "Multi-platform by Y3",
                  ],
                },
                {
                  scenario: "Worst Case",
                  arr: "$360K",
                  color: "#b85c5c",
                  assumptions: [
                    "Claude Code format breaks, 3-month recovery",
                    "3% free-to-paid conversion",
                    "No enterprise traction",
                    "Competitor enters by Y2",
                  ],
                },
              ].map((s) => (
                <div key={s.scenario}>
                  <div className="flex items-baseline gap-2 mb-2">
                    <span
                      className="text-xs font-mono uppercase tracking-widest"
                      style={{ color: s.color }}
                    >
                      {s.scenario}
                    </span>
                    <span className="text-sm font-mono text-[#e0e0e0]">
                      {s.arr}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {s.assumptions.map((a, i) => (
                      <li key={i} className="text-[10px] font-mono text-muted flex gap-2">
                        <span style={{ color: s.color }}>&gt;</span>
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
            SECTION 11 — Market Entry & Expansion Strategy
            ================================================================ */}
        <Section id="expansion" number="11" title="Market Entry & Expansion Strategy">
          <div className="space-y-6">
            <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed">
              Three-phase expansion from Claude Code-specific tool to the
              universal monitoring standard for AI coding agents, and eventually
              all AI agents.
            </p>

            {/* Expansion phases */}
            <div className="space-y-4">
              {[
                {
                  phase: "Phase 1: Claude Code (Now)",
                  color: "#7c9a72",
                  market: "400K+ Claude Code MAU",
                  strategy: "Deep integration with Claude Code internals. Open-source agent distributed via npm. Build the definitive Claude Code monitoring experience. Establish brand as 'the dashboard for Claude Code.'",
                  moat: "Intimate knowledge of Claude Code session format, .claude directory structure, and subagent patterns. Community trust from open-source contribution.",
                },
                {
                  phase: "Phase 2: AI Coding Tools (2027)",
                  color: "#6b8cae",
                  market: "2M+ AI coding tool users",
                  strategy: "Extend agent to monitor Cursor, GitHub Copilot, Windsurf, and Codeium sessions. Unified dashboard for developers using multiple AI coding tools. Plugin architecture for community-contributed integrations.",
                  moat: "Cross-platform monitoring is a harder problem than single-tool monitoring. Data normalization across different agent formats creates technical moat.",
                },
                {
                  phase: "Phase 3: General AI Agent Monitoring (2028)",
                  color: "#9b7cb8",
                  market: "$8.6B AI agent monitoring TAM",
                  strategy: "Expand beyond coding to any AI agent workflow: research agents, support agents, data analysis agents. Position as 'Datadog for AI agents' -- the observability layer for the agentic era.",
                  moat: "Brand, data network effects, enterprise relationships, and deep technical expertise in agent monitoring built over 2+ years.",
                },
              ].map((p) => (
                <div
                  key={p.phase}
                  className="p-4"
                  style={{
                    backgroundColor: "#161616",
                    border: "1px solid #2a2a2a",
                    borderLeft: `3px solid ${p.color}`,
                    borderRadius: "2px",
                  }}
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <p
                      className="text-xs font-mono uppercase tracking-widest"
                      style={{ color: p.color }}
                    >
                      {p.phase}
                    </p>
                    <span className="text-[10px] font-mono text-muted">
                      {p.market}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed mb-2">
                    {p.strategy}
                  </p>
                  <p className="text-[10px] font-mono text-muted">
                    Moat: {p.moat}
                  </p>
                </div>
              ))}
            </div>

            {/* Partnership analysis */}
            <div
              className="p-4"
              style={{
                backgroundColor: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: "2px",
              }}
            >
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-3">
                Partnership Analysis
              </p>
              <div className="space-y-3">
                {[
                  {
                    partner: "Anthropic",
                    type: "Strategic",
                    value: "Official Claude Code integration, API access, co-marketing. Could lead to acquisition.",
                    likelihood: "Medium",
                    color: "#c4956a",
                  },
                  {
                    partner: "Cursor / Anysphere",
                    type: "Integration",
                    value: "Extend monitoring to Cursor users. Shared user base. Plugin marketplace listing.",
                    likelihood: "High",
                    color: "#7c9a72",
                  },
                  {
                    partner: "Vercel / Netlify",
                    type: "Distribution",
                    value: "Deploy dashboard as a Vercel template. Distribution to developer audience.",
                    likelihood: "High",
                    color: "#7c9a72",
                  },
                  {
                    partner: "Datadog / Grafana",
                    type: "Integration",
                    value: "Export AI agent metrics to existing observability stacks. Enterprise channel.",
                    likelihood: "Low",
                    color: "#b85c5c",
                  },
                ].map((p, i) => (
                  <div key={i} className="flex items-start gap-4">
                    <span
                      className="text-[10px] font-mono px-2 py-0.5 shrink-0"
                      style={{
                        color: p.color,
                        border: `1px solid ${p.color}`,
                        borderRadius: "1px",
                      }}
                    >
                      {p.likelihood}
                    </span>
                    <div className="flex-1">
                      <span className="text-xs font-mono text-[#e0e0e0]">
                        {p.partner}
                      </span>
                      <span className="text-[10px] font-mono text-muted ml-2">
                        ({p.type})
                      </span>
                      <p className="text-[10px] font-mono text-muted mt-0.5">
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
            SECTION 12 — Executive Strategy Synthesis
            ================================================================ */}
        <Section id="synthesis" number="12" title="Executive Strategy Synthesis">
          <div className="space-y-6">
            {/* Opportunity summary */}
            <div
              className="p-6"
              style={{
                backgroundColor: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: "2px",
              }}
            >
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-4">
                The Opportunity
              </p>
              <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed mb-4">
                Mission Control is positioned to become the{" "}
                <span className="text-sage">Datadog for AI agents</span> -- the
                essential monitoring and orchestration layer for the agentic
                development era. With no direct competitors, a growing market of
                400K+ Claude Code users (expanding to 2M+ across AI coding tools),
                and a capital-efficient SaaS model with 91%+ gross margins, the
                opportunity is both large and executable.
              </p>
              <p className="text-xs font-mono text-[#e0e0e0] leading-relaxed">
                The developer who processes 120M tokens in 2 months is not an
                anomaly -- they are the leading edge of a wave. As AI-assisted
                development goes from &quot;nice to have&quot; to &quot;how we build software,&quot;
                the need for monitoring, analytics, and orchestration becomes
                non-negotiable. Mission Control is building that layer today.
              </p>
            </div>

            {/* Investment options */}
            <div
              className="p-4"
              style={{
                backgroundColor: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: "2px",
              }}
            >
              <p className="text-[10px] font-mono text-muted uppercase tracking-widest mb-4">
                Investment Options
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    option: "Conservative",
                    amount: "$0 (Bootstrap)",
                    color: "#7c9a72",
                    timeline: "36 months to $2.4M ARR",
                    details: [
                      "Self-funded from revenue",
                      "Slower growth, full ownership retained",
                      "Focus on Pro tier first",
                      "Team/Enterprise in Year 2",
                      "Risk: slower to capture market window",
                    ],
                  },
                  {
                    option: "Balanced",
                    amount: "$500K Pre-Seed",
                    color: "#6b8cae",
                    timeline: "24 months to $2.4M ARR",
                    details: [
                      "Hire 1 engineer + 1 GTM",
                      "Accelerate multi-platform support",
                      "Enterprise features by Month 12",
                      "Target Series A at $2M+ ARR",
                      "12-18 months runway",
                    ],
                  },
                  {
                    option: "Aggressive",
                    amount: "$2M Seed",
                    color: "#c4956a",
                    timeline: "18 months to $4.8M ARR",
                    details: [
                      "Team of 5 (3 eng, 1 GTM, 1 design)",
                      "Multi-platform by Month 6",
                      "Enterprise sales from Month 9",
                      "Target Series A at $5M+ ARR",
                      "18-24 months runway",
                    ],
                  },
                ].map((opt) => (
                  <div
                    key={opt.option}
                    className="p-4"
                    style={{
                      backgroundColor: "#0c0c0c",
                      border: `1px solid ${opt.color}`,
                      borderRadius: "2px",
                    }}
                  >
                    <p
                      className="text-xs font-mono uppercase tracking-widest mb-1"
                      style={{ color: opt.color }}
                    >
                      {opt.option}
                    </p>
                    <p className="text-sm font-mono text-[#e0e0e0] mb-1">
                      {opt.amount}
                    </p>
                    <p className="text-[10px] font-mono text-muted mb-3">
                      {opt.timeline}
                    </p>
                    <ul className="space-y-1">
                      {opt.details.map((d, i) => (
                        <li key={i} className="text-[10px] font-mono text-[#e0e0e0] flex gap-2">
                          <span style={{ color: opt.color }}>&gt;</span>
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
                backgroundColor: "#161616",
                border: "1px solid #7c9a72",
                borderRadius: "2px",
              }}
            >
              <p className="text-xs font-mono text-sage uppercase tracking-widest mb-2">
                Interested in Learning More?
              </p>
              <p className="text-xs font-mono text-muted mb-4">
                Leave your email and we will send detailed financials and a
                product demo.
              </p>
              {contactSent ? (
                <p className="text-xs font-mono text-sage">
                  Received. We will be in touch.
                </p>
              ) : (
                <form
                  className="flex gap-2"
                  onSubmit={(e) => {
                    e.preventDefault()
                    // Stub: send contact
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
                    className="flex-1 p-2 text-xs font-mono text-[#e0e0e0]"
                    style={{
                      backgroundColor: "#0c0c0c",
                      border: "1px solid #2a2a2a",
                      borderRadius: "2px",
                    }}
                  />
                  <button
                    type="submit"
                    className="px-4 p-2 text-xs font-mono uppercase tracking-widest"
                    style={{
                      backgroundColor: "#7c9a72",
                      border: "1px solid #7c9a72",
                      borderRadius: "2px",
                      color: "#0c0c0c",
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
              <p className="text-[10px] font-mono text-muted">
                mission control &mdash; confidential investment thesis &mdash; march 2026
              </p>
              <p className="text-[10px] font-mono text-muted mt-1">
                questions? reach out at invest@missioncontrol.dev
              </p>
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
