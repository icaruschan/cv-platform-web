"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function ProcessSteps() {
    const steps = [
        {
            id: "01",
            title: "Define Your Essence",
            description: "Share your story. Tell Ideate who you are, what you do, and the vibes you love. We build a unique identity around you.",
            imageSrc: "/Define.png",
            alt: "Ideate Onboarding Interface",
            color: "bg-orange-100 text-orange-600",
        },
        {
            id: "02",
            title: "Refine With Precision",
            description: "No generic templates. Use our AI assistant to tweak typography, colors, and layouts instantly. It's creative direction, not coding.",
            imageSrc: "/Refine.png",
            alt: "Ideate Editor Interface",
            color: "bg-blue-100 text-blue-600",
        },
        {
            id: "03",
            title: "Publish to the World",
            description: "Hit publish and go live instantly. We handle the hosting, domain, and optimization. You just share the link.",
            imageSrc: "/Publish.png",
            alt: "Ideate Publishing Interface",
            color: "bg-green-100 text-green-600",
        },
    ];

    return (
        <section className="py-12 md:py-32 px-4 md:px-12 bg-[#faf9f7] overflow-hidden">
            <div className="max-w-[1480px] mx-auto space-y-16 md:space-y-32">
                {steps.map((step, index) => (
                    <motion.div
                        key={step.id}
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, margin: "-100px" }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                        className={`flex flex-col md:flex-row items-center gap-8 md:gap-20 ${index % 2 === 1 ? "md:flex-row-reverse" : ""
                            }`}
                    >
                        {/* Text Side */}
                        <div className="md:w-5/12 space-y-6">
                            <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase ${step.color} bg-opacity-50`}>
                                <span>Step {step.id}</span>
                            </div>
                            <h2 className="font-serif text-3xl md:text-[40px] text-neutral-900 leading-tight">
                                {step.title}
                            </h2>
                            <p className="text-base md:text-lg text-neutral-600 leading-relaxed max-w-lg">
                                {step.description}
                            </p>
                        </div>

                        {/* Visual Side */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 30 }}
                            whileInView={{ opacity: 1, scale: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                            className="w-full md:w-7/12"
                        >
                            <div className="relative group perspective-1000">
                                {/* Browser Frame Container */}
                                <div className="relative rounded-xl overflow-hidden bg-neutral-900 shadow-2xl border border-neutral-200/50 transform transition-transform duration-700 hover:scale-[1.01] hover:-rotate-1">

                                    {/* Browser Header */}
                                    <div className="h-8 bg-neutral-100 border-b border-neutral-200 flex items-center px-4 gap-2">
                                        <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400/80" />
                                        <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                                    </div>

                                    {/* Image Content */}
                                    <div className="relative aspect-[16/10] bg-white">
                                        <Image
                                            src={step.imageSrc}
                                            alt={step.alt}
                                            fill
                                            className="object-cover object-top"
                                            sizes="(max-width: 768px) 100vw, 60vw"
                                        />
                                        {/* Inner Shadow Overlay for Depth */}
                                        <div className="absolute inset-0 ring-1 ring-black/5 rounded-b-xl pointer-events-none" />
                                    </div>
                                </div>

                                {/* Decorative Backdrop Blur */}
                                <div className={`absolute -inset-4 bg-gradient-to-r ${index % 2 === 0 ? 'from-orange-100 to-blue-50' : 'from-blue-50 to-purple-50'} opacity-50 blur-2xl -z-10 rounded-[3rem] transition-opacity duration-500 group-hover:opacity-75`} />
                            </div>
                        </motion.div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
}
