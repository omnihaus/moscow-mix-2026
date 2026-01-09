import React from 'react';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

interface FAQSectionProps {
    title?: string;
    subtitle?: string;
    faqs: FAQItem[];
    theme?: 'dark' | 'light';
}

// Generate FAQPage schema for structured data
export function generateFAQSchema(faqs: FAQItem[]) {
    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqs.map(faq => ({
            "@type": "Question",
            "name": faq.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": faq.answer
            }
        }))
    };
}

export default function FAQSection({
    title = "Frequently Asked Questions",
    subtitle,
    faqs,
    theme = 'dark'
}: FAQSectionProps) {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // Inject FAQ schema into the page
    React.useEffect(() => {
        const existingScript = document.getElementById('faq-schema');
        if (existingScript) existingScript.remove();

        const script = document.createElement('script');
        script.id = 'faq-schema';
        script.type = 'application/ld+json';
        script.text = JSON.stringify(generateFAQSchema(faqs));
        document.head.appendChild(script);

        return () => {
            const scriptToRemove = document.getElementById('faq-schema');
            if (scriptToRemove) scriptToRemove.remove();
        };
    }, [faqs]);

    const bgColor = theme === 'dark' ? 'bg-stone-950' : 'bg-stone-100';
    const borderColor = theme === 'dark' ? 'border-stone-800' : 'border-stone-300';
    const textColor = theme === 'dark' ? 'text-white' : 'text-stone-900';
    const subtitleColor = theme === 'dark' ? 'text-stone-400' : 'text-stone-600';
    const answerColor = theme === 'dark' ? 'text-stone-300' : 'text-stone-700';

    return (
        <section className={`py-24 px-6 ${bgColor} border-t ${borderColor}`}>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="text-copper-500 uppercase tracking-widest text-xs font-bold mb-4 block">
                        Got Questions?
                    </span>
                    <h2 className={`font-serif text-4xl md:text-5xl ${textColor} mb-4`}>
                        {title}
                    </h2>
                    {subtitle && (
                        <p className={`${subtitleColor} text-lg max-w-2xl mx-auto`}>
                            {subtitle}
                        </p>
                    )}
                </div>

                {/* FAQ Accordion */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`border ${borderColor} rounded-lg overflow-hidden transition-all duration-300`}
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className={`w-full flex items-center justify-between p-6 text-left ${theme === 'dark' ? 'hover:bg-stone-900/50' : 'hover:bg-stone-200/50'
                                    } transition-colors`}
                                aria-expanded={openIndex === index}
                            >
                                <span className={`font-medium text-lg ${textColor} pr-4`}>
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    size={20}
                                    className={`text-copper-500 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>

                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                    }`}
                            >
                                <div className={`px-6 pb-6 ${answerColor} leading-relaxed`}>
                                    {faq.answer}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

// Pre-built FAQ sets for different pages
export const HOMEPAGE_FAQS: FAQItem[] = [
    {
        question: "Are your copper mugs made from 100% pure copper?",
        answer: "Yes! Unlike many competitors who use copper-plated stainless steel, our mugs are crafted from solid, food-grade pure copper. This means better thermal conductivity for colder drinks and the authentic Moscow Mule experience."
    },
    {
        question: "Are copper mugs safe to drink from?",
        answer: "Absolutely. Our copper drinkware is food-safe and naturally antimicrobial. Copper has been used for drinking vessels for thousands of years. The copper naturally eliminates 99.9% of bacteria on contact."
    },
    {
        question: "How do I clean and care for my copper mug?",
        answer: "Hand wash with warm water and mild soap. For restoring shine, simply rub with a mixture of lemon juice and salt, then rinse thoroughly. Avoid dishwashers as harsh detergents can accelerate tarnishing."
    },
    {
        question: "What makes your fire starters different from others?",
        answer: "Our fire starters are made from 100% natural wood wool and wax—no chemicals, no petroleum products. They're odorless, non-toxic, and burn for up to 10 minutes, making them perfect for indoor fireplaces, outdoor fire pits, and camping."
    },
    {
        question: "Do you ship internationally?",
        answer: "Currently we ship throughout the United States via Amazon. International shipping options are being explored. Sign up for our newsletter to be notified when we expand shipping."
    },
    {
        question: "What is your return policy?",
        answer: "We offer hassle-free 30-day returns on all products purchased through Amazon. If you're not completely satisfied with your purchase, simply return it for a full refund."
    }
];

export const COPPER_PRODUCT_FAQS: FAQItem[] = [
    {
        question: "Why do Moscow Mules taste better in copper mugs?",
        answer: "Copper's exceptional thermal conductivity keeps your drink colder longer. When you grip the cold mug, the metal transfers temperature instantly to your hands, enhancing the sensory experience. Additionally, the copper slightly oxidizes with the lime juice, subtly boosting the citrus aroma."
    },
    {
        question: "Will my copper mug develop a patina?",
        answer: "Yes, pure copper naturally develops a patina (darker coloring) over time due to oxidation. Many people love this antique look. If you prefer the original shine, it's easily restored with lemon and salt."
    },
    {
        question: "Are these mugs lined with nickel or stainless steel?",
        answer: "No. Our mugs are unlined, 100% pure copper throughout. Lined mugs defeat the purpose of copper's thermal properties. We believe in authenticity."
    },
    {
        question: "Can I put hot beverages in copper mugs?",
        answer: "Copper conducts heat very efficiently, so the mug will get hot quickly. Use caution with hot liquids. Copper mugs are best suited for cold beverages like Moscow Mules, iced water, or cold cocktails."
    }
];

export const FIRE_PRODUCT_FAQS: FAQItem[] = [
    {
        question: "How long do your fire starters burn?",
        answer: "Each fire starter burns for approximately 8-10 minutes, providing ample time to ignite kindling and logs. One starter is typically enough for a standard fireplace or campfire."
    },
    {
        question: "Are these safe for indoor use?",
        answer: "Yes! Our fire starters are made from all-natural materials with no chemical additives. They produce no toxic fumes, making them completely safe for indoor fireplaces, wood stoves, and pizza ovens."
    },
    {
        question: "Do they work when wet?",
        answer: "Our fire starters are moisture-resistant but work best when kept dry. For camping, we recommend storing them in a sealed bag. Once lit, they'll continue burning even in light rain."
    },
    {
        question: "What's the difference between wood wool and cube starters?",
        answer: "Wood wool starters are loose, fluffy strands that light instantly with a single spark—great for kindling. Cube starters are denser and provide a longer, more intense burn—ideal for getting stubborn logs or charcoal started."
    }
];
