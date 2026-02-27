import { Navbar } from "@/components/landing-v2/Navbar";
import { Hero } from "@/components/landing-v2/Hero";
import { ShowcaseGallery } from "@/components/landing-v2/ShowcaseGallery";
import { ProcessSteps } from "@/components/landing-v2/ProcessSteps";
import { FeatureDeepDive } from "@/components/landing-v2/FeatureDeepDive";
import { PricingV2 } from "@/components/landing-v2/PricingV2";
import { Testimonials } from "@/components/landing-v1/Testimonials"; // Still reusing these, they fit well
import { Footer } from "@/components/landing-v2/Footer";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#faf9f7] overflow-x-hidden selection:bg-orange-100 selection:text-orange-900">
      <Navbar />
      <Hero />
      <ProcessSteps />
      <FeatureDeepDive />
      <ShowcaseGallery />
      <Testimonials />
      <PricingV2 />
      <Footer />
    </main>
  );
}
