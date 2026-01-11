import React, { useEffect } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { getPostSlug } from './BlogPost';

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

export default function Sitemap() {
    const { config } = useSiteConfig();

    // Generate sitemap XML
    const generateSitemapXML = () => {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
        xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

        // Add static pages
        STATIC_PAGES.forEach(page => {
            xml += '  <url>\n';
            xml += `    <loc>${SITE_URL}${page.path}</loc>\n`;
            xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
            xml += `    <priority>${page.priority}</priority>\n`;
            xml += '  </url>\n';
        });

        // Add products
        config.products.forEach(product => {
            xml += '  <url>\n';
            xml += `    <loc>${SITE_URL}/product/${product.id}</loc>\n`;
            xml += '    <changefreq>weekly</changefreq>\n';
            xml += '    <priority>0.8</priority>\n';
            xml += '  </url>\n';
        });

        // Add published blog posts
        config.blogPosts
            .filter(post => !post.status || post.status === 'published')
            .forEach(post => {
                xml += '  <url>\n';
                xml += `    <loc>${SITE_URL}/journal/${getPostSlug(post)}</loc>\n`;
                xml += '    <changefreq>monthly</changefreq>\n';
                xml += '    <priority>0.7</priority>\n';
                if (post.publishedAt) {
                    xml += `    <lastmod>${post.publishedAt.split('T')[0]}</lastmod>\n`;
                }
                xml += '  </url>\n';
            });

        xml += '</urlset>';
        return xml;
    };

    const sitemapXML = generateSitemapXML();

    // Set content type for the page (helps crawlers)
    useEffect(() => {
        document.title = 'Sitemap - Moscow Mix';
    }, []);

    return (
        <div className="bg-stone-950 min-h-screen pt-24 pb-24">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="font-serif text-4xl text-white mb-4">XML Sitemap</h1>
                <p className="text-stone-400 mb-8">
                    This dynamic sitemap is automatically generated from our products and blog posts.
                    Google can crawl this page to discover all content.
                </p>

                {/* Stats */}
                <div className="flex gap-8 mb-8">
                    <div className="text-center">
                        <div className="text-3xl text-copper-500 font-bold">{STATIC_PAGES.length}</div>
                        <div className="text-stone-500 text-xs uppercase tracking-widest">Pages</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl text-copper-500 font-bold">{config.products.length}</div>
                        <div className="text-stone-500 text-xs uppercase tracking-widest">Products</div>
                    </div>
                    <div className="text-center">
                        <div className="text-3xl text-copper-500 font-bold">
                            {config.blogPosts.filter(p => !p.status || p.status === 'published').length}
                        </div>
                        <div className="text-stone-500 text-xs uppercase tracking-widest">Articles</div>
                    </div>
                </div>

                {/* Download button */}
                <button
                    onClick={() => {
                        const blob = new Blob([sitemapXML], { type: 'application/xml' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'sitemap.xml';
                        a.click();
                        URL.revokeObjectURL(url);
                    }}
                    className="mb-8 px-6 py-3 bg-copper-600 hover:bg-copper-500 text-white font-bold uppercase tracking-widest text-xs transition-colors"
                >
                    Download sitemap.xml
                </button>

                {/* XML Preview */}
                <pre className="bg-stone-900 border border-stone-800 p-6 rounded overflow-x-auto text-sm text-stone-300 font-mono whitespace-pre-wrap">
                    {sitemapXML}
                </pre>

                {/* All URLs List */}
                <div className="mt-12">
                    <h2 className="text-white font-serif text-2xl mb-6">All URLs ({STATIC_PAGES.length + config.products.length + config.blogPosts.filter(p => !p.status || p.status === 'published').length})</h2>

                    <div className="space-y-1 text-sm">
                        {STATIC_PAGES.map(page => (
                            <a key={page.path} href={page.path} className="block text-copper-400 hover:text-white">
                                {SITE_URL}{page.path}
                            </a>
                        ))}
                        {config.products.map(product => (
                            <a key={product.id} href={`/product/${product.id}`} className="block text-stone-400 hover:text-white">
                                {SITE_URL}/product/{product.id}
                            </a>
                        ))}
                        {config.blogPosts
                            .filter(post => !post.status || post.status === 'published')
                            .map(post => (
                                <a key={post.id} href={`/journal/${getPostSlug(post)}`} className="block text-stone-400 hover:text-white">
                                    {SITE_URL}/journal/{getPostSlug(post)}
                                </a>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
