"use client";

import { motion, type Variants } from "framer-motion";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.15, delayChildren: 0.1 }
        }
    };
    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } }
    };

    return (
        <section className="relative pt-24 pb-12 lg:pt-40 lg:pb-32 overflow-hidden bg-[#faf9f7] text-neutral-900">
            <div className="w-full max-w-[1480px] mx-auto px-4 md:px-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-20 items-center">
                    {/* Left Column: Content */}
                    <div className="flex flex-col justify-center order-2 lg:order-1">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="space-y-6 md:space-y-8 max-w-xl"
                        >
                            <motion.div variants={itemVariants} className="flex items-center gap-2 text-orange-600 font-medium tracking-wide text-xs md:text-sm uppercase">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                AI-Powered Design
                            </motion.div>

                            <motion.h1 variants={itemVariants} className="font-serif text-3xl sm:text-5xl md:text-7xl leading-[1.1] text-neutral-900">
                                Portfolios that <br className="hidden lg:block" />
                                get you hired.
                            </motion.h1>

                            <motion.p variants={itemVariants} className="font-sans text-base md:text-lg text-neutral-600 leading-relaxed max-w-lg">
                                Stop struggling with generic templates. Ideate uses AI to craft unique, code-perfect portfolio websites tailored to your professional story in seconds.
                            </motion.p>

                            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-2 md:pt-4">
                                <a
                                    href={`/api/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}`}
                                    className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-4 bg-neutral-900 text-white rounded-full font-medium text-base md:text-lg transition-all hover:bg-neutral-800 hover:scale-105 active:scale-95 shadow-xl shadow-neutral-900/10"
                                >
                                    <span>Start Building</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </motion.div>

                            <motion.div variants={itemVariants} className="flex items-center gap-6 pt-2 md:pt-4 text-sm font-medium text-neutral-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />
                                    <span>No coding required</span>
                                </div>
                            </motion.div>

                            {/* Social Proof */}
                            <motion.div variants={itemVariants} className="pt-6 md:pt-8 border-t border-neutral-200">
                                <p className="text-sm text-neutral-500 mb-4 font-medium">Trusted by creatives from</p>
                                <div className="flex flex-wrap gap-4 md:gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                    <div className="flex items-center gap-2 font-bold text-base md:text-lg font-serif opacity-80">Adobe</div>
                                    <div className="flex items-center gap-2 font-bold text-base md:text-lg font-serif opacity-80">Meta</div>
                                    <div className="flex items-center gap-2 font-bold text-base md:text-lg font-serif opacity-80">Spotify</div>
                                    <div className="flex items-center gap-2 font-bold text-base md:text-lg font-serif opacity-80">Figma</div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Right Column: Visuals */}
                    <div className="relative h-[280px] sm:h-[380px] lg:h-[600px] w-full order-1 lg:order-2 flex items-center justify-center">

                        {/* Background Gradient Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl -z-10" />

                        {/* Floating Card Container */}
                        <div className="relative w-full h-full flex items-center justify-center scale-90 lg:scale-100 origin-center">

                            {/* Background Card (Code Snippet) - only visible on desktop */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: -1 }}
                                animate={{ opacity: 1, scale: 1, rotate: -1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="absolute top-4 -right-8 md:-right-16 w-[600px] md:w-[850px] h-[570px] bg-[#1E1E1E] rounded-2xl shadow-2xl border border-neutral-700 transform transition-all duration-500 z-10 overflow-hidden hidden lg:block"
                            >
                                <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-700 bg-[#252526]">
                                    <div className="w-3 h-3 rounded-full bg-red-500" />
                                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                    <div className="w-3 h-3 rounded-full bg-green-500" />
                                    <div className="ml-4 text-xs text-neutral-500 font-mono">portfolio.tsx</div>
                                </div>
                                <div className="p-6 font-mono text-sm leading-relaxed opacity-80">
                                    <div className="text-blue-400 mb-2">import <span className="text-yellow-300">React</span> from <span className="text-orange-300">'react'</span>;</div>
                                    <div className="text-blue-400 mb-4">import <span className="text-yellow-300">{`{ motion }`}</span> from <span className="text-orange-300">'framer-motion'</span>;</div>

                                    <div className="text-blue-400 mb-2">export const <span className="text-yellow-300">Portfolio</span> = () =&gt; {"{"}</div>
                                    <div className="pl-4 text-purple-400 mb-1">return (</div>
                                    <div className="pl-8 text-neutral-300 mb-1">&lt;<span className="text-red-400">main</span> className="bg-white"&gt;</div>
                                    <div className="pl-12 text-neutral-300 mb-1">&lt;<span className="text-red-400">Hero</span></div>
                                    <div className="pl-16 text-yellow-300">headline=<span className="text-green-400">"Creative Developer"</span></div>
                                    <div className="pl-16 text-yellow-300">status=<span className="text-green-400">"Open to work"</span></div>
                                    <div className="pl-12 text-neutral-300 mb-1">/&gt;</div>
                                    <div className="pl-12 text-neutral-300 mb-1">&lt;<span className="text-red-400">Projects</span> grid=<span className="text-blue-300">{3}</span> /&gt;</div>
                                    <div className="pl-12 text-neutral-300 mb-1">&lt;<span className="text-red-400">Contact</span> /&gt;</div>
                                    <div className="pl-8 text-neutral-300 mb-1">&lt;/<span className="text-red-400">main</span>&gt;</div>
                                    <div className="pl-4 text-purple-400 mb-2">);</div>
                                    <div className="text-blue-400">{`}`};</div>
                                </div>
                            </motion.div>

                            {/* Foreground Card (Full Site Preview) */}
                            <motion.div
                                initial={{ opacity: 0, y: 40, rotate: 0 }}
                                animate={{ opacity: 1, y: 0, rotate: 0 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="relative lg:absolute top-0 lg:top-16 right-0 lg:-right-24 w-full lg:w-[850px] h-full lg:h-[570px] bg-white rounded-xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] border border-neutral-200 lg:rotate-3 hover:scale-[1.02] transition-all duration-500 z-20 overflow-hidden"
                            >
                                {/* Browser Chrome */}
                                <div className="h-6 sm:h-8 bg-neutral-100 border-b border-neutral-200 flex items-center px-3 sm:px-4 gap-1.5 sm:gap-2">
                                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neutral-300" />
                                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neutral-300" />
                                    <div className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-neutral-300" />
                                    <div className="ml-3 sm:ml-4 flex-1 h-4 sm:h-5 bg-white rounded-md border border-neutral-200 text-[8px] sm:text-[10px] flex items-center px-2 text-neutral-400 font-medium truncate">
                                        miak-portfolio.design
                                    </div>
                                </div>
                                <div className="relative w-full bg-neutral-50 block">
                                    <Image
                                        src="/hero-images/img1-full.png"
                                        alt="Portfolio Preview"
                                        width={1200}
                                        height={800}
                                        className="w-full h-auto block"
                                        priority
                                    />
                                </div>
                            </motion.div>

                            {/* Floating Avatar Badge — hidden on very small screens */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1 }}
                                className="absolute bottom-4 -right-4 md:right-4 left-auto bg-white p-2 sm:p-3 pr-4 sm:pr-5 rounded-full shadow-xl border border-neutral-100 hidden sm:flex items-center gap-2 sm:gap-3 z-30 animate-bounce"
                                style={{ animationDuration: '3s' }}
                            >
                                <div className="relative">
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-neutral-200 overflow-hidden border-2 border-white">
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                                    </div>
                                    <div className="absolute 0 bottom-0 right-0 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-green-500 border-2 border-white rounded-full" />
                                </div>
                                <div>
                                    <div className="text-[8px] sm:text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Just created by</div>
                                    <div className="text-xs sm:text-sm font-bold text-neutral-900">Michael Carter</div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
