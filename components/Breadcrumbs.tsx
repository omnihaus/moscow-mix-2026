import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
    className?: string;
}

// Generate BreadcrumbList schema for structured data
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index) => ({
            "@type": "ListItem",
            "position": index + 1,
            "name": item.name,
            "item": item.url
        }))
    };
}

export default function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
    // Inject Breadcrumb schema into the page
    React.useEffect(() => {
        if (items.length === 0) return;

        const existingScript = document.getElementById('breadcrumb-schema');
        if (existingScript) existingScript.remove();

        const script = document.createElement('script');
        script.id = 'breadcrumb-schema';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(generateBreadcrumbSchema(items));
        document.head.appendChild(script);

        return () => {
            const scriptToRemove = document.getElementById('breadcrumb-schema');
            if (scriptToRemove) scriptToRemove.remove();
        };
    }, [items]);

    if (items.length === 0) return null;

    return (
        <nav
            aria-label="Breadcrumb"
            className={`flex items-center text-sm ${className}`}
        >
            <ol className="flex items-center flex-wrap gap-1">
                {items.map((item, index) => (
                    <li key={item.url} className="flex items-center">
                        {index > 0 && (
                            <ChevronRight size={14} className="mx-2 text-stone-600" />
                        )}

                        {index === items.length - 1 ? (
                            // Current page (not a link)
                            <span className="text-stone-400" aria-current="page">
                                {index === 0 && <Home size={14} className="inline mr-1" />}
                                {item.name}
                            </span>
                        ) : (
                            // Link to parent page
                            <Link
                                to={item.url.replace('https://www.moscowmix.com', '')}
                                className="text-stone-500 hover:text-copper-400 transition-colors flex items-center"
                            >
                                {index === 0 && <Home size={14} className="mr-1" />}
                                {item.name}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
        </nav>
    );
}

// Helper functions to generate breadcrumb arrays for common pages
export function getProductBreadcrumbs(productName: string, category: string): BreadcrumbItem[] {
    const categorySlug = category.toLowerCase().includes('copper') ? 'copper' : 'fire';
    const categoryName = category.toLowerCase().includes('copper') ? 'Copper Drinkware' : 'Fire Starters';

    return [
        { name: 'Home', url: 'https://www.moscowmix.com/' },
        { name: categoryName, url: `https://www.moscowmix.com/shop/${categorySlug}` },
        { name: productName, url: '#' } // Current page, URL not used for display
    ];
}

export function getBlogBreadcrumbs(postTitle: string): BreadcrumbItem[] {
    return [
        { name: 'Home', url: 'https://www.moscowmix.com/' },
        { name: 'Journal', url: 'https://www.moscowmix.com/journal' },
        { name: postTitle, url: '#' } // Current page
    ];
}

export function getShopBreadcrumbs(category: 'copper' | 'fire'): BreadcrumbItem[] {
    const categoryName = category === 'copper' ? 'Copper Drinkware' : 'Fire Starters';

    return [
        { name: 'Home', url: 'https://www.moscowmix.com/' },
        { name: categoryName, url: `https://www.moscowmix.com/shop/${category}` }
    ];
}
