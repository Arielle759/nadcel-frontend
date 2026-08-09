export default function AboutPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-sage/30 border-t-4 border-t-champagne bg-beige p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-forest">Qui sommes-nous</h1>

        <p className="text-anthracite/75">
          NADCEL est une plateforme multi-salons qui connecte les clientes et clients aux
          salons de beauté et spas au Sénégal. Notre objectif est simple : donner aux salons
          plus de visibilité et un outil de gestion simplifié, et permettre à chacun de
          réserver un rendez-vous en quelques clics, sans avoir à appeler chaque salon
          individuellement.
        </p>

        <p className="text-anthracite/75">
          Que vous cherchiez une coiffure, un soin, un massage ou une manucure, NADCEL
          regroupe des salons partenaires vérifiés dans plusieurs villes du Sénégal, avec
          leurs services, leurs disponibilités réelles et leurs avis clients.
        </p>

        <p className="text-anthracite/75">
          Vous gérez un salon de beauté ou un spa ? Rejoignez les salons partenaires de
          NADCEL pour gagner en visibilité et simplifier la gestion de vos rendez-vous.
        </p>
      </div>
    </main>
  );
}
