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

// [utility, colour family, shade regex] -> dark replacement colour token
const RULES = [
  // backgrounds
  ["bg", /^(?:gray|slate|neutral|zinc|stone)-(?:50)$/, "bg"],
  ["bg", /^(?:gray|slate|neutral|zinc|stone)-(?:100|200)$/, "bg-elevated"],
  ["bg", /^white$/, "bg-raised"],
  ["bg", /^(?:green|emerald)-(?:50|100)$/, "leaf-tint"],
  ["bg", /^(?:red|rose)-(?:50|100)$/, "clay-tint"],
  ["bg", /^(?:orange|amber|yellow)-(?:50|100)$/, "brand-tint"],
  ["bg", /^(?:blue|sky|indigo)-(?:50|100)$/, "indigo-tint"],
  // text
  ["text", /^(?:gray|slate|neutral|zinc|stone)-(?:800|900)$/, "ink"],
  ["text", /^(?:gray|slate|neutral|zinc|stone)-(?:400|500|600|700)$/, "ink-soft"],
  ["text", /^(?:green|emerald)-(?:600|700|800)$/, "leaf"],
  ["text", /^(?:red|rose)-(?:500|600|700|800)$/, "clay"],
  ["text", /^(?:orange|amber|yellow)-(?:600|700|800|900)$/, "brand"],
  // borders / dividers
  ["border", /^(?:gray|slate|neutral|zinc|stone)-(?:100|200|300)$/, "line"],
  ["divide", /^(?:gray|slate|neutral|zinc|stone)-(?:100|200|300)$/, "line"],
  ["border", /^(?:green|emerald)-(?:100|200)$/, "leaf"],
  ["border", /^(?:red|rose)-(?:100|200)$/, "clay"],
  ["border", /^(?:orange|amber|yellow)-(?:100|200)$/, "brand"],
];

// optional variants (hover:, md:, ...) + utility + colour(-shade) + optional /opacity
const CLASS_RE =
  /(?<![\w:-])((?:[a-z0-9-]+:)*)(bg|text|border|divide)-((?:white|(?:gray|slate|neutral|zinc|stone|red|rose|orange|amber|yellow|green|emerald|blue|sky|indigo)-\d{2,3}))(\/\d+)?(?![\w-])/g;

function mapClass(variants, util, colour, opacity) {
  if (opacity && colour === "white") return null; // translucent white: intentional
  for (const [u, re, token] of RULES) {
    if (u === util && re.test(colour)) {
      return `dark:${variants}${util}-${token}${opacity || ""}`;
    }
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
const arbitrary = [];

for (const f of SCOPES.flatMap((d) => walk(d, []))) {
  const src = fs.readFileSync(f, "utf8");
  const rel = path.relative(ROOT, f);
  let n = 0;

  const out = src
    .split(/\r?\n/)
    .map((line) => {
      return line.replace(CLASS_RE, (match, variants, util, colour, opacity) => {
        // already a dark: variant, or part of one
        if (/dark:$/.test(variants) || variants.includes("dark:")) return match;
        const twin = mapClass(variants, util, colour, opacity);
        if (!twin) return match;
        if (line.includes(twin)) return match; // idempotent
        n++;
        return `${match} ${twin}`;
      });
    })
    .join(src.includes("\r\n") ? "\r\n" : "\n");

  for (const m of src.matchAll(/(?:bg|text|border)-\[#[0-9a-fA-F]{3,8}\]/g)) {
    arbitrary.push(`${rel}: ${m[0]}`);
  }

  if (n > 0) {
    totalChanges += n;
    touched.push(`${String(n).padStart(4)}  ${rel}`);
    if (WRITE) fs.writeFileSync(f, out);
  }
}

console.log(`${WRITE ? "Updated" : "Would update"} ${touched.length} files, ${totalChanges} classes:`);
touched.forEach((t) => console.log("  " + t));
if (arbitrary.length) {
  console.log(`\nArbitrary hex colours left for manual fixing (${arbitrary.length}):`);
  arbitrary.slice(0, 60).forEach((a) => console.log("  " + a));
}
if (!WRITE) console.log("\nDry run only. Re-run with --write to apply.");