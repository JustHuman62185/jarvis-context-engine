import { supabase } from "@/integrations/supabase/client";

export const CAPABILITIES = [
  { key: "devices", label: "Devices", blurb: "Inspect paired devices and send commands" },
  { key: "notifications", label: "Notifications", blurb: "Read and triage captured notifications" },
  { key: "tasks", label: "Tasks", blurb: "Read and create tasks" },
  { key: "notes", label: "Notes", blurb: "Read and write notes" },
  { key: "memory", label: "Memory", blurb: "Durable facts, preferences and events" },
  { key: "automations", label: "Automations", blurb: "Create and toggle background rules" },
  { key: "activity", label: "Activity", blurb: "Read the audit log" },
  { key: "permissions", label: "Permissions", blurb: "Read the permission policy" },
] as const;

export const LEVELS = ["allow", "ask", "deny"] as const;
export type Level = (typeof LEVELS)[number];

export function mcpUrl() {
  if (typeof window === "undefined") return "";
  return `${window.location.origin}/mcp`;
}

export function claudeConnectUrl(url: string) {
  return `https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Jarvis&connectorUrl=${encodeURIComponent(
    url,
  )}`;
}

export function relativeTime(value: string | null | undefined) {
  if (!value) return "never";
  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

async function rows<T>(promise: PromiseLike<{ data: T[] | null; error: { message: string } | null }>) {
  const { data, error } = await promise;
  if (error) throw new Error(error.message);
  return data ?? [];
}

export const q = {
  devices: () =>
    rows(supabase.from("devices").select("*").order("is_primary", { ascending: false })),
  connections: () =>
    rows(supabase.from("ai_connections").select("*").order("created_at", { ascending: true })),
  permissions: () => rows(supabase.from("permissions").select("*").is("connection_id", null)),
  notifications: () =>
    rows(supabase.from("notifications").select("*").order("posted_at", { ascending: false }).limit(50)),
  tasks: () => rows(supabase.from("tasks").select("*").order("created_at", { ascending: false })),
  automations: () =>
    rows(supabase.from("automations").select("*").order("created_at", { ascending: true })),
  memories: () => rows(supabase.from("memories").select("*").order("created_at", { ascending: false })),
  activity: () =>
    rows(supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(60)),
};
