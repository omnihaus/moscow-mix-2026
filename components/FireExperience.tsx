import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Wind, Leaf, Timer, ArrowRight, BookOpen, CheckCircle } from 'lucide-react';

interface FireTip {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const FIRE_TIPS: FireTip[] = [
    {
        icon: <Flame size={24} />,
        title: "Light With One Spark",
        description: "Our wood wool catches instantly—no matches required. A single spark from a ferro rod or lighter is all you need."
    },
    {
        icon: <Wind size={24} />,
        title: "Burns Up to 10 Minutes",
        description: "Each fire starter provides a sustained, powerful flame that gives your kindling and logs time to catch."
    },
    {
        icon: <Leaf size={24} />,
        title: "100% Natural Materials",
        description: "Made from pure wood wool and natural wax. No petroleum, no chemicals, no toxic fumes—safe for cooking."
    },
    {
        icon: <Timer size={24} />,
        title: "Moisture Resistant",
        description: "Our dense construction resists moisture. Keep them in a sealed bag for camping and they'll perform every time."
    }
];

const COMPARISON_DATA = [
    { feature: "Odorless", moscowMix: true, chemicals: false },
    { feature: "Food Safe", moscowMix: true, chemicals: false },
    { feature: "Indoor Safe", moscowMix: true, chemicals: false },
    { feature: "Eco-Friendly", moscowMix: true, chemicals: false },
    { feature: "Burns 8-10 min", moscowMix: true, chemicals: false },
    { feature: "Single Spark Ignition", moscowMix: true, chemicals: false },
];

export default function FireExperience() {
    return (
        <section className="relative overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900" />

            {/* Subtle fire accent glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-6 py-24">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 text-orange-500 uppercase tracking-widest text-xs font-bold mb-4">
                        <Flame size={14} />
                        The Natural Way
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
                        Fire Starting, Perfected
                    </h2>
                    <p className="text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Forget chemical-soaked starters that ruin the smell of your fire. Our natural wood wool
                        ignites cleanly and burns powerfully—the way fire was meant to be.
                    </p>
                </div>

                {/* Fire Tips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
                    {FIRE_TIPS.map((tip, index) => (
                        <div
                            key={index}
                            className="group relative bg-stone-900/50 backdrop-blur border border-stone-800 p-8 rounded-lg hover:border-orange-500/30 transition-all duration-500"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mb-6 group-hover:bg-orange-500/20 transition-colors">
                                {tip.icon}
                            </div>

                            {/* Content */}
                            <h3 className="text-white font-medium text-lg mb-3">
                                {tip.title}
                            </h3>
                            <p className="text-stone-400 text-sm leading-relaxed">
                                {tip.description}
                            </p>

                            {/* Hover accent */}
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-orange-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    ))}
                </div>

                {/* Why Natural Comparison */}
                <div className="mb-20">
                    <div className="text-center mb-10">
                        <h3 className="font-serif text-2xl md:text-3xl text-white mb-2">
                            Why Choose Natural Fire Starters?
                        </h3>
                        <p className="text-stone-500">See how wood wool compares to chemical alternatives</p>
                    </div>

                    <div className="max-w-2xl mx-auto bg-stone-900/50 border border-stone-800 rounded-xl overflow-hidden">
                        <div className="grid grid-cols-3 bg-stone-800/50 p-4 text-center">
                            <div className="text-stone-400 text-sm font-medium"></div>
                            <div className="text-orange-400 text-sm font-bold uppercase tracking-wider">Moscow Mix</div>
                            <div className="text-stone-500 text-sm font-bold uppercase tracking-wider">Chemical Starters</div>
                        </div>
                        {COMPARISON_DATA.map((row, index) => (
                            <div
                                key={index}
                                className={`grid grid-cols-3 p-4 text-center ${index % 2 === 0 ? 'bg-stone-900/30' : ''}`}
                            >
                                <div className="text-stone-300 text-sm text-left pl-4">{row.feature}</div>
                                <div className="flex justify-center">
                                    {row.moscowMix ? (
                                        <CheckCircle size={18} className="text-green-500" />
                                    ) : (
                                        <span className="text-stone-600">—</span>
                                    )}
                                </div>
                                <div className="flex justify-center">
                                    {row.chemicals ? (
                                        <CheckCircle size={18} className="text-green-500" />
                                    ) : (
                                        <span className="text-stone-600">✕</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Featured Journal Link */}
                <div className="relative bg-gradient-to-r from-stone-900 via-stone-800/50 to-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 via-transparent to-orange-500/5" />

                    <div className="relative flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-12">
                        {/* Icon/Visual */}
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/20 to-amber-700/20 flex items-center justify-center border border-orange-500/30">
                                <BookOpen size={32} className="text-orange-400" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow text-center lg:text-left">
                            <span className="text-orange-500 uppercase tracking-widest text-xs font-bold mb-2 block">
                                From the Journal
                            </span>
                            <h3 className="font-serif text-2xl md:text-3xl text-white mb-3">
                                The Lost Art of Building a Fire
                            </h3>
                            <p className="text-stone-400 max-w-2xl leading-relaxed">
                                Stop using lighter fluid. Learn the log cabin method and why natural materials
                                matter for the perfect hearth or campfire.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="flex-shrink-0">
                            <Link
                                to="/journal/art-of-fire"
                                className="group/btn inline-flex items-center gap-3 bg-orange-600 hover:bg-orange-500 text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm transition-all duration-300 shadow-lg shadow-orange-900/20"
                            >
                                Read Guide
                                <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Pro Tips Callout */}
                <div className="mt-12 text-center">
                    <p className="text-stone-500 text-sm">
                        <span className="text-orange-400 font-medium">Pro tip:</span>{' '}
                        Build a small "teepee" of kindling around your fire starter before lighting for the fastest, most reliable ignition.
                    </p>
                </div>
            </div>
        </section>
    );
}
