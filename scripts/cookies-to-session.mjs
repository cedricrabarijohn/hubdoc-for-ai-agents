// Turns a copied Cookie header into session.json (Playwright storage state).
// No login needed: it reuses the session a logged-in browser already holds.
//
//   1. Copy the "cookie:" request header from DevTools (Network → a hubdoc request).
//   2. Paste it into raw-cookie.txt in the project root.
//   3. node scripts/cookies-to-session.mjs
//
// Optional: if Hubdoc is still logged out after this, also save localStorage as
// raw-localstorage.json ({ "key": "value", ... }) and rerun.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rawPath = join(root, "raw-cookie.txt");
const lsPath = join(root, "raw-localstorage.json");
const outPath = join(root, "session.json");

if (!existsSync(rawPath)) {
  console.error(`Missing ${rawPath}. Paste the copied "cookie:" header into it, then rerun.`);
  process.exit(1);
}

let raw = readFileSync(rawPath, "utf8").trim();
// Tolerate a pasted "cookie: ..." prefix.
raw = raw.replace(/^cookie:\s*/i, "");

const cookies = raw
  .split(/;\s*/)
  .map((pair) => pair.trim())
  .filter(Boolean)
  .map((pair) => {
    const eq = pair.indexOf("=");
    if (eq < 0) return null;
    return {
      name: pair.slice(0, eq).trim(),
      value: pair.slice(eq + 1).trim(),
      domain: ".hubdoc.com",
      path: "/",
      expires: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30,
      httpOnly: false,
      secure: true,
      sameSite: "Lax",
    };
  })
  .filter(Boolean);

if (cookies.length === 0) {
  console.error("No cookies parsed. Is raw-cookie.txt the 'name=value; name=value' header?");
  process.exit(1);
}

const origins = [];
if (existsSync(lsPath)) {
  const ls = JSON.parse(readFileSync(lsPath, "utf8"));
  origins.push({
    origin: "https://app.hubdoc.com",
    localStorage: Object.entries(ls).map(([name, value]) => ({ name, value: String(value) })),
  });
}

writeFileSync(outPath, JSON.stringify({ cookies, origins }, null, 2));
console.log(`Wrote ${outPath}: ${cookies.length} cookies, ${origins.length ? "with" : "no"} localStorage.`);
console.log("Point the MCP server at it with --storage-state. If Hubdoc is still logged out, add raw-localstorage.json and rerun.");
