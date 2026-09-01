import { z } from "zod";
import { defineJarvisTool, ok, fail } from "../policy";

export const activityList = defineJarvisTool({
  name: "activity_list",
  title: "List Jarvis activity",
  description: "Read the Jarvis audit log: which AI client requested which capability, when, and whether it was allowed.",
  capability: "activity",
  inputSchema: { limit: z.number().int().min(1).max(100).optional() },
  run: async ({ input, supabase }) => {
    const { data, error } = await supabase
      .from("audit_log")
      .select("id,actor,tool,summary,status,created_at")
      .order("created_at", { ascending: false })
      .limit(Number(input["limit"] ?? 25));
    return error ? fail(error.message) : ok(data ?? []);
  },
});

export const permissionsList = defineJarvisTool({
  name: "permissions_list",
  title: "List capability permissions",
  description: "Show the user's permission policy for each Jarvis capability (allow, ask or deny).",
  capability: "permissions",
  run: async ({ supabase }) => {
    const { data, error } = await supabase.from("permissions").select("capability,level").order("capability");
    return error ? fail(error.message) : ok(data ?? []);
  },
});
