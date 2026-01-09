import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Review {
    id: string;
    author: string;
    rating: number;
    title?: string;
    content: string;
    date: string;
    verified?: boolean;
    productId?: string;
}

interface ReviewsSectionProps {
    reviews: Review[];
    title?: string;
    showSchema?: boolean;
    productName?: string;
    productUrl?: string;
}

// Generate Review schema for structured data
export function generateReviewSchema(reviews: Review[], productName?: string, productUrl?: string) {
    // Calculate aggregate rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    const schema: any = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": productName || "Moscow Mix Products",
        "url": productUrl || "https://www.moscowmix.com",
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": avgRating.toFixed(1),
            "reviewCount": reviews.length,
            "bestRating": "5",
            "worstRating": "1"
        },
        "review": reviews.map(review => ({
            "@type": "Review",
            "author": {
                "@type": "Person",
                "name": review.author
            },
            "datePublished": review.date,
            "reviewRating": {
                "@type": "Rating",
                "ratingValue": review.rating,
                "bestRating": "5",
                "worstRating": "1"
            },
            "reviewBody": review.content,
            ...(review.title && { "name": review.title })
        }))
    };

    return schema;
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    size={16}
                    className={star <= rating ? 'fill-copper-500 text-copper-500' : 'text-stone-700'}
                />
            ))}
        </div>
    );
}

export default function ReviewsSection({
    reviews,
    title = "What Our Customers Say",
    showSchema = true,
    productName,
    productUrl
}: ReviewsSectionProps) {
    // Inject Review schema into the page
    React.useEffect(() => {
        if (!showSchema || reviews.length === 0) return;

        const existingScript = document.getElementById('review-schema');
        if (existingScript) existingScript.remove();

        const script = document.createElement('script');
        script.id = 'review-schema';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(generateReviewSchema(reviews, productName, productUrl));
        document.head.appendChild(script);

        return () => {
            const scriptToRemove = document.getElementById('review-schema');
            if (scriptToRemove) scriptToRemove.remove();
        };
    }, [reviews, showSchema, productName, productUrl]);

    if (reviews.length === 0) return null;

    // Calculate average rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    return (
        <section className="py-24 px-6 bg-stone-900 border-t border-stone-800">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-copper-500 uppercase tracking-widest text-xs font-bold mb-4 block">
                        Trusted by Thousands
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
                        {title}
                    </h2>
                    <div className="flex items-center justify-center gap-3 text-stone-400">
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={20}
                                    className={star <= Math.round(avgRating) ? 'fill-copper-500 text-copper-500' : 'text-stone-700'}
                                />
                            ))}
                        </div>
                        <span className="text-lg font-medium text-white">{avgRating.toFixed(1)}</span>
                        <span>|</span>
                        <span>{reviews.length} verified reviews</span>
                    </div>
                </div>

                {/* Reviews Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {reviews.slice(0, 6).map((review) => (
                        <div
                            key={review.id}
                            className="bg-stone-950 border border-stone-800 p-8 rounded-lg relative group hover:border-copper-500/30 transition-colors"
                        >
                            {/* Quote Icon */}
                            <Quote
                                size={32}
                                className="absolute top-6 right-6 text-stone-800 group-hover:text-copper-500/20 transition-colors"
                            />

                            {/* Rating */}
                            <StarRating rating={review.rating} />

                            {/* Title */}
                            {review.title && (
                                <h3 className="text-white font-medium mt-4 mb-2">{review.title}</h3>
                            )}

                            {/* Content */}
                            <p className="text-stone-400 leading-relaxed mt-4 line-clamp-4">
                                "{review.content}"
                            </p>

                            {/* Author & Date */}
                            <div className="mt-6 pt-4 border-t border-stone-800 flex items-center justify-between">
                                <div>
                                    <span className="text-white font-medium block">{review.author}</span>
                                    {review.verified && (
                                        <span className="text-copper-500 text-xs uppercase tracking-wider">
                                            Verified Buyer
                                        </span>
                                    )}
                                </div>
                                <span className="text-stone-600 text-sm">{review.date}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Real verified customer reviews from Amazon
export const SAMPLE_REVIEWS: Review[] = [
    // Copper Drinkware Reviews (4)
    {
        id: "rev-1",
        author: "Patricia",
        rating: 5,
        title: "Beautifully made",
        content: "So happy with my order, fun to drink from, comfortable handle, Really Great Mugs, stayed cold a long time.",
        date: "2025-07-17",
        verified: true
    },
    {
        id: "rev-2",
        author: "LUCKYICE2",
        rating: 5,
        title: "Love them!!!!",
        content: "OMG...Love these mugs...stays cold for a long time and the Moscow mule taste different and good in this mugs",
        date: "2025-10-26",
        verified: true
    },
    {
        id: "rev-3",
        author: "AllieZ",
        rating: 5,
        title: "Beautiful product - keeps my water ice cold for quite a while",
        content: "One of my favorite items I've bought from Amazon. Water tastes so much better in these mugs",
        date: "2025-03-28",
        verified: true
    },
    {
        id: "rev-4",
        author: "HighNBoat",
        rating: 5,
        title: "Perfect mule copper mugs",
        content: "Came without damage. Comes same as pictured. Good quality thickness of copper.",
        date: "2025-04-07",
        verified: true
    },
    // Fire Starter Reviews (2)
    {
        id: "rev-5",
        author: "Jean Houston Grreen",
        rating: 5,
        title: "The best starters",
        content: "They're great to use quick fast starting",
        date: "2025-12-24",
        verified: true
    },
    {
        id: "rev-6",
        author: "Nikole Hooks",
        rating: 5,
        title: "Works great",
        content: "These really are great! My husband has loved using them. Really get the job done and the fire goin!",
        date: "2025-12-07",
        verified: true
    }
];

