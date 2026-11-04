// Appels de l'espace admin vers les fonctions Vercel (api/).
import type { SiteContent } from "../data/schema";

export interface Upload { kind: "image" | "cv"; name?: string; base64: string }

export class ApiError extends Error {
  constructor(message: string, public status: number, public details: string[] = []) { super(message); }
}

async function call<T>(path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      ...init,
      credentials: "same-origin",
      headers: init.body ? { "content-type": "application/json" } : undefined,
    });
  } catch {
    throw new ApiError("Connexion impossible. Vérifiez votre réseau.", 0);
  }
  const data = await res.json().catch(() => ({})) as { error?: string; details?: string[] };
  if (!res.ok) throw new ApiError(data.error || `Erreur ${res.status}`, res.status, data.details);
  return data as T;
}

export const getSession = () => call<{ authenticated: boolean }>("/api/session");
export const login = (password: string) => call<{ authenticated: boolean }>("/api/session", { method: "POST", body: JSON.stringify({ password }) });
export const logout = () => call<{ authenticated: boolean }>("/api/session", { method: "DELETE" });
export const loadContent = () => call<{ content: SiteContent; sha: string }>("/api/content");
export const saveContent = (content: SiteContent, baseSha: string, uploads: Upload[]) =>
  call<{ ok: true; commit: string; sha: string }>("/api/content", { method: "POST", body: JSON.stringify({ content, baseSha, uploads }) });

/** Redimensionne une image (1600 px de large au plus) et la convertit en JPEG, pour des envois légers */
export async function imageToJpegBase64(file: File, maxWidth = 1600): Promise<{ base64: string; dataUrl: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#fff"; // les PNG transparents gardent un fond propre
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
  return { dataUrl, base64: dataUrl.split(",")[1] };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(",")[1]);
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}
