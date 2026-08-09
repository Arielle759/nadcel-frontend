import { Suspense } from "react";
import FadeIn from "@/components/FadeIn";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection";
import PopularSalons from "@/components/PopularSalons";
import TrustSection from "@/components/TrustSection";
import FaqSection from "@/components/FaqSection";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <FadeIn>
        <TrustSection />
      </FadeIn>
      <FadeIn>
        <FeaturesSection />
      </FadeIn>
      <FadeIn>
        <Suspense fallback={null}>
          <PopularSalons />
        </Suspense>
      </FadeIn>
      <FadeIn>
        <FaqSection />
      </FadeIn>
    </main>
  );
}
