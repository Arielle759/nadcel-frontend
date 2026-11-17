import FaqSection from "@/components/FaqSection";

export const metadata = { title: "Questions fréquentes — Nadcel" };

export default function FaqPage() {
  return (
    <main className="flex flex-1 flex-col">
      <FaqSection />
    </main>
  );
}
