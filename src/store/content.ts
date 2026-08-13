import { create } from "zustand";
import { loadSiteContent, saveSiteContent } from "@/lib/content.functions";
import hero from "@/assets/hero.jpg";
import b1 from "@/assets/blog-1.jpg";
import b2 from "@/assets/blog-2.jpg";
import b3 from "@/assets/blog-3.jpg";
import p1 from "@/assets/p1.jpg";
import p2 from "@/assets/p2.jpg";
import p3 from "@/assets/p3.jpg";
import p4 from "@/assets/p4.jpg";
import p5 from "@/assets/p5.jpg";
import p6 from "@/assets/p6.jpg";

export type BlogPost = {
  id: string;
  category: string;
  meta1: string;
  meta2: string;
  meta3: string;
  date: string;
  title: string;
  image: string;
  videoUrl?: string;
  link?: string;
  author?: string;
  readTime?: string;
  excerpt?: string;
  content?: string;
};

export type PortfolioItem = {
  id: string;
  index: string;
  image: string;
  images?: string[];
  name: string;
  category: string;
  tag: string;
  description: string;
  status: string;
  deployedDate: string;
  deployedVersion: string;
  environment: string;
  environmentLoc: string;
  role: string;
  roleType: string;
  link: string;
  url: string;
};

export type WorkProject = {
  id: string;
  image: string;
  title: string;
  description: string;
  status: string;
  tag: string;
  url?: string;
  media?: WorkMedia[];
};

export type WorkMedia = {
  id: string;
  kind: "image" | "video" | "youtube";
  url: string;
};

export type SocialLink = {
  id: string;
  platform: string; // github | twitter | x | instagram | linkedin | facebook | youtube | tiktok | mail | website | triangle
  url: string;
  label?: string;
};

export type LegalContent = {
  privacy: string;
  terms: string;
  disclaimer: string;
  footerSnippet: string;
};

export type PricingTier = {
  id: string;
  name: string;
  price: string;
  period: string;
  desc: string;
  features: string[];
  highlighted: boolean;
  buttonText: string;
  buttonLink: string;
};

export type Content = {
  header: {
    brand: string;
    tagline: string;
    centerLine1: string;
    centerLine2: string;
    rightLine1: string;
    rightLine2: string;
  };
  hero: {
    asset: string;
    process: string;
    environment: string;
    status: string;
    statusValue: string;
    overline: string;
    title: string;
    subtitle1: string;
    subtitle2: string;
    coordN: string;
    coordE: string;
    elev: string;
    buildLog: string;
    deployed: string;
    deployedDate: string;
    systems: string;
    image: string;
  };
  blogTitle: string;
  blogCta: string;
  blog: BlogPost[];
  portfolioTitle: string;
  portfolioSub1: string;
  portfolioSub2: string;
  portfolioSub3: string;
  portfolio: PortfolioItem[];
  hermesAgent: {
    title: string;
    description: string;
    currentStage: string;
    progress: number;
    nextMilestone: string;
    interfacePreview: string;
    userFlowDiagram: string;
    layoutPrototype: string;
    tasks: {
      id: string;
      description: string;
      status: 'todo' | 'in-progress' | 'done';
    }[];
  };
  footer: {
    brand: string;
    tagline: string;
    col1Label: string;
    col1Value: string;
    col2Label: string;
    col2Value: string;
    col3Label: string;
    col3Value: string;
    copyright: string;
    rights: string;
    socials: SocialLink[];
  };
  legal: LegalContent;
  pricingTitle: string;
  pricingSubtitle: string;
  pricing: PricingTier[];
  workProjects: WorkProject[];
};

const defaults: Content = {
  header: {
    brand: "MERQATO.DIGITAL",
    tagline: "DIGITAL INFRASTRUCTURE STUDIO",
    centerLine1: "/MICROGRAPHIC SYSTEMS",
    centerLine2: "VERSION 2.0",
    rightLine1: "PALAWAN, PHILIPPINES",
    rightLine2: "LIVE ENVIRONMENT",
  },
  hero: {
    asset: "ASSET_ID 2026_MQ_990X",
    process: "/PROCESS/V02",
    environment: "/ENVIRONMENT/SAN_VICENTE",
    status: "/STATUS/",
    statusValue: "BUILDING",
    overline: "TROPICAL DIGITAL INFRASTRUCTURE",
    title: "merQato.digital",
    subtitle1: "BUILDING OPERATIONAL SYSTEMS",
    subtitle2: "FROM PARADISE",
    coordN: "10.514° N",
    coordE: "119.178° E",
    elev: "ELEV. 14M",
    buildLog: "BUILD_LOG_0024",
    deployed: "DEPLOYED",
    deployedDate: "04.22.26",
    systems: "SYSTEMS",
    image: hero,
  },
  blogTitle: "LATEST INSIGHTS & STORIES",
  blogCta: "VIEW ALL ARTICLES",
  blog: [],
  portfolioTitle: "FEATURED WEB APPLICATIONS",
  portfolioSub1: "SIX SYSTEMS.",
  portfolioSub2: "ONE ECOSYSTEM.",
  portfolioSub3: "BUILT IN PALAWAN.",
  portfolio: [],
  hermesAgent: {
    title: "HERMES AGENT WORKING AREA",
    description: "Development zone for Hermes Agent interfaces, user flows, and experimental webapps.",
    currentStage: "INTERFACE DESIGN & PROTOTYPING",
    progress: 35,
    nextMilestone: "LIVE WORKING DEMO",
    interfacePreview: "/assets/hermes-interface.jpg",
    userFlowDiagram: "/assets/hermes-flow.jpg",
    layoutPrototype: "/assets/hermes-layout.jpg",
    tasks: [],
  },
  footer: {
    brand: "MERQATO.DIGITAL",
    tagline: "TROPICAL DIGITAL INFRASTRUCTURE",
    col1Label: "BUILDING",
    col1Value: "IN PARADISE",
    col2Label: "OPERATING",
    col2Value: "WORLDWIDE",
    col3Label: "CONNECT",
    col3Value: "WITH US",
    copyright: "© 2026 MERQATO.DIGITAL",
    rights: "ALL SYSTEMS RESERVED",
    socials: [
      { id: "s1", platform: "github", url: "https://github.com", label: "GitHub" },
      { id: "s2", platform: "triangle", url: "https://vercel.com", label: "Vercel" },
      { id: "s3", platform: "instagram", url: "https://instagram.com", label: "Instagram" },
      { id: "s4", platform: "twitter", url: "https://twitter.com", label: "Twitter" },
      { id: "s5", platform: "linkedin", url: "https://linkedin.com", label: "LinkedIn" },
    ],
  },
  legal: {
    privacy: "",
    terms: "",
    disclaimer: "",
    footerSnippet: "",
  },
  pricingTitle: "Simple & Transparent",
  pricingSubtitle: "All packages include hosting, updates, and support.",
  pricing: [
    {
      id: "p1",
      name: "Starter",
      price: "₱12,000",
      period: "one-time + ₱1,500/mo",
      desc: "Best for small resorts and eateries getting started",
      features: ["Basic website + AI chat", "Menu digitization (1 menu)", "Guest message auto-reply", "Hosting + updates included"],
      highlighted: false,
      buttonText: "Get Started",
      buttonLink: "#contact-form",
    },
    {
      id: "p2",
      name: "Full Operator",
      price: "₱25,000",
      period: "one-time + ₱3,500/mo",
      desc: "Best for growing properties that need full coverage",
      features: ["Everything in Starter", "24/7 multi-channel concierge", "Smart operations dashboard", "Marketing post generator", "Inventory alerts"],
      highlighted: true,
      buttonText: "Get Started",
      buttonLink: "#contact-form",
    },
    {
      id: "p3",
      name: "Enterprise",
      price: "Custom",
      period: "multiple properties",
      desc: "Best for groups and multi-property operations",
      features: ["Everything in Full Operator", "Multi-property management", "Custom integrations", "Dedicated account manager", "Priority support"],
      highlighted: false,
      buttonText: "Contact Us",
      buttonLink: "#contact-form",
    },
  ],
  workProjects: [],
};

type Store = {
  content: Content;
  loaded: boolean;
  saving: boolean;
  theme: "dark" | "light";
  setContent: (c: Content) => void;
  update: <K extends keyof Content>(key: K, value: Content[K]) => void;
  reset: () => void;
  setTheme: (t: "dark" | "light") => void;
  toggleTheme: () => void;
  load: () => Promise<void>;
  save: (passkey: string, c: Content) => Promise<void>;
};

export const defaultContent = defaults;

const THEME_KEY = "mq-theme";
const getInitialTheme = (): "dark" | "light" => "dark";
const applyTheme = (t: "dark" | "light") => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (t === "light") root.classList.add("light");
  else root.classList.remove("light");
  try { window.localStorage.setItem(THEME_KEY, t); } catch {}
};

export const useContent = create<Store>()((set, get) => ({
  content: defaults,
  loaded: false,
  saving: false,
  theme: getInitialTheme(),
  setContent: (c) => set({ content: c }),
  update: (key, value) => set((s) => ({ content: { ...s.content, [key]: value } })),
  reset: () => set({ content: defaults }),
  setTheme: (t) => { applyTheme(t); set({ theme: t }); },
  toggleTheme: () => {
    const next = get().theme === "dark" ? "light" : "dark";
    applyTheme(next);
    set({ theme: next });
  },
  load: async () => {
    if (get().loaded) return;
    try {
      const res = await loadSiteContent();
      if (res.json) {
        const parsed = JSON.parse(res.json) as Content;
        const merged = { ...defaults, ...parsed } as Content;
        // Self-heal stale bundled asset paths (e.g. /assets/hero-<oldhash>.jpg)
        // from previous builds by falling back to current bundled defaults.
        const isStale = (u?: string) =>
          typeof u === "string" &&
          (u.startsWith("/assets/") || u.startsWith("/src/assets/"));
        const heroImage = isStale(merged.hero?.image) ? defaults.hero.image : merged.hero.image;
        const blog = (merged.blog ?? []).map((p) => {
          const d = defaults.blog.find((x) => x.id === p.id);
          return { ...p, image: isStale(p.image) && d ? d.image : p.image };
        });
        const portfolio = (merged.portfolio ?? []).map((p) => {
          const d = defaults.portfolio.find((x) => x.id === p.id);
          return { ...p, image: isStale(p.image) && d ? d.image : p.image };
        });
        set({
          content: { ...merged, hero: { ...merged.hero, image: heroImage }, blog, portfolio },
          loaded: true,
        });
      } else {
        set({ loaded: true });
      }
    } catch (e) {
      console.error("Failed to load site content", e);
      set({ loaded: true });
    }
  },
  save: async (passkey, c) => {
    set({ saving: true });
    try {
      await saveSiteContent({ data: { passkey, json: JSON.stringify(c) } });
      set({ content: c });
    } finally {
      set({ saving: false });
    }
  },
}));
