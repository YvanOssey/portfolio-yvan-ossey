// Contenu du portfolio : GET le lit depuis GitHub, POST l'enregistre (avec captures et CV) en un commit.
import { isAuthenticated, json, sameOrigin } from "./_lib/auth";
import { commitFiles, readFile, type FileChange } from "./_lib/github";
import { validateContent, type SiteContent } from "../src/data/schema";

const CONTENT_PATH = "src/data/content.json";
const CV_PATH = "public/cv/CV_Yvan_Ossey.pdf";

const MAX_IMAGE = 1_500_000; // octets, après compression dans le navigateur
const MAX_CV = 2_500_000;

interface Upload {
  /** "image" : capture d'un projet (img/<nom>.jpg) ; "cv" : remplace le CV en PDF */
  kind: "image" | "cv";
  name?: string;
  base64: string;
}

interface SaveBody {
  content: unknown;
  /** sha du content.json lu à l'ouverture : évite d'écraser une modification faite ailleurs */
  baseSha: string;
  uploads?: Upload[];
}

const isJpeg = (b: Buffer) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
const isPdf = (b: Buffer) => b.subarray(0, 5).toString("latin1") === "%PDF-";

export async function GET(req: Request) {
  if (!isAuthenticated(req)) return json({ error: "Connexion requise." }, 401);
  try {
    const { text, sha } = await readFile(CONTENT_PATH);
    return json({ content: JSON.parse(text), sha });
  } catch (e) {
    console.error(e);
    return json({ error: "Impossible de lire le contenu depuis GitHub." }, 502);
  }
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  if (!isAuthenticated(req)) return json({ error: "Session expirée : reconnectez-vous." }, 401);

  let body: SaveBody;
  try {
    body = (await req.json()) as SaveBody;
  } catch {
    return json({ error: "Requête invalide." }, 400);
  }

  const errors = validateContent(body.content);
  if (errors.length) return json({ error: "Certaines informations sont invalides.", details: errors.slice(0, 20) }, 422);
  const content = body.content as SiteContent;

  // Fichiers envoyés : uniquement des JPEG pour les captures, un PDF pour le CV
  const files: FileChange[] = [];
  for (const u of body.uploads ?? []) {
    if (typeof u?.base64 !== "string") return json({ error: "Fichier invalide." }, 400);
    const buf = Buffer.from(u.base64, "base64");
    if (u.kind === "image") {
      if (typeof u.name !== "string" || !/^[a-z0-9-]{1,60}\.jpg$/.test(u.name)) return json({ error: "Nom d’image invalide." }, 400);
      if (!isJpeg(buf) || buf.length > MAX_IMAGE) return json({ error: `Image ${u.name} refusée (JPEG de 1,5 Mo maximum).` }, 400);
      files.push({ path: `public/img/${u.name}`, base64: buf.toString("base64") });
    } else if (u.kind === "cv") {
      if (!isPdf(buf) || buf.length > MAX_CV) return json({ error: "CV refusé (PDF de 2,5 Mo maximum)." }, 400);
      files.push({ path: CV_PATH, base64: buf.toString("base64") });
    } else {
      return json({ error: "Type de fichier inconnu." }, 400);
    }
  }

  try {
    const current = await readFile(CONTENT_PATH);
    if (current.sha !== body.baseSha) {
      return json({ error: "Le contenu a changé depuis l’ouverture de l’admin. Rechargez la page pour récupérer la dernière version." }, 409);
    }
    const text = `${JSON.stringify(content, null, 2)}\n`;
    files.push({ path: CONTENT_PATH, base64: Buffer.from(text, "utf8").toString("base64") });
    const commit = await commitFiles(files, "Admin : mise à jour du contenu du portfolio");
    const { sha } = await readFile(CONTENT_PATH);
    return json({ ok: true, commit, sha });
  } catch (e) {
    console.error(e);
    return json({ error: "L’enregistrement sur GitHub a échoué. Réessayez dans un instant." }, 502);
  }
}
