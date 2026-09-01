import { z } from "zod";
import { defineJarvisTool, ok, fail } from "../policy";

export const devicesList = defineJarvisTool({
  name: "devices_list",
  title: "List Jarvis devices",
  description: "List the devices paired to the user's Jarvis account with status, battery and capabilities.",
  capability: "devices",
  run: async ({ supabase }) => {
    const { data, error } = await supabase
      .from("devices")
      .select("id,name,kind,platform,status,is_primary,battery,capabilities,last_seen")
      .order("is_primary", { ascending: false });
    return error ? fail(error.message) : ok(data ?? []);
  },
});

export const devicesGet = defineJarvisTool({
  name: "devices_get",
  title: "Get a Jarvis device",
  description: "Get one paired device by name or id, including its granted capabilities.",
  capability: "devices",
  inputSchema: { device: z.string().min(1).describe("Device name or id.") },
  run: async ({ input, supabase }) => {
    const device = String(input["device"]);
    const { data, error } = await supabase
      .from("devices")
      .select("id,name,kind,platform,status,is_primary,battery,capabilities,last_seen")
      .or(`id.eq.${/^[0-9a-f-]{36}$/i.test(device) ? device : "00000000-0000-0000-0000-000000000000"},name.ilike.%${device}%`)
      .limit(1)
      .maybeSingle();
    if (error) return fail(error.message);
    return data ? ok(data) : fail(`No paired device matching "${device}".`);
  },
});

export const devicesSendCommand = defineJarvisTool({
  name: "devices_send_command",
  title: "Send a command to a device",
  description: "Queue a capability command (e.g. open_app, get_screen) for a paired Jarvis device agent to execute.",
  capability: "devices",
  write: true,
  inputSchema: {
    device: z.string().min(1).describe("Device name or id."),
    command: z.string().min(1).describe("Capability command, e.g. phone.open_app."),
    args: z.string().optional().describe("Optional JSON arguments for the command."),
  },
  run: async ({ input, supabase, userId }) => {
    const device = String(input["device"]);
    const { data: match } = await supabase.from("devices").select("id,name,status").ilike("name", `%${device}%`).limit(1).maybeSingle();
    if (!match) return fail(`No paired device matching "${device}".`);
    const { error } = await supabase.from("audit_log").insert({
      user_id: userId,
      actor: "mcp-client",
      tool: String(input["command"]),
      summary: `Queued ${String(input["command"])} for ${match["name"]}${input["args"] ? ` with ${String(input["args"])}` : ""}`,
      status: "queued",
      device_id: match["id"],
    });
    if (error) return fail(error.message);
    return ok(`Queued "${String(input["command"])}" for ${match["name"]}. The device agent executes it on next sync.`);
  },
});
