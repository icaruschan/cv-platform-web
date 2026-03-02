"use client";

import { motion } from "framer-motion";
import { IdeateLogo } from "@/components/ui/IdeateLogo";

import Image from "next/image";

const showcaseItems = [
    {
        title: "Kingoholi",
        category: "Awwwards",
        image: "/showcase/showcase-v3-1.png",
        color: "bg-stone-200"
    },
    {
        title: "Hover-tag",
        category: "Webflow",
        image: "/showcase/showcase-webflow-replacement.png",
        color: "bg-blue-50"
    },
    {
        title: "Valientebrands",
        category: "Awwwards",
        image: "/showcase/showcase-v3-3.png",
        color: "bg-blue-100"
    },
    {
        title: "Adambricker",
        category: "Awwwards",
        image: "/showcase/showcase-v3-4.png",
        color: "bg-neutral-200"
    },
    {
        title: "Interinter",
        category: "Awwwards",
        image: "/showcase/showcase-v3-5.png",
        color: "bg-green-100"
    },
    {
        title: "Joffreyspitzer",
        category: "Awwwards",
        image: "/showcase/showcase-v3-6.png",
        color: "bg-indigo-100"
    },
    {
        title: "Rauno Freiberg",
        category: "Awwwards",
        image: "/showcase/showcase-rauno.png",
        color: "bg-stone-200"
    },
    {
        title: "Yella Studgfx",
        category: "Webflow",
        image: "/showcase/showcase-v3-8.png",
        color: "bg-emerald-100"
    },
    {
        title: "Litoff Cold",
        category: "Webflow",
        image: "/showcase/showcase-v3-9.png",
        color: "bg-stone-200"
    },
    {
        title: "Transcend",
        category: "Webflow",
        image: "/showcase/showcase-v3-10.png",
        color: "bg-orange-100"
    },
    {
        title: "Clayboan",
        category: "LapaNinja",
        image: "/showcase/showcase-v3-11.png",
        color: "bg-blue-100"
    },
    {
        title: "Tanayakhadke",
        category: "LapaNinja",
        image: "/showcase/showcase-v3-12.png",
        color: "bg-neutral-200"
    },
    {
        title: "Amnajaved",
        category: "LapaNinja",
        image: "/showcase/showcase-v3-13.png",
        color: "bg-green-100"
    },
    {
        title: "Haleypark",
        category: "LapaNinja",
        image: "/showcase/showcase-v3-14.png",
        color: "bg-indigo-100"
    },
    {
        title: "Tanujashastri",
        category: "LapaNinja",
        image: "/showcase/showcase-v3-15.png",
        color: "bg-amber-100"
    },
    {
        title: "Linus Rogge",
        category: "Awwwards",
        image: "/showcase/showcase-linus.png",
        color: "bg-neutral-200"
    }
];

export function ShowcaseGallery() {
    return (
        <section className="py-8 md:py-12 bg-orange-50 overflow-hidden">
            <div className="space-y-8">

                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.7, ease: "easeOut" }}
                    className="max-w-[1600px] mx-auto px-6 md:px-12"
                >
                    <h2 className="text-2xl sm:text-4xl md:text-[64px] font-serif font-medium text-orange-900 tracking-tight leading-none flex flex-wrap items-center gap-2 md:gap-3">
                        <span>Made with</span>
                        <IdeateLogo className="h-6 sm:h-10 md:h-[72px] w-auto" textColor="#7c2d12" />
                    </h2>
                </motion.div>

                {/* Marquee Rows */}
                <div className="space-y-6">
                    {/* Row 1 - Scroll Left */}
                    <div className="flex">
                        <Marquee direction="left" speed={50}>
                            {showcaseItems.slice(0, 8).map((site, i) => (
                                <Card key={i} site={site} />
                            ))}
                        </Marquee>
                    </div>

                    {/* Row 2 - Scroll Right */}
                    <div className="flex">
                        <Marquee direction="right" speed={60}>
                            {showcaseItems.slice(8).map((site, i) => (
                                <Card key={i} site={site} />
                            ))}
                        </Marquee>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Marquee({ children, direction, speed }: { children: React.ReactNode; direction: "left" | "right"; speed: number }) {
    return (
        <motion.div
            className="flex gap-6 min-w-max px-3"
            initial={{ x: direction === "left" ? "0%" : "-50%" }}
            animate={{
                x: direction === "left" ? ["0%", "-50%"] : ["-50%", "0%"],
            }}
            transition={{
                ease: "linear",
                duration: speed,
                repeat: Infinity,
            }}
        >
            {children}
            {children}
        </motion.div>
    );
}

function Card({ site }: { site: any }) {
    // Fixed height, consistent 16:9 aspect ratio for all
    return (
        <div className={`relative h-[200px] sm:h-[280px] md:h-[400px] aspect-video rounded-2xl md:rounded-3xl ${site.color} flex-shrink-0 group cursor-pointer overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500`}>
            {/* Image Background */}
            <div className="absolute inset-0">
                <Image
                    src={site.image}
                    alt={site.title}
                    fill
                    className="object-cover object-top opacity-90 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                />
            </div>


        </div>
    );
}
