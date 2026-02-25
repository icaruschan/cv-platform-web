import { Navbar } from "@/components/landing-v2/Navbar";
import { Hero } from "@/components/landing-v2/Hero";
import { SocialProof } from "@/components/landing-v1/SocialProof";
import { Process } from "@/components/landing-v1/Process";
import { ShowcaseGallery } from "@/components/landing-v2/ShowcaseGallery";
import { Testimonials } from "@/components/landing-v1/Testimonials";
import { Pricing } from "@/components/landing-v1/Pricing";
import { Footer } from "@/components/landing-v1/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f7] overflow-x-hidden selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      <Hero />
      <SocialProof />
      <Process />
      <ShowcaseGallery />
      <Testimonials />
      <Pricing />
      <Footer />
    </main>
  );
}
