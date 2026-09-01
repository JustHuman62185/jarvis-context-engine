import { z } from "zod";
import { defineJarvisTool, ok, fail } from "../policy";

const columns = "id,app,sender,title,body,is_read,posted_at,device_id";

export const notificationsRecent = defineJarvisTool({
  name: "notifications_get_recent",
  title: "Recent notifications",
  description: "Get the most recent notifications captured by the user's Jarvis devices.",
  capability: "notifications",
  inputSchema: { limit: z.number().int().min(1).max(100).optional().describe("How many to return (default 20).") },
  run: async ({ input, supabase }) => {
    const { data, error } = await supabase
      .from("notifications")
      .select(columns)
      .order("posted_at", { ascending: false })
      .limit(Number(input["limit"] ?? 20));
    return error ? fail(error.message) : ok(data ?? []);
  },
});

export const notificationsUnread = defineJarvisTool({
  name: "notifications_get_unread",
  title: "Unread notifications",
  description: "Get notifications the user has not read yet — useful for 'what did I miss?'.",
  capability: "notifications",
  run: async ({ supabase }) => {
    const { data, error } = await supabase
      .from("notifications")
      .select(columns)
      .eq("is_read", false)
      .order("posted_at", { ascending: false })
      .limit(50);
    return error ? fail(error.message) : ok(data ?? []);
  },
});

export const notificationsSearch = defineJarvisTool({
  name: "notifications_search",
  title: "Search notifications",
  description: "Search captured notifications by keyword, app name or sender across all paired devices.",
  capability: "notifications",
  inputSchema: {
    query: z.string().optional().describe("Keyword to match in title, body or sender."),
    app: z.string().optional().describe("Filter by app, e.g. WhatsApp, Gmail, Discord."),
    limit: z.number().int().min(1).max(100).optional(),
  },
  run: async ({ input, supabase }) => {
    let q = supabase.from("notifications").select(columns).order("posted_at", { ascending: false }).limit(Number(input["limit"] ?? 30));
    if (input["app"]) q = q.ilike("app", `%${String(input["app"])}%`);
    if (input["query"]) {
      const term = String(input["query"]);
      q = q.or(`title.ilike.%${term}%,body.ilike.%${term}%,sender.ilike.%${term}%`);
    }
    const { data, error } = await q;
    return error ? fail(error.message) : ok(data ?? []);
  },
});

export const notificationsMarkRead = defineJarvisTool({
  name: "notifications_mark_read",
  title: "Mark notifications read",
  description: "Mark one notification, or all notifications, as read.",
  capability: "notifications",
  write: true,
  inputSchema: { id: z.string().uuid().optional().describe("Notification id; omit to mark all read.") },
  run: async ({ input, supabase, userId }) => {
    let q = supabase.from("notifications").update({ is_read: true }).eq("user_id", userId);
    if (input["id"]) q = q.eq("id", String(input["id"]));
    const { error } = await q;
    return error ? fail(error.message) : ok("Marked as read.");
  },
});
