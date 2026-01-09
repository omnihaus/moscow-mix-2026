import type { VercelRequest, VercelResponse } from '@vercel/node';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const SITE_URL = 'https://www.moscowmix.com';

// Static pages that are always in the sitemap
const STATIC_PAGES = [
    { path: '/', changefreq: 'weekly', priority: '1.0' },
    { path: '/shop/copper', changefreq: 'weekly', priority: '0.9' },
    { path: '/shop/fire', changefreq: 'weekly', priority: '0.9' },
    { path: '/journal', changefreq: 'daily', priority: '0.8' },
    { path: '/about', changefreq: 'monthly', priority: '0.7' },
    { path: '/contact', changefreq: 'monthly', priority: '0.6' },
];

// Initialize Firebase Admin SDK (only once)
function getDb() {
    if (getApps().length === 0) {
        // Use default credentials when running on Vercel
        // Firebase project ID is enough for Firestore access with proper IAM setup
        initializeApp({
            projectId: 'moscowmix-web',
        });
    }
    return getFirestore();
}

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try {
        const db = getDb();
        const docRef = db.collection('moscow_mix').doc('live_site');
        const docSnap = await docRef.get();

        let blogPosts: BlogPost[] = [];
        let products: Product[] = [];

        if (docSnap.exists) {
            const data = docSnap.data() as SiteConfig;
            blogPosts = data.blogPosts || [];
            products = data.products || [];
        }

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
