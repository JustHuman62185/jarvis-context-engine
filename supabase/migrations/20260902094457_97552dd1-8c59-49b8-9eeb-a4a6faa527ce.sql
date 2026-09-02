
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  phone_id uuid;
  laptop_id uuid;
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data ->> 'full_name', split_part(NEW.email, '@', 1)))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.devices (user_id, name, kind, platform, status, is_primary, battery, capabilities, last_seen)
  VALUES (NEW.id, 'Pixel 8 Pro', 'phone', 'android', 'online', true, 76,
          ARRAY['notifications','sms','calls','location','camera','apps','clipboard'], now())
  RETURNING id INTO phone_id;

  INSERT INTO public.devices (user_id, name, kind, platform, status, is_primary, battery, capabilities, last_seen)
  VALUES (NEW.id, 'MacBook Pro', 'laptop', 'macos', 'online', false, 92,
          ARRAY['browser','shell','files','clipboard'], now() - interval '4 minutes')
  RETURNING id INTO laptop_id;

  INSERT INTO public.permissions (user_id, capability, level) VALUES
    (NEW.id, 'devices', 'allow'),
    (NEW.id, 'notifications', 'allow'),
    (NEW.id, 'tasks', 'allow'),
    (NEW.id, 'notes', 'allow'),
    (NEW.id, 'memory', 'allow'),
    (NEW.id, 'automations', 'ask'),
    (NEW.id, 'activity', 'allow'),
    (NEW.id, 'permissions', 'allow')
  ON CONFLICT DO NOTHING;

  INSERT INTO public.ai_connections (user_id, provider, label, status, last_used_at)
  VALUES (NEW.id, 'claude', 'Claude Desktop', 'disconnected', NULL);

  INSERT INTO public.notifications (user_id, device_id, app, sender, title, body, is_read, posted_at) VALUES
    (NEW.id, phone_id, 'WhatsApp', 'Priya', 'Priya', 'Are we still on for dinner at 8?', false, now() - interval '9 minutes'),
    (NEW.id, phone_id, 'Gmail', 'billing@vercel.com', 'Your invoice is ready', 'Invoice #4471 for $20.00 has been charged.', false, now() - interval '42 minutes'),
    (NEW.id, phone_id, 'Slack', '#deploys', 'Production deploy finished', 'jarvis-core deployed to production in 2m 14s.', false, now() - interval '1 hour 20 minutes'),
    (NEW.id, phone_id, 'Calendar', NULL, 'Standup in 15 minutes', 'Daily standup with the platform team.', true, now() - interval '3 hours'),
    (NEW.id, phone_id, 'Telegram', 'Dad', 'Dad', 'Call me when you get a chance.', false, now() - interval '5 hours'),
    (NEW.id, laptop_id, 'GitHub', 'dependabot', 'Pull request opened', 'Bump zod from 3.24.1 to 3.25.0', true, now() - interval '8 hours');

  INSERT INTO public.tasks (user_id, title, notes, priority, due_at, completed) VALUES
    (NEW.id, 'Ship the Android agent beta', 'Notification listener + accessibility service.', 'high', now() + interval '2 days', false),
    (NEW.id, 'Reply to Priya about dinner', NULL, 'normal', now() + interval '3 hours', false),
    (NEW.id, 'Review permission engine defaults', 'Decide which capabilities default to Ask.', 'normal', now() + interval '5 days', false),
    (NEW.id, 'Renew domain', NULL, 'low', now() + interval '20 days', true);

  INSERT INTO public.memories (user_id, category, title, content) VALUES
    (NEW.id, 'facts', 'Timezone', 'The user lives in Bengaluru and works on IST (UTC+5:30).'),
    (NEW.id, 'preferences', 'Communication style', 'Prefers short, direct answers with no filler.'),
    (NEW.id, 'facts', 'Primary stack', 'TypeScript, React, Postgres and Supabase.'),
    (NEW.id, 'events', 'Launch date', 'JARVIS private beta targeted for the end of the quarter.');

  INSERT INTO public.notes (user_id, title, content) VALUES
    (NEW.id, 'JARVIS thesis', 'JARVIS is not a model. It is the execution layer that gives any AI model permissioned access to the user''s devices and digital life.');

  INSERT INTO public.automations (user_id, name, trigger, condition, action, enabled, last_run_at) VALUES
    (NEW.id, 'Morning briefing', 'schedule:07:30', NULL, 'Summarise unread notifications, today''s calendar and open high-priority tasks.', true, now() - interval '6 hours'),
    (NEW.id, 'Silence during focus', 'calendar:focus-block', 'event title contains "Focus"', 'Put the primary phone on Do Not Disturb until the block ends.', true, NULL),
    (NEW.id, 'Escalate family messages', 'notification:received', 'sender in family list', 'Notify on laptop and mark the task list with a follow-up.', false, NULL);

  INSERT INTO public.audit_log (user_id, actor, tool, summary, status, device_id) VALUES
    (NEW.id, 'claude', 'notifications_get_unread', 'Read unread notifications', 'allowed', phone_id),
    (NEW.id, 'claude', 'tasks_create', 'Created task "Reply to Priya about dinner"', 'allowed', NULL),
    (NEW.id, 'claude', 'devices_send_command', 'Requested Do Not Disturb on Pixel 8 Pro', 'denied', phone_id),
    (NEW.id, 'claude', 'memory_search', 'Searched memory for "timezone"', 'allowed', NULL);

  RETURN NEW;
END; $$;

REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
