import type { VercelRequest, VercelResponse } from '@vercel/node';

const SITE_URL = 'https://www.moscowmix.com';
const FIREBASE_PROJECT_ID = 'moscowmix-web';

// Static pages that are always in the sitemap
const STATIC_PAGES = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/shop/copper', changefreq: 'weekly', priority: '0.9' },
    { path: '/shop/fire', changefreq: 'weekly', priority: '0.9' },
    { path: '/journal', changefreq: 'daily', priority: '0.8' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/contact', changefreq: 'monthly', priority: '0.6' },
];

interface BlogPost {
    id: string;
    status?: 'draft' | 'scheduled' | 'published';
    scheduledDate?: string;
    publishedAt?: string;
}

interface Product {
    id: string;
}

interface SiteConfig {
    blogPosts?: BlogPost[];
    products?: Product[];
}

// Fetch data from Firestore using REST API (no authentication needed for public data)
async function fetchFirestoreData(): Promise<SiteConfig> {
    const url = `https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/moscow_mix/live_site`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Firestore fetch failed: ${response.status}`);
    }

    const doc = await response.json();

    // Parse Firestore document format
    const fields = doc.fields || {};

    // Parse blogPosts array
    const blogPosts: BlogPost[] = [];
    if (fields.blogPosts?.arrayValue?.values) {
        for (const item of fields.blogPosts.arrayValue.values) {
            const postFields = item.mapValue?.fields || {};
            blogPosts.push({
                id: postFields.id?.stringValue || '',
                status: postFields.status?.stringValue as BlogPost['status'],
                scheduledDate: postFields.scheduledDate?.stringValue,
                publishedAt: postFields.publishedAt?.stringValue,
            });
        }
    }

    // Parse products array
    const products: Product[] = [];
    if (fields.products?.arrayValue?.values) {
        for (const item of fields.products.arrayValue.values) {
            const productFields = item.mapValue?.fields || {};
            products.push({
                id: productFields.id?.stringValue || '',
            });
        }
    }

    return { blogPosts, products };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const data = await fetchFirestoreData();
        const blogPosts = data.blogPosts || [];
        const products = data.products || [];

        // Filter to only published posts (same logic as frontend)
        const now = new Date();
        const publishedPosts = blogPosts.filter(post => {
            if (!post.status || post.status === 'published') {
                return true;
            }
            if (post.status === 'scheduled' && post.scheduledDate) {
                return new Date(post.scheduledDate) <= now;
            }
            return false;
        });

        // Generate sitemap XML
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add static pages
        for (const page of STATIC_PAGES) {
            xml += '  <url>\n';
            xml += `    <loc>${SITE_URL}${page.path}</loc>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        }

        // Add products
        for (const product of products) {
            xml += '  <url>\n';
            xml += `    <loc>${SITE_URL}/product/${product.id}</loc>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        }

        // Add published blog posts
        for (const post of publishedPosts) {
            xml += '  <url>\n';
            xml += `    <loc>${SITE_URL}/journal/${post.id}</loc>\n`;
            xml += '    <changefreq>monthly</changefreq>\n';
            xml += '    <priority>0.7</priority>\n';
            if (post.publishedAt) {
                xml += `    <lastmod>${post.publishedAt.split('T')[0]}</lastmod>\n`;
            }
            xml += '  </url>\n';
        }

        xml += '</urlset>';

        // Set proper headers for XML
        res.setHeader('Content-Type', 'application/xml');
        res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
        res.status(200).send(xml);
    } catch (error) {
        console.error('Sitemap generation error:', error);
        res.status(500).send('Error generating sitemap');
    }
}
