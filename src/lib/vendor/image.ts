const ACCEPTED = ["image/jpeg", "image/png", "image/webp"];

export function validateImageFile(file: File): string | null {
  if (!ACCEPTED.includes(file.type)) return "Please choose a JPG, PNG or WebP image.";
  if (file.size > 25 * 1024 * 1024) return "That image is too large. Please choose one under 25 MB.";
  return null;
}

/**
 * The server rejects images over 5 MB, and phone photos are often bigger.
 * Downscale to maxSide and re-encode as JPEG (white background so
 * transparent PNG logos don't turn black).
 */
export async function prepareImage(file: File, maxSide = 1600): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", 0.85)
  );
  if (!blob) return file;

  const name = file.name.replace(/\.[^.]+$/, "") + ".jpg";
  return new File([blob], name, { type: "image/jpeg" });
}