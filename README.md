# Hubdoc for AI agents

Lets Claude work in Hubdoc for you. Hubdoc has no API, so Claude drives a real
browser window that you can watch.

Two parts:

- `.mcp.json` starts the browser tools (Microsoft's Playwright MCP server).
- `.claude/skills/hubdoc/SKILL.md` tells Claude how Hubdoc works and what it
  must ask before doing.

## Requirements

- Node.js 18 or newer
- Google Chrome

## Claude Code

1. Open a terminal in this folder and run `claude`.
2. Approve the `hubdoc-browser` server when asked.
3. Say: "Open Hubdoc".
4. Log in yourself in the window that opens. Claude never sees the password.

## Claude Desktop on Windows

Everything runs on your own PC. One prerequisite: **Node.js** (from nodejs.org,
LTS). It gives Claude Desktop the `npx` it needs to launch the browser.

1. Install Node.js, then install Google Chrome if missing.
2. In Claude Desktop: Settings → Developer → Edit Config. Paste the contents of
   `claude_desktop_config.windows.json` (keeps your Hubdoc login in a
   `hubdoc-profile` folder in your user directory).
3. Restart Claude Desktop.
4. Add the skill: zip the `.claude/skills/hubdoc` folder, then Settings →
   Capabilities → Skills → add the zip.
5. Say "Open Hubdoc".

### Logging in without the 2FA holder

The browser Claude opens is a fresh profile, so it starts logged out.

- **When the 2FA holder is available:** log in once in that window. The
  `hubdoc-profile` folder then keeps the session for weeks.
- **When the 2FA holder is not available:** reuse a session that is already
  logged in. Copy the `cookie:` request header from that browser (DevTools →
  Network → a `hubdoc` request) into `raw-cookie.txt`, run
  `node scripts/cookies-to-session.mjs`, and point the server at the result by
  replacing `--user-data-dir` and its value with
  `"--isolated", "--storage-state", "<path>\\session.json"` in the config args.

## Things to ask

- "What needs my attention in Hubdoc?"
- "Upload these invoices" (then attach or point to the files)
- "Show me how to code this receipt"
- "Find the last invoice from <supplier> and download it"

Claude asks for a yes before publishing, deleting, or changing settings.

## Limits

- The login lasts as long as Hubdoc's session does. When it expires, log in again.
- One browser window at a time uses the saved profile.
- A Hubdoc redesign can change labels. Claude reads the live page, so it
  usually adapts; when it cannot, it says what it sees.
