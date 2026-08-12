import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, X, Sun, Moon, Github, Instagram, Linkedin, Twitter, Triangle, Mail, Globe, Building2 } from "lucide-react";
import { useContent, type BlogPost, type PortfolioItem } from "@/store/content";
import HermesWorkstation from "@/components/HermesWorkstation";
import { AdminTrigger } from "@/components/AdminPanel";
import { PortfolioGallery } from "@/components/PortfolioGallery";
import { ClientLogos } from "@/components/ClientLogos";
import hero from "@/assets/hero.jpg";
import mqLogo from "@/assets/mq-logo.png";
import b1 from "@/assets/blog-1.jpg";
import b2 from "@/assets/blog-2.jpg";
import b3 from "@/assets/blog-3.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";

export const Route = createFileRoute("/")({ component: Index });

function Dot({ className = "" }: { className?: string }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full bg-accent ${className}`} />;
}

function Index() {
  const { content } = useContent();
  const [activeBlog, setActiveBlog] = useState<BlogPost | null>(null);
  const [galleryItem, setGalleryItem] = useState<PortfolioItem | null>(null);
  const theme = useContent((s) => s.theme);
  const toggleTheme = useContent((s) => s.toggleTheme);

  return (
    <main className="min-h-screen bg-background text-ink overflow-x-hidden">
      {/* Header */}
      <header className="grid grid-cols-12 gap-3 md:gap-4 px-4 md:px-6 lg:px-10 pt-5 md:pt-6 pb-4 text-[10px] uppercase tracking-[0.14em]">
        <div className="col-span-8 md:col-span-4">
          <Link to="/" className="hover:text-accent transition-colors">
            <div className="text-ink">{content.header.brand}</div>
            <div className="text-ink-mute mt-0.5 text-[9px] md:text-[10px]">{content.header.tagline}</div>
          </Link>
        </div>
        <div className="col-span-4 md:hidden flex justify-end">
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} aria-label="Toggle theme" className="border border-line p-1.5 text-ink-dim hover:text-accent hover:border-accent transition-colors">
              {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
            </button>
          </div>
        </div>
        <nav className="md:hidden col-span-12 flex flex-wrap items-center gap-x-4 gap-y-1 text-[10px]">
          <span className="text-ink border-b border-ink">HOME</span>
          <Link to="/agents" className="text-ink-dim hover:text-accent transition-colors">OPERATORS</Link>
          <Link to="/workspace" className="text-ink-dim hover:text-accent transition-colors">WORKSPACE</Link>
          <Link to="/dashboard" className="text-ink-dim hover:text-accent transition-colors">DASHBOARD</Link>
        </nav>
        <div className="hidden md:flex col-span-6 md:col-span-4 items-start justify-center gap-6">
          <span className="text-ink border-b border-ink">HOME</span>
          <Link to="/agents" className="text-ink-dim hover:text-accent transition-colors">OPERATORS</Link>
          <Link to="/workspace" className="text-ink-dim hover:text-accent transition-colors">WORKSPACE</Link>
          <Link to="/dashboard" className="text-ink-dim hover:text-accent transition-colors">DASHBOARD</Link>
        </div>
        <div className="col-span-6 md:col-span-3 md:text-right">
          <div className="text-ink flex md:justify-end items-center gap-1.5">{content.header.rightLine1}<Dot /></div>
          <div className="text-ink-mute mt-0.5">{content.header.rightLine2}</div>
        </div>
        <div className="hidden md:flex col-span-1 justify-end items-start gap-2">
          <button onClick={toggleTheme} aria-label="Toggle theme" className="border border-line p-1.5 text-ink-dim hover:text-accent hover:border-accent transition-colors">
            {theme === "dark" ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
          </button>
          <img src={mqLogo} alt="MQ" className="w-12 h-auto" />
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 md:px-6 lg:px-10">
        <div className="corner border border-line relative overflow-hidden">
          <div className="c1" /><div className="c2" />
          <div className="on-dark-media relative aspect-[3/4] sm:aspect-[16/10] md:aspect-[16/8]">
            <img src={content.hero.image} alt="Palawan sunset" className="img-crisp absolute inset-0 w-full h-full object-cover opacity-90" />
            <div className="img-veil-hero absolute inset-0" />
            <div className="hidden md:block absolute top-4 left-4 text-[10px] uppercase tracking-[0.14em] space-y-0.5">
              <div className="text-ink">{content.hero.asset}</div>
              <div className="text-ink-dim">{content.hero.process}</div>
              <div className="text-ink-dim">{content.hero.environment}</div>
              <div className="text-ink-dim">{content.hero.status}<span className="text-accent">{content.hero.statusValue}</span></div>
            </div>
            <div className="hidden md:block absolute top-4 right-4 text-[10px] uppercase tracking-[0.14em] border border-line-soft p-2 min-w-[180px]">
              <div className="mb-1.5"><span className="text-accent">SYSTEM</span> <span className="text-ink-dim">STATUS</span></div>
              <div className="space-y-0.5 text-ink-dim">
                <div className="flex justify-between"><span>NETWORK</span><span className="text-ink">: ONLINE</span></div>
                <div className="flex justify-between"><span>OPERATIONS</span><span className="text-ink">: ONLINE</span></div>
                <div className="flex justify-between"><span>DATABASE</span><span className="text-ink">: ONLINE</span></div>
                <div className="flex justify-between"><span>SYNC</span><span className="text-ink">: ONLINE</span></div>
              </div>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
              <img src={mqLogo} alt="MQ" className="w-24 sm:w-32 md:w-40 lg:w-48 h-auto mb-4 md:mb-6" />
              <div className="label text-[9px] md:text-[10px] mb-2 md:mb-3">{content.hero.overline}</div>
              <h1 className="hero-title font-serif text-4xl xs:text-5xl sm:text-6xl md:text-8xl lg:text-9xl text-ink leading-[0.95]">{content.hero.title}</h1>
              <div className="mt-4 md:mt-6 text-[9px] md:text-[10px] uppercase tracking-[0.22em] text-ink-dim">
                <div>{content.hero.subtitle1}</div>
                <div>{content.hero.subtitle2}</div>
              </div>
              <div className="mt-5 md:mt-8 inline-flex items-center gap-2 border border-accent/40 bg-accent/10 px-3 py-1.5 rounded-full text-[10px] md:text-[11px] uppercase tracking-[0.12em] text-ink">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Site under construction — refresh later for updates
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="px-6 lg:px-10 pt-12 md:pt-16">
        <div className="flex items-end justify-between mb-4 border-t border-line pt-4">
          <div>
            <div className="label">/ BLOG</div>
            <h2 className="font-serif text-2xl md:text-3xl text-ink mt-1">{content.blogTitle}</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {content.blog.map((p) => (
            <button key={p.id} type="button" onClick={() => setActiveBlog(p)} className="group corner border border-line block relative text-left w-full cursor-pointer">
              <div className="c1" /><div className="c2" />
              <div className="on-dark-media relative aspect-[16/10] overflow-hidden">
                <img src={p.image} alt="" className="img-crisp absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" loading="lazy" />
                <div className="img-veil-card absolute inset-0" />
                <div className="absolute top-3 left-3 text-[10px] uppercase tracking-[0.14em] text-accent">{p.category}</div>
              </div>
              <div className="p-4 border-t border-line">
                <div className="label mb-2">{p.date}</div>
                <div className="flex justify-between items-end gap-4">
                  <h3 className="font-serif text-xl md:text-2xl text-ink leading-snug whitespace-pre-line">{p.title}</h3>
                  <ArrowUpRight className="w-4 h-4 text-accent shrink-0 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
        {activeBlog && (
          <div className="fixed inset-0 z-[120] bg-background/95 backdrop-blur-sm overflow-y-auto" role="dialog" aria-modal="true">
            <article className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-8 sm:py-12">
              <div className="text-[10px] uppercase tracking-[0.14em] text-ink-dim flex flex-wrap gap-x-4 gap-y-1 mb-4">
                <span className="text-accent">{activeBlog.category}</span>
                <span>{activeBlog.date}</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink leading-[1.05] whitespace-pre-line mb-6">{activeBlog.title}</h1>
              <div className="space-y-5 text-ink text-[15px] sm:text-base leading-[1.75] font-light">
                {(activeBlog.content || activeBlog.excerpt || "").split(/\n+/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
              </div>
              <div className="mt-12 pt-6 border-t border-line flex items-center justify-between text-[10px] uppercase tracking-[0.14em] text-ink-dim">
                <span>END OF ARTICLE</span>
                <button type="button" onClick={() => setActiveBlog(null)} className="flex items-center gap-2 border border-line px-3 py-1.5 text-ink hover:border-accent hover:text-accent"><X className="h-3.5 w-3.5" /> Back</button>
              </div>
            </article>
          </div>
        )}
      </section>

      {/* Portfolio */}
      <section className="px-6 lg:px-10 pt-12 md:pt-16">
        <div className="border-t border-line pt-4">
          <div className="grid grid-cols-12 gap-3 items-end pb-4">
            <div className="col-span-12 lg:col-span-4">
              <div className="label">/ PORTFOLIO</div>
              <h2 className="font-serif text-2xl md:text-3xl text-ink mt-1">{content.portfolioTitle}</h2>
            </div>
            <div className="hidden lg:block col-span-3 text-[11px] uppercase tracking-[0.1em] text-ink-dim leading-relaxed">
              <div>{content.portfolioSub1}</div>
              <div>{content.portfolioSub2}</div>
              <div>{content.portfolioSub3}</div>
            </div>
          </div>
          <div className="border-t border-line">
            {content.portfolio.map((item) => (
              <div key={item.id} className="grid grid-cols-12 gap-x-4 gap-y-2 items-start py-4 border-b border-line text-[11px] uppercase tracking-[0.1em]">
                <div className="col-span-1 text-ink-mute pt-1">{item.index}</div>
                <div className="col-span-2 lg:col-span-1">
                  <button
                    type="button"
                    onClick={() => {
                      const imgs = [item.image, ...(item.images || [])].filter(Boolean);
                      if (imgs.length) setGalleryItem(item);
                    }}
                    className="block w-full aspect-[4/3] max-w-[88px] overflow-hidden border border-line-soft hover:border-accent transition-colors group relative"
                    aria-label={`Open ${item.name} gallery`}
                  >
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" loading="lazy" />
                    {((item.images?.length || 0) > 0) && (
                      <span className="absolute bottom-0 right-0 bg-background/80 text-accent text-[8px] px-1 leading-none py-0.5 border-l border-t border-line">
                        +{item.images!.length}
                      </span>
                    )}
                  </button>
                </div>
                <div className="col-span-9 lg:col-span-2">
                  <div className="text-ink">{item.name}</div>
                  <div className="text-ink-mute mt-0.5 leading-snug">{item.category}</div>
                  <div className="inline-block mt-1.5 px-1.5 py-0.5 border border-line-soft text-[9px] text-ink-dim">{item.tag}</div>
                </div>
                <div className="hidden md:block col-span-12 lg:col-span-3 md:col-start-4 lg:col-start-auto text-ink-dim normal-case tracking-normal text-[11px] leading-relaxed pt-1">{item.description}</div>
                <div className="hidden md:flex col-span-3 lg:col-span-1 items-start gap-1.5 pt-1">
                  <Dot className="mt-1" />
                  <div className="whitespace-pre-line text-ink leading-tight">{item.status}</div>
                </div>
                <div className="col-span-12 md:col-span-12 lg:col-span-1 flex items-center md:justify-start lg:justify-end gap-1 pt-1 md:pt-2 lg:pt-1 md:col-start-4 lg:col-start-auto">
                  <a href={item.url} target="_blank" rel="noreferrer" className="text-accent hover:underline truncate">{item.link}</a>
                  <ArrowUpRight className="w-3 h-3 text-accent shrink-0" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hermes Agent Section */}
      <section className="px-4 md:px-6 lg:px-10 pt-12">
        <div className="border-t border-line pt-6 mb-6">
          <div className="label text-accent mb-2">/ AI AGENT</div>
          <h2 className="font-serif text-2xl md:text-3xl text-ink">Hermes Agent Workspace</h2>
        </div>
        <div className="border border-line p-4 md:p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 border border-accent/40 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-accent"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.14em] text-accent">INTERACTIVE DEMO</div>
              <div className="text-ink text-[11px]">Click a capability to see the agent in action</div>
            </div>
            <Link to="/workspace" className="ml-auto text-[9px] uppercase tracking-[0.14em] text-accent hover:underline flex items-center gap-1">
              FULL WORKSPACE <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="border border-line p-3 bg-background font-mono text-[11px] leading-relaxed">
            <div className="flex"><span className="text-ink-dim">[Hermes Agent v2.4.1 — Online]</span></div>
            <div className="flex"><span className="text-ink-dim">[Workspace: /workspace/tropical-systems-studio]</span></div>
            <div className="flex"><span className="text-accent">$ agent status --all</span></div>
            <div className="flex"><span className="text-ink whitespace-pre-wrap">✓ Web Builder      ready{'\n'}✓ Guest Concierge  ready{'\n'}✓ Operations       ready{'\n'}✓ Security         ready{'\n'}✓ Deploy Pipeline  ready</span></div>
            <div className="flex items-center gap-1 mt-1"><span className="text-accent">$</span><span className="w-2 h-4 bg-accent/60 animate-pulse"></span></div>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 border-t border-line mt-0">
            {[
              { label: "Web Builder", action: () => window.location.href = "/workspace" },
              { label: "Guest Concierge", action: () => window.location.href = "/agents#demo-chat" },
              { label: "Operations", action: () => window.location.href = "/dashboard" },
              { label: "Deploy", action: () => window.location.href = "/workspace" },
            ].map((c) => (
              <button key={c.label} type="button" onClick={c.action} className="flex items-center gap-2 px-3 py-2.5 text-[9px] uppercase tracking-[0.12em] border-r border-line last:border-r-0 hover:bg-accent/10 transition-colors text-ink-dim">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 shrink-0"><path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/></svg>
                <span className="truncate">{c.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 md:px-6 lg:px-10 pt-12">
        <div className="border border-line p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-accent shrink-0"><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
            <div>
              <div className="text-ink text-[11px] uppercase tracking-[0.12em]">Automate Your Business</div>
              <div className="text-ink-dim text-[10px]">AI-powered operations for Palawan resorts and businesses.</div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link to="/dashboard" className="text-[9px] uppercase tracking-[0.14em] border border-accent bg-accent/10 text-accent px-4 py-2 hover:bg-accent hover:text-background transition-all flex items-center gap-1.5">
              OPEN DASHBOARD <ArrowUpRight className="w-3 h-3" />
            </Link>
            <Link to="/agents" className="text-[9px] uppercase tracking-[0.14em] border border-line text-ink-dim px-4 py-2 hover:border-accent hover:text-accent transition-all flex items-center gap-1.5">
              AI OPERATORS <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <ClientLogos />

      <footer className="px-6 lg:px-10 pt-12 pb-6 mt-8 border-t border-line">
        <div className="grid grid-cols-12 gap-4 items-center text-[10px] uppercase tracking-[0.14em]">
          <div className="col-span-12 md:col-span-3">
            <div className="text-ink">{content.footer.brand}</div>
            <div className="text-ink-mute mt-0.5">{content.footer.tagline}</div>
          </div>
          <div className="col-span-4 md:col-span-2 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-ink-dim" />
            <div><div className="text-ink-dim">{content.footer.col1Label}</div><div className="text-ink">{content.footer.col1Value}</div></div>
          </div>
          <div className="col-span-4 md:col-span-2 flex items-center gap-2">
            <Globe className="w-4 h-4 text-ink-dim" />
            <div><div className="text-ink-dim">{content.footer.col2Label}</div><div className="text-ink">{content.footer.col2Value}</div></div>
          </div>
          <div className="col-span-4 md:col-span-2 flex items-center gap-2">
            <Mail className="w-4 h-4 text-ink-dim" />
            <div><div className="text-ink-dim">{content.footer.col3Label}</div><div className="text-ink flex items-center gap-1">HELLO@MERQATO.DIGITAL <ArrowUpRight className="w-3 h-3 text-accent" /></div></div>
          </div>
          <div className="col-span-12 md:col-span-3 md:text-right">
            <div className="text-ink">{content.footer.copyright}</div>
            <div className="text-ink-mute mt-0.5">{content.footer.rights}</div>
          </div>
        </div>
        <div className="flex gap-4 mt-6 text-ink-mute">
          <Link to="/" className="hover:text-accent transition-colors text-[10px] uppercase tracking-[0.14em]">HOME</Link>
          <Link to="/agents" className="hover:text-accent transition-colors text-[10px] uppercase tracking-[0.14em]">OPERATORS</Link>
          <Link to="/workspace" className="hover:text-accent transition-colors text-[10px] uppercase tracking-[0.14em]">WORKSPACE</Link>
          <Link to="/dashboard" className="hover:text-accent transition-colors text-[10px] uppercase tracking-[0.14em]">DASHBOARD</Link>
        </div>
        <div className="flex gap-4 mt-3 text-ink-mute">
          {content.footer.socials.map((s) => (
            <a key={s.id} href={s.url} target="_blank" rel="noreferrer noopener" className="hover:text-accent transition-colors">
              {s.platform === "github" && <Github className="w-4 h-4" />}
              {s.platform === "triangle" && <Triangle className="w-4 h-4" />}
              {s.platform === "instagram" && <Instagram className="w-4 h-4" />}
              {s.platform === "twitter" && <Twitter className="w-4 h-4" />}
              {s.platform === "linkedin" && <Linkedin className="w-4 h-4" />}
            </a>
          ))}
        </div>
      </footer>
      <AdminTrigger />
      {galleryItem && (
        <PortfolioGallery
          title={galleryItem.name}
          images={[galleryItem.image, ...(galleryItem.images || [])].filter(Boolean)}
          onClose={() => setGalleryItem(null)}
        />
      )}
    </main>
  );
}
