import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Activity,
  ArrowRight,
  Bell,
  Bot,
  Brain,
  Cpu,
  Copy,
  ShieldCheck,
  Smartphone,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { claudeConnectUrl, mcpUrl } from "@/lib/jarvis";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "JARVIS — The execution layer for your AI" },
      {
        name: "description",
        content:
          "JARVIS gives Claude and other AI models permissioned access to your devices, notifications, memory and automations — with a full audit log you control.",
      },
      { property: "og:title", content: "JARVIS — The execution layer for your AI" },
      {
        property: "og:description",
        content: "Connect Claude to your digital life through one permissioned, audited interface.",
      },
    ],
  }),
  component: Landing,
});

const capabilities = [
  { icon: Smartphone, title: "Devices", body: "Paired phones and laptops with live status, battery and capability list." },
  { icon: Bell, title: "Notifications", body: "Every captured notification, searchable and triageable by your model." },
  { icon: Brain, title: "Memory", body: "Durable facts, preferences and events that survive every chat session." },
  { icon: Workflow, title: "Automations", body: "Background rules that fire on schedules, notifications or calendar events." },
  { icon: ShieldCheck, title: "Permission engine", body: "Allow, ask or deny per capability. Writes are blocked unless explicitly allowed." },
  { icon: Activity, title: "Audit log", body: "Which model asked for what, when, and whether it was granted." },
];

function Landing() {
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(mcpUrl()), []);

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 grid-backdrop" aria-hidden="true" />

      <header className="relative mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2 font-display text-lg font-semibold tracking-tight">
          <Cpu className="h-5 w-5 text-primary" />
          JARVIS
        </div>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link to="/auth">Sign in</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/dashboard">Open console</Link>
          </Button>
        </nav>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 pb-24">
        <section className="pt-14 pb-20 text-center md:pt-24">
          <p className="mx-auto w-fit rounded-full border border-border bg-surface px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            Model-agnostic execution layer
          </p>
          <h1 className="mt-6 font-display text-4xl leading-tight font-semibold md:text-6xl">
            JARVIS is not an AI model.
            <br />
            <span className="text-primary text-glow">It is the body.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-base text-muted-foreground md:text-lg">
            Claude, ChatGPT and Gemini can be the brain. JARVIS is the operating system, security
            layer, memory and tool ecosystem that gives them controlled access to your devices and
            digital life.
          </p>

          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <a href={claudeConnectUrl(url || "https://example.com/mcp")} target="_blank" rel="noreferrer">
                <Bot className="h-4 w-4" /> Connect Claude
              </a>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/dashboard">
                Open the control plane <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="mx-auto mt-8 flex w-fit max-w-full items-center gap-3 rounded-lg border border-border bg-surface px-4 py-2 font-mono text-xs text-muted-foreground">
            <span className="truncate">{url || "…"}</span>
            <button
              type="button"
              className="text-primary transition-opacity hover:opacity-70"
              onClick={() => {
                void navigator.clipboard.writeText(url);
                toast.success("MCP endpoint copied");
              }}
              aria-label="Copy MCP endpoint"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
          </div>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {capabilities.map(({ icon: Icon, title, body }) => (
            <div key={title} className="panel p-6">
              <Icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 font-display text-lg font-semibold">{title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{body}</p>
            </div>
          ))}
        </section>

        <section className="panel mt-16 p-8 text-center">
          <h2 className="font-display text-2xl font-semibold">One interface. Every brain.</h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-muted-foreground">
            JARVIS speaks MCP over OAuth. Sign in once, approve the capabilities you want, and any
            compatible client becomes a fully embodied assistant — inside your rules.
          </p>
          <Button asChild className="mt-6">
            <Link to="/auth">Create your JARVIS</Link>
          </Button>
        </section>
      </main>
    </div>
  );
}
