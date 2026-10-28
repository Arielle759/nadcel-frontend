// Règles visuelles communes du site public.
// Un seul style par rôle : le vert forêt pour l'action principale, le doré
// uniquement sur fond sombre (hero, pied de page), des pilules pour les
// boutons, des cartes en rounded-2xl.

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60";

export const ui = {
  buttonPrimary: `${buttonBase} bg-forest text-beige hover:bg-dark-sage`,
  buttonSecondary: `${buttonBase} border border-forest/25 text-forest hover:border-forest/50 hover:bg-forest/5`,
  // Action principale posée sur une photo ou un fond vert foncé.
  buttonOnDark: `${buttonBase} bg-champagne-light text-forest hover:bg-beige`,
  card: "rounded-2xl border border-sage/25 bg-white/60",
  eyebrow: "text-sm font-medium text-anthracite/70",
  sectionTitle: "text-3xl font-semibold tracking-tight text-forest sm:text-4xl",
  container: "mx-auto w-full max-w-6xl px-6 sm:px-10",
} as const;
