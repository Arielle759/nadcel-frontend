// Réduit une photo avant l'envoi : une photo de téléphone (3 à 6 Mo) devient
// un JPEG de quelques centaines de Ko, largement suffisant pour l'affichage,
// plus rapide à envoyer sur une connexion mobile et sous la limite du serveur.

const MAX_SIDE = 1600; // px, côté le plus long
const QUALITY = 0.85;
const SMALL_ENOUGH = 900 * 1024; // en dessous, on envoie le fichier tel quel

export async function resizeImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;

  try {
    // imageOrientation : respecte la rotation EXIF des photos de téléphone.
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));

    if (scale === 1 && file.size <= SMALL_ENOUGH) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const context = canvas.getContext("2d");
    if (!context) {
      bitmap.close();
      return file;
    }
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", QUALITY));
    if (!blob || blob.size >= file.size) return file;

    const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], name, { type: "image/jpeg", lastModified: Date.now() });
  } catch {
    // Format que le navigateur ne sait pas lire (HEIC sur certains Android, par
    // exemple) : on laisse le serveur répondre avec un message clair.
    return file;
  }
}
