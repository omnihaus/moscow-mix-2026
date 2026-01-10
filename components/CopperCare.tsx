import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, Sparkles, Shield, Clock, ArrowRight, BookOpen } from 'lucide-react';

interface CareTip {
    icon: React.ReactNode;
    title: string;
    description: string;
}

const CARE_TIPS: CareTip[] = [
    {
        icon: <Droplets size={24} />,
        title: "Hand Wash Only",
        description: "Gently wash with warm water and mild dish soap. Avoid dishwashers—harsh detergents and heat accelerate tarnishing."
    },
    {
        icon: <Sparkles size={24} />,
        title: "Restore the Shine",
        description: "Cut a lemon in half, dip in coarse salt, and scrub. Rinse thoroughly with warm water and dry immediately."
    },
    {
        icon: <Shield size={24} />,
        title: "Embrace the Patina",
        description: "Over time, copper develops a natural patina—a darker, antique finish that many collectors treasure."
    },
    {
        icon: <Clock size={24} />,
        title: "Dry Thoroughly",
        description: "After washing, dry your copper immediately with a soft cloth to prevent water spots and mineral deposits."
    }
];

export default function CopperCare() {
    return (
        <section className="relative overflow-hidden">
            {/* Background with gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900" />

            {/* Subtle copper accent glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-copper-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-copper-500/5 rounded-full blur-3xl" />

            <div className="relative max-w-7xl mx-auto px-6 py-24">
                {/* Header */}
                <div className="text-center mb-16">
                    <span className="inline-flex items-center gap-2 text-copper-500 uppercase tracking-widest text-xs font-bold mb-4">
                        <Shield size={14} />
                        Lifetime Care
                    </span>
                    <h2 className="font-serif text-4xl md:text-5xl text-white mb-4">
                        Caring for Pure Copper
                    </h2>
                    <p className="text-stone-400 text-lg max-w-2xl mx-auto leading-relaxed">
                        Pure copper is a living material that responds to its environment. With minimal care,
                        your copper drinkware will last for generations.
                    </p>
                </div>

                {/* Care Tips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
                    {CARE_TIPS.map((tip, index) => (
                        <div
                            key={index}
                            className="group relative bg-stone-900/50 backdrop-blur border border-stone-800 p-8 rounded-lg hover:border-copper-500/30 transition-all duration-500"
                        >
                            {/* Icon */}
                            <div className="w-12 h-12 rounded-full bg-copper-500/10 flex items-center justify-center text-copper-500 mb-6 group-hover:bg-copper-500/20 transition-colors">
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
                            <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-transparent via-copper-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
                    ))}
                </div>

                {/* Featured Journal Link */}
                <div className="relative bg-gradient-to-r from-stone-900 via-stone-800/50 to-stone-900 border border-stone-800 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-copper-500/5 via-transparent to-copper-500/5" />

                    <div className="relative flex flex-col lg:flex-row items-center gap-8 p-8 lg:p-12">
                        {/* Icon/Visual */}
                        <div className="flex-shrink-0">
                            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-copper-500/20 to-copper-700/20 flex items-center justify-center border border-copper-500/30">
                                <BookOpen size={32} className="text-copper-400" />
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-grow text-center lg:text-left">
                            <span className="text-copper-500 uppercase tracking-widest text-xs font-bold mb-2 block">
                                From the Journal
                            </span>
                            <h3 className="font-serif text-2xl md:text-3xl text-white mb-3">
                                How to Keep Your Copper Shining for Decades
                            </h3>
                            <p className="text-stone-400 max-w-2xl leading-relaxed">
                                Patina is beautiful, but sometimes you want that shine. Discover our simple
                                lemon and salt method for restoring your copper to its original brilliance.
                            </p>
                        </div>

                        {/* CTA */}
                        <div className="flex-shrink-0">
                            <Link
                                to="/journal/copper-care-guide"
                                className="group/btn inline-flex items-center gap-3 bg-copper-600 hover:bg-copper-500 text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-sm transition-all duration-300 shadow-lg shadow-copper-900/20"
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
                        <span className="text-copper-400 font-medium">Pro tip:</span>{' '}
                        Never use abrasive cleaners or steel wool on copper—it scratches the surface and damages the metal.
                    </p>
                </div>
            </div>
        </section>
    );
}
