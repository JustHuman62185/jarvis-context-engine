import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  Activity,
  Battery,
  Bell,
  Bot,
  Brain,
  CheckCircle2,
  Copy,
  Cpu,
  LogOut,
  Plus,
  ShieldCheck,
  Smartphone,
  Workflow,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { CAPABILITIES, LEVELS, claudeConnectUrl, mcpUrl, q, relativeTime, type Level } from "@/lib/jarvis";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Control plane — JARVIS" },
      { name: "description", content: "Manage paired devices, AI connections, capability permissions and the JARVIS audit log." },
      { property: "og:title", content: "Control plane — JARVIS" },
      { property: "og:description", content: "Devices, permissions, memory and audit log in one console." },
    ],
  }),
  component: Dashboard,
});

function useList<T>(key: string, fn: () => Promise<T[]>) {
  return useQuery({ queryKey: [key], queryFn: fn });
}

async function logAction(tool: string, summary: string, status = "allowed") {
  const { data } = await supabase.auth.getUser();
  if (!data.user) return;
  await supabase.from("audit_log").insert({ user_id: data.user.id, actor: "you", tool, summary, status });
}

function Dashboard() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(mcpUrl()), []);

  const devices = useList("devices", q.devices);
  const connections = useList("connections", q.connections);
  const permissions = useList("permissions", q.permissions);
  const notifications = useList("notifications", q.notifications);
  const tasks = useList("tasks", q.tasks);
  const automations = useList("automations", q.automations);
  const memories = useList("memories", q.memories);
  const activity = useList("activity", q.activity);

  const refresh = (...keys: string[]) => {
    keys.forEach((k) => void qc.invalidateQueries({ queryKey: [k] }));
    void qc.invalidateQueries({ queryKey: ["activity"] });
  };

  const unread = (notifications.data ?? []).filter((n) => !n.is_read).length;
  const openTasks = (tasks.data ?? []).filter((t) => !t.completed).length;
  const online = (devices.data ?? []).filter((d) => d.status === "online").length;

  const setLevel = useMutation({
    mutationFn: async ({ id, capability, level }: { id: string; capability: string; level: Level }) => {
      const { error } = await supabase.from("permissions").update({ level }).eq("id", id);
      if (error) throw new Error(error.message);
      await logAction("permissions_set", `Set ${capability} to ${level}`);
    },
    onSuccess: () => {
      toast.success("Permission updated");
      refresh("permissions");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const command = useMutation({
    mutationFn: async ({ deviceId, name, cmd }: { deviceId: string; name: string; cmd: string }) => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Not signed in");
      const { error } = await supabase.from("audit_log").insert({
        user_id: data.user.id,
        actor: "you",
        tool: "devices_send_command",
        summary: `Queued "${cmd}" on ${name}`,
        status: "allowed",
        device_id: deviceId,
      });
      if (error) throw new Error(error.message);
      await supabase.from("devices").update({ last_seen: new Date().toISOString() }).eq("id", deviceId);
    },
    onSuccess: () => {
      toast.success("Command queued for the device agent");
      refresh("devices");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", id);
      if (error) throw new Error(error.message);
      await logAction("notifications_mark_read", "Marked a notification as read");
    },
    onSuccess: () => refresh("notifications"),
  });

  const toggleTask = useMutation({
    mutationFn: async ({ id, completed, title }: { id: string; completed: boolean; title: string }) => {
      const { error } = await supabase.from("tasks").update({ completed }).eq("id", id);
      if (error) throw new Error(error.message);
      await logAction("tasks_complete", `${completed ? "Completed" : "Reopened"} "${title}"`);
    },
    onSuccess: () => refresh("tasks"),
  });

  const addTask = useMutation({
    mutationFn: async (title: string) => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) throw new Error("Not signed in");
      const { error } = await supabase.from("tasks").insert({ user_id: data.user.id, title });
      if (error) throw new Error(error.message);
      await logAction("tasks_create", `Created "${title}"`);
    },
    onSuccess: () => {
      toast.success("Task added");
      refresh("tasks");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleAutomation = useMutation({
    mutationFn: async ({ id, enabled, name }: { id: string; enabled: boolean; name: string }) => {
      const { error } = await supabase.from("automations").update({ enabled }).eq("id", id);
      if (error) throw new Error(error.message);
      await logAction("automations_set_enabled", `${enabled ? "Enabled" : "Disabled"} "${name}"`);
    },
    onSuccess: () => refresh("automations"),
  });

  const connectClaude = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("ai_connections")
        .update({ status: "connected", last_used_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw new Error(error.message);
      await logAction("connection_authorized", "Claude connector authorized");
    },
    onSuccess: () => refresh("connections"),
  });

  const [taskTitle, setTaskTitle] = useState("");

  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 grid-backdrop" aria-hidden="true" />

      <header className="relative border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 font-display font-semibold">
            <Cpu className="h-5 w-5 text-primary" /> JARVIS
          </Link>
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await supabase.auth.signOut();
              qc.clear();
              await navigate({ to: "/auth" });
            }}
          >
            <LogOut className="h-4 w-4" /> Sign out
          </Button>
        </div>
      </header>

      <main className="relative mx-auto max-w-6xl px-6 py-8">
        <div className="grid gap-4 sm:grid-cols-4">
          <Stat icon={Smartphone} label="Devices online" value={`${online}/${devices.data?.length ?? 0}`} />
          <Stat icon={Bell} label="Unread notifications" value={String(unread)} />
          <Stat icon={CheckCircle2} label="Open tasks" value={String(openTasks)} />
          <Stat icon={Activity} label="Recent tool calls" value={String(activity.data?.length ?? 0)} />
        </div>

        <Tabs defaultValue="overview" className="mt-8">
          <TabsList className="flex-wrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="inbox">Inbox</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
            <TabsTrigger value="memory">Memory</TabsTrigger>
            <TabsTrigger value="automations">Automations</TabsTrigger>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-4">
            <div className="panel p-6">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                <h2 className="font-display text-lg font-semibold">Connect Claude</h2>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">
                Add JARVIS as a custom connector in Claude. Claude signs in as you, and every tool
                call is checked against your permission policy below.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 font-mono text-xs">
                  <span className="max-w-[280px] truncate">{url}</span>
                  <button
                    type="button"
                    aria-label="Copy MCP endpoint"
                    className="text-primary"
                    onClick={() => {
                      void navigator.clipboard.writeText(url);
                      toast.success("Copied");
                    }}
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
                <Button asChild>
                  <a
                    href={claudeConnectUrl(url)}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      const claude = (connections.data ?? []).find((c) => c.provider === "claude");
                      if (claude) connectClaude.mutate(claude.id);
                    }}
                  >
                    Add to Claude
                  </a>
                </Button>
              </div>
            </div>

            <div className="panel p-6">
              <h2 className="font-display text-lg font-semibold">AI connections</h2>
              <div className="mt-4 space-y-3">
                {(connections.data ?? []).map((c) => (
                  <div key={c.id} className="flex items-center justify-between rounded-lg border border-border p-4">
                    <div>
                      <p className="font-medium">{c.label}</p>
                      <p className="text-xs text-muted-foreground">
                        {c.provider} · last used {relativeTime(c.last_used_at)}
                      </p>
                    </div>
                    <Badge variant={c.status === "connected" ? "default" : "secondary"}>{c.status}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="mt-6 grid gap-4 md:grid-cols-2">
            {(devices.data ?? []).map((d) => (
              <div key={d.id} className="panel p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display text-lg font-semibold">{d.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {d.platform} · {d.kind} · seen {relativeTime(d.last_seen)}
                    </p>
                  </div>
                  <Badge variant={d.status === "online" ? "default" : "secondary"}>{d.status}</Badge>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Battery className="h-4 w-4" /> {d.battery ?? "—"}%
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {d.capabilities.map((c) => (
                    <Badge key={c} variant="outline">
                      {c}
                    </Badge>
                  ))}
                </div>
                <div className="mt-5 flex flex-wrap gap-2">
                  {["Do Not Disturb", "Locate", "Read clipboard"].map((cmd) => (
                    <Button
                      key={cmd}
                      size="sm"
                      variant="outline"
                      onClick={() => command.mutate({ deviceId: d.id, name: d.name, cmd })}
                    >
                      {cmd}
                    </Button>
                  ))}
                </div>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="inbox" className="mt-6 space-y-3">
            {(notifications.data ?? []).map((n) => (
              <div
                key={n.id}
                className={`panel flex items-start justify-between gap-4 p-4 ${n.is_read ? "opacity-60" : ""}`}
              >
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary">{n.app}</p>
                  <p className="mt-1 font-medium">{n.title ?? n.sender ?? "Notification"}</p>
                  <p className="text-sm text-muted-foreground">{n.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{relativeTime(n.posted_at)}</p>
                </div>
                {!n.is_read && (
                  <Button size="sm" variant="ghost" onClick={() => markRead.mutate(n.id)}>
                    Mark read
                  </Button>
                )}
              </div>
            ))}
          </TabsContent>

          <TabsContent value="tasks" className="mt-6 space-y-3">
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!taskTitle.trim()) return;
                addTask.mutate(taskTitle.trim());
                setTaskTitle("");
              }}
            >
              <Input
                placeholder="Add a task…"
                value={taskTitle}
                onChange={(e) => setTaskTitle(e.target.value)}
              />
              <Button type="submit">
                <Plus className="h-4 w-4" /> Add
              </Button>
            </form>
            {(tasks.data ?? []).map((t) => (
              <div key={t.id} className="panel flex items-center justify-between gap-4 p-4">
                <div className={t.completed ? "opacity-50 line-through" : ""}>
                  <p className="font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.priority} · due {t.due_at ? relativeTime(t.due_at) : "—"}
                  </p>
                </div>
                <Switch
                  checked={t.completed}
                  onCheckedChange={(checked) =>
                    toggleTask.mutate({ id: t.id, completed: checked, title: t.title })
                  }
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="memory" className="mt-6 grid gap-3 md:grid-cols-2">
            {(memories.data ?? []).map((m) => (
              <div key={m.id} className="panel p-4">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  <p className="font-medium">{m.title}</p>
                  <Badge variant="outline">{m.category}</Badge>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{m.content}</p>
              </div>
            ))}
          </TabsContent>

          <TabsContent value="automations" className="mt-6 space-y-3">
            {(automations.data ?? []).map((a) => (
              <div key={a.id} className="panel flex items-start justify-between gap-4 p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Workflow className="h-4 w-4 text-primary" />
                    <p className="font-medium">{a.name}</p>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.action}</p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    on {a.trigger}
                    {a.condition ? ` · if ${a.condition}` : ""} · last run {relativeTime(a.last_run_at)}
                  </p>
                </div>
                <Switch
                  checked={a.enabled}
                  onCheckedChange={(checked) =>
                    toggleAutomation.mutate({ id: a.id, enabled: checked, name: a.name })
                  }
                />
              </div>
            ))}
          </TabsContent>

          <TabsContent value="permissions" className="mt-6 space-y-3">
            {CAPABILITIES.map((cap) => {
              const row = (permissions.data ?? []).find((p) => p.capability === cap.key);
              const level = (row?.level ?? "ask") as Level;
              return (
                <div key={cap.key} className="panel flex flex-wrap items-center justify-between gap-4 p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="h-4 w-4 text-primary" />
                      <p className="font-medium">{cap.label}</p>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{cap.blurb}</p>
                  </div>
                  <div className="flex gap-1 rounded-lg border border-border p-1">
                    {LEVELS.map((l) => (
                      <Button
                        key={l}
                        size="sm"
                        variant={level === l ? "default" : "ghost"}
                        disabled={!row}
                        onClick={() => row && setLevel.mutate({ id: row.id, capability: cap.key, level: l })}
                      >
                        {l}
                      </Button>
                    ))}
                  </div>
                </div>
              );
            })}
          </TabsContent>

          <TabsContent value="activity" className="mt-6 space-y-2">
            {(activity.data ?? []).map((a) => (
              <div key={a.id} className="panel flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="font-mono text-sm">{a.tool}</p>
                  <p className="text-sm text-muted-foreground">{a.summary}</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={a.status === "allowed" ? "default" : a.status === "denied" ? "destructive" : "secondary"}
                  >
                    {a.status}
                  </Badge>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {a.actor} · {relativeTime(a.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
}) {
  return (
    <div className="panel p-5">
      <Icon className="h-4 w-4 text-primary" />
      <p className="mt-3 font-display text-2xl font-semibold">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
