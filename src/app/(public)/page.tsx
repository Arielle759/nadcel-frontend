import HeroSection from "@/components/HeroSection";
import TrustSection from "@/components/TrustSection";
import BeautyUniverses from "@/components/BeautyUniverses";
import FeaturesSection from "@/components/FeaturesSection";
import PopularSalons from "@/components/PopularSalons";
import FaqSection from "@/components/FaqSection";
import PartnerBand from "@/components/PartnerBand";
import ReviewsShowcase from "@/components/ReviewsShowcase";

// Les sections apparaissent en douceur au défilement (composant Reveal), mais
// leur contenu est rendu visible côté serveur : il reste lisible même si le
// JavaScript tarde à charger (connexion mobile lente).
export default function Home() {
  return (
    <main className="flex flex-1 flex-col">
      <HeroSection />
      <TrustSection />
      <BeautyUniverses />
      <FeaturesSection />
      <PopularSalons />
      <ReviewsShowcase />
      <FaqSection />
      <PartnerBand />
    </main>
  );
}
