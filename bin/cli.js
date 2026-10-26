#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { validateUrl, validateHtml, validateJsonLd } from '../src/index.js';

const HELP = `Usage: schema-validator <url> [options]
       schema-validator --file page.html | data.jsonld

Extracts JSON-LD structured data from a page, checks JSON syntax, @context and
the required and recommended properties of types that power Google rich results
(Product, Offer, Article, FAQPage, BreadcrumbList, Organization, LocalBusiness,
Event, Recipe, VideoObject, JobPosting and more), plus dates, URLs and prices.

Options:
  --file <path>     Validate a local .html file or a .json/.jsonld file
  --types           List every typed node found
  --json            Print JSON
  --strict          Exit with code 1 on warnings too
  -h, --help        Show this help

Online version (no install): https://promopilot.link/en/tools/schema-validator.php
`;

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const value = (n) => { const i = args.indexOf(n); return i >= 0 ? args[i + 1] : undefined; };
if (!args.length || flag('-h') || flag('--help')) { process.stdout.write(HELP); process.exit(args.length ? 0 : 2); }

const color = process.stdout.isTTY && !process.env.NO_COLOR;
const c = (code, s) => (color ? `\x1b[${code}m${s}\x1b[0m` : s);
const ICON = { error: c(31, '✖'), warning: c(33, '!'), info: c(36, 'i') };

try {
  let r;
  const file = value('--file');
  if (file && /\.(json|jsonld)$/i.test(file)) {
    const v = validateJsonLd(JSON.parse(readFileSync(file, 'utf8')));
    r = { source: file, blocks: 1, items: v.items, types: [...new Set(v.items.flatMap((i) => i.type))], issues: v.issues, ok: !v.issues.some((i) => i.level === 'error') };
  } else if (file) {
    r = { source: file, ...validateHtml(readFileSync(file, 'utf8')) };
  } else {
    r = await validateUrl(args.find((a, i) => !a.startsWith('-') && args[i - 1] !== '--file'));
  }
  if (flag('--json')) console.log(JSON.stringify(r, null, 2));
  else {
    console.log(`${c(1, 'Source:')} ${r.finalUrl || r.source}${r.status ? `  (HTTP ${r.status})` : ''}`);
    console.log(`${c(1, 'JSON-LD blocks:')} ${r.blocks}   ${c(1, 'Types:')} ${r.types.join(', ') || '(none)'}`);
    if (flag('--types')) for (const it of r.items) console.log(`  ${c(2, `#${it.block ?? 1}`)} ${it.type.join(', ').padEnd(22)} ${c(2, it.path)}`);
    console.log('');
    if (!r.issues.length) console.log(c(32, '✔ Structured data looks valid'));
    for (const i of r.issues) console.log(`  ${ICON[i.level]} ${i.block ? c(2, `[#${i.block} ${i.path}] `) : ''}${i.message}`);
  }
  const failing = r.issues.filter((i) => i.level === 'error' || (flag('--strict') && i.level === 'warning'));
  process.exit(failing.length ? 1 : 0);
} catch (err) {
  console.error(c(31, `Error: ${err.message}`));
  process.exit(2);
}
