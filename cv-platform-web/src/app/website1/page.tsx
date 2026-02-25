import { Hero } from "@/components/landing-v1/Hero";
import { Process } from "@/components/landing-v1/Process";
import { SocialProof } from "@/components/landing-v1/SocialProof";
import { TemplateGallery } from "@/components/landing-v1/TemplateGallery";
import { Testimonials } from "@/components/landing-v1/Testimonials";
import { Pricing } from "@/components/landing-v1/Pricing";
import { Footer } from "@/components/landing-v1/Footer";

export default function Website1() {
    return (
        <main className="min-h-screen bg-[#faf9f7] overflow-x-hidden selection:bg-orange-100 selection:text-orange-900">
            <Hero />
            <SocialProof />
            <Process />
            <TemplateGallery />
            <Testimonials />
            <Pricing />
            <Footer />
        </main>
    );
}
