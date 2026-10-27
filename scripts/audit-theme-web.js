// Run from the web project root:  node scripts/audit-theme-web.js
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DIRS = ["src", "app", "components", "lib"].filter((d) =>
  fs.existsSync(path.join(ROOT, d))
);
const EXTS = new Set([".tsx", ".ts", ".jsx", ".js", ".css"]);
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", "public", "out"]);

// Hardcoded colour sources
const HEX = /(?<![\w&])#[0-9a-fA-F]{3,8}\b/g;
const FN = /\brgba?\(|\bhsla?\(/g;
const TW_PALETTE =
  /\b(?:bg|text|border|ring|divide|from|to|via|fill|stroke|placeholder|outline|shadow)-(?:gray|slate|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}(?:\/\d+)?\b/g;
const TW_BW = /\b(?:bg|text|border|ring|divide|fill|stroke)-(?:white|black)(?:\/\d+)?\b/g;

// Theme tokens (what a migrated file uses)
const TOKENS =
  /\b(?:bg|text|border|ring|divide|fill|stroke|from|to|via)-(?:bg|bg-raised|bg-elevated|ink|ink-soft|line|brand|brand-deep|brand-tint|leaf|leaf-tint|indigo|indigo-tint|clay|clay-tint)\b/g;

const count = (s, re) => (s.match(re) || []).length;

function walk(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    if (SKIP_DIRS.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (EXTS.has(path.extname(e.name))) out.push(full);
  }
  return out;
}

const rows = [];
for (const dir of DIRS) {
  for (const f of walk(path.join(ROOT, dir), [])) {
    const rel = path.relative(ROOT, f);
    if (rel.endsWith("globals.css") || rel.endsWith("lib" + path.sep + "theme.ts")) continue;
    const src = fs.readFileSync(f, "utf8");
    const palette = count(src, TW_PALETTE);
    const hex = count(src, HEX) + count(src, FN);
    const bw = count(src, TW_BW);
    const tokens = count(src, TOKENS);
    const hardcoded = palette + hex; // text-white / bg-black are tracked separately (often intentional on orange)
    if (hardcoded + bw === 0) continue;
    rows.push({
      rel,
      hardcoded,
      bw,
      tokens,
      status: hardcoded === 0 ? "check-bw" : tokens > 0 ? "MIXED" : "HARDCODED",
    });
  }
}

rows.sort((a, b) => b.hardcoded - a.hardcoded || b.bw - a.bw);
const fmt = (r) =>
  `${String(r.hardcoded).padStart(4)} hard  ${String(r.bw).padStart(4)} w/b  ${String(
    r.tokens
  ).padStart(4)} tok  ${r.status.padEnd(9)} ${r.rel}`;

fs.writeFileSync("audit-theme-web-report.txt", rows.map(fmt).join("\n"));

const hard = rows.filter((r) => r.hardcoded > 0);
console.log(`Files with hardcoded colours: ${hard.length}`);
console.log(`  MIXED (hardcoded + tokens, the broken-in-Dark kind): ${hard.filter((r) => r.status === "MIXED").length}`);
console.log(`  HARDCODED only: ${hard.filter((r) => r.status === "HARDCODED").length}`);
console.log(`Merchant files: ${hard.filter((r) => /merchants|merchant/i.test(r.rel)).length}`);
console.log("\nTop 40 (hardcoded, white/black, tokens, status, file):");
rows.slice(0, 40).forEach((r) => console.log(fmt(r)));
console.log("\nFull list written to audit-theme-web-report.txt");