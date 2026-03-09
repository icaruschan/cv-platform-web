"use client";

import { motion } from "framer-motion";
import { Check } from "@phosphor-icons/react";
import Link from "next/link";

export function PricingV2() {
    const features = [
        "AI-Powered Portfolio Generation",
        "5 Revision Credits",
        "Instant Live Hosting",
        "Mobile-Responsive Design",
        "Lifetime Access",
    ];

    return (
        <section className="py-16 md:py-32 px-4 md:px-12 bg-white">
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6 }}
                    className="text-center mb-16 space-y-4"
                >
                    <h2 className="font-serif text-2xl sm:text-3xl md:text-[44px] text-neutral-900">
                        Simple, Transparent Pricing
                    </h2>
                    <p className="text-base md:text-lg text-neutral-500">
                        Invest in your career with a plan that pays for itself.
                    </p>
                </motion.div>

                {/* The Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 30 }}
                    whileInView={{ opacity: 1, scale: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                    className="relative bg-white rounded-2xl md:rounded-3xl p-5 md:p-12 shadow-2xl border border-neutral-100 overflow-hidden group hover:border-orange-200 transition-colors duration-500 max-w-md md:max-w-lg mx-auto"
                >
                    {/* Decorative Background Blob */}
                    <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-orange-100/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

                    <div className="relative z-10 text-center space-y-6 md:space-y-8">
                        {/* Header */}
                        <div className="space-y-1 md:space-y-2">
                            <h3 className="font-serif text-2xl md:text-3xl text-neutral-900">The Pro Portfolio</h3>
                            <p className="text-sm md:text-base text-neutral-500">Everything you need to land your next role.</p>
                        </div>

                        {/* Price */}
                        <div className="flex items-baseline justify-center gap-1.5 md:gap-2">
                            <span className="text-4xl md:text-5xl font-sans font-bold text-neutral-900">$25</span>
                            <span className="text-xs md:text-base text-neutral-500 font-medium">one-time</span>
                        </div>

                        {/* Features */}
                        <ul className="space-y-3 md:space-y-4 text-left">
                            {features.map((feature, i) => (
                                <li key={i} className="flex items-center gap-3 text-sm md:text-base text-neutral-700">
                                    <Check className="w-4 h-4 md:w-5 md:h-5 text-orange-500 flex-shrink-0" weight="bold" />
                                    <span>{feature}</span>
                                </li>
                            ))}
                        </ul>

                        {/* CTA Button */}
                        <a
                            href={`/api/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}`}
                            className="block w-full py-3 px-6 md:py-4 md:px-8 bg-orange-600 text-white text-center font-medium rounded-xl md:rounded-2xl hover:bg-orange-700 transition-colors text-sm md:text-base"
                        >
                            Build Your Portfolio
                        </a>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
