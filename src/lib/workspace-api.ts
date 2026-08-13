import { supabase } from "@/integrations/supabase/client";
import { uploadWorkspaceMedia } from "@/lib/workspace-upload.functions";

export type WsProject = {
  id: string;
  title: string;
  pitch: string;
  description: string;
  status: string;
  tags: string[];
  cover_image: string | null;
  url: string | null;
  author_name: string;
  author_token: string | null;
  is_hidden: boolean;
  created_at: string;
  updated_at: string;
};

export type WsMedia = {
  id: string;
  project_id: string;
  kind: "image" | "video" | "youtube";
  url: string;
  caption: string | null;
  sort_order: number;
};

export type WsLink = {
  id: string;
  project_id: string;
  url: string;
  label: string;
  link_type: string;
  sort_order: number;
};

export type WsUpdate = {
  id: string;
  project_id: string;
  author_name: string;
  body: string;
  image_url: string | null;
  kind: string;
  created_at: string;
};

export type WsTask = {
  id: string;
  project_id: string;
  title: string;
  done: boolean;
  claimed_by: string | null;
  sort_order: number;
};

export type WsReaction = { id: string; project_id: string; kind: string; visitor_token: string };
export type WsFollow = { id: string; project_id: string; visitor_token: string };

export const STATUSES = ["IDEA", "BUILDING", "READY", "LIVE"] as const;
export const REACTIONS: { kind: string; emoji: string; label: string }[] = [
  { kind: "fire", emoji: "🔥", label: "Fire" },
  { kind: "rocket", emoji: "🚀", label: "Ship it" },
  { kind: "heart", emoji: "❤️", label: "Love" },
  { kind: "idea", emoji: "💡", label: "Idea" },
];

/* ---------- visitor identity (no accounts) ---------- */

const TOKEN_KEY = "mq_visitor_token";
const NAME_KEY = "mq_visitor_name";

export function getVisitorToken(): string {
  if (typeof window === "undefined") return "";
  let t = localStorage.getItem(TOKEN_KEY);
  if (!t) {
    t = `v_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
    localStorage.setItem(TOKEN_KEY, t);
  }
  return t;
}

export function getVisitorName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(NAME_KEY) ?? "";
}

export function setVisitorName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NAME_KEY, name.trim().slice(0, 60));
}

/* ---------- link helpers ---------- */

export function detectLinkType(url: string): string {
  const u = url.toLowerCase();
  if (u.includes("docs.google.com/document")) return "doc";
  if (u.includes("docs.google.com/spreadsheets")) return "sheet";
  if (u.includes("docs.google.com/presentation")) return "slides";
  if (u.includes("drive.google.com")) return "drive";
  if (u.includes("figma.com")) return "figma";
  if (u.includes("github.com")) return "github";
  if (u.includes("notion.so") || u.includes("notion.site")) return "notion";
  if (u.includes("youtube.com") || u.includes("youtu.be")) return "video";
  return "site";
}

export function defaultLinkLabel(url: string): string {
  const type = detectLinkType(url);
  const map: Record<string, string> = {
    doc: "Google Doc",
    sheet: "Google Sheet",
    slides: "Google Slides",
    drive: "Google Drive",
    figma: "Figma file",
    github: "GitHub repo",
    notion: "Notion page",
    video: "Video",
    site: "Website",
  };
  if (type === "site") {
    try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return "Link"; }
  }
  return map[type] ?? "Link";
}

export function normalizeUrl(url: string): string {
  const v = url.trim();
  if (!v) return "";
  return /^https?:\/\//i.test(v) ? v : `https://${v}`;
}

export function isValidUrl(url: string): boolean {
  try { const u = new URL(normalizeUrl(url)); return !!u.hostname.includes("."); } catch { return false; }
}

/* ---------- uploads ---------- */

const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

function readAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error("Could not read the file"));
    r.readAsDataURL(file);
  });
}

/** Downscale/compress large images in the browser so uploads stay under the limit. */
async function compressImage(file: File, maxSide = 2000, quality = 0.82): Promise<string> {
  const dataUrl = await readAsDataUrl(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Could not decode image"));
      el.src = dataUrl;
    });
    const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
    const w = Math.round(img.width * scale);
    const h = Math.round(img.height * scale);
    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return dataUrl;
    ctx.drawImage(img, 0, 0, w, h);
    let out = canvas.toDataURL("image/jpeg", quality);
    if (out.length > MAX_UPLOAD_BYTES * 1.37) out = canvas.toDataURL("image/jpeg", 0.6);
    return out;
  } catch {
    return dataUrl;
  }
}

export async function uploadFile(file: File): Promise<string> {
  const isImage = file.type.startsWith("image/") && file.type !== "image/gif";
  const dataUrl =
    isImage && file.size > 2 * 1024 * 1024 ? await compressImage(file) : await readAsDataUrl(file);

  // data URLs are ~1.37x the raw byte size
  if (dataUrl.length > MAX_UPLOAD_BYTES * 1.37) {
    throw new Error(
      isImage
        ? "That image is still too large after compression. Please use a smaller file (max 25MB)."
        : "That file is too large (max 25MB). Please compress the video or paste a YouTube link instead.",
    );
  }

  const name = isImage ? file.name.replace(/\.[^.]+$/, "") : file.name;
  const res = await uploadWorkspaceMedia({ data: { fileName: name, dataUrl } });
  return res.url;
}

/* ---------- queries ---------- */

function unwrap<T>(res: { data: T | null; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message);
  return (res.data ?? []) as T;
}

export async function fetchProjects(): Promise<WsProject[]> {
  return unwrap(
    await supabase
      .from("workspace_projects")
      .select("*")
      .eq("is_hidden", false)
      .order("updated_at", { ascending: false }),
  ) as WsProject[];
}

export type ProjectStats = {
  media: number;
  links: number;
  updates: number;
  tasks: number;
  tasksDone: number;
  reactions: number;
  followers: number;
  contributors: string[];
};

export async function fetchAllStats(): Promise<Record<string, ProjectStats>> {
  const [media, links, updates, tasks, reactions, follows, projects] = await Promise.all([
    supabase.from("workspace_media").select("project_id"),
    supabase.from("workspace_links").select("project_id"),
    supabase.from("workspace_updates").select("project_id,author_name"),
    supabase.from("workspace_tasks").select("project_id,done,claimed_by"),
    supabase.from("workspace_reactions").select("project_id"),
    supabase.from("workspace_follows").select("project_id"),
    supabase.from("workspace_projects").select("id,author_name").eq("is_hidden", false),
  ]);

  const out: Record<string, ProjectStats> = {};
  const ensure = (id: string) =>
    (out[id] ??= { media: 0, links: 0, updates: 0, tasks: 0, tasksDone: 0, reactions: 0, followers: 0, contributors: [] });

  (projects.data ?? []).forEach((p: any) => {
    const s = ensure(p.id);
    if (p.author_name && !s.contributors.includes(p.author_name)) s.contributors.push(p.author_name);
  });
  (media.data ?? []).forEach((r: any) => { ensure(r.project_id).media += 1; });
  (links.data ?? []).forEach((r: any) => { ensure(r.project_id).links += 1; });
  (updates.data ?? []).forEach((r: any) => {
    const s = ensure(r.project_id);
    s.updates += 1;
    if (r.author_name && !s.contributors.includes(r.author_name)) s.contributors.push(r.author_name);
  });
  (tasks.data ?? []).forEach((r: any) => {
    const s = ensure(r.project_id);
    s.tasks += 1;
    if (r.done) s.tasksDone += 1;
    if (r.claimed_by && !s.contributors.includes(r.claimed_by)) s.contributors.push(r.claimed_by);
  });
  (reactions.data ?? []).forEach((r: any) => { ensure(r.project_id).reactions += 1; });
  (follows.data ?? []).forEach((r: any) => { ensure(r.project_id).followers += 1; });
  return out;
}

export async function fetchProject(id: string): Promise<WsProject | null> {
  const { data, error } = await supabase.from("workspace_projects").select("*").eq("id", id).maybeSingle();
  if (error) throw new Error(error.message);
  return (data as WsProject) ?? null;
}

export async function fetchMedia(projectId: string): Promise<WsMedia[]> {
  return unwrap(
    await supabase.from("workspace_media").select("*").eq("project_id", projectId).order("sort_order"),
  ) as WsMedia[];
}
export async function fetchLinks(projectId: string): Promise<WsLink[]> {
  return unwrap(
    await supabase.from("workspace_links").select("*").eq("project_id", projectId).order("sort_order"),
  ) as WsLink[];
}
export async function fetchUpdates(projectId: string): Promise<WsUpdate[]> {
  return unwrap(
    await supabase.from("workspace_updates").select("*").eq("project_id", projectId).order("created_at", { ascending: false }),
  ) as WsUpdate[];
}
export async function fetchTasks(projectId: string): Promise<WsTask[]> {
  return unwrap(
    await supabase.from("workspace_tasks").select("*").eq("project_id", projectId).order("sort_order"),
  ) as WsTask[];
}
export async function fetchReactions(projectId: string): Promise<WsReaction[]> {
  return unwrap(await supabase.from("workspace_reactions").select("*").eq("project_id", projectId)) as WsReaction[];
}
export async function fetchFollows(projectId: string): Promise<WsFollow[]> {
  return unwrap(await supabase.from("workspace_follows").select("*").eq("project_id", projectId)) as WsFollow[];
}

/* ---------- mutations ---------- */

async function logRevision(projectId: string | null, action: string, snapshot?: unknown) {
  await supabase.from("workspace_revisions").insert({
    project_id: projectId,
    actor_name: getVisitorName() || "Anonymous",
    action: action.slice(0, 60),
    snapshot: (snapshot ?? null) as never,
  });
}

export type ProjectDraft = {
  title: string;
  pitch: string;
  description: string;
  status: string;
  tags: string[];
  cover_image: string | null;
  url: string | null;
};

export async function createProject(draft: ProjectDraft, authorName: string): Promise<WsProject> {
  const { data, error } = await supabase
    .from("workspace_projects")
    .insert({ ...draft, author_name: authorName || "Anonymous", author_token: getVisitorToken() } as never)
    .select("*")
    .single();
  if (error) throw new Error(error.message);
  const project = data as WsProject;
  await supabase.from("workspace_updates").insert({
    project_id: project.id,
    author_name: authorName || "Anonymous",
    body: "created this project folder.",
    kind: "system",
  } as never);
  await logRevision(project.id, "create", draft);
  return project;
}

export async function updateProject(id: string, draft: Partial<ProjectDraft>, actor: string) {
  const { error } = await supabase.from("workspace_projects").update(draft as never).eq("id", id);
  if (error) throw new Error(error.message);
  await supabase.from("workspace_updates").insert({
    project_id: id,
    author_name: actor || "Anonymous",
    body: "updated the project details.",
    kind: "system",
  } as never);
  await logRevision(id, "update", draft);
}

export async function hideProject(id: string, actor: string) {
  const { error } = await (supabase.rpc as unknown as (fn: string, args: Record<string, unknown>) => Promise<{ error: { message: string } | null }>)(
    "hide_workspace_project",
    { _project_id: id, _actor: actor || "Anonymous" },
  );
  if (error) throw new Error(error.message);
}

export async function addMedia(projectId: string, kind: WsMedia["kind"], url: string, sortOrder: number) {
  const { error } = await supabase.from("workspace_media").insert({ project_id: projectId, kind, url, sort_order: sortOrder } as never);
  if (error) throw new Error(error.message);
}
export async function removeMedia(id: string) {
  const { error } = await supabase.from("workspace_media").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
export async function moveMedia(a: WsMedia, b: WsMedia) {
  await supabase.from("workspace_media").update({ sort_order: b.sort_order } as never).eq("id", a.id);
  await supabase.from("workspace_media").update({ sort_order: a.sort_order } as never).eq("id", b.id);
}

export async function addLink(projectId: string, url: string, label: string, sortOrder: number) {
  const clean = normalizeUrl(url);
  const { error } = await supabase.from("workspace_links").insert({
    project_id: projectId,
    url: clean,
    label: label.trim() || defaultLinkLabel(clean),
    link_type: detectLinkType(clean),
    sort_order: sortOrder,
  } as never);
  if (error) throw new Error(error.message);
}
export async function removeLink(id: string) {
  const { error } = await supabase.from("workspace_links").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function addUpdate(projectId: string, author: string, body: string, imageUrl: string | null) {
  const { error } = await supabase.from("workspace_updates").insert({
    project_id: projectId,
    author_name: author || "Anonymous",
    body: body.trim().slice(0, 4000),
    image_url: imageUrl,
    kind: "post",
  } as never);
  if (error) throw new Error(error.message);
}

export async function addTask(projectId: string, title: string, sortOrder: number) {
  const { error } = await supabase.from("workspace_tasks").insert({
    project_id: projectId,
    title: title.trim().slice(0, 200),
    sort_order: sortOrder,
  } as never);
  if (error) throw new Error(error.message);
}
export async function toggleTask(id: string, done: boolean, claimedBy: string | null) {
  const { error } = await supabase
    .from("workspace_tasks")
    .update({ done, claimed_by: done ? claimedBy || "Anonymous" : null } as never)
    .eq("id", id);
  if (error) throw new Error(error.message);
}
export async function removeTask(id: string) {
  const { error } = await supabase.from("workspace_tasks").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function toggleReaction(projectId: string, kind: string, active: boolean) {
  const token = getVisitorToken();
  if (active) {
    const { error } = await supabase.from("workspace_reactions").delete().match({ project_id: projectId, kind, visitor_token: token });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("workspace_reactions").insert({ project_id: projectId, kind, visitor_token: token } as never);
    if (error) throw new Error(error.message);
  }
}

export async function toggleFollow(projectId: string, active: boolean) {
  const token = getVisitorToken();
  if (active) {
    const { error } = await supabase.from("workspace_follows").delete().match({ project_id: projectId, visitor_token: token });
    if (error) throw new Error(error.message);
  } else {
    const { error } = await supabase.from("workspace_follows").insert({ project_id: projectId, visitor_token: token } as never);
    if (error) throw new Error(error.message);
  }
}

export function statusTone(status: string) {
  const s = (status || "").toUpperCase();
  if (s.includes("LIVE")) return "text-accent border-accent/40";
  if (s.includes("BUILD")) return "text-amber-400 border-amber-400/40";
  if (s.includes("READY")) return "text-blue-400 border-blue-400/40";
  return "text-ink-dim border-line-soft";
}
