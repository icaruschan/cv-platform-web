"use client";

import Link from "next/link";
import Image from "next/image";

export function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-[#faf9f7]/80 backdrop-blur-md border-b border-neutral-100">
            <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
                <Link href="/" className="flex items-center">
                    <Image
                        src="/logo.svg"
                        alt="Portfolio Alchemy"
                        width={200}
                        height={50}
                        className="h-14 w-auto"
                        priority
                    />
                </Link>
                <Link
                    href="/create"
                    className="px-6 py-2.5 bg-neutral-900 text-white text-sm font-medium rounded-full hover:bg-neutral-800 transition-colors"
                >
                    Get Started
                </Link>
            </div>
        </nav>
    );
}
