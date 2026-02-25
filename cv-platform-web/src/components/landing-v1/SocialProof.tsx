export function SocialProof() {
    const companies = ["Linear", "Vercel", "Notion", "Figma", "Airbnb", "Stripe"];

    return (
        <section className="py-12 border-y border-neutral-200 bg-white/50 backdrop-blur-sm">
            <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16">
                <p className="text-sm font-medium text-neutral-400 uppercase tracking-widest whitespace-nowrap">
                    Users hired at
                </p>
                <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                    {companies.map((company) => (
                        <span key={company} className="text-lg font-serif font-bold text-neutral-800">
                            {company}
                        </span>
                    ))}
                </div>
            </div>
        </section>
    );
}
