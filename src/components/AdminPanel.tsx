import { useEffect, useRef, useState } from "react";
import { LockKeyhole, X } from "lucide-react";
import { defaultContent, useContent, type Content } from "@/store/content";
import { deleteMedia, uploadMedia } from "@/lib/content.functions";

const MAX_GALLERY = 7;
const MAX_WORKSPACE_MEDIA = 10;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

async function uploadFile(file: File, passkey: string): Promise<string> {
  const dataUrl = await fileToDataUrl(file);
  const res = await uploadMedia({
    data: { passkey, fileName: file.name, dataUrl },
  });
  return res.url;
}

function Field({
  label,
  value,
  onChange,
  area,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  area?: boolean;
}) {
  return (
    <label className="block">
      <span className="label block mb-1">{label}</span>
      {area ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          className="w-full bg-background border border-line p-2 text-ink font-mono text-[11px] focus:border-accent outline-none"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-background border border-line p-2 text-ink font-mono text-[11px] focus:border-accent outline-none"
        />
      )}
    </label>
  );
}

function ImageField({
  label,
  value,
  passkey,
  onChange,
  onDelete,
}: {
  label: string;
  value: string;
  passkey: string;
  onChange: (v: string) => void | Promise<void>;
  onDelete?: () => void | Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  return (
    <label className="block">
      <span className="label block mb-1">{label}</span>
      <div className="flex gap-2 items-center">
        {value && <img src={value} alt="" className="w-12 h-12 object-cover border border-line" />}
        <input
          type="file"
          accept="image/*"
          disabled={busy}
          onChange={async (e) => {
            const input = e.currentTarget;
            const f = input?.files?.[0];
            if (!f) return;
            setBusy(true);
            try {
              const url = await uploadFile(f, passkey);
              await onChange(url);
            } catch (err) {
              alert("Upload failed: " + (err instanceof Error ? err.message : "unknown"));
            } finally {
              setBusy(false);
              // Reset so the same file can be re-selected; guard against unmount.
              if (input && input.isConnected) {
                try { input.value = ""; } catch { /* ignore */ }
              }
            }
          }}
          className="text-[10px] text-ink-dim"
        />
        {value && onDelete && (
          <button
            type="button"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm("Delete this image from storage and remove it from the site?")) return;
              setBusy(true);
              try {
                await onDelete();
              } catch (err) {
                alert("Delete failed: " + (err instanceof Error ? err.message : "unknown"));
              } finally {
                setBusy(false);
              }
            }}
            className="label border border-line px-2 py-1 text-accent hover:border-accent disabled:opacity-50"
          >
            DELETE IMAGE
          </button>
        )}
        {busy && <span className="label text-ink-dim">SYNCING...</span>}
      </div>
    </label>
  );
}

function GalleryImages({
  item,
  passkey,
  onChange,
}: {
  item: { id: string; images?: string[] };
  passkey: string;
  onChange: (images: string[], deletedUrl?: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const images = item.images || [];
  const remaining = MAX_GALLERY - images.length;

  const addFiles = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const toUpload = Array.from(files).slice(0, remaining);
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of toUpload) {
        urls.push(await uploadFile(f, passkey));
      }
      onChange([...images, ...urls]);
    } catch (e) {
      alert("Upload failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="col-span-2 border border-line-soft p-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="label">
          gallery images ({images.length}/{MAX_GALLERY})
        </span>
        {busy && <span className="label text-ink-dim">UPLOADING...</span>}
      </div>
      <p className="text-[10px] text-ink-mute leading-snug">
        Up to {MAX_GALLERY} extra screenshots shown in the popup carousel when a visitor clicks the main image.
      </p>
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((url, gi) => (
            <div key={url + gi} className="relative w-16 h-16 border border-line">
              <img src={url} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-0 left-0 right-0 flex justify-between text-[9px] bg-background/70">
                <div className="flex">
                  <button
                    type="button"
                    disabled={gi === 0 || busy}
                    onClick={() => {
                      const arr = [...images];
                      [arr[gi - 1], arr[gi]] = [arr[gi], arr[gi - 1]];
                      onChange(arr);
                    }}
                    className="px-1 text-ink-dim hover:text-accent disabled:opacity-30"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={gi === images.length - 1 || busy}
                    onClick={() => {
                      const arr = [...images];
                      [arr[gi + 1], arr[gi]] = [arr[gi], arr[gi + 1]];
                      onChange(arr);
                    }}
                    className="px-1 text-ink-dim hover:text-accent disabled:opacity-30"
                  >
                    →
                  </button>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (!window.confirm("Remove this image?")) return;
                    onChange(images.filter((_, j) => j !== gi), url);
                  }}
                  className="px-1 text-accent"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {remaining > 0 ? (
        <input
          type="file"
          accept="image/*"
          multiple
          disabled={busy}
          onChange={(e) => {
            const input = e.currentTarget;
            void addFiles(input.files).finally(() => {
              if (input && input.isConnected) {
                try {
                  input.value = "";
                } catch {
                  /* ignore */
                }
              }
            });
          }}
          className="text-[10px] text-ink-dim"
        />
      ) : (
        <div className="label text-ink-mute">Gallery full — remove one to add more.</div>
      )}
    </div>
  );
}

function WorkspaceMediaManager({
  item,
  passkey,
  onChange,
}: {
  item: { id: string; media?: { id: string; kind: "image" | "video" | "youtube"; url: string }[] };
  passkey: string;
  onChange: (media: { id: string; kind: "image" | "video" | "youtube"; url: string }[], deletedUrl?: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [yt, setYt] = useState("");
  const media = item.media || [];
  const remaining = MAX_WORKSPACE_MEDIA - media.length;

  const addImages = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const list = Array.from(files).slice(0, remaining);
    setBusy(true);
    try {
      const next = [...media];
      for (const f of list) {
        const url = await uploadFile(f, passkey);
        next.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind: "image", url });
      }
      onChange(next);
    } catch (e) {
      alert("Upload failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally { setBusy(false); }
  };

  const addVideos = async (files: FileList | null) => {
    if (!files || !files.length) return;
    const list = Array.from(files).slice(0, remaining);
    setBusy(true);
    try {
      const next = [...media];
      for (const f of list) {
        const url = await uploadFile(f, passkey);
        next.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, kind: "video", url });
      }
      onChange(next);
    } catch (e) {
      alert("Upload failed: " + (e instanceof Error ? e.message : "unknown"));
    } finally { setBusy(false); }
  };

  const addYoutube = () => {
    const u = yt.trim();
    if (!u) return;
    if (remaining <= 0) return;
    onChange([...media, { id: `${Date.now()}`, kind: "youtube", url: u }]);
    setYt("");
  };

  return (
    <div className="col-span-2 border border-line-soft p-2 space-y-2">
      <div className="flex items-center justify-between">
        <span className="label">media — images & videos ({media.length}/{MAX_WORKSPACE_MEDIA})</span>
        {busy && <span className="label text-ink-dim">UPLOADING...</span>}
      </div>
      <p className="text-[10px] text-ink-mute leading-snug">
        Visitors click the project image to open this gallery. Up to {MAX_WORKSPACE_MEDIA} items: images, video files, or YouTube links.
      </p>
      {media.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {media.map((m, mi) => (
            <div key={m.id || mi} className="relative w-20 h-20 border border-line bg-surface">
              {m.kind === "image" ? (
                <img src={m.url} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-[0.14em] text-accent">
                  {m.kind === "youtube" ? "YT" : "VID"}
                </div>
              )}
              <div className="absolute top-0 left-0 right-0 flex justify-between text-[9px] bg-background/70">
                <div className="flex">
                  <button
                    type="button"
                    disabled={mi === 0 || busy}
                    onClick={() => {
                      const arr = [...media];
                      [arr[mi - 1], arr[mi]] = [arr[mi], arr[mi - 1]];
                      onChange(arr);
                    }}
                    className="px-1 text-ink-dim hover:text-accent disabled:opacity-30"
                  >←</button>
                  <button
                    type="button"
                    disabled={mi === media.length - 1 || busy}
                    onClick={() => {
                      const arr = [...media];
                      [arr[mi + 1], arr[mi]] = [arr[mi], arr[mi + 1]];
                      onChange(arr);
                    }}
                    className="px-1 text-ink-dim hover:text-accent disabled:opacity-30"
                  >→</button>
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    if (!window.confirm("Remove this media item?")) return;
                    const removed = media[mi];
                    const isStored = removed.kind !== "youtube";
                    onChange(media.filter((_, j) => j !== mi), isStored ? removed.url : undefined);
                  }}
                  className="px-1 text-accent"
                >✕</button>
              </div>
            </div>
          ))}
        </div>
      )}
      {remaining > 0 ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <label className="label text-ink-dim flex items-center gap-1">
              <span>+ IMAGES</span>
              <input
                type="file"
                accept="image/*"
                multiple
                disabled={busy}
                onChange={(e) => {
                  const input = e.currentTarget;
                  void addImages(input.files).finally(() => {
                    if (input && input.isConnected) { try { input.value = ""; } catch { /* ignore */ } }
                  });
                }}
                className="text-[10px] text-ink-dim"
              />
            </label>
            <label className="label text-ink-dim flex items-center gap-1">
              <span>+ VIDEO FILE</span>
              <input
                type="file"
                accept="video/*"
                multiple
                disabled={busy}
                onChange={(e) => {
                  const input = e.currentTarget;
                  void addVideos(input.files).finally(() => {
                    if (input && input.isConnected) { try { input.value = ""; } catch { /* ignore */ } }
                  });
                }}
                className="text-[10px] text-ink-dim"
              />
            </label>
          </div>
          <div className="flex gap-2 items-center">
            <input
              value={yt}
              onChange={(e) => setYt(e.target.value)}
              placeholder="https://youtube.com/watch?v=…"
              className="flex-1 bg-background border border-line p-2 text-ink font-mono text-[11px] focus:border-accent outline-none"
            />
            <button type="button" onClick={addYoutube} className="label px-3 py-2 border border-line hover:border-accent">+ YOUTUBE</button>
          </div>
        </div>
      ) : (
        <div className="label text-ink-mute">Gallery full — remove one to add more.</div>
      )}
    </div>
  );
}

export function AdminPanel({ onClose, passkey }: { onClose: () => void; passkey: string }) {
  const { content, save, saving, reset } = useContent();
  const [c, setC] = useState<Content>(content);
  const [tab, setTab] = useState<"header" | "hero" | "blog" | "portfolio" | "workspace" | "footer" | "socials" | "legal" | "pricing">("header");
  const [err, setErr] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const lastSavedJson = useRef(JSON.stringify(content));

  useEffect(() => {
    const incomingJson = JSON.stringify(content);
    setC((current) => (JSON.stringify(current) === lastSavedJson.current ? content : current));
    lastSavedJson.current = incomingJson;
  }, [content]);

  useEffect(() => {
    const json = JSON.stringify(c);
    if (json === lastSavedJson.current) return;
    const timer = window.setTimeout(async () => {
      if (json === lastSavedJson.current) return;
      setErr(null);
      setSyncing(true);
      try {
        await save(passkey, c);
        lastSavedJson.current = json;
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Auto-save failed");
      } finally {
        setSyncing(false);
      }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [c, save]);

  const handleSave = async () => {
    setErr(null);
    try {
      await save(passkey, c);
      lastSavedJson.current = JSON.stringify(c);
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
    }
  };

  const upd = <K extends keyof Content>(key: K, value: Content[K]) => setC({ ...c, [key]: value });

  const commit = async (next: Content, mediaUrlToDelete?: string) => {
    setErr(null);
    setC(next);
    setSyncing(true);
    try {
      await save(passkey, next);
      lastSavedJson.current = JSON.stringify(next);
      if (mediaUrlToDelete) {
        await deleteMedia({ data: { passkey, url: mediaUrlToDelete } });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Sync failed");
      throw e;
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 z-[100] overflow-auto">
      <div className="max-w-5xl mx-auto p-6 corner border border-line my-6 bg-surface">
        <div className="c1" />
        <div className="c2" />
        <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
          <div>
            <div className="label">/ADMIN/CMS</div>
            <h2 className="font-serif text-2xl text-ink">Content Editor</h2>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => {
                reset();
                void commit(defaultContent);
              }}
              disabled={saving || syncing}
              className="label px-3 py-2 border border-line hover:border-accent"
            >
              RESET
            </button>
            <button
              onClick={onClose}
              className="label px-3 py-2 border border-line hover:border-accent"
            >
              CANCEL
            </button>
            <button
              onClick={handleSave}
              disabled={saving || syncing}
              className="label px-3 py-2 bg-accent text-white border border-accent disabled:opacity-50"
            >
              {saving || syncing ? "SYNCING..." : "SAVE"}
            </button>
          </div>
        </div>
        {err && <div className="label text-accent mb-3">ERROR: {err}</div>}
        {!err && syncing && <div className="label text-ink-dim mb-3">SYNCING TO BACKEND...</div>}

        <div className="flex gap-1 mb-4 border-b border-line">
          {(["header", "hero", "blog", "portfolio", "workspace", "pricing", "footer", "socials", "legal"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`label px-3 py-2 ${tab === t ? "text-accent border-b border-accent -mb-px" : "text-ink-dim"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "header" && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(c.header).map(([k, v]) => (
              <Field
                key={k}
                label={k}
                value={v}
                onChange={(nv) => upd("header", { ...c.header, [k]: nv })}
              />
            ))}
          </div>
        )}

        {tab === "hero" && (
          <div className="grid grid-cols-2 gap-3">
            <ImageField
              label="background image"
              value={c.hero.image}
              passkey={passkey}
              onChange={(nv) => commit({ ...c, hero: { ...c.hero, image: nv } }, c.hero.image)}
              onDelete={() => commit({ ...c, hero: { ...c.hero, image: "" } }, c.hero.image)}
            />
            {Object.entries(c.hero)
              .filter(([k]) => k !== "image")
              .map(([k, v]) => (
                <Field
                  key={k}
                  label={k}
                  value={v as string}
                  onChange={(nv) => upd("hero", { ...c.hero, [k]: nv })}
                />
              ))}
          </div>
        )}

        {tab === "blog" && (
          <div className="space-y-4">
            <Field
              label="section title"
              value={c.blogTitle}
              onChange={(v) => upd("blogTitle", v)}
            />
            <Field label="CTA label" value={c.blogCta} onChange={(v) => upd("blogCta", v)} />
            {c.blog.map((post, i) => (
              <div key={post.id} className="border border-line p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="label">POST {i + 1}</span>
                  <button
                    onClick={() => {
                      const next = { ...c, blog: c.blog.filter((_, j) => j !== i) };
                      void commit(next, post.image);
                    }}
                    className="label text-accent"
                  >
                    DELETE
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ImageField
                    label="image"
                    value={post.image}
                    passkey={passkey}
                    onChange={(nv) =>
                      commit(
                        { ...c, blog: c.blog.map((p, j) => (j === i ? { ...p, image: nv } : p)) },
                        post.image,
                      )
                    }
                    onDelete={() =>
                      commit(
                        { ...c, blog: c.blog.map((p, j) => (j === i ? { ...p, image: "" } : p)) },
                        post.image,
                      )
                    }
                  />
                  <Field
                    label="video URL (mp4 or YouTube)"
                    value={post.videoUrl || ""}
                    onChange={(nv) =>
                      upd(
                        "blog",
                        c.blog.map((p, j) => (j === i ? { ...p, videoUrl: nv } : p)),
                      )
                    }
                  />
                  {(["category", "meta1", "meta2", "meta3", "date", "author", "readTime", "link"] as const).map((k) => (
                    <Field
                      key={k}
                      label={k}
                      value={(post[k] as string) || ""}
                      onChange={(nv) =>
                        upd(
                          "blog",
                          c.blog.map((p, j) => (j === i ? { ...p, [k]: nv } : p)),
                        )
                      }
                    />
                  ))}
                  <div className="col-span-2">
                    <Field
                      area
                      label="title"
                      value={post.title}
                      onChange={(nv) =>
                        upd(
                          "blog",
                          c.blog.map((p, j) => (j === i ? { ...p, title: nv } : p)),
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <Field
                      area
                      label="excerpt (short summary shown at top of article)"
                      value={post.excerpt || ""}
                      onChange={(nv) =>
                        upd(
                          "blog",
                          c.blog.map((p, j) => (j === i ? { ...p, excerpt: nv } : p)),
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block">
                      <span className="label block mb-1">full story (blank line separates paragraphs)</span>
                      <textarea
                        value={post.content || ""}
                        onChange={(e) =>
                          upd(
                            "blog",
                            c.blog.map((p, j) => (j === i ? { ...p, content: e.target.value } : p)),
                          )
                        }
                        rows={14}
                        className="w-full bg-background border border-line p-2 text-ink font-mono text-[11px] focus:border-accent outline-none leading-relaxed"
                      />
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const next = {
                  ...c,
                  blog: [
                  ...c.blog,
                  {
                    id: String(Date.now()),
                    category: "NEW",
                    meta1: "",
                    meta2: "",
                    meta3: "",
                    date: "",
                    title: "New post",
                    image: "",
                  },
                  ],
                };
                void commit(next);
              }}
              className="label px-3 py-2 border border-line hover:border-accent"
            >
              + ADD POST
            </button>
          </div>
        )}

        {tab === "portfolio" && (
          <div className="space-y-4">
            <Field
              label="section title"
              value={c.portfolioTitle}
              onChange={(v) => upd("portfolioTitle", v)}
            />
            {c.portfolio.map((item, i) => (
              <div key={item.id} className="border border-line p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="label">
                    {item.index} — {item.name}
                  </span>
                  <div className="flex gap-2">
                    <button
                      disabled={i === 0}
                      onClick={() => {
                        const arr = [...c.portfolio];
                        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                        void commit({ ...c, portfolio: arr });
                      }}
                      className="label disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      disabled={i === c.portfolio.length - 1}
                      onClick={() => {
                        const arr = [...c.portfolio];
                        [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                        void commit({ ...c, portfolio: arr });
                      }}
                      className="label disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => {
                        const next = { ...c, portfolio: c.portfolio.filter((_, j) => j !== i) };
                        void commit(next, item.image);
                      }}
                      className="label text-accent"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ImageField
                    label="image"
                    value={item.image}
                    passkey={passkey}
                    onChange={(nv) =>
                      commit(
                        { ...c, portfolio: c.portfolio.map((p, j) => (j === i ? { ...p, image: nv } : p)) },
                        item.image,
                      )
                    }
                    onDelete={() =>
                      commit(
                        { ...c, portfolio: c.portfolio.map((p, j) => (j === i ? { ...p, image: "" } : p)) },
                        item.image,
                      )
                    }
                  />
                  <GalleryImages
                    item={item}
                    passkey={passkey}
                    onChange={(images, deletedUrl) =>
                      commit(
                        { ...c, portfolio: c.portfolio.map((p, j) => (j === i ? { ...p, images } : p)) },
                        deletedUrl,
                      )
                    }
                  />
                  {(
                    [
                      "index",
                      "name",
                      "category",
                      "tag",
                      "status",
                      "deployedDate",
                      "deployedVersion",
                      "environment",
                      "environmentLoc",
                      "role",
                      "roleType",
                      "link",
                      "url",
                    ] as const
                  ).map((k) => (
                    <Field
                      key={k}
                      label={k}
                      value={item[k] as string}
                      onChange={(nv) =>
                        upd(
                          "portfolio",
                          c.portfolio.map((p, j) => (j === i ? { ...p, [k]: nv } : p)),
                        )
                      }
                    />
                  ))}
                  <div className="col-span-2">
                    <Field
                      area
                      label="description"
                      value={item.description}
                      onChange={(nv) =>
                        upd(
                          "portfolio",
                          c.portfolio.map((p, j) => (j === i ? { ...p, description: nv } : p)),
                        )
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const next = {
                  ...c,
                  portfolio: [
                    ...c.portfolio,
                    {
                      id: String(Date.now()),
                      index: String(c.portfolio.length + 1).padStart(2, "0"),
                      image: "",
                      name: "NEW.APP",
                      category: "CATEGORY",
                      tag: "TAG",
                      description: "",
                      status: "LIVE\nACTIVE",
                      deployedDate: "",
                      deployedVersion: "",
                      environment: "CLOUD",
                      environmentLoc: "",
                      role: "FOUNDER",
                      roleType: "FULLSTACK",
                      link: "",
                      url: "",
                    },
                  ],
                };
                void commit(next);
              }}
              className="label px-3 py-2 border border-line hover:border-accent"
            >
              + ADD APP
            </button>
          </div>
        )}

        {tab === "workspace" && (
          <div className="space-y-4">
            <div className="label text-ink-dim">
              Working projects shown on the /workspace page. Upload an image, add a title and description for each.
            </div>
            {(c.workProjects || []).map((item, i) => (
              <div key={item.id} className="border border-line p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="label">{String(i + 1).padStart(2, "0")} — {item.title || "UNTITLED"}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={i === 0}
                      onClick={() => {
                        const arr = [...c.workProjects];
                        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                        void commit({ ...c, workProjects: arr });
                      }}
                      className="label disabled:opacity-30"
                    >↑</button>
                    <button
                      disabled={i === c.workProjects.length - 1}
                      onClick={() => {
                        const arr = [...c.workProjects];
                        [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                        void commit({ ...c, workProjects: arr });
                      }}
                      className="label disabled:opacity-30"
                    >↓</button>
                    <button
                      onClick={() => {
                        const next = { ...c, workProjects: c.workProjects.filter((_, j) => j !== i) };
                        void commit(next, item.image);
                      }}
                      className="label text-accent"
                    >DELETE</button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <ImageField
                    label="image"
                    value={item.image}
                    passkey={passkey}
                    onChange={(nv) =>
                      commit(
                        { ...c, workProjects: c.workProjects.map((p, j) => (j === i ? { ...p, image: nv } : p)) },
                        item.image,
                      )
                    }
                    onDelete={() =>
                      commit(
                        { ...c, workProjects: c.workProjects.map((p, j) => (j === i ? { ...p, image: "" } : p)) },
                        item.image,
                      )
                    }
                  />
                  {(["title", "tag", "status", "url"] as const).map((k) => (
                    <Field
                      key={k}
                      label={k}
                      value={(item[k] as string) || ""}
                      onChange={(nv) =>
                        upd(
                          "workProjects",
                          c.workProjects.map((p, j) => (j === i ? { ...p, [k]: nv } : p)),
                        )
                      }
                    />
                  ))}
                  <div className="col-span-2">
                    <Field
                      area
                      label="description"
                      value={item.description}
                      onChange={(nv) =>
                        upd(
                          "workProjects",
                          c.workProjects.map((p, j) => (j === i ? { ...p, description: nv } : p)),
                        )
                      }
                    />
                  </div>
                  <WorkspaceMediaManager
                    item={item}
                    passkey={passkey}
                    onChange={(media, deletedUrl) =>
                      commit(
                        { ...c, workProjects: c.workProjects.map((p, j) => (j === i ? { ...p, media } : p)) },
                        deletedUrl,
                      )
                    }
                  />
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const next = {
                  ...c,
                  workProjects: [
                    ...(c.workProjects || []),
                    {
                      id: String(Date.now()),
                      image: "",
                      title: "NEW PROJECT",
                      description: "",
                      status: "BUILDING",
                      tag: "WORK",
                      url: "",
                    },
                  ],
                };
                void commit(next);
              }}
              className="label px-3 py-2 border border-line hover:border-accent"
            >+ ADD PROJECT</button>
          </div>
        )}
        {tab === "pricing" && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field
                label="section title"
                value={c.pricingTitle}
                onChange={(v) => upd("pricingTitle", v)}
              />
              <Field
                label="section subtitle"
                value={c.pricingSubtitle}
                onChange={(v) => upd("pricingSubtitle", v)}
              />
            </div>
            {c.pricing.map((tier, i) => (
              <div key={tier.id} className="border border-line p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="label">{tier.name}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={i === 0}
                      onClick={() => {
                        const arr = [...c.pricing];
                        [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]];
                        void commit({ ...c, pricing: arr });
                      }}
                      className="label disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      disabled={i === c.pricing.length - 1}
                      onClick={() => {
                        const arr = [...c.pricing];
                        [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]];
                        void commit({ ...c, pricing: arr });
                      }}
                      className="label disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => {
                        const next = { ...c, pricing: c.pricing.filter((_, j) => j !== i) };
                        void commit(next);
                      }}
                      className="label text-accent"
                    >
                      DELETE
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Field
                    label="plan name"
                    value={tier.name}
                    onChange={(nv) =>
                      upd(
                        "pricing",
                        c.pricing.map((p, j) => (j === i ? { ...p, name: nv } : p)),
                      )
                    }
                  />
                  <Field
                    label="price"
                    value={tier.price}
                    onChange={(nv) =>
                      upd(
                        "pricing",
                        c.pricing.map((p, j) => (j === i ? { ...p, price: nv } : p)),
                      )
                    }
                  />
                  <Field
                    label="period"
                    value={tier.period}
                    onChange={(nv) =>
                      upd(
                        "pricing",
                        c.pricing.map((p, j) => (j === i ? { ...p, period: nv } : p)),
                      )
                    }
                  />
                  <Field
                    label="button text"
                    value={tier.buttonText}
                    onChange={(nv) =>
                      upd(
                        "pricing",
                        c.pricing.map((p, j) => (j === i ? { ...p, buttonText: nv } : p)),
                      )
                    }
                  />
                  <div className="col-span-2">
                    <Field
                      area
                      label="description"
                      value={tier.desc}
                      onChange={(nv) =>
                        upd(
                          "pricing",
                          c.pricing.map((p, j) => (j === i ? { ...p, desc: nv } : p)),
                        )
                      }
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block">
                      <span className="label block mb-1">features (one per line)</span>
                      <textarea
                        value={tier.features.join("\n")}
                        onChange={(e) =>
                          upd(
                            "pricing",
                            c.pricing.map((p, j) =>
                              j === i ? { ...p, features: e.target.value.split("\n").filter(Boolean) } : p,
                            ),
                          )
                        }
                        rows={5}
                        className="w-full bg-background border border-line p-2 text-ink font-mono text-[11px] focus:border-accent outline-none"
                      />
                    </label>
                  </div>
                  <div className="col-span-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={tier.highlighted}
                        onChange={(e) =>
                          upd(
                            "pricing",
                            c.pricing.map((p, j) =>
                              j === i ? { ...p, highlighted: e.target.checked } : p,
                            ),
                          )
                        }
                        className="accent-accent"
                      />
                      <span className="label">Recommended / Highlighted</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => {
                const next = {
                  ...c,
                  pricing: [
                    ...c.pricing,
                    {
                      id: String(Date.now()),
                      name: "New Plan",
                      price: "₱0",
                      period: "per month",
                      desc: "Describe this plan",
                      features: ["Feature 1", "Feature 2"],
                      highlighted: false,
                      buttonText: "Get Started",
                      buttonLink: "#contact-form",
                    },
                  ],
                };
                void commit(next);
              }}
              className="label px-3 py-2 border border-line hover:border-accent"
            >
              + ADD PLAN
            </button>
          </div>
        )}

        {tab === "footer" && (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(c.footer)
              .filter(([k]) => k !== "socials")
              .map(([k, v]) => (
                <Field
                  key={k}
                  label={k}
                  value={v as string}
                  onChange={(nv) => upd("footer", { ...c.footer, [k]: nv })}
                />
              ))}
          </div>
        )}

        {tab === "socials" && (
          <div className="space-y-3">
            <div className="label text-ink-dim">
              Platforms: github, twitter, instagram, linkedin, facebook, youtube, tiktok, mail, website, triangle
            </div>
            {(c.footer.socials || []).map((s, i) => (
              <div key={s.id} className="border border-line p-3 grid grid-cols-12 gap-2 items-end">
                <div className="col-span-3">
                  <Field
                    label="platform"
                    value={s.platform}
                    onChange={(nv) =>
                      upd("footer", {
                        ...c.footer,
                        socials: c.footer.socials.map((x, j) => (j === i ? { ...x, platform: nv } : x)),
                      })
                    }
                  />
                </div>
                <div className="col-span-3">
                  <Field
                    label="label"
                    value={s.label || ""}
                    onChange={(nv) =>
                      upd("footer", {
                        ...c.footer,
                        socials: c.footer.socials.map((x, j) => (j === i ? { ...x, label: nv } : x)),
                      })
                    }
                  />
                </div>
                <div className="col-span-5">
                  <Field
                    label="url"
                    value={s.url}
                    onChange={(nv) =>
                      upd("footer", {
                        ...c.footer,
                        socials: c.footer.socials.map((x, j) => (j === i ? { ...x, url: nv } : x)),
                      })
                    }
                  />
                </div>
                <button
                  onClick={() => {
                    void commit({
                      ...c,
                      footer: { ...c.footer, socials: c.footer.socials.filter((_, j) => j !== i) },
                    });
                  }}
                  className="col-span-1 label text-accent border border-line py-2"
                >
                  DEL
                </button>
              </div>
            ))}
            <button
              onClick={() => {
                void commit({
                  ...c,
                  footer: {
                    ...c.footer,
                    socials: [
                      ...(c.footer.socials || []),
                      { id: String(Date.now()), platform: "github", url: "https://", label: "" },
                    ],
                  },
                });
              }}
              className="label px-3 py-2 border border-line hover:border-accent"
            >
              + ADD SOCIAL
            </button>
          </div>
        )}

        {tab === "legal" && (
          <div className="space-y-4">
            <div className="label text-ink-dim">
              HTML allowed. Edit placeholders in [brackets]. Pages: /privacy, /terms, /disclaimer.
            </div>
            {(
              [
                ["privacy", "Privacy Policy (HTML)"],
                ["terms", "Terms of Service (HTML)"],
                ["disclaimer", "Disclaimer (HTML)"],
                ["footerSnippet", "Footer copy snippet (HTML reference)"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="block">
                <span className="label block mb-1">{label}</span>
                <textarea
                  value={c.legal?.[k] || ""}
                  onChange={(e) => upd("legal", { ...c.legal, [k]: e.target.value })}
                  rows={14}
                  className="w-full bg-background border border-line p-2 text-ink font-mono text-[11px] focus:border-accent outline-none leading-relaxed"
                />
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminTrigger() {
  const [open, setOpen] = useState(false);
  const [askKey, setAskKey] = useState(false);
  const [val, setVal] = useState("");
  const [passkey, setPasskey] = useState("");
  const [error, setError] = useState(false);

  const unlock = () => {
    if (val.trim()) {
      setPasskey(val);
      setOpen(true);
      setAskKey(false);
      setVal("");
      setError(false);
      return;
    }
    setVal("");
    setError(true);
  };

  const closePasskey = () => {
    setAskKey(false);
    setVal("");
    setError(false);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault();
        setAskKey(true);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label="Open admin login"
        onClick={() => {
          setAskKey(true);
          setError(false);
        }}
        className="fixed bottom-4 right-4 z-50 flex h-10 items-center gap-2 border border-line bg-surface/95 px-3 text-[10px] uppercase tracking-[0.14em] text-ink shadow-[0_12px_30px_rgba(0,0,0,0.35)] backdrop-blur hover:border-accent hover:text-accent sm:bottom-5 sm:right-5"
      >
        <LockKeyhole className="h-3.5 w-3.5" />
        <span>Admin Login</span>
      </button>
      {askKey && (
        <div className="fixed inset-0 bg-background/92 z-[200] flex items-center justify-center px-4">
          <div className="corner border border-line p-5 sm:p-6 bg-surface w-full max-w-[340px] shadow-[0_24px_80px_rgba(0,0,0,0.5)]">
            <div className="c1" />
            <div className="c2" />
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <div className="label mb-1">/ADMIN/LOGIN</div>
                <h2 className="font-serif text-2xl leading-none text-ink">Access Passkey</h2>
              </div>
              <button
                type="button"
                aria-label="Close admin login"
                onClick={closePasskey}
                className="border border-line-soft p-2 text-ink-dim hover:border-accent hover:text-accent"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <input
              type="password"
              autoFocus
              value={val}
              onChange={(e) => {
                setVal(e.target.value);
                setError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  unlock();
                }
                if (e.key === "Escape") closePasskey();
              }}
              className={`w-full bg-background border p-3 text-ink font-mono text-lg tracking-[0.4em] outline-none focus:border-accent ${error ? "border-accent" : "border-line"}`}
              placeholder="••••"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <div className={`label ${error ? "text-accent" : "label-mute"}`}>
                {error ? "INVALID PASSKEY" : "PASSKEY REQUIRED"}
              </div>
              <button
                type="button"
                onClick={unlock}
                className="label border border-accent bg-accent px-3 py-2 text-background hover:bg-accent-dim"
              >
                Unlock
              </button>
            </div>
          </div>
        </div>
      )}
      {open && <AdminPanel passkey={passkey} onClose={() => setOpen(false)} />}
    </>
  );
}
