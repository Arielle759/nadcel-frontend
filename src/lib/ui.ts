// Règles visuelles communes du site public.
// - Un seul style par rôle : chocolat noir pour l'action principale,
//   chocolat pour l'identité (titres, bandeaux), ivoire pour le fond,
//   terracotta en simple touche (liens, « Inscrire mon salon »).
// - Pas de soulignements ni de traits de séparation : la hiérarchie vient des
//   surfaces blanches posées sur le fond ivoire et de leurs ombres douces.

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-200 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

const shadow = "shadow-[0_1px_2px_rgba(90,50,35,0.05),0_8px_24px_rgba(90,50,35,0.07)]";
const shadowHover =
  "hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(90,50,35,0.06),0_18px_40px_rgba(90,50,35,0.13)]";

export const ui = {
  buttonPrimary: `${buttonBase} bg-cacao text-beige shadow-[0_6px_16px_rgba(59,42,36,0.22)] hover:bg-cacao-soft hover:shadow-[0_10px_22px_rgba(90,50,35,0.28)]`,
  buttonSecondary: `${buttonBase} bg-white text-brand ${shadow} hover:shadow-[0_2px_6px_rgba(90,50,35,0.06),0_12px_28px_rgba(90,50,35,0.12)]`,
  // Action posée sur une photo ou un fond chocolat : touche terracotta.
  buttonOnDark: `${buttonBase} bg-accent text-beige shadow-[0_6px_16px_rgba(40,25,18,0.30)] hover:bg-accent-soft`,
  buttonGhostOnDark: `${buttonBase} bg-beige/10 text-beige ring-1 ring-inset ring-beige/25 hover:bg-beige/20`,
  // Surface blanche surélevée, statique ou cliquable.
  surface: `rounded-2xl bg-white ${shadow}`,
  surfaceInteractive: `rounded-2xl bg-white ${shadow} transition-all duration-200 ${shadowHover} active:translate-y-0 active:scale-[0.99]`,
  // Lien d'action sans soulignement : couleur et graisse suffisent.
  textLink: "font-semibold text-accent transition-colors hover:text-brand",
  // Champ de formulaire : fond blanc, ombre légère, anneau chocolat au focus.
  input:
    "h-12 w-full rounded-xl bg-white px-4 text-base text-anthracite outline-none shadow-[0_1px_2px_rgba(90,50,35,0.06),0_0_0_1px_rgba(90,50,35,0.10)] transition-shadow placeholder:text-anthracite/45 focus:shadow-[0_0_0_2px_var(--color-brand)]",
  textarea:
    "min-h-28 w-full rounded-xl bg-white px-4 py-3 text-base text-anthracite outline-none shadow-[0_1px_2px_rgba(90,50,35,0.06),0_0_0_1px_rgba(90,50,35,0.10)] transition-shadow placeholder:text-anthracite/45 focus:shadow-[0_0_0_2px_var(--color-brand)]",
  label: "text-sm font-semibold text-anthracite",
  // Action destructive discrète (le vrai bouton rouge n'apparaît qu'à la confirmation).
  buttonDangerGhost:
    "inline-flex min-h-11 items-center justify-center rounded-full px-4 text-sm font-semibold text-red-800 transition-all hover:bg-red-50 active:scale-[0.97]",
  buttonDanger:
    "inline-flex min-h-11 items-center justify-center rounded-full bg-red-800 px-5 text-sm font-semibold text-white transition-all hover:bg-red-900 active:scale-[0.97] disabled:opacity-60",
  eyebrow: "text-sm font-medium text-anthracite/70",
  sectionTitleBase: "text-3xl font-semibold tracking-tight sm:text-[2.75rem] sm:leading-[1.1]",
  sectionTitle: "text-3xl font-semibold tracking-tight text-brand sm:text-[2.75rem] sm:leading-[1.1]",
  container: "mx-auto w-full max-w-6xl px-6 sm:px-10",
} as const;
