import { z } from "zod";
import { defineJarvisTool, ok, fail } from "../policy";

export const memorySearch = defineJarvisTool({
  name: "memory_search",
  title: "Search Jarvis memory",
  description: "Search the user's Jarvis memory (preferences, people, projects, events) by keyword or category.",
  capability: "memory",
  inputSchema: {
    query: z.string().optional(),
    category: z.enum(["preferences", "people", "projects", "tasks", "conversations", "devices", "events", "facts"]).optional(),
  },
  run: async ({ input, supabase }) => {
    let q = supabase.from("memories").select("id,category,title,content,created_at").order("updated_at", { ascending: false }).limit(50);
    if (input["category"]) q = q.eq("category", String(input["category"]));
    if (input["query"]) {
      const term = String(input["query"]);
      q = q.or(`title.ilike.%${term}%,content.ilike.%${term}%`);
    }
    const { data, error } = await q;
    return error ? fail(error.message) : ok(data ?? []);
  },
});

export const memoryStore = defineJarvisTool({
  name: "memory_store",
  title: "Store a memory",
  description: "Save a durable fact, preference or event into the user's Jarvis memory.",
  capability: "memory",
  write: true,
  inputSchema: {
    title: z.string().trim().min(1),
    content: z.string().trim().min(1),
    category: z.enum(["preferences", "people", "projects", "tasks", "conversations", "devices", "events", "facts"]).optional(),
  },
  run: async ({ input, supabase, userId }) => {
    const { data, error } = await supabase
      .from("memories")
      .insert({
        user_id: userId,
        title: String(input["title"]),
        content: String(input["content"]),
        category: String(input["category"] ?? "facts"),
      })
      .select()
      .maybeSingle();
    return error ? fail(error.message) : ok(data);
  },
});

export const memoryDelete = defineJarvisTool({
  name: "memory_delete",
  title: "Delete a memory",
  description: "Delete one memory entry from Jarvis memory.",
  capability: "memory",
  write: true,
  inputSchema: { id: z.string().uuid() },
  run: async ({ input, supabase }) => {
    const { error } = await supabase.from("memories").delete().eq("id", String(input["id"]));
    return error ? fail(error.message) : ok("Memory deleted.");
  },
});
