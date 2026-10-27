// node scripts/codemod-dark.js            -> dry run
// node scripts/codemod-dark.js --write    -> apply
const fs = require("fs");
const path = require("path");

const WRITE = process.argv.includes("--write");
const ROOT = process.cwd();
const SCOPES = [
  "src/app/merchants",
  "src/components/vendor",
  "src/components/vendors",
  "src/components/orders",
  "src/app/notifications",
].map((p) => path.join(ROOT, p));
const EXTS = new Set([".tsx", ".jsx"]);

// ── Tailwind palette classes → dark token ─────────────────────────────────
const RULES = [
  ["bg", /^(?:gray|slate|neutral|zinc|stone)-(?:50)$/, "bg"],
  ["bg", /^(?:gray|slate|neutral|zinc|stone)-(?:100|200)$/, "bg-elevated"],
  ["bg", /^white$/, "bg-raised"],
  ["bg", /^(?:green|emerald)-(?:50|100)$/, "leaf-tint"],
  ["bg", /^(?:red|rose)-(?:50|100)$/, "clay-tint"],
  ["bg", /^(?:orange|amber|yellow)-(?:50|100)$/, "brand-tint"],
  ["bg", /^(?:blue|sky|indigo)-(?:50|100)$/, "indigo-tint"],
  ["text", /^(?:gray|slate|neutral|zinc|stone)-(?:800|900)$/, "ink"],
  ["text", /^(?:gray|slate|neutral|zinc|stone)-(?:400|500|600|700)$/, "ink-soft"],
  ["text", /^(?:green|emerald)-(?:600|700|800)$/, "leaf"],
  ["text", /^(?:red|rose)-(?:500|600|700|800)$/, "clay"],
  ["text", /^(?:orange|amber|yellow)-(?:600|700|800|900)$/, "brand"],
  ["border", /^(?:gray|slate|neutral|zinc|stone)-(?:100|200|300)$/, "line"],
  ["divide", /^(?:gray|slate|neutral|zinc|stone)-(?:100|200|300)$/, "line"],
  ["border", /^(?:green|emerald)-(?:100|200)$/, "leaf"],
  ["border", /^(?:red|rose)-(?:100|200)$/, "clay"],
  ["border", /^(?:orange|amber|yellow)-(?:100|200)$/, "brand"],
];

const CLASS_RE =
  /(?<![\w:-])((?:[a-z0-9-]+:)*)(bg|text|border|divide)-((?:white|(?:gray|slate|neutral|zinc|stone|red|rose|orange|amber|yellow|green|emerald|blue|sky|indigo)-\d{2,3}))(\/\d+)?(?![\w-])/g;

// ── Arbitrary hex classes (bg-[#f8f9fa] etc.) → dark class ────────────────
// Values are lowercase. A dark value starting with "[" is an arbitrary value.
const HEX_RULES = {
  text: {
    "text-ink": ["#222", "#222222", "#111", "#111111", "#1a1a2e", "#1a1a1a", "#333", "#333333", "#000", "#000000", "#11181c"],
    "text-ink-soft": ["#444", "#555", "#666", "#777", "#888", "#999", "#aaa", "#bbb", "#bdbdbd", "#ccc", "#d0d0d0", "#ddd", "#687076", "#6b7280", "#9ca3af"],
    "text-leaf": ["#16a34a", "#15803d", "#047857", "#065f46"],
    "text-clay": ["#dc2626", "#ef4444", "#ff3b30", "#b91c1c"],
    "text-brand": ["#92400e", "#a16207", "#d97706", "#c2410c"],
    "text-[#ffc94d]": ["#b8860b"],
  },
  border: {
    "border-line": ["#e0e0e0", "#f0f0f0", "#e8e8e8", "#e5e5e5", "#eee", "#eeeeee", "#f5f5f5", "#dad5d5", "#e5e7eb", "#ddd", "#ccc"],
    "border-leaf": ["#bbf7d0", "#a7f3d0"],
    "border-clay": ["#fecaca"],
    "border-brand": ["#fde68a", "#fed7aa"],
  },
  divide: {
    "divide-line": ["#e0e0e0", "#f0f0f0", "#e8e8e8", "#e5e5e5", "#eee", "#f5f5f5", "#e5e7eb"],
  },
  bg: {
    "bg-bg": ["#f8f9fa", "#f8f8f8", "#f5f6fa", "#fff4ee"],
    "bg-bg-elevated": ["#fafafa", "#f5f5f5", "#f0f0f0", "#e0e0e0", "#eee", "#f3f4f6", "#f9fafb", "#e5e7eb", "#f2f2f2", "#f1f1f1", "#f6f6f6"],
    "bg-bg-raised": ["#fff", "#ffffff"],
    "bg-leaf-tint": ["#ecfdf5", "#f0fdf4", "#dcfce7"],
    "bg-clay-tint": ["#fef2f2", "#fee2e2"],
    "bg-brand-tint": ["#fef3c7", "#fffbeb", "#fff7ed"],
    "bg-indigo-tint": ["#eff6ff"],
    "bg-[#ffb80014]": ["#fffdf5"],
    "bg-[#ffb80026]": ["#fff9e6"],
    "bg-[#ff7c0914]": ["#fffbf7"],
  },
};

const HEX_LOOKUP = {};
for (const [util, groups] of Object.entries(HEX_RULES)) {
  HEX_LOOKUP[util] = {};
  for (const [cls, hexes] of Object.entries(groups)) {
    for (const h of hexes) HEX_LOOKUP[util][h] = cls;
  }
}

const HEX_RE =
  /(?<![\w:-])((?:[a-z0-9-]+:)*)(bg|text|border|divide)-\[(#[0-9a-fA-F]{3,8})\](\/\d+)?(?![\w-])/g;

function mapClass(variants, util, colour, opacity) {
  if (opacity && colour === "white") return null; // translucent white: intentional
  for (const [u, re, token] of RULES) {
    if (u === util && re.test(colour)) return `dark:${variants}${util}-${token}${opacity || ""}`;
  }
  return null;
}

function walk(dir, out) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, out);
    else if (EXTS.has(path.extname(e.name))) out.push(full);
  }
  return out;
}

let totalChanges = 0;
const touched = [];
const leftover = [];

for (const f of SCOPES.flatMap((d) => walk(d, []))) {
  const src = fs.readFileSync(f, "utf8");
  const rel = path.relative(ROOT, f);
  let n = 0;

  const out = src
    .split(/\r?\n/)
    .map((line) => {
      // pass 1: Tailwind palette classes
      let cur = line.replace(CLASS_RE, (match, variants, util, colour, opacity) => {
        if (variants.includes("dark:")) return match;
        const twin = mapClass(variants, util, colour, opacity);
        if (!twin) return match;
        if (line.includes(twin)) return match; // idempotent
        n++;
        return `${match} ${twin}`;
      });

      // pass 2: arbitrary hex classes
      const base = cur;
      cur = cur.replace(HEX_RE, (match, variants, util, hex, opacity) => {
        if (variants.includes("dark:")) return match;
        const cls = HEX_LOOKUP[util] && HEX_LOOKUP[util][hex.toLowerCase()];
        if (!cls) {
          leftover.push(`${rel}: ${util}-[${hex}]`);
          return match;
        }
        const twin = `dark:${variants}${cls}${opacity || ""}`;
        if (base.includes(twin)) return match; // idempotent
        n++;
        return `${match} ${twin}`;
      });
      return cur;
    })
    .join(src.includes("\r\n") ? "\r\n" : "\n");

  if (n > 0) {
    totalChanges += n;
    touched.push(`${String(n).padStart(4)}  ${rel}`);
    if (WRITE) fs.writeFileSync(f, out);
  }
}

console.log(`${WRITE ? "Updated" : "Would update"} ${touched.length} files, ${totalChanges} classes:`);
touched.forEach((t) => console.log("  " + t));

const uniqueLeft = [...new Set(leftover)];
if (uniqueLeft.length) {
  console.log(`\nHex classes with no dark rule, left for manual fixing (${uniqueLeft.length}):`);
  uniqueLeft.slice(0, 60).forEach((a) => console.log("  " + a));
}
if (!WRITE) console.log("\nDry run only. Re-run with --write to apply.");