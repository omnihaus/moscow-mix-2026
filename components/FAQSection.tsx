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

// Product-specific FAQs for Copper Moscow Mule Mugs
export const COPPER_MUG_FAQS: FAQItem[] = [
    {
        question: "Why are Moscow Mules traditionally served in copper mugs?",
        answer: "Moscow Mules are served in copper mugs for three reasons: temperature (copper keeps drinks ice-cold), taste (the metal subtly enhances citrus and vodka aromas), and tradition (dating back to the cocktail's 1940s invention). The cold copper also stabilizes the carbonation of ginger beer."
    },
    {
        question: "Are copper Moscow Mule mugs safe to drink from?",
        answer: "Yes, our unlined copper mugs are safe for occasional use with acidic drinks like Moscow Mules. The amount of copper that leaches into your drink is negligible and within safe limits. Pure copper has been used for drinking vessels for thousands of years."
    },
    {
        question: "How do I clean my copper Moscow Mule mug?",
        answer: "Hand wash with warm, soapy water and dry immediately to prevent water spots. Never use a dishwasher—harsh detergents damage copper. To restore shine, rub with lemon and salt, then rinse and dry thoroughly."
    },
    {
        question: "What size copper mug is best for Moscow Mules?",
        answer: "A 16oz mug is the standard size for Moscow Mules, providing room for vodka, ginger beer, lime, and ice. Our 16oz mugs are perfectly sized for the classic 2oz vodka recipe."
    },
    {
        question: "Why is my copper mug turning dark or changing color?",
        answer: "This is natural oxidation—copper reacts with air and moisture to form a patina. It's not damage; many people treasure this aged appearance. If you prefer the original shine, simply polish with lemon and salt."
    },
    {
        question: "Does the hammered texture affect the drink?",
        answer: "The hammered finish improves grip and adds a traditional aesthetic. Some believe it enhances thermal properties by increasing surface area for heat transfer. Functionally, it keeps drinks colder slightly longer."
    }
];

// Product-specific FAQs for Copper Water Bottles
export const COPPER_BOTTLE_FAQS: FAQItem[] = [
    {
        question: "What are the benefits of drinking water from a copper bottle?",
        answer: "Copper bottles offer natural antimicrobial properties—copper ions eliminate 99.9% of bacteria. In Ayurvedic tradition, storing water in copper overnight is believed to balance the body's pH and aid digestion. Copper is also an essential trace mineral."
    },
    {
        question: "How long should I store water in a copper bottle?",
        answer: "For optimal benefits, store water for 6-8 hours or overnight. This allows copper ions to naturally infuse into the water. You can drink 1-2 glasses of copper-charged water daily."
    },
    {
        question: "Can I put hot water or juice in my copper bottle?",
        answer: "Avoid hot liquids—copper conducts heat and can burn. Never store acidic drinks (citrus juice, soda) as they accelerate copper leaching. Copper bottles are designed for plain, room-temperature or cool water."
    },
    {
        question: "Is too much copper harmful?",
        answer: "When used as directed (1-2 glasses daily of water stored overnight), copper intake is well within safe limits. The WHO recommends no more than 2mg copper per liter, and properly used copper vessels release far less."
    },
    {
        question: "How do I clean my copper water bottle?",
        answer: "Rinse with warm water after each use. Weekly, clean the interior with a mixture of lemon juice and salt, shake well, and rinse thoroughly. Never use abrasive scrubbers or put in the dishwasher."
    },
    {
        question: "How can I tell if a copper bottle is real copper?",
        answer: "Real copper has a distinct reddish-brown color, is non-magnetic, and will develop a natural patina over time. Our bottles are 100% pure copper with no plating or lining."
    }
];

// Product-specific FAQs for Copper Jugs
export const COPPER_JUG_FAQS: FAQItem[] = [
    {
        question: "What is a copper water jug used for?",
        answer: "Copper jugs are traditionally used to store drinking water overnight, allowing natural copper ions to purify and mineralize the water. They also make elegant serving pitchers for water, cocktails, or table service."
    },
    {
        question: "How do I store water in my copper jug?",
        answer: "Fill the jug with filtered water in the evening and cover with the included lid. Let it sit for 6-8 hours or overnight. In the morning, drink 1-2 glasses on an empty stomach for maximum benefit."
    },
    {
        question: "How much water does the 2-liter jug hold?",
        answer: "Our 2-liter jug holds about 8 glasses of water (250ml each), perfect for a family's daily hydration or entertaining guests."
    },
    {
        question: "Will the copper jug affect the taste of water?",
        answer: "Water stored in copper has a slightly different, often softer taste that many people prefer. This comes from the natural copper ions. The taste is subtle and refreshing."
    },
    {
        question: "Can I store beverages other than water?",
        answer: "Only store plain water in copper. Avoid milk, juice, acidic drinks, or alcohol—these can react with copper. For cocktail service, pour drinks in just before serving."
    },
    {
        question: "How do I maintain the shine on my copper jug?",
        answer: "Copper naturally develops a patina. To maintain shine, regularly polish with lemon and salt or a copper cream. Always dry immediately after washing to prevent water spots."
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

// Product-specific FAQs for Wood Wool Fire Starters
export const FIRE_STARTER_WOOL_FAQS: FAQItem[] = [
    {
        question: "What are wood wool fire starters made of?",
        answer: "Our fire starters are made from 100% natural wood wool (fine wood shavings from sustainable forests) coated in natural wax. No chemicals, petroleum, or artificial additives."
    },
    {
        question: "How do I use wood wool fire starters?",
        answer: "Place 1-2 fire starters at the base of your kindling or logs. Light with a match or lighter. The wax coating ignites quickly and burns steadily for 8-10 minutes, giving your fire time to catch."
    },
    {
        question: "Are wood wool fire starters better than chemical firelighters?",
        answer: "Yes! Unlike chemical starters, wood wool is non-toxic, odorless, and safe for cooking. It produces no harsh fumes or chemical residue—just clean, natural heat."
    },
    {
        question: "Can I use these for grilling and BBQ?",
        answer: "Absolutely. Our fire starters are food-safe and odorless, making them perfect for charcoal grills, smokers, and pizza ovens. They won't affect the taste of your food."
    },
    {
        question: "How many fire starters do I need per fire?",
        answer: "One starter is typically enough for a fireplace or campfire. For larger fire pits or stubborn logs, use two. For charcoal grills, one or two placed among the coals works perfectly."
    },
    {
        question: "How should I store wood wool fire starters?",
        answer: "Store in a cool, dry place away from heat sources. The wax coating protects against moisture, giving them a shelf life of over 2 years. For camping, keep in a sealed bag."
    },
    {
        question: "Are wood wool fire starters safe around children and pets?",
        answer: "When stored properly, yes. They're non-toxic and don't contain harmful chemicals. However, like any fire-starting material, keep them out of reach of children and away from flames until ready to use."
    }
];

// Product-specific FAQs for Fire Starter Cubes
export const FIRE_STARTER_CUBE_FAQS: FAQItem[] = [
    {
        question: "What's the difference between fire starter cubes and wood wool?",
        answer: "Cubes are denser and provide a longer, more intense burn (10-12 minutes). They're ideal for stubborn logs, charcoal, and wet conditions. Wood wool ignites faster but burns slightly shorter."
    },
    {
        question: "How long do fire starter cubes burn?",
        answer: "Our cubes burn for 10-12 minutes with a consistent flame. This sustained burn is perfect for lighting charcoal grills or getting even damp logs started."
    },
    {
        question: "Are fire starter cubes safe for cooking?",
        answer: "Yes! Like our wood wool starters, cubes are made from natural materials with no petroleum or chemicals. They're completely food-safe for grilling and smoking."
    },
    {
        question: "How many cubes do I need for a charcoal grill?",
        answer: "For a standard charcoal grill, 2-3 cubes placed among the coals will light approximately 50-60 briquettes. For larger grills or smokers, use 3-4 cubes."
    },
    {
        question: "Do fire starter cubes work in wet conditions?",
        answer: "Yes, their dense construction and wax coating make them more moisture-resistant than wood wool. They're excellent for camping where conditions may be damp."
    },
    {
        question: "Can I use fire starter cubes in a fireplace?",
        answer: "Absolutely. Place 1-2 cubes under your kindling and logs. The extended burn time gives your fire plenty of time to establish, even with larger logs."
    }
];

// Helper function to get product-specific FAQs based on product ID
export function getProductFAQs(productId: string): { faqs: FAQItem[], title: string, subtitle: string } {
    const id = productId.toLowerCase();

    if (id.includes('mug') || id.includes('mule')) {
        return {
            faqs: COPPER_MUG_FAQS,
            title: "Copper Mug FAQ",
            subtitle: "Common questions about our pure copper Moscow Mule mugs."
        };
    }

    if (id.includes('bottle')) {
        return {
            faqs: COPPER_BOTTLE_FAQS,
            title: "Copper Water Bottle FAQ",
            subtitle: "Common questions about our pure copper water bottles."
        };
    }

    if (id.includes('jug')) {
        return {
            faqs: COPPER_JUG_FAQS,
            title: "Copper Jug FAQ",
            subtitle: "Common questions about our pure copper water jugs."
        };
    }

    if (id.includes('cube')) {
        return {
            faqs: FIRE_STARTER_CUBE_FAQS,
            title: "Fire Starter Cubes FAQ",
            subtitle: "Common questions about our natural fire starter cubes."
        };
    }

    if (id.includes('fire') || id.includes('starter')) {
        return {
            faqs: FIRE_STARTER_WOOL_FAQS,
            title: "Wood Wool Fire Starters FAQ",
            subtitle: "Common questions about our natural wood wool fire starters."
        };
    }

    // Default fallback
    return {
        faqs: COPPER_PRODUCT_FAQS,
        title: "Product FAQ",
        subtitle: "Common questions about this product."
    };
}

