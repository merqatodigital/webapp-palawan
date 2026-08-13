import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, ArrowUpRight, Bell, BellRing, Check, ExternalLink, Film, ImagePlus,
  Link2, Loader2, Pencil, Plus, Trash2, Users, X, Youtube,
} from "lucide-react";
import mqLogo from "@/assets/mq-logo.png";
import { AdminTrigger } from "@/components/AdminPanel";
import { WorkspaceMediaGallery } from "@/components/WorkspaceMediaGallery";
import { ProjectComments } from "@/components/ProjectComments";
import {
  REACTIONS, STATUSES,
  addLink, addMedia, addTask, addUpdate,
  fetchFollows, fetchLinks, fetchMedia, fetchProject, fetchReactions, fetchTasks, fetchUpdates,
  getVisitorName, getVisitorToken, hideProject, isValidUrl, normalizeUrl,
  removeLink, removeMedia, removeTask, setVisitorName, toggleFollow, toggleReaction, toggleTask,
  statusTone, updateProject, uploadFile,
  type WsMedia,
} from "@/lib/workspace-api";

export const Route = createFileRoute("/workspace/$projectId")({
  component: ProjectFolderPage,
  head: () => ({
    meta: [
      { title: "Project Folder — merQato.digital" },
      { name: "description", content: "An open community project folder: media, resources, updates and tasks anyone can contribute to." },
      { property: "og:title", content: "Project Folder — merQato.digital" },
      { property: "og:description", content: "An open community project folder anyone can contribute to." },
      { property: "og:type", content: "article" },
    ],
  }),
});

const inputCls =
  "w-full bg-surface/40 border border-line px-3 py-2 text-[12px] text-ink placeholder:text-ink-mute focus:outline-none focus:border-accent";
const btnGhost =
  "inline-flex items-center gap-1.5 border border-line px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink-dim hover:border-accent hover:text-accent transition-colors";
const btnAccent =
  "inline-flex items-center gap-1.5 border border-accent bg-accent/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-background transition-all disabled:opacity-50";

function Panel({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <section className="corner border border-line relative">
      <div className="c1" /><div className="c2" />
      <div className="flex items-center justify-between border-b border-line px-4 py-2.5 text-[10px] uppercase tracking-[0.14em]">
        <span className="text-accent">/ {title}</span>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function ProjectFolderPage() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const token = typeof window !== "undefined" ? getVisitorToken() : "";

  const [name, setName] = useState(getVisitorName());
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openMedia, setOpenMedia] = useState<number | null>(null);

  const projectQ = useQuery({ queryKey: ["ws-project", projectId], queryFn: () => fetchProject(projectId) });
  const mediaQ = useQuery({ queryKey: ["ws-media", projectId], queryFn: () => fetchMedia(projectId) });
  const linksQ = useQuery({ queryKey: ["ws-links", projectId], queryFn: () => fetchLinks(projectId) });
  const updatesQ = useQuery({ queryKey: ["ws-updates", projectId], queryFn: () => fetchUpdates(projectId) });
  const tasksQ = useQuery({ queryKey: ["ws-tasks", projectId], queryFn: () => fetchTasks(projectId) });
  const reactionsQ = useQuery({ queryKey: ["ws-reactions", projectId], queryFn: () => fetchReactions(projectId) });
  const followsQ = useQuery({ queryKey: ["ws-follows", projectId], queryFn: () => fetchFollows(projectId) });

  const project = projectQ.data;
  const media = mediaQ.data ?? [];
  const links = linksQ.data ?? [];
  const updates = updatesQ.data ?? [];
  const tasks = tasksQ.data ?? [];
  const reactions = reactionsQ.data ?? [];
  const follows = followsQ.data ?? [];

  const invalidate = (keys: string[]) => Promise.all(keys.map((k) => qc.invalidateQueries({ queryKey: [k, projectId] })));

  const saveName = (v: string) => { setName(v); setVisitorName(v); };
  const actor = () => name.trim() || "Anonymous";

  const run = async (fn: () => Promise<unknown>, keys: string[]) => {
    setBusy(true); setError(null);
    try { await fn(); await invalidate(keys); }
    catch (e) { setError(e instanceof Error ? e.message : "Something went wrong."); }
    finally { setBusy(false); }
  };

  /* --- edit form state --- */
  const [form, setForm] = useState({ title: "", pitch: "", description: "", status: "IDEA", tags: "", url: "" });
  const startEdit = () => {
    if (!project) return;
    setForm({
      title: project.title, pitch: project.pitch, description: project.description,
      status: project.status, tags: project.tags.join(", "), url: project.url ?? "",
    });
    setEditing(true);
  };
  const saveEdit = () =>
    run(async () => {
      if (!form.title.trim()) throw new Error("Title can't be empty.");
      if (form.url.trim() && !isValidUrl(form.url)) throw new Error("That project URL doesn't look right.");
      await updateProject(projectId, {
        title: form.title.trim().slice(0, 120),
        pitch: form.pitch.trim().slice(0, 300),
        description: form.description.trim().slice(0, 8000),
        status: form.status,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
        url: form.url.trim() ? normalizeUrl(form.url) : null,
      }, actor());
      setEditing(false);
    }, ["ws-project", "ws-updates"]);

  /* --- media --- */
  const [ytUrl, setYtUrl] = useState("");
  const onUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 10 - media.length);
    void run(async () => {
      let order = media.length;
      for (const f of list) {
        const url = await uploadFile(f);
        await addMedia(projectId, f.type.startsWith("video") ? "video" : "image", url, order++);
      }
    }, ["ws-media"]);
  };
  const addYoutube = () =>
    run(async () => {
      if (!isValidUrl(ytUrl)) throw new Error("Paste a valid video URL.");
      await addMedia(projectId, "youtube", normalizeUrl(ytUrl), media.length);
      setYtUrl("");
    }, ["ws-media"]);

  /* --- links --- */
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const submitLink = () =>
    run(async () => {
      if (!isValidUrl(linkUrl)) throw new Error("Paste a valid link (Drive, Docs, Figma, GitHub…).");
      await addLink(projectId, linkUrl, linkLabel, links.length);
      setLinkUrl(""); setLinkLabel("");
    }, ["ws-links"]);

  /* --- updates --- */
  const [updateBody, setUpdateBody] = useState("");
  const [updateImage, setUpdateImage] = useState<string | null>(null);
  const submitUpdate = () =>
    run(async () => {
      if (!updateBody.trim()) throw new Error("Write something first.");
      await addUpdate(projectId, actor(), updateBody, updateImage);
      setUpdateBody(""); setUpdateImage(null);
    }, ["ws-updates"]);

  /* --- tasks --- */
  const [taskTitle, setTaskTitle] = useState("");
  const submitTask = () =>
    run(async () => {
      if (!taskTitle.trim()) throw new Error("Task needs a title.");
      await addTask(projectId, taskTitle, tasks.length);
      setTaskTitle("");
    }, ["ws-tasks"]);

  const galleryMedia: WsMedia[] = media;
  const contributors = Array.from(new Set([
    project?.author_name ?? "",
    ...updates.map((u) => u.author_name),
    ...tasks.map((t) => t.claimed_by ?? ""),
  ].filter(Boolean)));

  const following = follows.some((f) => f.visitor_token === token);

  if (projectQ.isLoading) {
    return <main className="min-h-screen bg-background text-ink flex items-center justify-center text-[12px] text-ink-dim">Loading folder…</main>;
  }
  if (!project) {
    return (
      <main className="min-h-screen bg-background text-ink flex flex-col items-center justify-center gap-4 px-6 text-center">
        <div className="font-serif text-3xl">Folder not found</div>
        <p className="text-[12px] text-ink-dim">It may have been removed by its author.</p>
        <Link to="/workspace" className={btnAccent}>Back to workspace</Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-ink">
      <header className="px-4 md:px-6 lg:px-10 pt-5 pb-4 flex items-center justify-between text-[10px] uppercase tracking-[0.14em]">
        <Link to="/workspace" className="inline-flex items-center gap-1.5 text-ink-dim hover:text-accent transition-colors">
          <ArrowLeft className="w-3.5 h-3.5" /> All folders
        </Link>
        <Link to="/"><img src={mqLogo} alt="MQ" className="w-10 h-auto" /></Link>
      </header>

      {/* Cover + title */}
      <section className="px-4 md:px-6 lg:px-10">
        <div className="corner border border-line overflow-hidden relative">
          <div className="c1" /><div className="c2" />
          {project.cover_image && (
            <div className="aspect-[21/9] bg-surface border-b border-line overflow-hidden">
              <img src={project.cover_image} alt={project.title} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-5 md:p-8 flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-3 text-[9px] uppercase tracking-[0.14em]">
              <span className={`px-2 py-0.5 border ${statusTone(project.status)}`}>{project.status}</span>
              <span className="text-ink-mute">Started by {project.author_name}</span>
              <span className="text-ink-mute inline-flex items-center gap-1"><Users className="w-3 h-3" />{contributors.length} contributors</span>
            </div>

            {editing ? (
              <div className="flex flex-col gap-3">
                <input className={inputCls} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={120} />
                <input className={inputCls} value={form.pitch} onChange={(e) => setForm({ ...form, pitch: e.target.value })} maxLength={300} placeholder="One-line pitch" />
                <textarea className={`${inputCls} min-h-32`} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} maxLength={8000} />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select className={inputCls} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <input className={inputCls} value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tags, comma separated" />
                  <input className={inputCls} value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://project-url" />
                </div>
                <div className="flex gap-2">
                  <button className={btnAccent} disabled={busy} onClick={() => void saveEdit()}>
                    {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Save
                  </button>
                  <button className={btnGhost} onClick={() => setEditing(false)}><X className="w-3.5 h-3.5" /> Cancel</button>
                </div>
              </div>
            ) : (
              <>
                <h1 className="font-serif text-3xl md:text-5xl leading-[1.02]">{project.title}</h1>
                {project.pitch && <p className="text-[13px] text-ink-dim max-w-2xl leading-relaxed">{project.pitch}</p>}
                {project.description && <p className="text-[12px] text-ink-dim whitespace-pre-wrap leading-relaxed max-w-3xl">{project.description}</p>}
                {project.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((t) => (
                      <span key={t} className="border border-line-soft px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-ink-mute">{t}</span>
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  <button className={btnGhost} onClick={startEdit}><Pencil className="w-3.5 h-3.5" /> Edit</button>
                  {project.url && (
                    <a className={btnGhost} href={project.url} target="_blank" rel="noopener noreferrer">
                      Visit project <ArrowUpRight className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <button
                    className={following ? btnAccent : btnGhost}
                    disabled={busy}
                    onClick={() => void run(() => toggleFollow(projectId, following), ["ws-follows"])}
                  >
                    {following ? <BellRing className="w-3.5 h-3.5" /> : <Bell className="w-3.5 h-3.5" />}
                    {following ? "Following" : "Follow"} · {follows.length}
                  </button>
                  <button
                    className={`${btnGhost} hover:border-red-400 hover:text-red-400`}
                    disabled={busy}
                    onClick={() => {
                      if (!confirm("Remove this folder from the workspace? An admin can restore it.")) return;
                      void run(async () => { await hideProject(projectId, actor()); navigate({ to: "/workspace" }); }, ["ws-project"]);
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  {REACTIONS.map((r) => {
                    const mine = reactions.some((x) => x.kind === r.kind && x.visitor_token === token);
                    const count = reactions.filter((x) => x.kind === r.kind).length;
                    return (
                      <button
                        key={r.kind}
                        disabled={busy}
                        onClick={() => void run(() => toggleReaction(projectId, r.kind, mine), ["ws-reactions"])}
                        className={`inline-flex items-center gap-1.5 border px-3 py-1.5 text-[11px] transition-colors ${mine ? "border-accent text-accent bg-accent/10" : "border-line text-ink-dim hover:border-accent/40"}`}
                        aria-label={r.label}
                      >
                        <span>{r.emoji}</span><span>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 lg:px-10 pt-4">
        <div className="corner border border-line px-4 py-3 flex flex-col md:flex-row md:items-center gap-3">
          <div className="c1" /><div className="c2" />
          <span className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">Contributing as</span>
          <input className={`${inputCls} md:max-w-xs`} value={name} onChange={(e) => saveName(e.target.value)} placeholder="Your name" maxLength={60} />
          {error && <span className="text-[11px] text-red-400 md:ml-auto">{error}</span>}
        </div>
      </section>

      <div className="px-4 md:px-6 lg:px-10 py-5 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 flex flex-col gap-4">
          {/* Media */}
          <Panel
            title={`MEDIA ${media.length}/10`}
            action={
              <label className="text-ink-dim hover:text-accent cursor-pointer inline-flex items-center gap-1.5">
                <ImagePlus className="w-3.5 h-3.5" /> UPLOAD
                <input type="file" accept="image/*,video/*" multiple className="hidden" onChange={(e) => { onUpload(e.target.files); e.target.value = ""; }} />
              </label>
            }
          >
            {media.length === 0 ? (
              <p className="text-[12px] text-ink-dim">No media yet. Upload images or clips from your device, or paste a YouTube link.</p>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {media.map((m, i) => (
                  <div key={m.id} className="relative group border border-line overflow-hidden aspect-[4/3] bg-surface">
                    <button type="button" onClick={() => setOpenMedia(i)} className="w-full h-full">
                      {m.kind === "image" ? (
                        <img src={m.url} alt={m.caption ?? "Project media"} loading="lazy" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center gap-1 text-ink-dim text-[9px] uppercase tracking-[0.14em]">
                          {m.kind === "youtube" ? <Youtube className="w-5 h-5 text-accent" /> : <Film className="w-5 h-5 text-accent" />}
                          {m.kind}
                        </div>
                      )}
                    </button>
                    <button
                      onClick={() => void run(() => removeMedia(m.id), ["ws-media"])}
                      className="absolute top-1 right-1 border border-line bg-background/80 p-1 text-ink-dim hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      aria-label="Remove media"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 mt-3">
              <input className={inputCls} value={ytUrl} onChange={(e) => setYtUrl(e.target.value)} placeholder="YouTube or video URL" />
              <button className={btnGhost} disabled={busy || media.length >= 10} onClick={() => void addYoutube()}>
                <Plus className="w-3.5 h-3.5" /> Add video
              </button>
            </div>
          </Panel>

          {/* Updates */}
          <Panel title={`UPDATES ${updates.length}`}>
            <div className="flex flex-col gap-2">
              <textarea className={`${inputCls} min-h-20`} value={updateBody} onChange={(e) => setUpdateBody(e.target.value)} placeholder="Post progress, a question, or an idea…" maxLength={4000} />
              <div className="flex flex-wrap items-center gap-2">
                <label className={`${btnGhost} cursor-pointer`}>
                  <ImagePlus className="w-3.5 h-3.5" /> {updateImage ? "Image attached" : "Attach image"}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                    const f = e.target.files?.[0]; e.target.value = "";
                    if (f) void run(async () => { setUpdateImage(await uploadFile(f)); }, []);
                  }} />
                </label>
                <button className={btnAccent} disabled={busy} onClick={() => void submitUpdate()}>
                  {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />} Post update
                </button>
              </div>
            </div>
            <div className="mt-4 flex flex-col gap-3">
              {updates.map((u) => (
                <div key={u.id} className="border-l border-line-soft pl-3">
                  <div className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">
                    {u.author_name} · {new Date(u.created_at).toLocaleDateString()}
                  </div>
                  <p className={`text-[12px] leading-relaxed whitespace-pre-wrap ${u.kind === "system" ? "text-ink-mute italic" : "text-ink-dim"}`}>{u.body}</p>
                  {u.image_url && <img src={u.image_url} alt="Update" loading="lazy" className="mt-2 max-h-56 border border-line object-cover" />}
                </div>
              ))}
              {updates.length === 0 && <p className="text-[12px] text-ink-dim">No updates yet.</p>}
            </div>
          </Panel>

          <ProjectComments projectId={projectId} />
        </div>

        <div className="flex flex-col gap-4">
          {/* Links */}
          <Panel title={`RESOURCES ${links.length}`}>
            <div className="flex flex-col gap-2">
              <input className={inputCls} value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="Paste Drive / Docs / Figma / GitHub URL" />
              <div className="flex gap-2">
                <input className={inputCls} value={linkLabel} onChange={(e) => setLinkLabel(e.target.value)} placeholder="Label (optional)" maxLength={120} />
                <button className={btnGhost} disabled={busy} onClick={() => void submitLink()}><Plus className="w-3.5 h-3.5" /></button>
              </div>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {links.map((l) => (
                <li key={l.id} className="flex items-center gap-2 border border-line px-3 py-2">
                  <Link2 className="w-3.5 h-3.5 text-accent shrink-0" />
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-ink-dim hover:text-accent truncate flex-1">
                    {l.label}
                  </a>
                  <span className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">{l.link_type}</span>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="text-ink-mute hover:text-accent"><ExternalLink className="w-3 h-3" /></a>
                  <button onClick={() => void run(() => removeLink(l.id), ["ws-links"])} className="text-ink-mute hover:text-red-400" aria-label="Remove link">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
              {links.length === 0 && <li className="text-[12px] text-ink-dim">No resources linked yet.</li>}
            </ul>
          </Panel>

          {/* Tasks */}
          <Panel title={`TASKS ${tasks.filter((t) => t.done).length}/${tasks.length}`}>
            <div className="flex gap-2">
              <input className={inputCls} value={taskTitle} onChange={(e) => setTaskTitle(e.target.value)} placeholder="Add a task anyone can claim" maxLength={200} />
              <button className={btnGhost} disabled={busy} onClick={() => void submitTask()}><Plus className="w-3.5 h-3.5" /></button>
            </div>
            <ul className="mt-3 flex flex-col gap-2">
              {tasks.map((t) => (
                <li key={t.id} className="flex items-start gap-2 border border-line px-3 py-2">
                  <button
                    onClick={() => void run(() => toggleTask(t.id, !t.done, actor()), ["ws-tasks"])}
                    className={`mt-0.5 w-4 h-4 border flex items-center justify-center shrink-0 ${t.done ? "border-accent text-accent" : "border-line text-transparent"}`}
                    aria-label={t.done ? "Mark as not done" : "Mark as done"}
                  >
                    <Check className="w-3 h-3" />
                  </button>
                  <div className="flex-1">
                    <div className={`text-[12px] ${t.done ? "line-through text-ink-mute" : "text-ink-dim"}`}>{t.title}</div>
                    {t.claimed_by && <div className="text-[9px] uppercase tracking-[0.14em] text-ink-mute mt-0.5">done by {t.claimed_by}</div>}
                  </div>
                  <button onClick={() => void run(() => removeTask(t.id), ["ws-tasks"])} className="text-ink-mute hover:text-red-400" aria-label="Remove task">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </li>
              ))}
              {tasks.length === 0 && <li className="text-[12px] text-ink-dim">No tasks yet.</li>}
            </ul>
          </Panel>

          {/* Contributors */}
          <Panel title="CONTRIBUTORS">
            <div className="flex flex-wrap gap-2">
              {contributors.map((c) => (
                <span key={c} className="border border-line-soft px-2 py-1 text-[10px] text-ink-dim">{c}</span>
              ))}
            </div>
          </Panel>
        </div>
      </div>

      <footer className="px-6 lg:px-10 pt-10 pb-6 border-t border-line text-[10px] uppercase tracking-[0.14em] flex flex-wrap gap-4 justify-between">
        <Link to="/workspace" className="text-ink-dim hover:text-accent">← ALL FOLDERS</Link>
        <span className="text-ink-mute">© 2026 MERQATO.DIGITAL</span>
      </footer>

      <AdminTrigger />
      {openMedia !== null && galleryMedia.length > 0 && (
        <WorkspaceMediaGallery
          media={galleryMedia.map((m) => ({ id: m.id, kind: m.kind, url: m.url }))}
          title={project.title}
          startIndex={openMedia}
          onClose={() => setOpenMedia(null)}
        />
      )}
    </main>
  );
}
