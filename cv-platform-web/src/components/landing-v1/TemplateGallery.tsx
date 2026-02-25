export function TemplateGallery() {
    return (
        <section id="examples" className="py-24 px-4 overflow-hidden border-t border-neutral-200 bg-white">
            <div className="max-w-7xl mx-auto mb-12 flex justify-between items-end">
                <div>
                    <h2 className="font-serif text-4xl text-neutral-900 mb-2">Made with Alchemy</h2>
                    <p className="text-neutral-500">Explore portfolios created by our users.</p>
                </div>
                <button className="hidden md:block text-sm font-medium border-b border-black pb-0.5 hover:opacity-70 transition-opacity">
                    View All Examples
                </button>
            </div>

            {/* Horizontal Scroll Area */}
            <div className="flex gap-6 overflow-x-auto pb-8 snap-x pl-4 md:pl-0 scrollbar-hide">
                {[1, 2, 3, 4].map((item) => (
                    <div key={item} className="snap-center flex-shrink-0 w-[85vw] md:w-[600px] group cursor-pointer">
                        <div className="aspect-[16/10] bg-neutral-100 rounded-xl overflow-hidden mb-4 relative">
                            <div className="absolute inset-0 bg-neutral-200 animate-pulse group-hover:bg-neutral-300 transition-colors" />
                            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-medium">
                                {item % 2 === 0 ? "Developer Portfolio" : "Designer Portfolio"}
                            </div>
                        </div>
                        <h3 className="font-medium text-lg text-neutral-900">Alex Chen, Senior Product Designer</h3>
                        <p className="text-neutral-500 text-sm">Generated in 2 minutes</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
