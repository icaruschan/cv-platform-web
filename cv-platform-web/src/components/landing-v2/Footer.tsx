import { IdeateLogo } from "@/components/ui/IdeateLogo";
import Link from "next/link";
import { TwitterLogo, InstagramLogo, LinkedinLogo } from "@phosphor-icons/react/dist/ssr";

const footerLinks = {
    product: [
        { label: "Features", href: "#" },
        { label: "Pricing", href: "#" },
        { label: "Showcase", href: "#" },
        { label: "Reviews", href: "#" },
    ],
    resources: [
        { label: "About", href: "#" },
        { label: "Blog", href: "#" },
        { label: "Careers", href: "#" },
        { label: "Contact", href: "#" },
    ],
    legal: [
        { label: "Privacy Policy", href: "#" },
        { label: "Terms of Service", href: "#" },
        { label: "Cookie Policy", href: "#" },
    ],
};

export function Footer() {
    return (
        <footer className="bg-neutral-900 text-white pt-24 pb-12 overflow-hidden relative">
            <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 mb-20">
                    {/* Brand Column */}
                    <div className="md:col-span-4 space-y-6">
                        <Link href="/" className="inline-block">
                            <IdeateLogo className="h-12 w-auto" textColor="#ffffff" />
                        </Link>
                        <p className="text-neutral-400 leading-relaxed max-w-sm">
                            Portfolios that get you hired.
                            Craft unique, code-perfect websites tailored to your professional story in seconds.
                        </p>
                        <div className="flex gap-4">
                            <SocialLink href="#" icon={TwitterLogo} />
                            <SocialLink href="#" icon={InstagramLogo} />
                            <SocialLink href="#" icon={LinkedinLogo} />
                        </div>
                    </div>

                    {/* Links Columns */}
                    <div className="md:col-span-2 md:col-start-7">
                        <h3 className="font-bold text-white mb-6">Product</h3>
                        <ul className="space-y-4">
                            {footerLinks.product.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-neutral-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="font-bold text-white mb-6">Resources</h3>
                        <ul className="space-y-4">
                            {footerLinks.resources.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-neutral-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <h3 className="font-bold text-white mb-6">Legal</h3>
                        <ul className="space-y-4">
                            {footerLinks.legal.map((link) => (
                                <li key={link.label}>
                                    <Link href={link.href} className="text-neutral-400 hover:text-white transition-colors">
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-neutral-500 text-sm">
                        © {new Date().getFullYear()} Ideate Inc. All rights reserved.
                    </p>
                    <p className="text-neutral-600 text-sm">
                        Designed for creatives, by creatives.
                    </p>
                </div>
            </div>

            {/* Background Blob */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-orange-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
        </footer>
    );
}

function SocialLink({ href, icon: Icon }: { href: string; icon: any }) {
    return (
        <a
            href={href}
            className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-white hover:bg-orange-600 transition-colors duration-300"
        >
            <Icon className="w-5 h-5" weight="bold" />
        </a>
    );
}
