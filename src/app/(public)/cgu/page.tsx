export default function TermsPage() {
  return (
    <main className="flex flex-1 flex-col items-center gap-6 bg-gradient-to-br from-beige to-sage/20 px-6 py-12 sm:px-16">
      <div className="flex w-full max-w-2xl flex-col gap-6 rounded-lg border border-sage/30 border-t-4 border-t-champagne bg-beige p-8">
        <h1 className="text-3xl font-semibold tracking-tight text-forest">
          Conditions générales d&apos;utilisation
        </h1>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
            Objet
          </h2>
          <p className="text-anthracite/75">
            NADCEL est une plateforme multi-salons qui met en relation des clientes et
            clients avec des salons de beauté et spas partenaires au Sénégal, afin de
            faciliter la prise de rendez-vous en ligne.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
            Comptes utilisateurs
          </h2>
          <p className="text-anthracite/75">
            La création d&apos;un compte est nécessaire pour réserver un rendez-vous ou
            inscrire un salon. Chaque utilisateur est responsable de l&apos;exactitude des
            informations fournies et de la confidentialité de ses identifiants.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
            Réservations et paiement
          </h2>
          <p className="text-anthracite/75">
            Une réservation effectuée sur NADCEL constitue une demande de rendez-vous
            transmise au salon choisi. Aucun paiement n&apos;est collecté en ligne par
            NADCEL : le règlement de la prestation s&apos;effectue directement auprès du
            salon, en espèces ou par carte.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
            Annulation
          </h2>
          <p className="text-anthracite/75">
            Un rendez-vous en attente ou confirmé peut être annulé depuis l&apos;espace
            client, sous réserve d&apos;un délai minimum avant l&apos;heure prévue du
            rendez-vous, tel qu&apos;indiqué au moment de l&apos;annulation.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-anthracite/75">
            Salons partenaires
          </h2>
          <p className="text-anthracite/75">
            Toute fiche de salon soumise via l&apos;inscription partenaire est examinée par
            l&apos;équipe NADCEL avant publication et reste soumise au respect des présentes
            conditions.
          </p>
        </div>
      </div>
    </main>
  );
}
