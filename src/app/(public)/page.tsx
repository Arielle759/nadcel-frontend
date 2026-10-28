import HeroSection from "@/components/HeroSection";
import TrustSection from "@/components/TrustSection";
import FeaturesSection from "@/components/FeaturesSection";
import PopularSalons from "@/components/PopularSalons";
import FaqSection from "@/components/FaqSection";
import PartnerBand from "@/components/PartnerBand";

// Pas d'apparition au défilement : le contenu reste visible même si le
// JavaScript tarde à charger (connexion mobile lente).
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <TrustSection />
      <FeaturesSection />
      <PopularSalons />
      <FaqSection />
      <PartnerBand />
    </main>
  );
}
