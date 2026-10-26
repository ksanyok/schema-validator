import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extractJsonLd, validateJsonLd, validateHtml, validateUrl } from '../src/index.js';

const codes = (l) => l.map((i) => i.code);
const page = (...blocks) => `<html><head>${blocks.map((b) => `<script type="application/ld+json">${typeof b === 'string' ? b : JSON.stringify(b)}</script>`).join('')}</head></html>`;
const ARTICLE = { '@context': 'https://schema.org', '@type': 'NewsArticle', headline: 'Title', image: ['https://example.com/a.jpg'], datePublished: '2026-10-01T08:00:00+02:00', dateModified: '2026-10-02', author: { '@type': 'Person', name: 'Jane', url: 'https://example.com/jane' } };

test('a complete article is valid', () => {
  const r = validateJsonLd(ARTICLE);
  assert.deepEqual(r.issues, []);
  assert.deepEqual(r.items.map((i) => i.type[0]), ['NewsArticle', 'Person']);
});

test('reports missing required and recommended properties', () => {
  const r = validateJsonLd({ '@context': 'https://schema.org', '@type': 'Event', name: 'Concert' });
  assert.equal(r.issues.filter((i) => i.code === 'missing-required').length, 2);
  assert.ok(codes(r.issues).includes('missing-recommended'));
});

test('validates values: dates, durations, prices, currency, URLs, ratings', () => {
  const r = validateJsonLd({
    '@context': 'https://schema.org', '@type': 'Recipe', name: 'Soup', image: 'soup.jpg', totalTime: '30 minutes', datePublished: '01/02/2026',
    aggregateRating: { '@type': 'AggregateRating', ratingValue: 7, reviewCount: 3 },
    offers: { '@type': 'Offer', price: '$5', priceCurrency: 'dollars' },
  });
  for (const code of ['invalid-url', 'invalid-duration', 'invalid-date', 'rating-range', 'invalid-price', 'invalid-currency']) assert.ok(codes(r.issues).includes(code), code);
});

test('handles @graph, arrays of types and missing context', () => {
  const r = validateJsonLd({ '@context': { '@vocab': 'https://schema.org/' }, '@graph': [{ '@type': ['Organization'], name: 'Acme', url: 'https://acme.test', logo: 'https://acme.test/l.png', sameAs: ['https://x.com/acme'] }, { '@type': 'WebSite', url: 'https://acme.test', potentialAction: {} }] });
  assert.deepEqual(r.issues, []);
  assert.ok(codes(validateJsonLd({ '@type': 'Thing' }).issues).includes('context'));
  assert.ok(codes(validateJsonLd({ '@context': 'https://schema.org' }).issues).includes('no-type'));
});

test('extracts blocks and reports invalid JSON and entity-encoded JSON', () => {
  const html = page(ARTICLE, '{ "@context": "https://schema.org", "@type": "Thing", }', '{&quot;@context&quot;:&quot;https://schema.org&quot;,&quot;@type&quot;:&quot;Thing&quot;}');
  assert.equal(extractJsonLd(html).length, 3);
  const r = validateHtml(html);
  assert.ok(codes(r.issues).includes('invalid-json'));
  assert.ok(codes(r.issues).includes('html-entities'));
  assert.deepEqual(r.types, ['NewsArticle', 'Thing']);
});

test('no structured data and microdata detection', () => {
  assert.ok(codes(validateHtml('<html></html>').issues).includes('no-json-ld'));
  const md = validateHtml('<div itemscope itemtype="https://schema.org/Product"></div>');
  assert.equal(md.microdata, 1);
  assert.equal(md.issues[0].level, 'info');
});

test('the bundled example has the documented problems', () => {
  const r = validateHtml(readFileSync(new URL('../examples/product.html', import.meta.url), 'utf8'));
  for (const code of ['invalid-price', 'invalid-currency', 'invalid-availability', 'breadcrumb-position', 'invalid-url']) assert.ok(codes(r.issues).includes(code), code);
  assert.deepEqual(r.types, ['Product', 'BreadcrumbList']);
});

test('fetches a URL', async () => {
  const r = await validateUrl('example.com', { fetch: async () => new Response(page(ARTICLE)) });
  assert.equal(r.ok, true);
  assert.equal(r.blocks, 1);
});
