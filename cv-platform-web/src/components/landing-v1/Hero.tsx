"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkle, ChatCircleText, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";

export function Hero() {
    return (
        <section className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden px-4 pt-20 pb-32">
            {/* Background Ambience */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-3xl opacity-60" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl opacity-60" />
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="space-y-4"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-neutral-200 shadow-sm mb-4">
                        <Sparkle className="w-4 h-4 text-orange-500" weight="fill" />
                        <span className="text-xs font-medium text-neutral-600 tracking-wide uppercase">
                            Now Available in Beta
                        </span>
                    </div>

                    <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl text-neutral-900 tracking-tight leading-[1.1]">
                        Portfolios that <br />
                        <span className="italic text-neutral-800">get you hired.</span>
                    </h1>

                    <p className="font-sans text-lg md:text-xl text-neutral-500 max-w-xl mx-auto leading-relaxed">
                        AI-designed sites that showcase what you do best. <br className="hidden md:block" />
                        From brief to published in minutes. No coding required.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.5 }}
                    className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
                >
                    <Link
                        href="/create"
                        className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full font-medium text-lg transition-transform active:scale-95 hover:shadow-lg hover:shadow-neutral-900/20"
                    >
                        <span>Create Your Site</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Link>
                    <Link
                        href="#examples"
                        className="inline-flex items-center justify-center px-8 py-4 text-neutral-600 hover:text-neutral-900 font-medium transition-colors"
                    >
                        View Examples
                    </Link>
                </motion.div>
            </div>

            {/* Floating Elements (Desktop Only) */}
            <div className="absolute inset-0 pointer-events-none hidden md:block max-w-7xl mx-auto">
                {/* Top Left - Preview Card */}
                <motion.div
                    initial={{ opacity: 0, x: -50, rotate: -10 }}
                    animate={{ opacity: 1, x: 0, rotate: -3 }}
                    transition={{ delay: 0.4, duration: 0.8 }}
                    className="absolute top-[20%] left-[5%] w-64 bg-white p-2 rounded-xl shadow-xl border border-neutral-100 transform -rotate-3 hover:rotate-0 transition-transform duration-500"
                >
                    <div className="aspect-[4/3] bg-neutral-900 rounded-lg overflow-hidden relative">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-neutral-500 text-xs font-mono">My Portfolio</span>
                        </div>
                        {/* Abstract UI Lines */}
                        <div className="absolute top-4 left-4 w-12 h-2 bg-neutral-800 rounded-full" />
                        <div className="absolute top-8 left-4 w-24 h-2 bg-neutral-800 rounded-full" />
                    </div>
                    <div className="mt-3 flex items-center justify-between px-1">
                        <div className="flex gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-400" />
                            <div className="w-2 h-2 rounded-full bg-yellow-400" />
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                        </div>
                    </div>
                </motion.div>

                {/* Bottom Right - Success Badge */}
                <motion.div
                    initial={{ opacity: 0, y: 50, rotate: 10 }}
                    animate={{ opacity: 1, y: 0, rotate: 2 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    className="absolute bottom-[20%] right-[10%] bg-white px-4 py-3 rounded-full shadow-lg border border-neutral-100 flex items-center gap-3 transform rotate-2 hover:rotate-0 transition-transform"
                >
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xs font-bold text-neutral-900">Published</span>
                        <span className="text-[10px] text-neutral-500">Just now to Vercel</span>
                    </div>
                </motion.div>

                {/* Top Right - Chat Bubble */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6, duration: 0.8 }}
                    className="absolute top-[25%] right-[5%] bg-white p-4 rounded-2xl rounded-tr-sm shadow-lg border border-neutral-100 max-w-[200px]"
                >
                    <div className="flex gap-2 items-start">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex-shrink-0 flex items-center justify-center">
                            <ChatCircleText className="w-4 h-4 text-blue-600" />
                        </div>
                        <p className="text-xs text-neutral-600 font-medium leading-relaxed">
                            "Can you make the background darker and add a project gallery?"
                        </p>
                    </div>
                </motion.div>

                {/* Bottom Left - Palette Swatch */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.7, duration: 0.8 }}
                    className="absolute bottom-[25%] left-[10%] bg-white p-3 rounded-2xl shadow-lg border border-neutral-100"
                >
                    <div className="flex gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#1a1a1a]" />
                        <div className="w-8 h-8 rounded-full bg-[#ff6b6b]" />
                        <div className="w-8 h-8 rounded-full bg-[#faf9f7] border border-neutral-200" />
                    </div>
                </motion.div>

            </div>
        </section>
    );
}
