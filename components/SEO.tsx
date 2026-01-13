import React from 'react';

interface SEOProps {
    title?: string;
    description?: string;
    image?: string;
    url?: string;
    type?: 'website' | 'article' | 'product';
    // For articles
    publishedTime?: string;
    author?: string;
    // For products
    price?: number;
    availability?: 'InStock' | 'OutOfStock';
    // Schema data
    schemaData?: object;
}

const SITE_NAME = 'Moscow Mix';
const DEFAULT_DESCRIPTION = 'Moscow Mix creates solid 100% pure copper mugs and natural fire starters with authenticity and purity at their core. No plated copper, no fillers, no synthetic shortcuts.';
const DEFAULT_IMAGE = 'https://www.moscowmix.com/og-image.jpg';
const SITE_URL = 'https://www.moscowmix.com';

export default function SEO({
    title,
    description = DEFAULT_DESCRIPTION,
    image = DEFAULT_IMAGE,
    url = SITE_URL,
    type = 'website',
    publishedTime,
    author,
    price,
    availability = 'InStock',
    schemaData
}: SEOProps) {
    const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Pure Copper Mugs and Natural Fire Starters`;

    // Update document head
    React.useEffect(() => {
        // Title
        document.title = fullTitle;

        // Meta description
        updateMeta('description', description);

        // Open Graph
        updateMeta('og:title', fullTitle, 'property');
        updateMeta('og:description', description, 'property');
        updateMeta('og:image', image, 'property');
        updateMeta('og:url', url, 'property');
        updateMeta('og:type', type, 'property');
        updateMeta('og:site_name', SITE_NAME, 'property');

        // Twitter Card
        updateMeta('twitter:card', 'summary_large_image');
        updateMeta('twitter:title', fullTitle);
        updateMeta('twitter:description', description);
        updateMeta('twitter:image', image);

        // Article specific
        if (type === 'article' && publishedTime) {
            updateMeta('article:published_time', publishedTime, 'property');
            if (author) updateMeta('article:author', author, 'property');
        }

        // Canonical URL
        updateLink('canonical', url);

        // Add schema data if provided
        if (schemaData) {
            addSchemaScript(schemaData);
        }

        return () => {
            // Cleanup schema script on unmount
            const existingScript = document.getElementById('schema-script');
            if (existingScript) existingScript.remove();
        };
    }, [fullTitle, description, image, url, type, publishedTime, author, schemaData]);

    return null; // This component only updates the head
}

// Helper to update meta tags
function updateMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
    let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
    if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
    }
    meta.content = content;
}

// Helper to update link tags
function updateLink(rel: string, href: string) {
    let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement;
    if (!link) {
        link = document.createElement('link');
        link.rel = rel;
        document.head.appendChild(link);
    }
    link.href = href;
}

// Helper to add JSON-LD schema
function addSchemaScript(data: object) {
    const existingScript = document.getElementById('schema-script');
    if (existingScript) existingScript.remove();

    const script = document.createElement('script');
    script.id = 'schema-script';
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    document.head.appendChild(script);
}

// Pre-built schema generators
export function generateOrganizationSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "Moscow Mix",
        "url": "https://www.moscowmix.com",
        "logo": "https://www.moscowmix.com/logo.png",
        "description": DEFAULT_DESCRIPTION,
        "sameAs": [
            "https://www.instagram.com/moscowmix",
            "https://www.facebook.com/moscowmix"
        ]
    };
}

export function generateProductSchema(product: {
    name: string;
    description: string;
    image: string;
    price?: number;
    url: string;
    rating?: number;
    reviewCount?: number;
}) {
    // Calculate priceValidUntil as 1 year from now
    const priceValidUntil = new Date();
    priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

    return {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": product.name,
        "description": product.description,
        "image": product.image,
        "url": product.url,
        "brand": {
            "@type": "Brand",
            "name": "Moscow Mix"
        },
        "offers": {
            "@type": "Offer",
            "url": product.url,
            "availability": "https://schema.org/InStock",
            "priceCurrency": "USD",
            "price": product.price || 0,
            "priceValidUntil": priceValidUntil.toISOString().split('T')[0],
            "seller": {
                "@type": "Organization",
                "name": "Moscow Mix"
            },
            "shippingDetails": {
                "@type": "OfferShippingDetails",
                "shippingRate": {
                    "@type": "MonetaryAmount",
                    "value": "0",
                    "currency": "USD"
                },
                "shippingDestination": {
                    "@type": "DefinedRegion",
                    "addressCountry": "US"
                },
                "deliveryTime": {
                    "@type": "ShippingDeliveryTime",
                    "handlingTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 1,
                        "maxValue": 2,
                        "unitCode": "d"
                    },
                    "transitTime": {
                        "@type": "QuantitativeValue",
                        "minValue": 3,
                        "maxValue": 7,
                        "unitCode": "d"
                    }
                }
            },
            "hasMerchantReturnPolicy": {
                "@type": "MerchantReturnPolicy",
                "applicableCountry": "US",
                "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
                "merchantReturnDays": 30,
                "returnMethod": "https://schema.org/ReturnByMail",
                "returnFees": "https://schema.org/FreeReturn"
            }
        },
        ...(product.rating && {
            "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": product.rating,
                "reviewCount": product.reviewCount || 1
            }
        })
    };
}

export function generateArticleSchema(article: {
    title: string;
    description: string;
    image: string;
    url: string;
    datePublished: string;
    author: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": article.title,
        "description": article.description,
        "image": article.image,
        "url": article.url,
        "datePublished": article.datePublished,
        "author": {
            "@type": "Person",
            "name": article.author
        },
        "publisher": {
            "@type": "Organization",
            "name": "Moscow Mix",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.moscowmix.com/logo.png"
            }
        }
    };
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items.map((item, index, arr) => {
            const isLastItem = index === arr.length - 1;
            // Google requires valid absolute URLs for 'item' field
            // For the last item (current page), we omit the 'item' property entirely
            const listItem: Record<string, unknown> = {
                "@type": "ListItem",
                "position": index + 1,
                "name": item.name
            };
            // Only include 'item' for non-last items with valid URLs
            if (!isLastItem && item.url && item.url !== '#') {
                listItem["item"] = item.url;
            }
            return listItem;
        })
    };
}

export function generateFAQSchema(question: string, answer: string) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [{
            "@type": "Question",
            "name": question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": answer
            }
        }]
    };
}
