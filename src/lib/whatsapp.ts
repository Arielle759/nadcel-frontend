// Rappels envoyés par le gérant via les liens officiels « Click to Chat » de
// WhatsApp (https://wa.me/<numéro>?text=...). Aucun service payant ni clé d'API.

const SENEGAL_PREFIX = "221";

// « 77 123 45 67 » -> « 221771234567 » ; « +221 77... » ou « 00221 77... » -> idem.
// Retourne null si le numéro est inexploitable.
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  let digits = phone.replace(/\D+/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 9) digits = SENEGAL_PREFIX + digits; // numéro sénégalais sans indicatif
  return digits.length >= 10 && digits.length <= 15 ? digits : null;
}

function formatTime(date: Date): string {
  const minutes = date.getMinutes();
  return minutes === 0 ? `${date.getHours()} h` : `${date.getHours()} h ${String(minutes).padStart(2, "0")}`;
}

export function reminderMessage({
  clientName,
  salonName,
  serviceName,
  scheduledAt,
  now = new Date(),
}: {
  clientName: string;
  salonName: string;
  serviceName: string;
  scheduledAt: string;
  now?: Date;
}): string {
  const date = new Date(scheduledAt);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);
  const isTomorrow =
    date.getFullYear() === tomorrow.getFullYear() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getDate() === tomorrow.getDate();
  const when = isTomorrow
    ? `demain à ${formatTime(date)}`
    : `le ${date.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })} à ${formatTime(date)}`;
  const firstName = clientName.trim().split(/\s+/)[0] ?? clientName;

  return `Bonjour ${firstName}, nous vous rappelons votre rendez-vous ${when} chez ${salonName} pour : ${serviceName}. En cas d'empêchement, merci de nous prévenir par retour de message. À bientôt !`;
}

export function whatsAppLink(phone: string | null | undefined, message: string): string | null {
  const number = toWhatsAppNumber(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(message)}` : null;
}
