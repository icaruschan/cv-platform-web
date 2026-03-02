"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        handleScroll();
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <nav
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled
                    ? "bg-[#faf9f7]/90 backdrop-blur-md border-b border-neutral-200 py-2 md:py-3 shadow-sm"
                    : "bg-transparent border-transparent py-4 md:py-6"
                }`}
        >
            <div className="w-full max-w-[1600px] mx-auto px-4 md:px-12 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.svg"
                        alt="Ideate"
                        width={180}
                        height={45}
                        className="h-8 md:h-12 w-auto"
                        priority
                    />
                </Link>
                <Link
                    href={`/api/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}`}
                    className="px-4 py-2 md:px-6 md:py-2.5 bg-neutral-900 text-white text-xs md:text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    );
}
