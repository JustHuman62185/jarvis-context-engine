import { z } from "zod";
import { defineJarvisTool, ok, fail } from "../policy";

export const tasksList = defineJarvisTool({
  name: "tasks_list",
  title: "List tasks",
  description: "List the user's Jarvis tasks, optionally including completed ones.",
  capability: "tasks",
  inputSchema: { include_completed: z.boolean().optional() },
  run: async ({ input, supabase }) => {
    let q = supabase.from("tasks").select("id,title,notes,priority,due_at,completed").order("created_at", { ascending: false });
    if (!input["include_completed"]) q = q.eq("completed", false);
    const { data, error } = await q;
    return error ? fail(error.message) : ok(data ?? []);
  },
});

export const tasksCreate = defineJarvisTool({
  name: "tasks_create",
  title: "Create a task",
  description: "Create a task in the user's Jarvis task list.",
  capability: "tasks",
  write: true,
  inputSchema: {
    title: z.string().trim().min(1),
    notes: z.string().optional(),
    priority: z.enum(["low", "normal", "high"]).optional(),
    due_at: z.string().optional().describe("ISO 8601 timestamp."),
  },
  run: async ({ input, supabase, userId }) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        user_id: userId,
        title: String(input["title"]),
        notes: input["notes"] ? String(input["notes"]) : null,
        priority: String(input["priority"] ?? "normal"),
        due_at: input["due_at"] ? String(input["due_at"]) : null,
      })
      .select()
      .maybeSingle();
    return error ? fail(error.message) : ok(data);
  },
});

export const tasksComplete = defineJarvisTool({
  name: "tasks_complete",
  title: "Complete a task",
  description: "Mark a Jarvis task as completed.",
  capability: "tasks",
  write: true,
  inputSchema: { id: z.string().uuid() },
  run: async ({ input, supabase }) => {
    const { error } = await supabase.from("tasks").update({ completed: true }).eq("id", String(input["id"]));
    return error ? fail(error.message) : ok("Task completed.");
  },
});
