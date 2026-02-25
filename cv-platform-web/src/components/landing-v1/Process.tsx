"use client";

import { motion } from "framer-motion";
import { MagicWand, Stack, Globe } from "@phosphor-icons/react";

const steps = [
    {
        number: "01",
        title: "Extraction",
        description: "We scan your LinkedIn and GitHub to build a comprehensive profile automatically, saving you hours of manual entry.",
        icon: MagicWand,
        color: "bg-purple-100 text-purple-600",
    },
    {
        number: "02",
        title: "Curation",
        description: "Our AI organizes your best work, highlighting key achievements and skills to tell a cohesive professional story.",
        icon: Stack,
        color: "bg-orange-100 text-orange-600",
    },
    {
        number: "03",
        title: "Creation",
        description: "You get a unique, deployed portfolio website in seconds. Claim your custom domain and start sharing instantly.",
        icon: Globe,
        color: "bg-blue-100 text-blue-600",
    },
];

export function Process() {
    return (
        <section className="py-24 px-6 md:px-12 bg-[#faf9f7]">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
                    <h2 className="font-serif text-4xl md:text-5xl text-neutral-900">
                        Built for speed. <br /> Designed for impact.
                    </h2>
                    <p className="text-xl text-neutral-500 font-sans">
                        Everything you need to create a personal website that stands out, without touching a line of code.
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.2, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-md transition-all duration-300 border border-neutral-100 flex flex-col items-start gap-6 group"
                        >
                            <div className={`p-3 rounded-xl ${step.color} bg-opacity-50`}>
                                <step.icon className="w-8 h-8" weight="fill" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="font-serif text-2xl text-neutral-900">
                                    {step.title}
                                </h3>
                                <p className="text-neutral-500 leading-relaxed text-sm">
                                    {step.description}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
