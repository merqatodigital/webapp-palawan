import { useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowUpRight, Layers, Mail, Plus, Search, Users, ListChecks, MessageSquare, Loader2 } from "lucide-react";
import mqLogo from "@/assets/mq-logo.png";
import { AdminTrigger } from "@/components/AdminPanel";
import {
  STATUSES,
  createProject,
  fetchAllStats,
  fetchProjects,
  getVisitorName,
  isValidUrl,
  normalizeUrl,
  setVisitorName,
  uploadFile,
} from "@/lib/workspace-api";

export const Route = createFileRoute("/workspace")({
  component: WorkspacePage,
  head: () => ({
    meta: [
      { title: "Community Project Folders — merQato.digital" },
      { name: "description", content: "Open workspace where anyone can create, edit and contribute to live projects being built in Palawan." },
      { property: "og:title", content: "Community Project Folders — merQato.digital" },
      { property: "og:description", content: "Open workspace where anyone can create, edit and contribute to live projects." },
      { property: "og:type", content: "website" },
    ],
  }),
});

function MQLogo({ className = "" }: { className?: string }) {
  return <img src={mqLogo} alt="MQ" className={className} />;
}

function WorkspaceHeader() {
  return (
    <header className="px-4 md:px-6 lg:px-10 pt-5 md:pt-6 pb-4">
      <div className="grid grid-cols-12 gap-3 md:gap-4 text-[10px] uppercase tracking-[0.14em]">
        <div className="col-span-6 md:col-span-4">
          <Link to="/" className="hover:text-accent transition-colors">
            <div className="text-ink">MERQATO.DIGITAL</div>
            <div className="text-ink-mute mt-0.5 text-[9px] md:text-[10px]">DIGITAL INFRASTRUCTURE STUDIO</div>
          </Link>
        </div>
        <div className="col-span-6 md:col-span-4 flex justify-end md:justify-center items-start gap-4 md:gap-6">
          <Link to="/" className="text-ink-dim hover:text-accent transition-colors">HOME</Link>
          <Link to="/agents" className="text-ink-dim hover:text-accent transition-colors">OPERATORS</Link>
          <span className="text-accent border-b border-accent">WORKSPACE</span>
        </div>
        <div className="hidden md:flex col-span-4 justify-end">
          <MQLogo className="w-12 h-auto" />
        </div>
      </div>
    </header>
  );
}

export function statusTone(status: string) {
  const s = (status || "").toUpperCase();
  if (s.includes("LIVE")) return "text-accent border-accent/40";
  if (s.includes("BUILD")) return "text-amber-400 border-amber-400/40";
  if (s.includes("READY")) return "text-blue-400 border-blue-400/40";
  return "text-ink-dim border-line-soft";
}

const inputCls =
  "w-full bg-surface/40 border border-line px-3 py-2 text-[12px] text-ink placeholder:text-ink-mute focus:outline-none focus:border-accent";

function NewProjectDialog({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [name, setName] = useState(getVisitorName());
  const [title, setTitle] = useState("");
  const [pitch, setPitch] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string>("IDEA");
  const [tags, setTags] = useState("");
  const [url, setUrl] = useState("");
  const [cover, setCover] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!title.trim()) { setError("Give the project a title."); return; }
    if (url.trim() && !isValidUrl(url)) { setError("That project URL doesn't look right."); return; }
    setBusy(true);
    setError(null);
    try {
      setVisitorName(name);
      const project = await createProject(
        {
          title: title.trim().slice(0, 120),
          pitch: pitch.trim().slice(0, 300),
          description: description.trim().slice(0, 8000),
          status,
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 8),
          cover_image: cover,
          url: url.trim() ? normalizeUrl(url) : null,
        },
        name.trim() || "Anonymous",
      );
      await qc.invalidateQueries({ queryKey: ["ws-projects"] });
      onClose();
      navigate({ to: "/workspace/$projectId", params: { projectId: project.id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not create the project.");
    } finally {
      setBusy(false);
    }
  };

  const onCover = async (file: File) => {
    setBusy(true);
    setError(null);
    try { setCover(await uploadFile(file)); }
    catch (e) { setError(e instanceof Error ? e.message : "Upload failed."); }
    finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 z-[80] bg-background/90 backdrop-blur-sm overflow-y-auto p-4 md:p-8">
      <div className="max-w-xl mx-auto corner border border-line bg-background relative">
        <div className="c1" /><div className="c2" />
        <div className="flex items-center justify-between border-b border-line px-5 py-3 text-[10px] uppercase tracking-[0.14em]">
          <span className="text-accent">/ NEW PROJECT FOLDER</span>
          <button onClick={onClose} className="text-ink-dim hover:text-accent">CLOSE</button>
        </div>
        <div className="p-5 flex flex-col gap-3">
          <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">Your name</label>
          <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Anonymous" maxLength={60} />

          <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">Project title *</label>
          <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} maxLength={120} placeholder="Digital nomad ecosystem" />

          <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">One-line pitch</label>
          <input className={inputCls} value={pitch} onChange={(e) => setPitch(e.target.value)} maxLength={300} placeholder="What is it, in one sentence?" />

          <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">Description</label>
          <textarea className={`${inputCls} min-h-28`} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={8000} />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">Status</label>
              <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value)}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">Tags (comma separated)</label>
              <input className={inputCls} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="community, palawan" />
            </div>
          </div>

          <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">Project URL (optional)</label>
          <input className={inputCls} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://" />

          <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">Cover image</label>
          <div className="flex items-center gap-3">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) void onCover(f); }}
              className="text-[11px] text-ink-dim file:mr-3 file:border file:border-line file:bg-surface/40 file:px-3 file:py-1.5 file:text-[10px] file:uppercase file:tracking-[0.14em] file:text-ink-dim"
            />
            {cover && <img src={cover} alt="Cover preview" className="w-16 h-10 object-cover border border-line" />}
          </div>

          {error && <div className="text-[11px] text-red-400">{error}</div>}

          <button
            onClick={() => void submit()}
            disabled={busy}
            className="mt-2 inline-flex items-center justify-center gap-2 border border-accent bg-accent/10 px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-background transition-all disabled:opacity-50"
          >
            {busy ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Create folder
          </button>
        </div>
      </div>
    </div>
  );
}

function WorkspacePage() {
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const projectsQ = useQuery({ queryKey: ["ws-projects"], queryFn: fetchProjects });
  const statsQ = useQuery({ queryKey: ["ws-stats"], queryFn: fetchAllStats });

  const projects = projectsQ.data ?? [];
  const stats = statsQ.data ?? {};

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return projects.filter((p) => {
      if (statusFilter !== "ALL" && (p.status || "").toUpperCase() !== statusFilter) return false;
      if (!q) return true;
      return [p.title, p.pitch, p.description, p.tags.join(" "), p.author_name].join(" ").toLowerCase().includes(q);
    });
  }, [projects, query, statusFilter]);

  return (
    <main className="min-h-screen bg-background text-ink">
      <WorkspaceHeader />

      <section className="px-4 md:px-6 lg:px-10 pt-4">
        <div className="corner border border-line relative overflow-hidden">
          <div className="c1" /><div className="c2" />
          <div className="relative py-10 md:py-16 px-6 md:px-10 text-center">
            <div className="label text-[9px] md:text-[10px] mb-3 text-accent">— OPEN WORKSPACE —</div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-6xl text-ink leading-[0.95]">Community Project Folders</h1>
            <p className="mt-4 max-w-xl mx-auto text-ink-dim text-[11px] md:text-[12px] leading-relaxed">
              Anyone can open a folder, drop in media and Drive links, post updates and claim tasks.
              No account needed — just add your name and start building with us.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => setCreating(true)}
                className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-background transition-all"
              >
                <Plus className="w-3.5 h-3.5" /> New project
              </button>
              <div className="inline-flex items-center gap-2 border border-line bg-surface/30 px-3 py-2 text-[9px] uppercase tracking-[0.14em]">
                <Layers className="w-3.5 h-3.5 text-accent" />
                <span className="text-ink-dim">FOLDERS</span>
                <span className="text-accent">{projects.length.toString().padStart(2, "0")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 lg:px-10 pt-5">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-ink-mute absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search projects, tags, people…"
              className={`${inputCls} pl-9`}
            />
          </div>
          <div className="flex flex-wrap gap-2 text-[9px] uppercase tracking-[0.14em]">
            {["ALL", ...STATUSES].map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-2 border transition-colors ${statusFilter === s ? "border-accent text-accent bg-accent/10" : "border-line text-ink-dim hover:text-accent hover:border-accent/40"}`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 md:px-6 lg:px-10 pt-5 pb-12">
        {projectsQ.isLoading ? (
          <div className="corner border border-line p-10 text-center text-ink-dim text-[12px]">
            <div className="c1" /><div className="c2" />
            Loading project folders…
          </div>
        ) : projectsQ.isError ? (
          <div className="corner border border-line p-10 text-center text-red-400 text-[12px]">
            <div className="c1" /><div className="c2" />
            Could not load projects. Refresh to try again.
          </div>
        ) : filtered.length === 0 ? (
          <div className="corner border border-line p-10 text-center text-ink-dim text-[12px]">
            <div className="c1" /><div className="c2" />
            No folders match. Start the first one with <span className="text-accent">New project</span>.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((p, i) => {
              const s = stats[p.id];
              return (
                <Link
                  key={p.id}
                  to="/workspace/$projectId"
                  params={{ projectId: p.id }}
                  className="corner border border-line overflow-hidden flex flex-col group hover:border-accent/40 transition-colors"
                >
                  <div className="c1" /><div className="c2" />
                  <div className="aspect-[16/10] bg-surface overflow-hidden border-b border-line">
                    {p.cover_image ? (
                      <img src={p.cover_image} alt={p.title} loading="lazy" className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-mute text-[10px] uppercase tracking-[0.14em]">No cover yet</div>
                    )}
                  </div>
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.14em]">
                      <span className="text-ink-mute">{String(i + 1).padStart(2, "0")} · {p.author_name}</span>
                      <span className={`px-2 py-0.5 border ${statusTone(p.status)}`}>{p.status || "—"}</span>
                    </div>
                    <h2 className="font-serif text-xl md:text-2xl text-ink leading-tight">{p.title}</h2>
                    {p.pitch && <p className="text-[12px] text-ink-dim leading-relaxed flex-1">{p.pitch}</p>}
                    {p.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {p.tags.map((t) => (
                          <span key={t} className="border border-line-soft px-2 py-0.5 text-[9px] uppercase tracking-[0.14em] text-ink-mute">{t}</span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-4 text-[9px] uppercase tracking-[0.14em] text-ink-mute pt-1 border-t border-line-soft">
                      <span className="inline-flex items-center gap-1"><MessageSquare className="w-3 h-3" />{s?.updates ?? 0}</span>
                      <span className="inline-flex items-center gap-1"><ListChecks className="w-3 h-3" />{s?.tasksDone ?? 0}/{s?.tasks ?? 0}</span>
                      <span className="inline-flex items-center gap-1"><Users className="w-3 h-3" />{s?.contributors.length ?? 1}</span>
                      <span className="ml-auto text-accent inline-flex items-center gap-1">OPEN <ArrowUpRight className="w-3 h-3" /></span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <section className="px-4 md:px-6 lg:px-10 pb-6">
        <div className="corner border border-accent/40 relative overflow-hidden p-8 md:p-12 text-center">
          <div className="c1" /><div className="c2" />
          <div className="label text-accent mb-3">/ BUILD WITH US</div>
          <h2 className="font-serif text-2xl md:text-4xl text-ink max-w-xl mx-auto leading-[1.05]">Open a folder, add value, ship it</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-background transition-all">
              New project <Plus className="w-3.5 h-3.5" />
            </button>
            <a href="mailto:hello@merqato.digital" className="inline-flex items-center gap-2 border border-line px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-ink-dim hover:border-accent hover:text-accent transition-all">
              Contact Team <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </section>

      <footer className="px-6 lg:px-10 pt-12 pb-6 mt-4 border-t border-line">
        <div className="grid grid-cols-12 gap-4 items-center text-[10px] uppercase tracking-[0.14em]">
          <div className="col-span-12 md:col-span-4">
            <div className="text-ink">MERQATO.DIGITAL</div>
            <div className="text-ink-mute mt-0.5">COMMUNITY WORKSPACE</div>
          </div>
          <div className="col-span-12 md:col-span-4 flex items-center justify-center gap-4">
            <Link to="/" className="text-ink-dim hover:text-accent transition-colors">HOME</Link>
            <Link to="/agents" className="text-ink-dim hover:text-accent transition-colors">OPERATORS</Link>
            <span className="text-accent">WORKSPACE</span>
          </div>
          <div className="col-span-12 md:col-span-4 md:text-right">
            <div className="text-ink">© 2026 MERQATO.DIGITAL</div>
            <div className="text-ink-mute mt-0.5">ALL SYSTEMS RESERVED</div>
          </div>
        </div>
      </footer>

      <AdminTrigger />
      {creating && <NewProjectDialog onClose={() => setCreating(false)} />}
    </main>
  );
}
