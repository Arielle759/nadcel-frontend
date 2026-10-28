import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import Footer from "@/components/Footer";

// Layout du site public (accueil, salons, connexion, espace client).
// Les espaces gérant et administrateur ont leur propre layout, sans navbar ni footer.
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <PageTransition>{children}</PageTransition>
      <Footer />
    </>
  );
}
