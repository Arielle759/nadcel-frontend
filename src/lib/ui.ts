// Règles visuelles communes du site public.
// - Un seul style par rôle : vert forêt pour l'action principale, doré clair
//   pour « Inscrire mon salon » et les actions sur fond sombre.
// - Pas de soulignements ni de traits de séparation : la hiérarchie vient des
//   surfaces blanches posées sur le fond ivoire et de leurs ombres douces.

const buttonBase =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-full px-6 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60";

const shadow = "shadow-[0_1px_2px_rgba(45,59,40,0.05),0_8px_24px_rgba(45,59,40,0.07)]";
const shadowHover =
  "hover:-translate-y-0.5 hover:shadow-[0_2px_6px_rgba(45,59,40,0.06),0_18px_40px_rgba(45,59,40,0.13)]";

export const ui = {
  buttonPrimary: `${buttonBase} bg-forest text-beige shadow-[0_6px_16px_rgba(45,59,40,0.22)] hover:bg-dark-sage hover:shadow-[0_10px_22px_rgba(45,59,40,0.28)]`,
  buttonSecondary: `${buttonBase} bg-white text-forest ${shadow} hover:shadow-[0_2px_6px_rgba(45,59,40,0.06),0_12px_28px_rgba(45,59,40,0.12)]`,
  // Action posée sur une photo ou un fond vert foncé, et « Inscrire mon salon ».
  buttonOnDark: `${buttonBase} bg-champagne-light text-forest shadow-[0_6px_16px_rgba(20,30,18,0.25)] hover:bg-[#cca35a]`,
  buttonGhostOnDark: `${buttonBase} bg-beige/10 text-beige ring-1 ring-inset ring-beige/25 hover:bg-beige/20`,
  // Surface blanche surélevée, statique ou cliquable.
  surface: `rounded-2xl bg-white ${shadow}`,
  surfaceInteractive: `rounded-2xl bg-white ${shadow} transition-all duration-200 ${shadowHover}`,
  // Lien d'action sans soulignement : couleur et graisse suffisent.
  textLink: "font-semibold text-forest transition-colors hover:text-dark-sage",
  eyebrow: "text-sm font-medium text-anthracite/70",
  sectionTitleBase: "text-3xl font-semibold tracking-tight sm:text-[2.75rem] sm:leading-[1.1]",
  sectionTitle: "text-3xl font-semibold tracking-tight text-forest sm:text-[2.75rem] sm:leading-[1.1]",
  // Seconde ligne d'un titre, plus claire (contraste ≥ 3:1 en grand texte).
  sectionTitleMuted: "block text-[#7d8a76]",
  container: "mx-auto w-full max-w-6xl px-6 sm:px-10",
} as const;
