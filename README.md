# Moscow Mix website

Server-rendered React and TypeScript website powered by Next.js. The live
catalog, journal, brand story, and media references are stored in Firebase in the
`moscow_mix/live_site` document. Values in `constants.ts` are fallback content,
not a complete copy of the production site.

Public pages are generated as complete HTML with page-specific metadata,
canonical URLs, and structured data. Firebase content is refreshed at most five
minutes after a request, so journal updates do not require changing source code.

## Local development

Requirements: Node.js 20.9 or newer and npm.

```sh
npm install
npm run dev
```

The development server prints the local address after startup (normally
`http://localhost:3000`). No environment file is required to view the site.

The optional AI tools in the admin area require a Gemini API key. Enter it in
the admin Settings screen; it is kept in that browser's local storage. Never
commit API keys to this repository.

## Live-content safety

Firebase is the source of truth for production content. Before changing data
through the admin area, create a local snapshot:

```sh
npm run backup:content
```

Snapshots are written to the ignored `backups/` directory and deliberately
exclude admin users and passwords. Keep an additional copy of important
snapshots outside this project folder.

## Production build

```sh
npm run build
npm start
```

The public website is currently served by Vercel. Publishing should remain
paused until the Vercel project, GitHub connection, Firebase access, and Google
Search Console property have been confirmed. A local build does not change the
live website.

## SEO architecture

- All journal and product URLs return their content in the initial HTML.
- Canonicals, titles, descriptions, social metadata, and JSON-LD are generated
  per page.
- `sitemap.xml` and `robots.txt` are generated automatically.
- Unknown URLs return HTTP 404 instead of the former SPA soft-404 response.
- Known legacy article and product URLs use permanent redirects in
  `next.config.ts`. Add redirects discovered in Search Console to that list.
