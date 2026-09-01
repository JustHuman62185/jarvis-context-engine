import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ZodTypeAny } from "zod";
import { supabaseForUser } from "./supabase";

export type Capability =
  | "devices"
  | "notifications"
  | "tasks"
  | "notes"
  | "memory"
  | "automations"
  | "activity"
  | "permissions";

type Result = { content: Array<{ type: "text"; text: string }>; isError?: boolean; structuredContent?: unknown };

function text(value: unknown, isError = false): Result {
  const body = typeof value === "string" ? value : JSON.stringify(value, null, 2);
  return isError ? { content: [{ type: "text", text: body }], isError: true } : { content: [{ type: "text", text: body }] };
}

export const ok = (value: unknown) => text(value);
export const fail = (message: string) => text(message, true);

interface JarvisToolConfig<S extends Record<string, ZodTypeAny>> {
  name: string;
  title: string;
  description: string;
  capability: Capability;
  /** Writes require an explicit non-denied policy and are audited as write actions. */
  write?: boolean;
  inputSchema?: S;
  run: (args: {
    input: Record<string, unknown>;
    supabase: SupabaseClient;
    userId: string;
    ctx: ToolContext;
  }) => Promise<Result>;
}

/**
 * Wraps every Jarvis capability with the permission engine:
 * identify caller -> resolve capability policy -> execute -> write audit entry.
 */
export function defineJarvisTool<S extends Record<string, ZodTypeAny>>(config: JarvisToolConfig<S>) {
  return defineTool({
    name: config.name,
    title: config.title,
    description: config.description,
    ...(config.inputSchema ? { inputSchema: config.inputSchema } : {}),
    annotations: {
      readOnlyHint: !config.write,
      destructiveHint: Boolean(config.write),
      openWorldHint: false,
    },
    handler: (async (input: Record<string, unknown>, ctx: ToolContext) => {
      if (!ctx.isAuthenticated()) return fail("Not authenticated with Jarvis.");
      const userId = ctx.getUserId();
      if (!userId) return fail("No Jarvis user bound to this session.");

      const supabase = supabaseForUser(ctx);

      const { data: policy } = await supabase
        .from("permissions")
        .select("level")
        .eq("capability", config.capability)
        .is("connection_id", null)
        .maybeSingle();

      const level = (policy?.["level"] as string | undefined) ?? "allow";
      const audit = async (status: string, summary: string) => {
        await supabase.from("audit_log").insert({
          user_id: userId,
          actor: ctx.getClientId() ?? "mcp-client",
          tool: config.name,
          summary,
          status,
        });
      };

      if (level === "deny") {
        await audit("denied", `Blocked by permission policy for ${config.capability}`);
        return fail(`Denied: the user's Jarvis policy blocks "${config.capability}".`);
      }
      if (level === "ask" && config.write) {
        await audit("denied", `Write blocked: ${config.capability} is set to Ask`);
        return fail(
          `Denied: "${config.capability}" is set to Ask, so write actions must be approved in the Jarvis app first.`,
        );
      }

      try {
        const result = await config.run({ input, supabase, userId, ctx });
        await audit(result.isError ? "error" : "allowed", config.description);
        return result;
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        await audit("error", message);
        return fail(message);
      }
    },
  });
}
