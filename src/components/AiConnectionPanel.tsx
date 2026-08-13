import { useEffect, useState } from "react";
import { Check, Copy, ExternalLink, Loader2, RefreshCw, Settings2, X } from "lucide-react";
import {
  DEFAULT_CONNECTION, OLLAMA_CORS_HINT, connectionLabel, isConfigured,
  listOllamaModels, listOpenRouterModels, loadConnection, saveConnection,
  testOllama, testOpenRouter,
  type AiConnection, type ModelOption, type ProbeState, type ProviderId,
} from "@/lib/ai-connection";

const input =
  "w-full bg-surface/40 border border-line px-3 py-2 text-[12px] text-ink placeholder:text-ink-mute focus:outline-none focus:border-accent";
const btn =
  "inline-flex items-center gap-1.5 border border-line px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-ink-dim hover:border-accent hover:text-accent transition-colors disabled:opacity-50";
const btnOn =
  "inline-flex items-center gap-1.5 border border-accent bg-accent/10 px-3 py-2 text-[10px] uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-background transition-all disabled:opacity-50";

export function StatusDot({ state }: { state: ProbeState }) {
  const cls =
    state === "ok" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
    : state === "testing" ? "bg-amber-400 animate-pulse"
    : state === "error" ? "bg-red-400"
    : "bg-ink-mute/50";
  return <span className={`inline-block w-2 h-2 rounded-full ${cls}`} aria-hidden />;
}

function useProbe() {
  const [state, setState] = useState<ProbeState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const run = async (fn: () => Promise<unknown>, okMsg: string) => {
    setState("testing"); setMessage(null);
    try { await fn(); setState("ok"); setMessage(okMsg); }
    catch (e) { setState("error"); setMessage(e instanceof Error ? e.message : "Failed."); }
  };
  return { state, message, run, reset: () => { setState("idle"); setMessage(null); } };
}

export function AiConnectionPanel({ onClose }: { onClose: () => void }) {
  const [conn, setConn] = useState<AiConnection>(DEFAULT_CONNECTION);
  const [models, setModels] = useState<ModelOption[]>([]);
  const [showAll, setShowAll] = useState(false);
  const [loadingModels, setLoadingModels] = useState(false);
  const [modelError, setModelError] = useState<string | null>(null);
  const [ollamaModels, setOllamaModels] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);

  const or = useProbe();
  const ol = useProbe();

  useEffect(() => { setConn(loadConnection()); }, []);

  const update = (patch: Partial<AiConnection>) => {
    setConn((prev) => { const next = { ...prev, ...patch }; saveConnection(next); return next; });
  };

  const setProvider = (provider: ProviderId) => update({ provider });

  const loadModels = async (force = false) => {
    setLoadingModels(true); setModelError(null);
    try { setModels(await listOpenRouterModels(force)); }
    catch (e) { setModelError(e instanceof Error ? e.message : "Could not load models."); }
    finally { setLoadingModels(false); }
  };

  useEffect(() => { if (conn.provider === "openrouter" && models.length === 0) void loadModels(); }, [conn.provider]);

  const detectOllama = async () => {
    ol.reset();
    try {
      const list = await listOllamaModels(conn.ollamaUrl);
      setOllamaModels(list);
      if (!conn.ollamaModel || !list.includes(conn.ollamaModel)) update({ ollamaModel: list[0] });
    } catch (e) {
      setOllamaModels([]);
      ol.run(() => Promise.reject(e), "");
    }
  };

  const visible = showAll ? models : models.filter((m) => m.free);
  const selected = models.find((m) => m.id === conn.openrouterModel);

  const Row = ({ id, title, desc, dot, children }: {
    id: ProviderId; title: string; desc: string; dot: ProbeState; children?: React.ReactNode;
  }) => {
    const active = conn.provider === id;
    return (
      <div className={`border p-4 transition-colors ${active ? "border-accent/50 bg-accent/5" : "border-line"}`}>
        <button onClick={() => setProvider(id)} className="w-full flex items-start gap-3 text-left">
          <span className={`mt-1 w-3 h-3 border shrink-0 ${active ? "border-accent bg-accent" : "border-line"}`} />
          <span className="flex-1">
            <span className="flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-ink">
              {title} <StatusDot state={dot} />
            </span>
            <span className="block text-[11px] text-ink-dim mt-1 leading-relaxed">{desc}</span>
          </span>
        </button>
        {active && children && <div className="mt-4 flex flex-col gap-2">{children}</div>}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-[90] bg-background/90 backdrop-blur-sm overflow-y-auto p-4 md:p-8">
      <div className="max-w-lg mx-auto corner border border-line bg-background relative">
        <div className="c1" /><div className="c2" />
        <div className="flex items-center justify-between border-b border-line px-5 py-3 text-[10px] uppercase tracking-[0.14em]">
          <span className="text-accent">/ AI CONNECTION</span>
          <button onClick={onClose} className="text-ink-dim hover:text-accent inline-flex items-center gap-1">
            <X className="w-3.5 h-3.5" /> CLOSE
          </button>
        </div>

        <div className="p-5 flex flex-col gap-3">
          <p className="text-[11px] text-ink-dim leading-relaxed">
            Choose which AI powers the tools on this site. Your key and your local address stay in this
            browser — they are never sent to our servers.
          </p>

          <Row id="site" title="Site AI" desc="Works out of the box, no setup. Runs on merQato's own AI." dot={conn.provider === "site" ? "ok" : "idle"} />

          <Row
            id="openrouter"
            title="OpenRouter — your key"
            desc="Use your own OpenRouter account, including its free models."
            dot={or.state}
          >
            <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">API key</label>
            <input
              className={input}
              type="password"
              value={conn.openrouterKey}
              onChange={(e) => { update({ openrouterKey: e.target.value }); or.reset(); }}
              placeholder="sk-or-v1-..."
              autoComplete="off"
            />
            <a
              href="https://openrouter.ai/keys"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[10px] uppercase tracking-[0.14em] text-accent hover:underline inline-flex items-center gap-1 self-start"
            >
              Get a free key <ExternalLink className="w-3 h-3" />
            </a>

            <div className="flex items-center justify-between mt-1">
              <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">
                {showAll ? "All models" : "Free models"} {models.length > 0 && `(${visible.length})`}
              </label>
              <div className="flex items-center gap-2">
                <button className="text-[9px] uppercase tracking-[0.14em] text-ink-dim hover:text-accent" onClick={() => setShowAll((v) => !v)}>
                  {showAll ? "Free only" : "Show all"}
                </button>
                <button className="text-ink-dim hover:text-accent" onClick={() => void loadModels(true)} aria-label="Reload models">
                  <RefreshCw className={`w-3 h-3 ${loadingModels ? "animate-spin" : ""}`} />
                </button>
              </div>
            </div>
            <select
              className={input}
              value={conn.openrouterModel}
              onChange={(e) => { update({ openrouterModel: e.target.value }); or.reset(); }}
            >
              {visible.length === 0 && <option value={conn.openrouterModel}>{conn.openrouterModel}</option>}
              {visible.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}{m.context ? ` · ${Math.round(m.context / 1000)}k` : ""}{m.multimodal ? " · vision" : ""}
                </option>
              ))}
            </select>
            {loadingModels && <span className="text-[10px] text-ink-mute">Loading live model list…</span>}
            {modelError && <span className="text-[10px] text-red-400">{modelError}</span>}
            {selected && !selected.multimodal && (
              <span className="text-[10px] text-amber-400">This model is text-only — image attachments will be ignored.</span>
            )}

            <button
              className={btnOn}
              disabled={or.state === "testing"}
              onClick={() => void or.run(() => testOpenRouter(conn.openrouterKey, conn.openrouterModel), "Connected — key and model are working.")}
            >
              {or.state === "testing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
              Test connection
            </button>
            {or.message && (
              <span className={`text-[10px] leading-relaxed ${or.state === "ok" ? "text-emerald-400" : "text-red-400"}`}>{or.message}</span>
            )}
          </Row>

          <Row
            id="ollama"
            title="Ollama — your device"
            desc="Use the models installed on your own computer. Nothing leaves your machine."
            dot={ol.state}
          >
            <label className="text-[9px] uppercase tracking-[0.14em] text-ink-mute">Ollama address</label>
            <input
              className={input}
              value={conn.ollamaUrl}
              onChange={(e) => { update({ ollamaUrl: e.target.value }); ol.reset(); }}
              placeholder="http://localhost:11434"
            />
            <div className="flex gap-2">
              <button className={btn} onClick={() => void detectOllama()}><RefreshCw className="w-3.5 h-3.5" /> Detect models</button>
              <button
                className={btnOn}
                disabled={ol.state === "testing"}
                onClick={() => void ol.run(() => testOllama(conn.ollamaUrl, conn.ollamaModel), "Connected — your local model answered.")}
              >
                {ol.state === "testing" ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />} Test
              </button>
            </div>
            {ollamaModels.length > 0 && (
              <select className={input} value={conn.ollamaModel} onChange={(e) => { update({ ollamaModel: e.target.value }); ol.reset(); }}>
                {ollamaModels.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            )}
            {ol.message && (
              <span className={`text-[10px] leading-relaxed ${ol.state === "ok" ? "text-emerald-400" : "text-red-400"}`}>{ol.message}</span>
            )}
            {ol.state === "error" && (
              <div className="border border-line bg-surface/40 p-2 flex items-center gap-2">
                <code className="text-[10px] text-ink-dim flex-1 break-all">{OLLAMA_CORS_HINT}</code>
                <button
                  className="text-ink-dim hover:text-accent"
                  onClick={() => { void navigator.clipboard?.writeText(OLLAMA_CORS_HINT); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
                  aria-label="Copy command"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </Row>

          <div className="border-t border-line pt-3 flex items-center justify-between text-[10px] uppercase tracking-[0.14em]">
            <span className="text-ink-mute inline-flex items-center gap-2">
              <StatusDot state={isConfigured(conn) ? "ok" : "error"} /> {connectionLabel(conn)}
            </span>
            <button className={btnOn} onClick={onClose}>Done</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AiConnectionButton({ className = "" }: { className?: string }) {
  const [open, setOpen] = useState(false);
  const [conn, setConn] = useState<AiConnection | null>(null);

  useEffect(() => { if (!open) setConn(loadConnection()); }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`inline-flex items-center gap-1.5 border border-line px-2.5 py-1.5 text-[9px] uppercase tracking-[0.14em] text-ink-dim hover:border-accent hover:text-accent transition-colors ${className}`}
      >
        <Settings2 className="w-3 h-3" />
        <span className="hidden sm:inline">{conn ? connectionLabel(conn) : "AI CONNECTION"}</span>
        <span className="sm:hidden">AI</span>
        <StatusDot state={conn && isConfigured(conn) ? "ok" : "idle"} />
      </button>
      {open && <AiConnectionPanel onClose={() => setOpen(false)} />}
    </>
  );
}
