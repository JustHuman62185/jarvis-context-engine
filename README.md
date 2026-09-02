# Your Digital Twin

Yes. Let's throw away the old "Buildly = Hatchable competitor" framing and design JARVIS from zero.

The important idea is this:

> JARVIS is not an AI model. JARVIS is the execution layer that gives AI models access to the user's digital life and devices, under the user's control.



Claude, ChatGPT, Gemini, your own models, etc. can become brains. Jarvis becomes the body, operating system, security layer, memory and tool ecosystem.

And yes, we're going ridiculously broad with the tools. Humanity has enough apps to justify it. 🗿


---

1. The core concept

The user installs JARVIS on a primary Android phone.

That phone becomes a Jarvis Device.

The user can then connect other AI clients to Jarvis through MCP.

For example:

Claude on another phone

ChatGPT

Claude on a computer

Your own Jarvis interface

Another MCP-compatible AI


All of them can access the user's authorized Jarvis capabilities.

The AI doesn't directly control the phone.

It requests a Jarvis capability.

Example:

> Claude: "What's on my phone?"



Jarvis decides what that means and exposes the appropriate information.


---

2. JARVIS has three major layers

JARVIS Core

This is your backend.

It handles:

accounts

authentication

devices

sessions

permissions

tool routing

memory

audit logs

automation

integrations

device communication

MCP

AI-provider connections


This is the brain stem.


---

3. JARVIS Android Agent

This is the app installed on Phone A.

It provides capabilities Android allows an application to access.

The app can have:

Notification access

Read notifications from:

WhatsApp

Telegram

Discord

Gmail

Instagram

Reddit

YouTube

banking apps where notification content is exposed

delivery apps

calendar

SMS

basically anything appearing in the notification shade, subject to Android/app restrictions


Tools:

notifications.list
notifications.search
notifications.get
notifications.get_recent
notifications.get_unread
notifications.search_by_app
notifications.search_by_sender
notifications.search_by_keyword
notifications.group
notifications.dismiss
notifications.open


---

4. Phone accessibility

This is where Jarvis becomes considerably more interesting.

With the user's explicit Android accessibility permission, Jarvis can interact with supported app UIs.

Tools:

phone.get_screen
phone.get_screen_text
phone.get_ui_tree
phone.find_element
phone.find_text
phone.tap
phone.long_press
phone.double_tap
phone.swipe
phone.scroll
phone.type
phone.clear_text
phone.press_back
phone.press_home
phone.open_app
phone.close_app
phone.switch_app
phone.get_current_app
phone.wait_for_element
phone.wait_for_text
phone.take_screenshot

You can build higher-level tools on top of those rather than forcing Claude to manipulate coordinates like a caveman.


---

5. WhatsApp

Don't make WhatsApp a special magical exception.

Make it one of many app capabilities.

Potential tools:

whatsapp.get_notifications
whatsapp.search_messages
whatsapp.get_recent_messages
whatsapp.find_contact
whatsapp.open
whatsapp.open_chat
whatsapp.read_visible_messages
whatsapp.search_chat
whatsapp.draft_message
whatsapp.send_message
whatsapp.reply_to_message
whatsapp.get_chat_list
whatsapp.get_unread_chats

The implementation can use the appropriate combination of:

notification access

accessibility

official APIs where applicable


Don't promise unrestricted access to WhatsApp's entire internal message database. Android permissions and WhatsApp's architecture still exist, tragically.


---

6. Discord

Tools:

discord.get_notifications
discord.list_servers
discord.list_channels
discord.read_channel
discord.search_messages
discord.get_message
discord.get_user
discord.search_users
discord.send_message
discord.reply
discord.create_thread
discord.add_reaction
discord.remove_reaction
discord.edit_message
discord.delete_message
discord.open

Prefer Discord's official API for account-level operations.


---

7. Telegram

telegram.get_notifications
telegram.list_chats
telegram.search_messages
telegram.get_messages
telegram.get_chat
telegram.get_contact
telegram.send_message
telegram.reply
telegram.forward_message
telegram.send_file
telegram.send_photo
telegram.send_video
telegram.open

Again, official APIs wherever possible.


---

8. Gmail

gmail.get_unread
gmail.search
gmail.get_email
gmail.get_thread
gmail.list_threads
gmail.download_attachment
gmail.get_attachment
gmail.create_draft
gmail.reply
gmail.forward
gmail.send
gmail.archive
gmail.trash
gmail.mark_read
gmail.mark_unread
gmail.add_label
gmail.remove_label


---

9. Google Calendar

calendar.list_events
calendar.get_event
calendar.search_events
calendar.create_event
calendar.update_event
calendar.delete_event
calendar.add_attendee
calendar.remove_attendee
calendar.respond
calendar.get_free_time
calendar.find_next_available


---

10. Google Drive

drive.search
drive.list_files
drive.get_file
drive.download
drive.upload
drive.create_folder
drive.rename
drive.move
drive.copy
drive.delete
drive.share
drive.get_permissions
drive.create_document


---

11. GitHub

This is where your original Buildly heritage survives.

github.get_user
github.list_repositories
github.get_repository
github.search_repositories
github.search_code
github.search_issues
github.get_issue
github.create_issue
github.update_issue
github.close_issue
github.comment_issue
github.list_pull_requests
github.get_pull_request
github.create_pull_request
github.update_pull_request
github.merge_pull_request
github.review_pull_request
github.list_commits
github.get_commit
github.get_file
github.create_file
github.update_file
github.delete_file
github.create_branch
github.delete_branch
github.create_release
github.list_workflows
github.run_workflow
github.get_workflow_run


---

12. GitLab

Same philosophy:

gitlab.list_projects
gitlab.get_project
gitlab.search_projects
gitlab.search_code
gitlab.list_issues
gitlab.create_issue
gitlab.update_issue
gitlab.close_issue
gitlab.list_merge_requests
gitlab.create_merge_request
gitlab.merge_merge_request
gitlab.list_commits
gitlab.get_file
gitlab.update_file
gitlab.create_branch
gitlab.run_pipeline
gitlab.get_pipeline


---

13. Development infrastructure

Here's where Buildly's original DNA becomes useful.

Jarvis can control:

servers

databases

deployments

domains

containers

cloud resources

CI/CD

logs


Tools:

server.list
server.get
server.create
server.delete
server.restart
server.start
server.stop
server.execute
server.get_metrics
server.get_logs
server.get_processes
server.get_environment

Docker:

docker.list_containers
docker.get_container
docker.start
docker.stop
docker.restart
docker.remove
docker.logs
docker.exec
docker.list_images
docker.pull
docker.build
docker.remove_image

Deployments:

deploy.list
deploy.get
deploy.create
deploy.preview
deploy.deploy
deploy.cancel
deploy.rollback
deploy.get_logs
deploy.get_status
deploy.get_environment
deploy.set_environment_variable


---

14. Databases

Support:

PostgreSQL

MySQL

SQLite

Supabase

Firebase

MongoDB

Redis


Tools:

database.list
database.get
database.connect
database.query
database.explain
database.schema
database.tables
database.columns
database.indexes
database.create_table
database.alter_table
database.create_index
database.drop_index
database.insert
database.update
database.delete
database.backup
database.restore
database.migrate
database.migration_status

Dangerous database operations should have strong permission policies.


---

15. Files

Jarvis should understand the user's files.

files.list
files.search
files.read
files.write
files.create
files.rename
files.move
files.copy
files.delete
files.download
files.upload
files.get_metadata
files.create_folder
files.compress
files.extract

And eventually:

files.summarize
files.extract_text
files.convert
files.compare
files.find_duplicates


---

16. Computer control

If you eventually have a Jarvis desktop agent:

computer.get_screen
computer.screenshot
computer.get_active_window
computer.open_application
computer.close_application
computer.focus_window
computer.click
computer.double_click
computer.right_click
computer.move_mouse
computer.scroll
computer.type
computer.press_key
computer.hotkey
computer.copy
computer.paste
computer.read_clipboard

Again, this should be heavily permissioned.


---

17. Browser

A dedicated browser agent can expose:

browser.open
browser.close
browser.back
browser.forward
browser.refresh
browser.get_url
browser.get_title
browser.get_text
browser.get_links
browser.find
browser.click
browser.type
browser.select
browser.scroll
browser.screenshot
browser.download
browser.upload
browser.new_tab
browser.close_tab
browser.switch_tab
browser.search

And higher-level:

browser.search_web
browser.extract_page
browser.fill_form
browser.submit_form
browser.monitor_page


---

18. Contacts

contacts.list
contacts.search
contacts.get
contacts.create
contacts.update
contacts.delete
contacts.get_phone
contacts.get_email


---

19. SMS

Where Android permissions and device capabilities permit:

sms.list
sms.search
sms.get_thread
sms.get_message
sms.get_unread
sms.send
sms.reply
sms.mark_read
sms.delete


---

20. Phone calls

Potentially:

calls.get_recent
calls.search
calls.get_contact
calls.dial
calls.cancel
calls.open

Calling capabilities need to respect Android permissions and carrier/device behavior.


---

21. Camera

Jarvis could eventually provide:

camera.open
camera.take_photo
camera.record_video
camera.get_preview
camera.close

With explicit device permission.


---

22. Microphone

audio.record
audio.stop
audio.get_recording
audio.transcribe

Again, this should never become a stealth surveillance mechanism. The user needs clear control and visibility.


---

23. Device information

device.get_info
device.get_model
device.get_os
device.get_battery
device.get_storage
device.get_memory
device.get_network
device.get_wifi
device.get_bluetooth
device.get_volume
device.get_brightness
device.get_orientation
device.get_connection_status


---

24. Device controls

Where Android permits:

device.set_volume
device.set_brightness
device.enable_wifi
device.disable_wifi
device.enable_bluetooth
device.disable_bluetooth
device.set_alarm
device.open_settings
device.lock
device.reboot

Some of these will have Android restrictions. Design the tool registry around capabilities actually granted to the installed device, rather than pretending Android is your obedient servant.


---

25. Location

Potentially:

location.current
location.last_known
location.permission_status
location.start_tracking
location.stop_tracking

This should be an especially sensitive permission.


---

26. Notifications as a universal interface

This is actually one of your killer features.

Instead of building:

WhatsApp API
Instagram API
Discord API
Reddit API
Telegram API
...

for basic notification reading, Jarvis can expose:

notifications.search

and Claude can ask:

> "What did I miss while I was asleep?"



Jarvis could aggregate whatever notifications are actually available.


---

27. Automation engine

This is where Jarvis stops being merely reactive.

Create:

automation.list
automation.get
automation.create
automation.update
automation.delete
automation.enable
automation.disable
automation.run
automation.history
automation.logs

Example:

> "Every morning, summarize my unread notifications."



Or:

> "When my GitHub repository gets a new issue, notify me."



Or:

> "When my battery falls below a configured threshold, remind me."



You can eventually support:

trigger
condition
action

For example:

WHEN
GitHub issue created

IF
repository = my-project

THEN
send notification


---

28. Memory

Jarvis needs its own memory system.

memory.store
memory.search
memory.get
memory.update
memory.delete
memory.list
memory.summarize
memory.preferences
memory.facts
memory.events

But don't make memory a giant dump of everything the user has ever done.

Use categories:

preferences

people

projects

tasks

conversations

devices

permissions

important events


And give the user controls to inspect/delete it.


---

29. Tasks

tasks.list
tasks.get
tasks.create
tasks.update
tasks.complete
tasks.delete
tasks.search
tasks.set_priority
tasks.set_due_date


---

30. Notes

notes.list
notes.search
notes.get
notes.create
notes.update
notes.delete
notes.append
notes.summarize


---

31. Passwords and secrets

Be extremely careful here.

Don't make:

passwords.get_everything

That's a security disaster wearing a trench coat.

Instead:

secrets.list_metadata
secrets.get
secrets.create
secrets.update
secrets.delete

with extremely strict authorization and preferably an established password-manager integration rather than becoming one yourself.


---

32. AI model management

Now your original AI-team idea comes back.

Jarvis can connect:

Claude

OpenAI

Gemini

Groq

OpenRouter

local models

other providers


Tools:

ai.list_models
ai.get_model
ai.chat
ai.generate
ai.summarize
ai.classify
ai.embed
ai.transcribe
ai.generate_image

And agent orchestration:

agent.create
agent.list
agent.get
agent.run
agent.stop
agent.pause
agent.resume
agent.handoff
agent.get_status
agent.get_logs


---

33. Jarvis can have specialized agents

For example:

Research Agent
Coding Agent
Security Agent
Planning Agent
Writing Agent
Browser Agent
Phone Agent
DevOps Agent
Data Agent
Communication Agent
Personal Assistant

But don't make every agent independently powerful.

They should request capabilities from Jarvis Core.

That gives you one security layer.


---

34. The most important component: Permission Engine

This is the thing I'd spend a ridiculous amount of time getting right.

Every tool call should go through something like:

Who?
↓
Which AI?
↓
Which user?
↓
Which device?
↓
Which tool?
↓
What data?
↓
What action?
↓
What scope?
↓
Allowed?
↓
Execute

Permissions could be:

READ
WRITE
SEND
DELETE
EXECUTE
ADMIN
DEVICE_CONTROL
SENSITIVE_DATA

And users can configure them.


---

35. Phone B becomes the control authority

This is exactly your idea.

Phone A:

> Jarvis Device



Phone B:

> User's current control device



Claude runs on Phone B.

The user authorizes Claude/Jarvis from Phone B.

Then:

Claude
→ Jarvis MCP
→ authorization/session
→ Phone A
→ operation
→ result

Phone A doesn't need someone standing beside it.

That's the point.


---

36. Device pairing

Each Jarvis device gets a cryptographic identity.

For example:

Jarvis Account
    ↓
Device A: Home Phone
Device B: Current Phone
Device C: Laptop
Device D: Tablet

The server knows which devices belong to the account.

You can then ask:

> "Show me notifications from my home phone."



Jarvis knows which device that means.


---

37. Remote device tools

devices.list
devices.get
devices.rename
devices.status
devices.ping
devices.locate
devices.get_capabilities
devices.get_battery
devices.get_notifications
devices.get_screen
devices.open_app
devices.execute
devices.send_command
devices.disconnect

And eventually:

devices.share_screen
devices.stream_events
devices.start_session
devices.end_session


---

38. MCP becomes your universal interface

This is the clever part.

Instead of Claude needing:

Claude → WhatsApp
Claude → Discord
Claude → GitHub
Claude → Phone
Claude → Servers

you have:

Claude
   ↓
JARVIS MCP
   ↓
JARVIS CORE
   ↓
whatever capability is required

So Claude only needs one connector.

Same for other MCP-compatible AI clients.

That's your killer distribution mechanism.


---

39. Your Claude integration

You already discovered the Hatchable-style deep link.

Your website can have:

Connect JARVIS to Claude

which opens the pre-filled custom connector page.

Your endpoint would eventually be something like:

https://mcp.jarvis.yourdomain.com/mcp

instead of the Base44-hosted URL.

Then:

Connect → OAuth → authorized.


---

40. ChatGPT integration

Build toward a native ChatGPT App/integration as well.

The goal is:

Connect JARVIS

and ChatGPT gets access to the same Jarvis capabilities.

The important architectural decision is:

> Don't build Claude-specific tools.



Build Jarvis capabilities.

Then expose them to each AI through the appropriate protocol/interface.


---

41. The Jarvis Android app itself

The app should have sections like:

Home

Jarvis
Online

3 devices
14 notifications
2 automations

Devices

Home Phone
Laptop
Tablet

Connections

Claude       Connected
ChatGPT      Connected
GitHub       Connected
Discord      Connected
Google       Connected

Permissions

Claude

Notifications       Allowed
Phone control        Allowed
GitHub               Allowed
Messaging            Allowed
Files                Ask
Device settings      Denied

Activity

11:42 Claude requested:
Read recent notifications

11:41 Claude requested:
Search GitHub issues

11:37 Automation:
Daily notification summary

That activity log is very important.


---

42. The ultimate user experience

The user is outside with Phone B.

Phone A is at home.

They open Claude.

> "Jarvis, what messages did I miss on my home phone?"



Claude:

> "You have three new notifications..."



Then:

> "Reply to Alex that I'll call him later."



Claude:

> "Sending..."



Jarvis performs the authorized operation on Phone A.

No walking home.

No touching Phone A.

No second confirmation.

Because Phone B is the user's authenticated control surface.


---

43. The security model I'd use

There are three concepts:

Pairing

"Does this device belong to the user?"

Authorization

"Is this AI/session allowed to use Jarvis?"

Capability

"What exactly is this AI allowed to do?"

So:

Phone B
   ↓
Authenticated user
   ↓
Claude session
   ↓
Jarvis authorization
   ↓
Permission policy
   ↓
Phone A

This is much cleaner than asking Phone A for approval every time.


---

44. Don't build all 500 tools immediately

You should design the platform for hundreds of tools, but build them in layers.

Your first serious version should probably have:

Core

authentication

devices

sessions

permissions

audit logs

MCP

OAuth

tool registry


Android

notifications

accessibility

screen

app launching

basic device information

remote commands


Integrations

GitHub

Discord

Google

Telegram

WhatsApp-related capabilities where technically/officially supported


AI

Claude

OpenAI

local models


Automation

triggers

conditions

actions


Once those foundations work, adding another integration becomes:

> Create connector → expose tools → permission policy → done



instead of rebuilding Jarvis every time.


---

45. The actual product

I'd define JARVIS as:

> A universal AI execution platform that lets AI assistants securely interact with a user's applications, accounts, devices, files, infrastructure and digital environment through one permissioned interface.



That's the product.

Not:

> "another chatbot."



Not:

> "another MCP server."



Not:

> "an Android assistant."



It's a personal AI control plane.

And your original Buildly infrastructure work isn't wasted at all. Authentication, MCP, projects, providers, deployment, databases, tool orchestration, AI teams, audit logs, etc. become components of Jarvis.

You're basically taking the thing you were building as a developer control plane and expanding it into a personal digital control plane.

Which is, frankly, a much more interesting direction. Your poor original roadmap has been murdered and repurposed into Jarvis. 🗿🔥





I was talking to chatgpt and this is the plan. Let's make it. First claude only. The connect claude button should have this link:



https://claude.ai/customize/connectors?modal=add-custom-connector&connectorName=Jarvis&connectorUrl=YOURMCPURL

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://jarvis-context-engine.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4f0cbbc2-4da0-4a27-b5a9-4c3b5ab67038).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
