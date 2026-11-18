// Réservation (choix du service, du jour et de l'heure) : page « tunnel »,
// sans barre de navigation ni pied de page, pour que la cliente termine sa
// réservation sans être distraite. Le logo et « Retour au salon » gardent
// une sortie claire (voir FocusTopBar).
export default function ReservationLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-svh flex-1 flex-col bg-beige">{children}</div>;
}
