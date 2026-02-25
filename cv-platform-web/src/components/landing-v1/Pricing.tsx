import { Check } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";

export function Pricing() {
    return (
        <section className="py-24 px-4 bg-[#1a1a1a] text-white">
            <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div className="space-y-6">
                    <h2 className="font-serif text-4xl md:text-5xl">Simple, transparent pricing.</h2>
                    <p className="text-neutral-400 text-lg max-w-md">
                        Start for free. Upgrade when you're ready to publish to a custom domain.
                    </p>
                    <div className="flex flex-col gap-3 pt-4">
                        {["Unlimited Re-generations", "Custom Domain Support", "SEO Optimization", "Analytics", "Remove Branding"].map((feature) => (
                            <div key={feature} className="flex items-center gap-3">
                                <div className="w-5 h-5 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                    <Check size={12} weight="bold" />
                                </div>
                                <span className="text-neutral-300">{feature}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="relative">
                    {/* Card */}
                    <div className="bg-neutral-800/50 border border-neutral-700 p-8 rounded-2xl relative z-10">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="font-bold text-xl">Pro Portfolio</h3>
                                <p className="text-neutral-400 text-sm mt-1">Everything you need to launch.</p>
                            </div>
                            <div className="text-right">
                                <span className="text-3xl font-bold">$12</span>
                                <span className="text-neutral-500 text-sm">/mo</span>
                            </div>
                        </div>

                        <Link
                            href="/create"
                            className="block w-full text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-colors"
                        >
                            Get Started
                        </Link>
                        <p className="text-center text-xs text-neutral-500 mt-4">No credit card required for trial.</p>
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-blue-500/20 blur-[100px] rounded-full pointer-events-none" />
                </div>
            </div>
        </section>
    );
}
