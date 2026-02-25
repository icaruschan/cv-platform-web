"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

const placeholders = [
    { color: "bg-red-200", title: "Bold & Loud" },
    { color: "bg-blue-200", title: "Corporate Clean" },
    { color: "bg-green-200", title: "Eco Friendly" },
    { color: "bg-yellow-200", title: "Creative Sun" },
    { color: "bg-purple-200", title: "Dark Saas" },
    { color: "bg-orange-200", title: "Warm Blog" },
    { color: "bg-pink-200", title: "Fashion Portfolio" },
    { color: "bg-teal-200", title: "Medical Tech" },
];

const Column = ({
    images,
    y = 0,
    duration = 20
}: {
    images: typeof placeholders,
    y?: number | string | (number | string)[],
    duration?: number
}) => {
    return (
        <motion.div
            className="flex flex-col gap-6 w-full"
            animate={{ y: y }}
            transition={{
                repeat: Infinity,
                repeatType: "loop",
                duration: duration,
                ease: "linear",
            }}
        >
            {/* Triplicate the list to ensure smooth infinite scroll without gaps */}
            {[...images, ...images, ...images].map((img, i) => (
                <div
                    key={i}
                    className={`w-full aspect-[3/4] rounded-xl ${img.color} relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-sm`}
                >
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10">
                        <span className="font-bold text-black/50">{img.title}</span>
                    </div>
                    {/* Mock UI */}
                    <div className="absolute top-4 left-4 right-4 h-4 bg-white/30 rounded-md" />
                    <div className="absolute top-10 left-4 w-1/2 h-4 bg-white/30 rounded-md" />
                </div>
            ))}
        </motion.div>
    );
};

export function Carousel() {
    return (
        <div className="h-[120vh] -my-[10vh] overflow-hidden flex gap-6 p-6 rotate-0 transform-gpu relative mask-gradient">
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-[#faf9f7] via-transparent to-[#faf9f7] pointer-events-none" />

            <div className="w-1/2 -mt-32">
                <Column images={placeholders} y={["0%", "-50%"]} duration={45} />
            </div>
            <div className="w-1/2 -mt-10">
                <Column images={[...placeholders].reverse()} y={["-50%", "0%"]} duration={50} />
            </div>
        </div>
    );
}
