"use client";

import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "@phosphor-icons/react";
import Link from "next/link";
import Image from "next/image";

export function Hero() {
    return (
        <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden bg-[#faf9f7] text-neutral-900">
            <div className="w-full max-w-[1480px] mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    {/* Left Column: Content */}
                    <div className="flex flex-col justify-center order-2 lg:order-1">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.6 }}
                            className="space-y-8 max-w-xl"
                        >
                            <div className="flex items-center gap-2 text-orange-600 font-medium tracking-wide text-sm uppercase">
                                <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                                AI-Powered Design
                            </div>

                            <h1 className="font-serif text-5xl md:text-7xl leading-[1.1] text-neutral-900">
                                Portfolios that <br className="hidden lg:block" />
                                get you hired.
                            </h1>

                            <p className="font-sans text-lg text-neutral-600 leading-relaxed max-w-lg">
                                Stop struggling with generic templates. Ideate uses AI to craft unique, code-perfect portfolio websites tailored to your professional story in seconds.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <a
                                    href={`/api/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}`}
                                    className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-neutral-900 text-white rounded-full font-medium text-lg transition-all hover:bg-neutral-800 hover:scale-105 active:scale-95 shadow-xl shadow-neutral-900/10"
                                >
                                    <span>Start Building</span>
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </a>
                            </div>

                            <div className="flex items-center gap-6 pt-4 text-sm font-medium text-neutral-500">
                                <div className="flex items-center gap-2">
                                    <CheckCircle className="w-5 h-5 text-green-600" weight="fill" />
                                    <span>No coding required</span>
                                </div>
                            </div>

                            {/* Social Proof */}
                            <div className="pt-8 border-t border-neutral-200">
                                <p className="text-sm text-neutral-500 mb-4 font-medium">Trusted by creatives from</p>
                                <div className="flex flex-wrap gap-6 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                                    {/* Placeholder logos using text for now, could be replaced with SVGs */}
                                    <div className="flex items-center gap-2 font-bold text-lg font-serif opacity-80">Adobe</div>
                                    <div className="flex items-center gap-2 font-bold text-lg font-serif opacity-80">Meta</div>
                                    <div className="flex items-center gap-2 font-bold text-lg font-serif opacity-80">Spotify</div>
                                    <div className="flex items-center gap-2 font-bold text-lg font-serif opacity-80">Figma</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Visuals */}
                    <div className="relative h-[600px] w-full order-1 lg:order-2 flex items-center justify-center">

                        {/* Background Gradient Blob */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-orange-200/20 via-orange-100/10 to-transparent rounded-full blur-3xl -z-10" />

                        {/* Floating Card Container */}
                        <div className="relative w-full h-full flex items-center justify-center scale-75 md:scale-90 lg:scale-100 origin-center">

                            {/* Background Card (Code Snippet) - acts as backdrop */}
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
                                    <div className="text-blue-400">{"}"};</div>
                                </div>
                            </motion.div>

                            {/* Foreground Card (Full Site Preview) */}
                            <motion.div
                                initial={{ opacity: 0, y: 40, rotate: 3 }}
                                animate={{ opacity: 1, y: 0, rotate: 3 }}
                                transition={{ duration: 0.8, delay: 0.4 }}
                                className="absolute top-16 right-0 md:-right-24 w-[600px] md:w-[850px] h-[570px] bg-white rounded-xl shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] border border-neutral-200 transform hover:scale-[1.02] transition-all duration-500 z-20 overflow-hidden"
                            >
                                {/* Browser Chrome */}
                                <div className="h-8 bg-neutral-100 border-b border-neutral-200 flex items-center px-4 gap-2">
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                                    <div className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
                                    <div className="ml-4 flex-1 h-5 bg-white rounded-md border border-neutral-200 text-[10px] flex items-center px-2 text-neutral-400 font-medium truncate">
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

                            {/* Floating Avatar Badge */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.5, delay: 1 }}
                                className="absolute bottom-4 -right-4 md:right-4 left-auto bg-white p-3 pr-5 rounded-full shadow-xl border border-neutral-100 flex items-center gap-3 z-30 animate-bounce"
                                style={{ animationDuration: '3s' }}
                            >
                                <div className="relative">
                                    <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden border-2 border-white">
                                        {/* Placeholder Avatar */}
                                        <div className="w-full h-full bg-gradient-to-br from-indigo-400 to-purple-400" />
                                    </div>
                                    <div className="absolute 0 bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                </div>
                                <div>
                                    <div className="text-[10px] text-neutral-500 uppercase tracking-wider font-semibold">Just created by</div>
                                    <div className="text-sm font-bold text-neutral-900">Michael Carter</div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
