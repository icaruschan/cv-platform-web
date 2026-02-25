import { LinkSimple } from "@phosphor-icons/react/dist/ssr";

export function Footer() {
    return (
        <footer className="bg-[#1a1a1a] text-white pt-12 pb-8 px-4 border-t border-neutral-800">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                        <LinkSimple className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg">Portfolio Alchemy</span>
                </div>

                <div className="flex gap-8 text-neutral-400 text-sm font-medium">
                    <a href="#" className="hover:text-white transition-colors">Twitter</a>
                    <a href="#" className="hover:text-white transition-colors">GitHub</a>
                    <a href="#" className="hover:text-white transition-colors">Terms</a>
                    <a href="#" className="hover:text-white transition-colors">Privacy</a>
                </div>

                <p className="text-neutral-600 text-xs text-center md:text-right">
                    © {new Date().getFullYear()} Ideate Inc. All rights reserved.
                </p>
            </div>
        </footer>
    );
}
