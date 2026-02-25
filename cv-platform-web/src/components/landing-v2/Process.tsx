import { ChatText, SlidersHorizontal, RocketLaunch } from "@phosphor-icons/react/dist/ssr";

export function Process() {
    const steps = [
        {
            number: "01",
            title: "Describe",
            description: "Tell Ideate about your role, vibe, and goals. The more you share, the better the result.",
            icon: ChatText,
        },
        {
            number: "02",
            title: "Refine",
            description: "Use our chat editor to tweak colors, fonts, and layout. It's like talking to a senior designer.",
            icon: SlidersHorizontal,
        },
        {
            number: "03",
            title: "Publish",
            description: "One click to deploy to Vercel. Get a live URL instantly or connect your custom domain.",
            icon: RocketLaunch,
        },
    ];

    return (
        <section className="py-24 px-6 md:px-12 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="mb-16 md:w-1/2">
                    <h2 className="font-serif text-4xl md:text-5xl text-neutral-900 mb-6">How it works</h2>
                    <p className="text-xl text-neutral-500">From concept to live site in three simple steps.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-12 relative">
                    {/* Connecting Line (Desktop) */}
                    <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-px bg-neutral-200 -z-10" />

                    {steps.map((step, i) => (
                        <div key={i} className="group">
                            <div className="w-24 h-24 bg-[#faf9f7] border border-neutral-200 rounded-full flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300 relative z-10">
                                <step.icon className="w-8 h-8 text-neutral-900" />
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold border-4 border-white">
                                    {step.number}
                                </div>
                            </div>
                            <h3 className="font-serif text-2xl text-neutral-900 mb-3">{step.title}</h3>
                            <p className="text-neutral-500 leading-relaxed max-w-xs">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
