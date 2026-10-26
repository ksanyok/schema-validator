import { RULES, ALIASES, DATE_PROPS, URL_PROPS } from './rules.js';
import { decode } from './html.js';

export { RULES, ALIASES } from './rules.js';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}([T ]\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?)?$/;
const ISO_DURATION = /^P(?!$)(\d+Y)?(\d+M)?(\d+W)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+(\.\d+)?S)?)?$/;

/** Extract JSON-LD blocks from HTML; each block is parsed or reported with its error. */
export function extractJsonLd(html) {
  const blocks = [];
  const re = /<script\b[^>]*type\s*=\s*["']?application\/ld\+json["']?[^>]*>([\s\S]*?)<\/script>/gi;
  for (let m; (m = re.exec(html));) {
    const raw = m[1].trim().replace(/^<!--|-->$/g, '').replace(/^\/\/<!\[CDATA\[|\/\/\]\]>$/g, '').trim();
    const line = html.slice(0, m.index).split('\n').length;
    try { blocks.push({ line, data: JSON.parse(raw), raw }); } catch (err) {
      let data = null;
      try { data = JSON.parse(decode(raw)); } catch { /* still invalid */ }
      blocks.push(data ? { line, data, raw, entityEncoded: true } : { line, error: err.message, raw });
    }
  }
  return blocks;
}

const typesOf = (node) => [].concat(node['@type'] || []).map((t) => String(t).replace(/^https?:\/\/schema\.org\//, ''));
const has = (node, spec) => spec.split('|').some((p) => { const v = node[p]; return v !== undefined && v !== null && v !== '' && !(Array.isArray(v) && !v.length); });

/** Flatten a JSON-LD value into typed nodes with their JSON paths. */
function collect(value, path, out) {
  if (Array.isArray(value)) { value.forEach((v, i) => collect(v, `${path}[${i}]`, out)); return; }
  if (!value || typeof value !== 'object') return;
  if (value['@type']) out.push({ node: value, path });
  for (const [k, v] of Object.entries(value)) if (k !== '@context') collect(v, path ? `${path}.${k}` : k, out);
}

/**
 * Validate parsed JSON-LD data.
 * @param {unknown} data one parsed JSON-LD block
 * @returns {{items: {type: string[], path: string}[], issues: object[]}}
 */
export function validateJsonLd(data) {
  const issues = [];
  const add = (level, code, message, path) => issues.push({ level, code, message, path });
  const roots = [].concat(data);
  for (const r of roots) {
    const ctx = JSON.stringify(r?.['@context'] ?? '');
    if (!/schema\.org/.test(ctx)) add('error', 'context', '@context must be "https://schema.org".', '');
  }
  const nodes = [];
  collect(data, '', nodes);
  if (!nodes.length) add('error', 'no-type', 'No @type found in the block.', '');
  for (const { node, path } of nodes) {
    const where = path || '(root)';
    for (const type of typesOf(node)) {
      const rule = RULES[type] || RULES[ALIASES[type]];
      if (!rule) continue;
      for (const spec of rule.required) if (!has(node, spec)) add('error', 'missing-required', `${type} is missing required ${spec.split('|').join(' or ')}.`, where);
      for (const spec of rule.recommended) if (!has(node, spec)) add('warning', 'missing-recommended', `${type} is missing recommended ${spec.split('|').join(' or ')}.`, where);
    }
    for (const [k, v] of Object.entries(node)) {
      for (const val of [].concat(v)) {
        if (typeof val !== 'string') continue;
        if (DATE_PROPS.has(k) && !ISO_DATE.test(val.trim())) add('error', 'invalid-date', `${k} "${val}" is not an ISO 8601 date.`, where);
        if (URL_PROPS.has(k) && !/^https?:\/\//.test(val.trim())) add('warning', 'invalid-url', `${k} "${val}" is not an absolute URL.`, where);
        if (/^(totalTime|cookTime|prepTime|duration|timeRequired)$/.test(k) && !ISO_DURATION.test(val.trim())) add('error', 'invalid-duration', `${k} "${val}" is not an ISO 8601 duration (e.g. PT30M).`, where);
        if (k === 'priceCurrency' && !/^[A-Z]{3}$/.test(val)) add('error', 'invalid-currency', `priceCurrency "${val}" must be a 3-letter ISO 4217 code.`, where);
        if (k === 'price' && !/^\d+(\.\d+)?$/.test(val.trim())) add('error', 'invalid-price', `price "${val}" must be a number without currency symbols or thousands separators.`, where);
        if (k === 'availability' && !/schema\.org\/|^(InStock|OutOfStock|PreOrder|BackOrder|Discontinued|LimitedAvailability|SoldOut|OnlineOnly|InStoreOnly|PreSale)$/.test(val)) add('warning', 'invalid-availability', `availability "${val}" should be a schema.org ItemAvailability value.`, where);
      }
    }
    if (typesOf(node).includes('AggregateRating')) {
      const v = Number(node.ratingValue);
      const best = Number(node.bestRating ?? 5);
      if (!Number.isNaN(v) && (v > best || v < Number(node.worstRating ?? 1))) add('error', 'rating-range', `ratingValue ${node.ratingValue} is outside ${node.worstRating ?? 1}–${best}.`, where);
    }
    if (typesOf(node).includes('BreadcrumbList')) {
      const items = [].concat(node.itemListElement || []);
      items.forEach((it, i) => { if (Number(it.position) !== i + 1) add('warning', 'breadcrumb-position', `Breadcrumb item ${i + 1} has position ${it.position}.`, where); });
    }
  }
  return { items: nodes.map(({ node, path }) => ({ type: typesOf(node), path: path || '(root)' })), issues };
}

/** Validate every JSON-LD block of an HTML document. */
export function validateHtml(html) {
  const blocks = extractJsonLd(html);
  const issues = [];
  const items = [];
  blocks.forEach((b, i) => {
    const prefix = `block ${i + 1} (line ${b.line})`;
    if (b.error) { issues.push({ level: 'error', code: 'invalid-json', message: `${prefix}: invalid JSON — ${b.error}`, path: '' }); return; }
    if (b.entityEncoded) issues.push({ level: 'error', code: 'html-entities', message: `${prefix}: the JSON is HTML-entity encoded; output raw JSON inside the script tag.`, path: '' });
    const r = validateJsonLd(b.data);
    items.push(...r.items.map((it) => ({ ...it, block: i + 1 })));
    issues.push(...r.issues.map((it) => ({ ...it, block: i + 1 })));
  });
  const microdata = (html.match(/\bitemscope\b/gi) || []).length;
  const rdfa = (html.match(/\btypeof\s*=/gi) || []).length;
  if (!blocks.length) issues.push({ level: microdata || rdfa ? 'info' : 'warning', code: 'no-json-ld', message: microdata || rdfa ? `No JSON-LD; the page uses ${microdata ? 'microdata' : 'RDFa'} (${microdata || rdfa} items), which this tool does not validate.` : 'No structured data (JSON-LD) found.', path: '' });
  const topTypes = items.filter((it) => /^(\(root\)|\[\d+\]|@graph\[\d+\]|\[\d+\]\.@graph\[\d+\])$/.test(it.path)).flatMap((it) => it.type);
  return { blocks: blocks.length, microdata, items, types: [...new Set(topTypes.length ? topTypes : items.flatMap((it) => it.type))], issues, ok: !issues.some((i) => i.level === 'error') };
}

/** Fetch a page and validate its JSON-LD. */
export async function validateUrl(url, options = {}) {
  const doFetch = options.fetch || globalThis.fetch;
  const start = new URL(/^https?:\/\//i.test(url) ? url : `https://${url}`).toString();
  const res = await doFetch(start, { redirect: 'follow', headers: { 'user-agent': options.userAgent || 'Mozilla/5.0 (compatible; schema-validator; +https://github.com/ksanyok/schema-validator)' } });
  return { url: start, finalUrl: res.url || start, status: res.status, ...validateHtml(await res.text()) };
}
