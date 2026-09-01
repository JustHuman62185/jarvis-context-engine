import { z } from "zod";
import { defineJarvisTool, ok, fail } from "../policy";

export const automationsList = defineJarvisTool({
  name: "automations_list",
  title: "List automations",
  description: "List the user's Jarvis automations (trigger / condition / action rules).",
  capability: "automations",
  run: async ({ supabase }) => {
    const { data, error } = await supabase
      .from("automations")
      .select("id,name,trigger,condition,action,enabled,last_run_at")
      .order("created_at", { ascending: false });
    return error ? fail(error.message) : ok(data ?? []);
  },
});

export const automationsCreate = defineJarvisTool({
  name: "automations_create",
  title: "Create an automation",
  description: "Create a trigger / condition / action automation in Jarvis.",
  capability: "automations",
  write: true,
  inputSchema: {
    name: z.string().trim().min(1),
    trigger: z.string().trim().min(1).describe("e.g. 'every morning at 08:00' or 'github issue created'."),
    condition: z.string().optional(),
    action: z.string().trim().min(1).describe("e.g. 'summarize unread notifications'."),
  },
  run: async ({ input, supabase, userId }) => {
    const { data, error } = await supabase
      .from("automations")
      .insert({
        user_id: userId,
        name: String(input["name"]),
        trigger: String(input["trigger"]),
        condition: input["condition"] ? String(input["condition"]) : null,
        action: String(input["action"]),
      })
      .select()
      .maybeSingle();
    return error ? fail(error.message) : ok(data);
  },
});

export const automationsSetEnabled = defineJarvisTool({
  name: "automations_set_enabled",
  title: "Enable or disable an automation",
  description: "Turn a Jarvis automation on or off.",
  capability: "automations",
  write: true,
  inputSchema: { id: z.string().uuid(), enabled: z.boolean() },
  run: async ({ input, supabase }) => {
    const { error } = await supabase.from("automations").update({ enabled: Boolean(input["enabled"]) }).eq("id", String(input["id"]));
    return error ? fail(error.message) : ok(input["enabled"] ? "Automation enabled." : "Automation disabled.");
  },
});
