import { writeFile } from 'node:fs/promises';

const origin = (process.argv[2] || 'https://www.moscowmix.com').replace(/\/$/, '');
const outputPath = process.argv[3];
const sitemapXml = await fetch(`${origin}/sitemap.xml`).then(async (response) => {
  if (!response.ok) throw new Error(`Sitemap returned ${response.status}`);
  return response.text();
});

const canonicalOrigin = 'https://www.moscowmix.com';
const sitemapPaths = [...sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => new URL(match[1]).pathname);
const requiredRoutes = [
  '/', '/shop/copper', '/shop/fire', '/journal', '/about', '/contact', '/privacy', '/terms',
  '/journal/pure-copper-mugs-vs-stainless-steel-mugs',
  '/journal/real-copper-mugs-guide',
  '/journal/moscow-mule-copper-mugs',
];
const paths = [...new Set([...sitemapPaths, ...requiredRoutes])];
const genericTitlePattern = /^Moscow Mix \|/i;
const genericDescription = 'Moscow Mix creates solid 100% pure copper mugs and natural fire starters';

function match(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || '';
}

function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z#0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function audit(path) {
  const fetchUrl = `${origin}${path}`;
  const expectedUrl = `${canonicalOrigin}${path}`;
  const response = await fetch(fetchUrl, { redirect: 'manual', headers: { 'User-Agent': 'MoscowMix-SEO-Audit/1.0' } });
  const html = await response.text();
  const title = match(html, /<title[^>]*>([\s\S]*?)<\/title>/i);
  const description = match(html, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)/i)
    || match(html, /<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
  const canonical = match(html, /<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/i)
    || match(html, /<link[^>]+href=["']([^"']+)["'][^>]+rel=["']canonical["']/i);
  const ogUrl = match(html, /<meta[^>]+property=["']og:url["'][^>]+content=["']([^"']+)/i)
    || match(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:url["']/i);
  const ogType = match(html, /<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']+)/i)
    || match(html, /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:type["']/i);
  const text = visibleText(html);
  const ownUrl = new URL(expectedUrl).toString();
  const canonicalAbsolute = canonical ? new URL(canonical, origin).toString() : '';
  const mainBodyPresent = text.length >= (path.includes('/journal/') ? 1200 : 180);
  const flags = [];
  if (response.status !== 200) flags.push(`status:${response.status}`);
  if (!title) flags.push('missing-title');
  if (!description) flags.push('missing-description');
  if (!canonical) flags.push('missing-canonical');
  if (canonicalAbsolute && canonicalAbsolute !== ownUrl) flags.push('canonical-mismatch');
  if (!mainBodyPresent) flags.push('missing-body');
  if (path !== '/' && genericTitlePattern.test(title)) flags.push('generic-title');
  if (path !== '/' && description.startsWith(genericDescription)) flags.push('generic-description');
  if (path.includes('/journal/') && !path.includes('/journal/page/') && ogType !== 'article') flags.push('og-type-not-article');
  if (ogUrl && new URL(ogUrl, origin).toString() !== ownUrl) flags.push('og-url-mismatch');
  return { url: expectedUrl, fetchedFrom: fetchUrl, status: response.status, title, description, canonical: canonicalAbsolute, ogUrl, ogType, textLength: text.length, mainBodyPresent, flags };
}

const results = [];
for (let index = 0; index < paths.length; index += 8) {
  results.push(...await Promise.all(paths.slice(index, index + 8).map(audit)));
}

const report = { origin, count: results.length, flagged: results.filter((result) => result.flags.length), results };
if (outputPath) {
  const escapeCsv = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  const header = ['url', 'fetchedFrom', 'status', 'title', 'description', 'canonical', 'ogUrl', 'ogType', 'textLength', 'mainBodyPresent', 'flags'];
  const rows = results.map((result) => [
    result.url, result.fetchedFrom, result.status, result.title, result.description, result.canonical, result.ogUrl,
    result.ogType, result.textLength, result.mainBodyPresent, result.flags.join('|'),
  ]);
  await writeFile(outputPath, [header, ...rows].map((row) => row.map(escapeCsv).join(',')).join('\n') + '\n');
}
console.log(JSON.stringify(report, null, 2));
