// Connexion, inscription, mot de passe et « Inscrire mon salon » : pages de
// « tunnel », sans barre de navigation ni pied de page, pour que l'attention
// reste sur le formulaire.
// Le logo et « Retour à l'accueil » (FocusTopBar) gardent une sortie claire.
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <main className="flex min-h-svh flex-1 flex-col bg-beige">{children}</main>;
}
