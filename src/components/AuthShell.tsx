import Image from "next/image";

// Mise en page commune connexion / inscription : formulaire à gauche, photo à
// droite (masquée sur mobile pour aller droit au formulaire).
export default function AuthShell({
  title,
  intro,
  image,
  quote,
  children,
}: {
  title: string;
  intro: string;
  image: string;
  quote: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col lg:flex-row">
      <div className="flex flex-1 items-center justify-center px-6 py-14 sm:px-10 lg:py-20">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-semibold tracking-tight text-forest sm:text-[2.75rem] sm:leading-[1.1]">
            {title}
          </h1>
          <p className="mt-4 leading-7 text-anthracite/75">{intro}</p>
          <div className="mt-8">{children}</div>
        </div>
      </div>

      <div className="relative hidden w-full overflow-hidden lg:block lg:w-[46%]">
        <Image src={image} alt="" fill priority sizes="46vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-forest/90 via-forest/30 to-transparent" aria-hidden="true" />
        <p className="absolute inset-x-0 bottom-0 max-w-lg p-12 font-heading text-3xl font-semibold leading-tight text-beige">
          {quote}
        </p>
      </div>
    </div>
  );
}
