import React from 'react';
import { Truck, RefreshCw, Leaf, Shield } from 'lucide-react';

interface TrustItem {
    icon: React.ReactNode;
    text: string;
}

const TRUST_ITEMS: TrustItem[] = [
    { icon: <Truck size={16} />, text: "Free Shipping $50+" },
    { icon: <RefreshCw size={16} />, text: "30-Day Returns" },
    { icon: <Leaf size={16} />, text: "Sustainably Made" },
    { icon: <Shield size={16} />, text: "Lifetime Quality" },
];

interface TrustBarProps {
    className?: string;
}

export default function TrustBar({ className = "" }: TrustBarProps) {
    return (
        <div className={`bg-stone-900/50 border-y border-stone-800 ${className}`}>
            <div className="max-w-7xl mx-auto px-6 py-4">
                <div className="flex flex-wrap justify-center md:justify-between items-center gap-4 md:gap-8">
                    {TRUST_ITEMS.map((item, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-2 text-stone-400 hover:text-white transition-colors"
                        >
                            <span className="text-copper-500">{item.icon}</span>
                            <span className="text-xs uppercase tracking-wider font-medium">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
