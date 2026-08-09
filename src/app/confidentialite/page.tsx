export default function PrivacyPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-sage/30 border-t-4 border-t-champagne bg-beige p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-forest">
          Politique de confidentialité
        </h1>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
            Données collectées
          </h2>
          <p className="text-anthracite/75">
            Pour créer un compte et gérer vos réservations, NADCEL collecte votre nom, votre
            adresse email et les informations liées à vos rendez-vous (salon, service, date
            et heure). Les salons partenaires fournissent quant à eux les informations
            nécessaires à la présentation de leur établissement.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
            Utilisation des données
          </h2>
          <p className="text-anthracite/75">
            Ces informations servent uniquement à faire fonctionner la plateforme : créer et
            afficher vos réservations, permettre aux salons de les gérer, et vous permettre
            de laisser un avis après une prestation terminée. NADCEL ne vend aucune donnée
            personnelle à des tiers.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
            Partage avec les salons
          </h2>
          <p className="text-anthracite/75">
            Lorsque vous réservez un rendez-vous, le salon concerné a accès aux informations
            nécessaires à sa préparation (nom, service demandé, date et heure). Le paiement
            se faisant directement au salon, aucune donnée bancaire n&apos;est traitée par
            NADCEL.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
            Vos droits
          </h2>
          <p className="text-anthracite/75">
            Vous pouvez à tout moment demander l&apos;accès, la correction ou la suppression
            de vos données personnelles en nous contactant à{" "}
            <a href="mailto:contact@nadcel.sn" className="text-link-sage hover:underline">
              contact@nadcel.sn
            </a>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
