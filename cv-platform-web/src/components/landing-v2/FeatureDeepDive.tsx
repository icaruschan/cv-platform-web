"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function FeatureDeepDive() {
    return (
        <section className="py-32 bg-neutral-900 text-white overflow-hidden relative">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/20 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 text-center space-y-16">
                <div className="max-w-3xl mx-auto space-y-6">
                    <h2 className="font-serif text-3xl md:text-[44px]">
                        Control without the Code
                    </h2>
                    <p className="text-lg text-neutral-400 leading-relaxed">
                        Our intelligent editor gives you the power of a developer with the ease of a conversation.
                        Real-time previews, instant updates, and zero deployment headaches.
                    </p>
                </div>

                {/* Editor Screenshot in Browser Frame */}
                <motion.div
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="relative rounded-xl overflow-hidden shadow-2xl border border-neutral-800 bg-neutral-950"
                >
                    {/* Browser Window Controls */}
                    <div className="h-12 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 gap-2">
                        <div className="flex gap-2">
                            <div className="w-3 h-3 rounded-full bg-red-500" />
                            <div className="w-3 h-3 rounded-full bg-yellow-500" />
                            <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="mx-auto w-1/3 h-6 bg-neutral-800 rounded-md" />
                    </div>

                    {/* Editor Screenshot */}
                    <Image
                        src="/editor.png"
                        alt="Ideate Editor Interface"
                        width={1920}
                        height={1080}
                        className="w-full h-auto"
                        priority
                    />
                </motion.div>
            </div>
        </section>
    );
}
