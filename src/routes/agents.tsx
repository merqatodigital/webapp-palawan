import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  ArrowUpRight, Camera, MessageCircle, ClipboardList,
  Wifi, Heart, Users, TrendingUp,
  Star, Check, CheckCircle2, ChevronRight, X, Globe, Mail, Building2,
  Github, Triangle, Instagram, Twitter, Linkedin, Loader2, Paperclip,
} from "lucide-react";
import mqLogo from "@/assets/mq-logo.png";
import {
  DEFAULT_CONNECTION, connectionLabel, isConfigured, loadConnection, sendChat,
  type AiConnection, type ChatMessage,
} from "@/lib/ai-connection";
import { AiConnectionButton, StatusDot } from "@/components/AiConnectionPanel";
import { useContent } from "@/store/content";
import type { PricingTier } from "@/store/content";
import { AdminTrigger } from "@/components/AdminPanel";

export const Route = createFileRoute("/agents")({
  component: AgentsPage,
  head: () => ({
    meta: [
      { title: "Palawan AI Operators — merQato.digital" },
      { name: "description", content: "Your 24/7 AI employee for micro resorts and small businesses in Palawan. Bookings, orders, guest messages, and operations — automated." },
      { property: "og:title", content: "Palawan AI Operators — merQato.digital" },
      { property: "og:description", content: "Your 24/7 AI employee for micro resorts and small businesses in Palawan." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "Palawan AI Operators — merQato.digital" },
      { name: "twitter:description", content: "Your 24/7 AI employee for micro resorts and small businesses in Palawan." },
    ],
  }),
});

function MQLogo({ className = "" }: { className?: string }) {
  return <img src={mqLogo} alt="MQ" className={className} />;
}

function Dot({ className = "" }: { className?: string }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full bg-accent ${className}`} />;
}

// ────── Header ──────

function AgentsHeader() {
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
          <span className="text-accent border-b border-accent">OPERATORS</span>
          <Link to="/workspace" className="text-ink-dim hover:text-accent transition-colors">WORKSPACE</Link>
        </div>
        <div className="hidden md:flex col-span-4 justify-end">
          <MQLogo className="w-12 h-auto" />
        </div>
      </div>
    </header>
  );
}

// ────── Hero ──────

function AgentsHero() {
  return (
    <section className="px-4 md:px-6 lg:px-10">
      <div className="corner border border-line relative overflow-hidden">
        <div className="c1" /><div className="c2" />
        <div className="relative aspect-[3/4] sm:aspect-[16/9] md:aspect-[21/9]">
          <div className="absolute inset-0 bg-gradient-to-br from-background via-background/90 to-background/60" />

          {/* decorative grid lines */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />

          {/* status pill */}
          <div className="absolute top-4 left-4 text-[9px] md:text-[10px] uppercase tracking-[0.14em] border border-line-soft px-3 py-1.5 text-ink-dim">
            <span className="text-accent">LIVE</span> / AI SYSTEM
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center px-4 md:px-8 text-center">
            <div className="label text-[9px] md:text-[10px] mb-3 md:mb-4 text-accent">
              — YOUR 24/7 AI EMPLOYEE —
            </div>
            <h1 className="font-serif text-3xl xs:text-4xl sm:text-5xl md:text-7xl lg:text-8xl text-ink leading-[0.95] max-w-4xl">
              Meet Your Palawan<br />
              AI Operator
            </h1>
            <p className="mt-4 md:mt-6 max-w-2xl text-ink-dim text-[11px] md:text-[13px] leading-relaxed font-light">
              An always-on intelligent assistant that helps micro-resorts in Palawan handle
              bookings, orders, guest messages, and operations — 24 hours a day.
            </p>

            {/* tagline pills */}
            <div className="mt-4 flex flex-wrap justify-center gap-2 text-[9px] md:text-[10px] uppercase tracking-[0.14em]">
              <div className="border border-line-soft px-2.5 py-1.5 text-ink-dim flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-accent" /> Menu photo → live website
              </div>
              <div className="border border-line-soft px-2.5 py-1.5 text-ink-dim flex items-center gap-1.5">
                <MessageCircle className="w-3 h-3 text-accent" /> Guest inquiry → instant reply
              </div>
            </div>

            {/* CTA buttons */}
            <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#demo-chat"
                className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-background transition-all"
              >
                Talk to the AI Now <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 border border-line px-5 py-3 text-[11px] uppercase tracking-[0.14em] text-ink-dim hover:border-accent hover:text-accent transition-all"
              >
                See How It Works <ChevronRight className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* bottom meta */}
          <div className="absolute bottom-4 left-4 text-[9px] uppercase tracking-[0.14em] text-ink-dim hidden md:block">
            <div>— · — · —</div>
            <div className="mt-1">10.514° N / 119.178° E</div>
          </div>
          <div className="absolute bottom-4 right-4 text-[9px] uppercase tracking-[0.14em] text-ink-dim text-right hidden md:block">
            <div>PALAWAN, PHILIPPINES</div>
            <div className="text-accent">SYSTEMS ONLINE</div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────── 3 Main Services ──────

const services = [
  {
    icon: Camera,
    title: "Instant Online Presence",
    tag: "01",
    items: [
      "Upload a photo of your menu → AI builds a beautiful mobile ordering website",
      "Guests can browse and order food/drinks directly",
      "One-click publish + hosting included",
      "Perfect for small resorts and eateries",
    ],
  },
  {
    icon: MessageCircle,
    title: "24/7 Guest Concierge",
    tag: "02",
    items: [
      "Answers WhatsApp, Facebook, and website messages instantly",
      "Handles room & tour bookings",
      "Sends automated confirmations and reminders",
      "Gives local recommendations (beaches, tours, weather)",
    ],
  },
  {
    icon: ClipboardList,
    title: "Smart Operations Assistant",
    tag: "03",
    items: [
      "Daily housekeeping task lists",
      "Inventory alerts (low on towels, drinks, etc.)",
      "Simple sales reports",
      "Marketing post generator for Facebook",
    ],
  },
];

function ServicesSection() {
  return (
    <section id="how-it-works" className="px-6 lg:px-10 pt-16 md:pt-20">
      <div className="border-t border-line pt-6">
        <div className="label text-accent mb-2">/ HOW IT HELPS</div>
        <h2 className="font-serif text-2xl md:text-4xl text-ink max-w-2xl">
          Three ways an AI Operator runs your resort
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {services.map((s) => (
          <div
            key={s.tag}
            className="corner border border-line p-5 md:p-6 hover:border-accent/40 transition-colors"
          >
            <div className="c1" /><div className="c2" />
            <div className="flex items-start justify-between mb-4">
              <s.icon className="w-6 h-6 text-accent" />
              <span className="text-[10px] uppercase tracking-[0.14em] text-ink-mute">{s.tag}</span>
            </div>
            <h3 className="font-serif text-xl md:text-2xl text-ink mb-3">{s.title}</h3>
            <ul className="space-y-2.5">
              {s.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-[11px] md:text-[12px] text-ink-dim leading-relaxed">
                  <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ────── Live Demo Chat ──────

const exampleQuestions = [
  "Build me a website from this menu photo",
  "I have 3 new bookings today, what should I prepare?",
  "Write a Facebook post promoting low season rates",
];

function DemoChat() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [typingText, setTypingText] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [conn, setConn] = useState<AiConnection>(DEFAULT_CONNECTION);
  useEffect(() => {
    const sync = () => setConn(loadConnection());
    sync();
    window.addEventListener("mq-ai-connection-change", sync);
    return () => window.removeEventListener("mq-ai-connection-change", sync);
  }, []);
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string; images?: string[] }>
  >([
    {
      role: "ai",
      content:
        "Hello! I'm your Palawan AI Operator. I can help you build a menu website, manage guest inquiries, or handle resort operations. What would you like to try?",
    },
  ]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, []);

  // Typewriter effect for the last AI message
  const [displayedTexts, setDisplayedTexts] = useState<Record<number, string>>({});

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingText, scrollToBottom]);

  // Typewriter reveal when a new AI message appears
  useEffect(() => {
    const lastIdx = messages.length - 1;
    if (lastIdx < 0) return;
    const last = messages[lastIdx];
    if (last.role !== "ai") return;
    if (displayedTexts[lastIdx] === last.content) return;

    // Start typing from where we left off, or from empty
    let i = displayedTexts[lastIdx]?.length || 0;
    if (i >= last.content.length) return;

    const interval = setInterval(() => {
      i++;
      setDisplayedTexts((prev) => ({ ...prev, [lastIdx]: last.content.slice(0, i) }));
      if (i >= last.content.length) clearInterval(interval);
    }, 15);

    return () => clearInterval(interval);
  }, [messages, displayedTexts]);

  const askAI = useCallback(
    async (userMessage: string, images: string[] = []) => {
      const newMessages = [
        ...messages,
        { role: "user" as const, content: userMessage, images },
      ];
      setMessages(newMessages);
      setInput("");
      setAttachments([]);
      setLoading(true);

      try {
        const apiMessages = newMessages.map((m) => {
          const role = (m.role === "ai" ? "assistant" : m.role) as
            | "user"
            | "assistant"
            | "system";
          if (m.images && m.images.length > 0) {
            return {
              role,
              content: [
                { type: "text" as const, text: m.content || "Please analyze the attached image(s)." },
                ...m.images.map((url) => ({
                  type: "image_url" as const,
                  image_url: { url },
                })),
              ],
            };
          }
          return { role, content: m.content };
        });
        const res = await sendChat(conn, apiMessages as ChatMessage[]);
        const reply = res.content || "Sorry, I couldn't process that.";
        setMessages((prev) => [...prev, { role: "ai", content: reply }]);
      } catch (err) {
        const detail = err instanceof Error ? err.message : "Unknown error.";
        setMessages((prev) => [
          ...prev,
          {
            role: "ai",
            content: `⚠️ ${detail}\n\nOpen "AI Connection" above to switch provider, paste your own OpenRouter key, or connect your local Ollama.`,
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [messages, conn],
  );

  const handleSend = () => {
    if (loading) return;
    if (!input.trim() && attachments.length === 0) return;
    askAI(input.trim(), attachments);
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    const imgs = Array.from(files).filter((f) => f.type.startsWith("image/"));
    imgs.forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        alert(`"${file.name}" exceeds 5MB and was skipped.`);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          setAttachments((prev) => [...prev, result]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <section id="demo-chat" className="px-6 lg:px-10 pt-16 md:pt-20">
      <div className="border-t border-line pt-6 mb-8">
        <div className="label text-accent mb-2">/ LIVE DEMO</div>
        <h2 className="font-serif text-2xl md:text-4xl text-ink">
          Talk to Palawan AI Operator Now
        </h2>
        <p className="mt-2 text-ink-dim text-[12px] max-w-xl">
          Powered by {connectionLabel(conn)} — bring your own OpenRouter key or your local Ollama models.
        </p>
        <div className="mt-3">
          <AiConnectionButton />
        </div>
      </div>

      {/* Chat container */}
      <div className="corner border border-line overflow-hidden">
        <div className="c1" /><div className="c2" />

        {/* Chat header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface/50">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]">
            <div className={`w-2 h-2 rounded-full ${loading ? "bg-accent animate-pulse" : "bg-accent"}`} />
            <span className="text-accent">OPERATOR TERMINAL</span>
            <span className="text-ink-dim">/ {loading ? "THINKING" : "ONLINE"}</span>
          </div>
          <div className="text-[9px] text-ink-mute uppercase tracking-[0.14em] flex items-center gap-1.5">
            <StatusDot state={isConfigured(conn) ? "ok" : "error"} />
            {connectionLabel(conn)}
          </div>
        </div>

        {/* Messages */}
        <div className="h-[400px] md:h-[500px] overflow-y-auto p-4 space-y-4 bg-background">
          {messages.map((msg, i) => {
            const isAi = msg.role === "ai";
            const isLastAi = isAi && i === messages.length - 1;
            const text = isLastAi && displayedTexts[i] ? displayedTexts[i] : msg.content;
            const fullyRevealed = isLastAi && displayedTexts[i]?.length >= msg.content.length;

            return (
              <div
                key={i}
                className={`flex ${!isAi ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[70%] px-4 py-3 text-[12px] leading-relaxed whitespace-pre-wrap ${
                    !isAi
                      ? "bg-accent/10 border border-accent/30 text-ink"
                      : "border border-line-soft text-ink-dim"
                  }`}
                >
                  {msg.images && msg.images.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-2">
                      {msg.images.map((src, idx) => (
                        <img
                          key={idx}
                          src={src}
                          alt={`attachment ${idx + 1}`}
                          className="max-h-32 max-w-[140px] object-cover border border-line-soft"
                        />
                      ))}
                    </div>
                  )}
                  {text}
                  {isLastAi && !fullyRevealed && displayedTexts[i] && (
                    <span className="inline-block w-1.5 h-4 bg-accent/60 ml-0.5 animate-pulse" />
                  )}
                </div>
              </div>
            );
          })}
          {loading && !messages[messages.length - 1]?.role?.includes("ai") && (
            <div className="flex justify-start">
              <div className="border border-line-soft px-4 py-3 text-[12px] text-ink-dim flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-accent" />
                Thinking...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested */}
        <div className="px-4 py-2.5 border-t border-line bg-surface/30">
          <div className="flex flex-wrap gap-2">
            {exampleQuestions.map((q, i) => (
              <button
                key={i}
                type="button"
                disabled={loading}
                onClick={() => askAI(q)}
                className="text-[9px] uppercase tracking-[0.14em] border border-line-soft px-2.5 py-1.5 text-ink-dim hover:border-accent hover:text-accent transition-colors disabled:opacity-40"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 px-4 py-2.5 border-t border-line bg-surface/30">
            {attachments.map((src, i) => (
              <div key={i} className="relative group">
                <img
                  src={src}
                  alt={`pending ${i + 1}`}
                  className="h-16 w-16 object-cover border border-line-soft"
                />
                <button
                  type="button"
                  onClick={() =>
                    setAttachments((prev) => prev.filter((_, idx) => idx !== i))
                  }
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-background border border-line text-ink-dim hover:text-accent hover:border-accent flex items-center justify-center"
                  aria-label="Remove image"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <div className="flex border-t border-line">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={loading}
            className="px-3 py-3 border-r border-line text-ink-dim hover:text-accent hover:bg-accent/10 transition-colors disabled:opacity-40"
            aria-label="Attach images"
            title="Attach images"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder={
              loading
                ? "Waiting for response..."
                : attachments.length > 0
                ? "Add a question about the image(s)..."
                : "Ask about bookings, operations, or marketing..."
            }
            disabled={loading}
            className="flex-1 bg-background px-4 py-3 text-[12px] text-ink placeholder:text-ink-mute outline-none font-mono disabled:opacity-50"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || (!input.trim() && attachments.length === 0)}
            className="px-5 py-3 border-l border-line text-[10px] uppercase tracking-[0.14em] text-accent hover:bg-accent/10 transition-colors disabled:opacity-40"
          >
            {loading ? "..." : "Send"}
          </button>
        </div>
      </div>
    </section>
  );
}

// ────── Pricing ──────

function ContactForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resort, setResort] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => onClose(), 2500);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-background/90 backdrop-blur-sm flex items-center justify-center p-4" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="corner border border-line bg-surface w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="c1" /><div className="c2" />
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="label text-accent mb-1">/ GET STARTED</div>
              <h3 className="font-serif text-xl text-ink">Contact the merQato Team</h3>
            </div>
            <button onClick={onClose} className="text-ink-dim hover:text-accent p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          {submitted ? (
            <div className="text-center py-8">
              <CheckCircle2 className="w-10 h-10 text-accent mx-auto mb-3" />
              <div className="font-serif text-xl text-ink mb-2">Message Sent!</div>
              <div className="text-ink-dim text-[12px]">We'll get back to you within 24 hours.</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="label block mb-1">YOUR NAME</label>
                <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Juan Dela Cruz" className="w-full bg-background border border-line px-3 py-2.5 text-ink text-[12px] placeholder:text-ink-mute outline-none focus:border-accent" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label block mb-1">EMAIL</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@email.com" className="w-full bg-background border border-line px-3 py-2.5 text-ink text-[12px] placeholder:text-ink-mute outline-none focus:border-accent" />
                </div>
                <div>
                  <label className="label block mb-1">PHONE</label>
                  <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+63 912 345 6789" className="w-full bg-background border border-line px-3 py-2.5 text-ink text-[12px] placeholder:text-ink-mute outline-none focus:border-accent" />
                </div>
              </div>
              <div>
                <label className="label block mb-1">RESORT / BUSINESS NAME</label>
                <input value={resort} onChange={(e) => setResort(e.target.value)} placeholder="Sunset Bay Resort" className="w-full bg-background border border-line px-3 py-2.5 text-ink text-[12px] placeholder:text-ink-mute outline-none focus:border-accent" />
              </div>
              <div>
                <label className="label block mb-1">HOW CAN WE HELP?</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} placeholder="Tell us about your property and what you need..." className="w-full bg-background border border-line px-3 py-2.5 text-ink text-[12px] placeholder:text-ink-mute outline-none focus:border-accent resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-accent text-background py-3 text-[11px] uppercase tracking-[0.14em] hover:bg-accent/90 transition-colors">
                  Send Message
                </button>
                <button type="button" onClick={onClose} className="px-4 py-3 border border-line text-ink-dim text-[11px] uppercase tracking-[0.14em] hover:border-accent hover:text-accent transition-colors">
                  Cancel
                </button>
              </div>
              <p className="text-[10px] text-ink-mute text-center leading-relaxed">
                We'll respond within 24 hours. Your information is kept private.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function Pricing() {
  const { content } = useContent();
  const [showForm, setShowForm] = useState(false);
  const p = content;

  return (
    <>
      <section id="contact-form" className="px-6 lg:px-10 pt-16 md:pt-20">
        <div className="border-t border-line pt-6 mb-8">
          <div className="label text-accent mb-2">/ PRICING</div>
          <h2 className="font-serif text-2xl md:text-4xl text-ink">
            {p.pricingTitle}
          </h2>
          <p className="mt-2 text-ink-dim text-[12px]">
            {p.pricingSubtitle}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {p.pricing.map((tier: PricingTier) => (
            <div
              key={tier.id}
              className={`corner border p-6 flex flex-col ${
                tier.highlighted
                  ? "border-accent bg-accent/[0.03]"
                  : "border-line"
              }`}
            >
              <div className="c1" /><div className="c2" />
              {tier.highlighted && (
                <div className="label text-accent mb-3">/ RECOMMENDED</div>
              )}
              <h3 className="font-serif text-xl text-ink">{tier.name}</h3>
              <div className="mt-3">
                <span className="font-serif text-3xl text-ink">{tier.price}</span>
                <span className="text-[11px] text-ink-dim ml-2">{tier.period}</span>
              </div>
              <p className="text-[11px] text-ink-dim mt-2 leading-relaxed">{tier.desc}</p>
              <ul className="mt-5 space-y-2.5 flex-1">
                {tier.features.map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-[11px] text-ink-dim">
                    <Check className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${tier.highlighted ? "text-accent" : "text-ink-mute"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <button
                type="button"
                onClick={() => setShowForm(true)}
                className={`mt-6 block text-center px-4 py-3 text-[11px] uppercase tracking-[0.14em] transition-all ${
                  tier.highlighted
                    ? "border border-accent bg-accent/10 text-accent hover:bg-accent hover:text-background"
                    : "border border-line text-ink-dim hover:border-accent hover:text-accent"
                }`}
              >
                {tier.buttonText}
              </button>
            </div>
          ))}
        </div>
      </section>

      {showForm && <ContactForm onClose={() => setShowForm(false)} />}
    </>
  );
}

// ────── Why Love It ──────

const reasons = [
  { icon: Wifi, title: "Works even with slow internet", desc: "Optimized for Palawan's unique connectivity — offline-capable, syncs when online." },
  { icon: Heart, title: "Designed for small family resorts", desc: "Built specifically for 5-20 room properties, not enterprise bloatware." },
  { icon: Users, title: "Reduces staff workload dramatically", desc: "Handles repetitive tasks so your team can focus on guests." },
  { icon: TrendingUp, title: "Helps you compete with bigger resorts", desc: "Professional digital presence and 24/7 service at a fraction of the cost." },
];

function WhySection() {
  return (
    <section className="px-6 lg:px-10 pt-16 md:pt-20">
      <div className="border-t border-line pt-6 mb-8">
        <div className="label text-accent mb-2">/ WHY IT WORKS</div>
        <h2 className="font-serif text-2xl md:text-4xl text-ink">
          Why Palawan Businesses Love It
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reasons.map((r, i) => (
          <div key={i} className="corner border border-line p-5 flex items-start gap-4">
            <div className="c1" /><div className="c2" />
            <div className="w-10 h-10 border border-line-soft flex items-center justify-center shrink-0">
              <r.icon className="w-5 h-5 text-accent" />
            </div>
            <div>
              <h3 className="text-[12px] uppercase tracking-[0.14em] text-ink mb-1">{r.title}</h3>
              <p className="text-[11px] text-ink-dim leading-relaxed">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ────── Final CTA ──────

function FinalCta() {
  return (
    <section className="px-6 lg:px-10 pt-16 md:pt-20 pb-12">
      <div className="corner border border-accent/40 relative overflow-hidden">
        <div className="c1" /><div className="c2" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(to right, var(--color-line) 1px, transparent 1px), linear-gradient(to bottom, var(--color-line) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="relative px-6 md:px-12 py-12 md:py-16 text-center">
          <div className="label text-accent mb-3">/ READY?</div>
          <h2 className="font-serif text-2xl md:text-5xl text-ink max-w-2xl mx-auto leading-[1.05]">
            Ready to get your own AI Operator?
          </h2>
          <p className="mt-4 text-ink-dim text-[12px] max-w-lg mx-auto">
            Start with a free demo chat or book a call with the merQato team to discuss your property's needs.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="#demo-chat"
              className="inline-flex items-center gap-2 border border-accent bg-accent/10 px-6 py-3.5 text-[11px] uppercase tracking-[0.14em] text-accent hover:bg-accent hover:text-background transition-all"
            >
              Start Free Demo Chat <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
            <a
              href="mailto:hello@merqato.digital"
              className="inline-flex items-center gap-2 border border-line px-6 py-3.5 text-[11px] uppercase tracking-[0.14em] text-ink-dim hover:border-accent hover:text-accent transition-all"
            >
              Book a Call <Mail className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ────── Footer ──────

function AgentsFooter() {
  return (
    <footer className="px-6 lg:px-10 pt-12 pb-6 mt-4 border-t border-line">
      <div className="grid grid-cols-12 gap-4 items-center text-[10px] uppercase tracking-[0.14em]">
        <div className="col-span-12 md:col-span-3">
          <div className="text-ink">MERQATO.DIGITAL</div>
          <div className="text-ink-mute mt-0.5">TROPICAL DIGITAL INFRASTRUCTURE</div>
        </div>
        <div className="col-span-4 md:col-span-2 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-ink-dim" />
          <div><div className="text-ink-dim">BUILDING</div><div className="text-ink">IN PARADISE</div></div>
        </div>
        <div className="col-span-4 md:col-span-2 flex items-center gap-2">
          <Globe className="w-4 h-4 text-ink-dim" />
          <div><div className="text-ink-dim">OPERATING</div><div className="text-ink">WORLDWIDE</div></div>
        </div>
        <div className="col-span-4 md:col-span-2 flex items-center gap-2">
          <Mail className="w-4 h-4 text-ink-dim" />
          <div><div className="text-ink-dim">CONNECT</div><div className="text-ink flex items-center gap-1">HELLO@MERQATO.DIGITAL <ArrowUpRight className="w-3 h-3 text-accent" /></div></div>
        </div>
        <div className="col-span-12 md:col-span-3 md:text-right">
          <div className="text-ink">© 2026 MERQATO.DIGITAL</div>
          <div className="text-ink-mute mt-0.5">ALL SYSTEMS RESERVED</div>
        </div>
      </div>
      <div className="flex gap-4 mt-6 text-ink-mute">
        <Link to="/" className="hover:text-accent transition-colors text-[10px] uppercase tracking-[0.14em]">HOME</Link>
        <span className="text-accent text-[10px] uppercase tracking-[0.14em]">OPERATORS</span>
        <Link to="/workspace" className="hover:text-accent transition-colors text-[10px] uppercase tracking-[0.14em]">WORKSPACE</Link>
      </div>
      <div className="flex gap-4 mt-3 text-ink-mute">
        {[Github, Triangle, Instagram, Twitter, Linkedin].map((Icon, i) => (
          <a key={i} href="#" className="hover:text-accent transition-colors"><Icon className="w-4 h-4" /></a>
        ))}
      </div>
    </footer>
  );
}

// ────── Page ──────

function AgentsPage() {
  return (
    <main className="min-h-screen bg-background text-ink">
      <AgentsHeader />
      <AgentsHero />
      <ServicesSection />
      <DemoChat />
      <Pricing />
      <WhySection />
      <FinalCta />
      <AgentsFooter />
      <AdminTrigger />
    </main>
  );
}
