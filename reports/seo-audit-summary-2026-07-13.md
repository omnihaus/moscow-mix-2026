# Moscow Mix raw-HTML SEO audit — 2026-07-13

## Scope and method

The audit fetched the HTTP response HTML directly, without running browser JavaScript. The production crawl covered every URL in `sitemap.xml` plus the requested legal and test routes. The review-build crawl repeated the same checks and included the new Journal pagination routes. The accompanying CSV files contain one row per tested route with status, title, description, canonical, Open Graph URL/type, visible pre-JavaScript text length, body-content result, and flags.

- Production before: `seo-raw-html-live-before.csv` — 105 tested routes.
- Review build after: `seo-raw-html-review.csv` — 114 tested routes.

## Findings

1. **The three named journal posts are server-rendered correctly.** All return HTTP 200, unique titles and descriptions, self-referencing canonicals and Open Graph URLs, `og:type=article`, and full article content in raw HTML.
2. **The reported failure on `/journal/moscow-mule-copper-mugs` could not be reproduced.** Production already returned correct raw HTML. The earlier observation most likely came from an older Vercel deployment or cached response, not a current route/data failure.
3. **The homepage is server-rendered.** Its raw HTML contains its real headings, collection copy, product links, FAQs, and other visible content (approximately 4,958 characters after removing scripts/styles/tags).
4. **Seven real production issues were found.** `/shop/copper`, `/shop/fire`, `/journal`, `/about`, and `/contact` inherited the homepage `og:url`. `/privacy` and `/terms` also inherited the generic homepage description and `og:url` (they remain `noindex`).
5. **Journal pagination was not crawlable.** Only the first set of article links existed in raw `/journal` HTML; later pages required a client-side button click.
6. **Structured data existed but was incomplete.** Articles and products had basic JSON-LD. Articles lacked `dateModified`, `mainEntityOfPage`, and server-rendered Breadcrumb JSON-LD. Products lacked offers. The homepage lacked Organization JSON-LD.
7. **Domain handling is consistent.** `https://moscowmix.com` permanently redirects (301) to `https://www.moscowmix.com`. HTTP requests permanently redirect with 308 before/while reaching the canonical HTTPS host. Canonicals and internal links use `www`.
8. **Sitemap and robots are healthy.** `robots.txt` allows the public site, blocks `/admin`, and references the canonical `www` sitemap. The sitemap uses the canonical host and lists public static, product, and published article URLs.

## Implemented in the review build

- Correct per-route Open Graph URLs and unique legal-page descriptions.
- Crawlable `/journal/page/2` through `/journal/page/10` routes with unique metadata, canonicals, and real HTML links.
- Related journal links on articles and product pages.
- Article JSON-LD: `mainEntityOfPage`, `dateModified`, publisher logo, and BreadcrumbList in raw HTML. No author-profile pages were added.
- Product JSON-LD: BreadcrumbList and conditional Offer data with USD price, availability, condition, seller, and Amazon URL when a current price is stored.
- Product Admin fields for current price and availability. Offer markup is deliberately omitted when no current price exists, rather than sending Google invented or stale prices.
- Organization JSON-LD on the homepage.
- Sitemap image entries for article covers and product images, crawlable Journal pagination URLs, and meaningful modification timestamps for edited posts.
- Removed the public footer link to `/admin`.
- Lazy decoding/loading for non-hero article, listing, and related-content images.

## `/journal/moscow-mule-copper-mugs` raw head: before and after

### Production before

```html
<title>Moscow Mule Magic: Why Copper Mugs Make All the Difference | Moscow Mix</title>
<meta name="description" content="Ever wonder why Moscow Mules are served in copper mugs? Explore the science of taste and temperature that makes this iconic vessel essential for the perfect cocktail." />
<link rel="canonical" href="https://www.moscowmix.com/journal/moscow-mule-copper-mugs" />
<meta property="og:url" content="https://www.moscowmix.com/journal/moscow-mule-copper-mugs" />
<meta property="og:type" content="article" />
```

The raw production body contained approximately 8,184 visible-text characters, including the article. This refutes the hypothesis that this route currently serves the old homepage shell.

### Review build after

```html
<title>Moscow Mule Magic: Why Copper Mugs Make All the Difference | Moscow Mix</title>
<meta name="description" content="Ever wonder why Moscow Mules are served in copper mugs? Explore the science of taste and temperature that makes this iconic vessel essential for the perfect cocktail." />
<link rel="canonical" href="https://www.moscowmix.com/journal/moscow-mule-copper-mugs" />
<meta property="og:url" content="https://www.moscowmix.com/journal/moscow-mule-copper-mugs" />
<meta property="og:type" content="article" />
<meta property="article:published_time" content="2026-02-12T15:16:48.709Z" />
<meta property="article:modified_time" content="2026-02-12T15:16:48.709Z" />
```

The raw review-build body contains approximately 8,412 visible-text characters plus Article and BreadcrumbList JSON-LD and three related-article links.

## Result

The final review crawl contains 114 route rows and zero flags: every tested route returned 200, a non-empty title and description, the expected canonical, the expected Open Graph URL, and substantive raw body content. Journal posts also returned `og:type=article`.
