import { auth, defineMcp } from "@lovable.dev/mcp-js";
import { devicesList, devicesGet, devicesSendCommand } from "./tools/devices";
import {
  notificationsRecent,
  notificationsUnread,
  notificationsSearch,
  notificationsMarkRead,
} from "./tools/notifications";
import { tasksList, tasksCreate, tasksComplete } from "./tools/tasks";
import { memorySearch, memoryStore, memoryDelete } from "./tools/memory";
import { automationsList, automationsCreate, automationsSetEnabled } from "./tools/automations";
import { activityList, permissionsList } from "./tools/activity";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "jarvis",
  title: "JARVIS",
  version: "0.1.0",
  instructions:
    "JARVIS is the user's personal AI execution layer. It exposes their paired devices, captured notifications, tasks, notes, memory, automations and activity log through one permissioned interface. Every call is checked against the user's permission policy and written to their audit log. Prefer notifications_* to answer 'what did I miss', devices_* to inspect or command paired phones, and memory_* to recall durable facts about the user.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [
    devicesList,
    devicesGet,
    devicesSendCommand,
    notificationsRecent,
    notificationsUnread,
    notificationsSearch,
    notificationsMarkRead,
    tasksList,
    tasksCreate,
    tasksComplete,
    memorySearch,
    memoryStore,
    memoryDelete,
    automationsList,
    automationsCreate,
    automationsSetEnabled,
    activityList,
    permissionsList,
  ],
});
