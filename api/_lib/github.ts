// Lecture et enregistrement des fichiers du dépôt via l'API GitHub.
// Le jeton (GITHUB_TOKEN) ne quitte jamais le serveur.

const API = "https://api.github.com";

function config() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN manquant");
  return {
    token,
    repo: process.env.GITHUB_REPO || "YvanOssey/portfolio-yvan-ossey",
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

async function gh<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = config();
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      accept: "application/vnd.github+json",
      "x-github-api-version": "2022-11-28",
      "user-agent": "portfolio-admin",
      ...(init.body ? { "content-type": "application/json" } : {}),
    },
  });
  if (!res.ok) {
    // le détail reste dans les journaux Vercel, pas dans la réponse au navigateur
    console.error("GitHub", res.status, path, await res.text().catch(() => ""));
    throw new Error(`GitHub a répondu ${res.status}`);
  }
  return res.json() as Promise<T>;
}

/** Contenu d'un fichier texte de la branche, avec son identifiant (sha) pour détecter les conflits */
export async function readFile(path: string): Promise<{ text: string; sha: string }> {
  const { repo, branch } = config();
  const f = await gh<{ content: string; sha: string }>(`/repos/${repo}/contents/${path}?ref=${encodeURIComponent(branch)}`);
  return { text: Buffer.from(f.content, "base64").toString("utf8"), sha: f.sha };
}

export interface FileChange {
  path: string;
  /** contenu encodé en base64 */
  base64: string;
}

/** Enregistre plusieurs fichiers en un seul commit sur la branche (Vercel redéploie ensuite) */
export async function commitFiles(files: FileChange[], message: string): Promise<string> {
  const { repo, branch } = config();
  const ref = await gh<{ object: { sha: string } }>(`/repos/${repo}/git/ref/heads/${encodeURIComponent(branch)}`);
  const parent = await gh<{ tree: { sha: string } }>(`/repos/${repo}/git/commits/${ref.object.sha}`);

  const tree = await Promise.all(files.map(async (f) => {
    const blob = await gh<{ sha: string }>(`/repos/${repo}/git/blobs`, {
      method: "POST",
      body: JSON.stringify({ content: f.base64, encoding: "base64" }),
    });
    return { path: f.path, mode: "100644", type: "blob", sha: blob.sha };
  }));

  const newTree = await gh<{ sha: string }>(`/repos/${repo}/git/trees`, {
    method: "POST",
    body: JSON.stringify({ base_tree: parent.tree.sha, tree }),
  });
  const commit = await gh<{ sha: string }>(`/repos/${repo}/git/commits`, {
    method: "POST",
    body: JSON.stringify({ message, tree: newTree.sha, parents: [ref.object.sha] }),
  });
  // force: false — si la branche a bougé entre-temps, GitHub refuse au lieu d'écraser
  await gh(`/repos/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, {
    method: "PATCH",
    body: JSON.stringify({ sha: commit.sha, force: false }),
  });
  return commit.sha;
}
