"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "@phosphor-icons/react";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf9f7]/80 backdrop-blur-md border-b border-neutral-100">
            <div className="w-full max-w-[1600px] mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.svg"
                        alt="Ideate"
                        width={180}
                        height={45}
                        className="h-12 w-auto"
                        priority
                    />
                </Link>
                <Link
                    href={`/api/checkout?products=${process.env.NEXT_PUBLIC_POLAR_PRODUCT_ID}`}
                    className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    );
}
