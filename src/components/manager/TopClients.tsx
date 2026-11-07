"use client";

import type { ActivityPeriod, ActivityTopClient } from "@/hooks/useManagerActivity";
import { formatCurrency } from "@/lib/currency";
import { whatsAppLink } from "@/lib/whatsapp";
import { ui } from "@/lib/ui";

const LABEL = "text-[11px] font-semibold uppercase tracking-[0.08em]";

const TITLE_BY_PERIOD: Record<ActivityPeriod, string> = {
  month: "Client du mois",
  quarter: "Client du trimestre",
  year: "Client de l'année",
};

function thankYouMessage(name: string): string {
  const firstName = name.trim().split(/\s+/)[0] || name;
  return `Bonjour ${firstName}, merci pour votre fidélité ! Pour vous remercier, une petite attention vous attend lors de votre prochain passage au salon. À très bientôt !`;
}

function visitsLabel(visits: number): string {
  return `${visits} visite${visits > 1 ? "s" : ""}`;
}

function lastVisit(iso: string): string {
  return new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
}

// Clients les plus fidèles de la période : de quoi récompenser les habitués
// (réduction, petite attention) et les remercier en un clic sur WhatsApp.
export default function TopClients({ clients, period }: { clients: ActivityTopClient[]; period: ActivityPeriod }) {
  if (clients.length === 0) return null;
  const [first, ...others] = clients;
  const firstLink = whatsAppLink(first.phone, thankYouMessage(first.name));

  return (
    <section
      aria-labelledby="top-clients-title"
      className="rounded-2xl bg-white p-5 shadow-[0_1px_2px_rgba(90,50,35,0.05),0_8px_24px_rgba(90,50,35,0.07)] sm:p-6"
    >
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="top-clients-title" className="font-sans text-base font-semibold text-anthracite">
          Clients fidèles
        </h3>
        <p className="text-sm text-anthracite/60">Une réduction ou une petite attention les fera revenir.</p>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="flex flex-col rounded-2xl bg-brand p-6 text-beige shadow-[0_6px_16px_rgba(59,42,36,0.18),0_18px_40px_rgba(74,51,40,0.22)]">
          <p className={`${LABEL} text-beige/65`}>{TITLE_BY_PERIOD[period]}</p>
          <p className="mt-3 font-heading text-3xl font-semibold leading-tight">{first.name}</p>
          <p className="mt-2 text-sm text-beige/80">
            {visitsLabel(first.visits)}, {formatCurrency(first.spent)} encaissés
          </p>
          <p className="mt-1 text-xs text-beige/60">Dernière visite le {lastVisit(first.last_visit)}</p>
          {firstLink && (
            <a
              href={firstLink}
              target="_blank"
              rel="noopener noreferrer"
              className={`${ui.buttonOnDark} mt-6 self-start`}
            >
              Remercier sur WhatsApp
            </a>
          )}
        </div>

        {others.length > 0 && (
          <ol className="flex flex-col gap-4" start={2}>
            {others.map((client, index) => {
              const link = whatsAppLink(client.phone, thankYouMessage(client.name));
              return (
                <li key={`${client.name}-${index}`} className="flex items-center gap-4">
                  <span
                    aria-hidden="true"
                    className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-beige font-heading text-lg font-semibold text-accent"
                  >
                    {index + 2}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-anthracite">{client.name}</p>
                    <p className="mt-0.5 text-xs text-anthracite/55">
                      {visitsLabel(client.visits)}, {formatCurrency(client.spent)}, dernière le {lastVisit(client.last_visit)}
                    </p>
                  </div>
                  {link && (
                    <a
                      href={link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${ui.textLink} shrink-0 text-sm`}
                      aria-label={`Remercier ${client.name} sur WhatsApp`}
                    >
                      Remercier
                    </a>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </section>
  );
}
