import { Star } from "@phosphor-icons/react/dist/ssr";

export function Testimonials() {
    const testimonials = [
        {
            quote: "I spent weeks trying to code my portfolio. With Ideate, I had a stunning site in 5 minutes.",
            author: "Sarah Jenkins",
            role: "UX Researcher",
            avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150&h=150"
        },
        {
            quote: "The visual quality is unmatched. It doesn't look like a template, it looks like a custom agency build.",
            author: "David Kim",
            role: "Frontend Dev",
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150&h=150"
        },
        {
            quote: "Finally, an AI builder that understands design principles. My portfolio helped me land my dream job.",
            author: "Elena Rodriguez",
            role: "Product Designer",
            avatar: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=80&w=150&h=150"
        }
    ];

    return (
        <section className="py-24 px-4 bg-[#faf9f7]">
            <div className="max-w-7xl mx-auto">
                <h2 className="font-serif text-[44px] text-neutral-900 text-center mb-16">Loved by creatives.</h2>

                <div className="grid md:grid-cols-3 gap-8">
                    {testimonials.map((t, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl border border-neutral-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                            <div className="flex gap-1 mb-6 text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} weight="fill" className="w-4 h-4" />
                                ))}
                            </div>
                            <p className="text-lg text-neutral-600 mb-8 leading-relaxed font-medium">"{t.quote}"</p>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden ring-2 ring-white shadow-sm">
                                    <img
                                        src={t.avatar}
                                        alt={t.author}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <p className="font-bold text-neutral-900 text-sm leading-tight">{t.author}</p>
                                    <p className="text-neutral-500 text-[11px] uppercase tracking-wider font-semibold">{t.role}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
