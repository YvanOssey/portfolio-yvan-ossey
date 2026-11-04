// Connexion à l'espace admin : POST { password } ouvre une session, DELETE la ferme, GET dit si on est connecté.
import { checkPassword, clearCookie, isAuthenticated, json, pause, sameOrigin, sessionCookie } from "./_lib/auth";

export async function GET(req: Request) {
  return json({ authenticated: isAuthenticated(req) });
}

export async function POST(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  let password: unknown;
  try {
    ({ password } = (await req.json()) as { password?: unknown });
  } catch {
    return json({ error: "Requête invalide." }, 400);
  }
  try {
    if (!checkPassword(password)) {
      // ralentit les essais de mots de passe en série
      await pause(1200);
      return json({ error: "Mot de passe incorrect." }, 401);
    }
    return json({ authenticated: true }, 200, { "set-cookie": sessionCookie() });
  } catch (e) {
    console.error(e);
    return json({ error: "L’espace admin n’est pas encore configuré sur Vercel." }, 500);
  }
}

export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return json({ error: "Requête refusée." }, 403);
  return json({ authenticated: false }, 200, { "set-cookie": clearCookie() });
}
