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
  blog: [
    {
      id: "1",
      category: "OPERATIONS",
      meta1: "BUILD_LOG_024",
      meta2: "SV_NODE",
      meta3: "LIVE",
      date: "MAY 20, 2026",
      title: "Building operational systems\nfor modern hospitality",
      image: b1,
      author: "MERQATO TEAM",
      readTime: "6 MIN READ",
      excerpt: "How we designed merQato.app to run resorts end-to-end — from reservations to housekeeping — without the usual SaaS bloat.",
      content: "Hospitality software has a reputation for being clunky, expensive, and built for a world that no longer exists. When we set out to design merQato.app, we started by sitting in the lobby of a small resort in Palawan and writing down every single task the team performed in a day.\n\nWhat we found wasn't a software problem. It was a coordination problem. Front desk, housekeeping, maintenance and revenue all lived in separate spreadsheets, separate WhatsApp groups, separate heads. Information moved through the property at the speed of conversation.\n\nSo we built one operating system. Reservations, housekeeping boards, maintenance tickets, revenue dashboards and guest messaging all share the same underlying state. When a guest checks out, housekeeping knows instantly. When a room is flagged for maintenance, the booking engine stops selling it. Nothing has to be remembered. Nothing has to be re-typed.\n\nThe result is a property that runs quieter. Staff spend less time chasing information and more time with guests. Owners see real numbers, in real time, on any device.\n\nThis is what we mean by operational infrastructure: software that fades into the background and lets the work happen.",
    },
    {
      id: "2",
      category: "TECHNOLOGY",
      meta1: "SYSTEMS_ONLINE",
      meta2: "SYNC_ACTIVE",
      meta3: "V02.1",
      date: "MAY 18, 2026",
      title: "Why we build our own tools\nfrom the ground up",
      image: b2,
      author: "MERQATO TEAM",
      readTime: "5 MIN READ",
      excerpt: "Off-the-shelf tools optimize for the average customer. We don't operate average businesses, so we don't use average software.",
      content: "Every time we evaluated an off-the-shelf tool for one of our properties, we ran into the same wall. The tool was good at the eighty percent that every business shares, and useless at the twenty percent that actually makes our business ours.\n\nBuilding our own stack is not about ego. It's about owning the parts of the workflow that matter most. A booking engine that understands our pricing logic. A menu system that speaks the language of our kitchen. A directory that reflects the actual character of the town we live in.\n\nWe use modern building blocks — TypeScript, edge-rendered React, Postgres, Cloudflare — but the surface area is always tailored. Less is more. We ship small. We delete often. The codebase is something we read together on a Monday morning, not a black box we pay a vendor to maintain.\n\nThe tradeoff is real. Building takes time. But every tool we own is a tool that compounds, and an ecosystem that no competitor can copy by writing a check.",
    },
    {
      id: "3",
      category: "LIFESTYLE",
      meta1: "PALAWAN_NETWORK",
      meta2: "REMOTE_LIFE",
      meta3: "CONNECTED",
      date: "MAY 15, 2026",
      title: "Life and work in Palawan:\nour why",
      image: b3,
      author: "MERQATO TEAM",
      readTime: "4 MIN READ",
      excerpt: "Why we chose to base a digital studio on a remote island, and what that decision has taught us about focus, pace and presence.",
      content: "People assume we moved to Palawan to escape work. The truth is closer to the opposite. We moved here because the noise of the city was making it impossible to do work we were proud of.\n\nThere is a particular kind of clarity that comes from living somewhere with limited bandwidth, limited shops and unlimited horizon. You stop optimizing for inputs and start optimizing for output. You stop reacting and start building.\n\nOur days are simple. Early mornings on the laptops while it is still cool. Long lunches. Afternoons in the water or in the workshop. Evenings reading, sketching, planning the next week. The work is deep because the surroundings invite depth.\n\nWe are not romantic about it. The internet drops, supply chains are fragile, and tropical weather has opinions. But on the balance, this place has made us better operators, better designers and better partners to the businesses we serve.\n\nThis blog is part of that practice — an open log of what we are building, what we are learning, and why we are doing it from here.",
    },
  ],
  portfolioTitle: "FEATURED WEB APPLICATIONS",
  portfolioSub1: "SIX SYSTEMS.",
  portfolioSub2: "ONE ECOSYSTEM.",
  portfolioSub3: "BUILT IN PALAWAN.",
  portfolio: [
    { id: "1", index: "01", image: p1, name: "NOMADS.ONE", category: "COMMUNITY PLATFORM", tag: "SOCIAL INFRASTRUCTURE", description: "A global community network connecting digital nomads, creators and remote professionals.", status: "LIVE\nACTIVE", deployedDate: "2026.02.10", deployedVersion: "V02.1", environment: "CLOUD", environmentLoc: "GLOBAL", role: "FOUNDER", roleType: "FULLSTACK", link: "nomads.one", url: "https://nomads.one" },
    { id: "2", index: "02", image: p2, name: "MERQATO.APP", category: "HOSPITALITY OPERATING SYSTEM", tag: "OPERATIONAL PLATFORM", description: "All-in-one backoffice for resorts. Reservations, housekeeping, revenue, maintenance and guest services.", status: "LIVE\nACTIVE", deployedDate: "2026.03.05", deployedVersion: "V01.8", environment: "CLOUD", environmentLoc: "PALAWAN", role: "FOUNDER", roleType: "FULLSTACK", link: "merqato.app", url: "https://merqato.app" },
    { id: "3", index: "03", image: p3, name: "SANVICENTE.PH", category: "MAPS & DIRECTORY", tag: "DISCOVERY PLATFORM", description: "Interactive map and business directory of San Vicente, Palawan. Explore. Discover. Support Local.", status: "LIVE\nACTIVE", deployedDate: "2026.01.20", deployedVersion: "V03.2", environment: "CLOUD", environmentLoc: "PALAWAN", role: "FOUNDER", roleType: "FULLSTACK", link: "sanvicente.ph", url: "https://sanvicente.ph" },
    { id: "4", index: "04", image: p4, name: "MERQATO.SOLAR", category: "SOLAR CALCULATOR", tag: "UTILITY PLATFORM", description: "Solar savings estimator for homes and businesses in tropical regions. Calculate. Save. Go Solar.", status: "LIVE\nACTIVE", deployedDate: "2026.02.28", deployedVersion: "V01.5", environment: "CLOUD", environmentLoc: "GLOBAL", role: "FOUNDER", roleType: "FULLSTACK", link: "merqato.solar", url: "https://merqato.solar" },
    { id: "5", index: "05", image: p5, name: "MERQATO.MENU", category: "DIGITAL MENU SYSTEM", tag: "BUSINESS TOOL", description: "Modern digital menu for restaurants and resorts. Beautiful, fast and mobile-first.", status: "LIVE\nACTIVE", deployedDate: "2026.04.02", deployedVersion: "V01.2", environment: "CLOUD", environmentLoc: "GLOBAL", role: "FOUNDER", roleType: "FULLSTACK", link: "merqato.menu", url: "https://merqato.menu" },
    { id: "6", index: "06", image: p6, name: "MERQATO.STAY", category: "DIRECT BOOKING ENGINE", tag: "BOOKING PLATFORM", description: "Increase direct bookings with a fast, secure and commission-free booking system.", status: "LIVE\nACTIVE", deployedDate: "2026.04.12", deployedVersion: "V01.0", environment: "CLOUD", environmentLoc: "PALAWAN", role: "FOUNDER", roleType: "FULLSTACK", link: "merqato.stay", url: "https://merqato.stay" },
  ],
  hermesAgent: {
    title: "HERMES AGENT WORKING AREA",
    description: "Development zone for Hermes Agent interfaces, user flows, and experimental webapps.",
    currentStage: "INTERFACE DESIGN & PROTOTYPING",
    progress: 35,
    nextMilestone: "LIVE WORKING DEMO",
    interfacePreview: "/assets/hermes-interface.jpg",
    userFlowDiagram: "/assets/hermes-flow.jpg",
    layoutPrototype: "/assets/hermes-layout.jpg",
    tasks: [
      { id: "t1", description: "Define core interface components", status: "done" },
      { id: "t2", description: "Map primary user flows", status: "in-progress" },
      { id: "t3", description: "Build working prototype", status: "todo" },
      { id: "t4", description: "Integrate with live agent", status: "todo" },
      { id: "t5", description: "Deploy demo environment", status: "todo" },
    ],
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
    privacy: `<h1>Privacy Policy</h1>\n<p><em>Last updated: [Insert Date]</em></p>\n<p>This Privacy Policy explains how <strong>[Insert Company Name]</strong> ("we", "us", or "our") collects, uses, and protects your personal information when you visit <strong>[Insert Website URL]</strong> (the "Site").</p>\n\n<h2>1. Information We Collect</h2>\n<ul>\n  <li><strong>Contact information</strong> you provide through forms (name, email, phone, message).</li>\n  <li><strong>Usage data</strong> collected automatically through analytics (pages visited, device, browser, IP address, approximate location).</li>\n  <li><strong>Cookies</strong> and similar technologies used to remember your preferences and measure performance.</li>\n</ul>\n\n<h2>2. How We Use Your Information</h2>\n<ul>\n  <li>To respond to inquiries submitted via our contact forms.</li>\n  <li>To improve our website, services, and customer experience.</li>\n  <li>To send service-related communications you have requested.</li>\n  <li>To comply with applicable legal obligations.</li>\n</ul>\n\n<h2>3. Third-Party Sharing</h2>\n<p>We do not sell your personal data. We share limited information only with trusted service providers strictly to operate our business, including:</p>\n<ul>\n  <li><strong>Hosting & infrastructure:</strong> [Insert Hosting Provider, e.g. Cloudflare]</li>\n  <li><strong>Analytics:</strong> [Insert Analytics Provider, e.g. Google Analytics]</li>\n  <li><strong>Payment processors:</strong> [Insert Payment Processor, e.g. Stripe / PayPal]</li>\n  <li><strong>Email & communications:</strong> [Insert Email Provider]</li>\n</ul>\n\n<h2>4. Cookies</h2>\n<p>We use essential cookies to make the Site function and optional cookies for analytics and preferences. You can disable cookies in your browser settings; some features may not work as intended.</p>\n\n<h2>5. Your Rights</h2>\n<p>Depending on your jurisdiction, you may have the right to access, correct, delete, or restrict the processing of your personal data, and to withdraw consent at any time. To exercise these rights, contact us at <strong>[Insert Contact Email]</strong>.</p>\n\n<h2>6. Data Retention & Security</h2>\n<p>We retain personal data only as long as necessary for the purposes described above and apply reasonable technical and organizational measures to protect it.</p>\n\n<h2>7. Children's Privacy</h2>\n<p>Our Site is not directed to children under 13, and we do not knowingly collect personal information from them.</p>\n\n<h2>8. Changes to This Policy</h2>\n<p>We may update this Policy from time to time. Material changes will be posted on this page with a new "Last updated" date.</p>\n\n<h2>9. Contact</h2>\n<p><strong>[Insert Company Name]</strong><br/>[Insert Business Address]<br/>Email: [Insert Contact Email]</p>`,
    terms: `<h1>Terms of Service</h1>\n<p><em>Last updated: [Insert Date]</em></p>\n<p>These Terms of Service ("Terms") govern your use of <strong>[Insert Website URL]</strong> operated by <strong>[Insert Company Name]</strong> ("we", "us", or "our"). By accessing or using the Site, you agree to these Terms.</p>\n\n<h2>1. Acceptable Use</h2>\n<p>You agree to use the Site only for lawful purposes and in a way that does not infringe the rights of, restrict, or inhibit anyone else's use of the Site. You must not:</p>\n<ul>\n  <li>Attempt to gain unauthorized access to our systems or data.</li>\n  <li>Upload viruses, malicious code, or harmful content.</li>\n  <li>Use the Site to harass, defame, or impersonate others.</li>\n  <li>Scrape, reverse-engineer, or copy the Site without permission.</li>\n</ul>\n\n<h2>2. Accounts & Information</h2>\n<p>If the Site allows account creation, you are responsible for keeping your credentials confidential and for all activity under your account. Information you provide must be accurate and current.</p>\n\n<h2>3. Intellectual Property</h2>\n<p>All content on the Site — including text, graphics, logos, images, software, and design — is the property of <strong>[Insert Company Name]</strong> or its licensors and is protected by intellectual property laws. You may not copy, reproduce, or distribute any content without prior written consent.</p>\n\n<h2>4. Limitation of Liability</h2>\n<p>To the maximum extent permitted by law, <strong>[Insert Company Name]</strong>, its directors, employees, contractors, developers, and service providers shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, business, or goodwill, arising from:</p>\n<ul>\n  <li>Your use of, or inability to use, the Site or any related software.</li>\n  <li>Software bugs, errors, downtime, or interruptions of service.</li>\n  <li>Unauthorized access to or alteration of your data.</li>\n  <li>Any third-party content, products, or services referenced on the Site.</li>\n</ul>\n<p>The Site and all related software are provided <strong>"as-is" and "as-available"</strong> without warranties of any kind.</p>\n\n<h2>5. Indemnification</h2>\n<p>You agree to indemnify and hold harmless <strong>[Insert Company Name]</strong> and its developers from any claim or demand arising out of your breach of these Terms or your misuse of the Site.</p>\n\n<h2>6. Third-Party Services</h2>\n<p>The Site may include links or integrations with third-party services. We are not responsible for their content, policies, or practices.</p>\n\n<h2>7. Termination</h2>\n<p>We may suspend or terminate access to the Site at any time, with or without notice, for conduct that we believe violates these Terms or is harmful to other users or our business.</p>\n\n<h2>8. Governing Law</h2>\n<p>These Terms are governed by and construed in accordance with the laws of the <strong>Republic of the Philippines</strong>, without regard to its conflict-of-laws principles. Any dispute shall be submitted to the exclusive jurisdiction of the courts of <strong>[Insert City, Philippines]</strong>.</p>\n\n<h2>9. Changes to These Terms</h2>\n<p>We may revise these Terms from time to time. Continued use of the Site after changes constitutes acceptance of the revised Terms.</p>\n\n<h2>10. Contact</h2>\n<p><strong>[Insert Company Name]</strong><br/>[Insert Business Address]<br/>Email: [Insert Contact Email]</p>`,
    disclaimer: `<h1>Disclaimer</h1>\n<p><em>Last updated: [Insert Date]</em></p>\n\n<h2>1. General Information</h2>\n<p>The information provided by <strong>[Insert Company Name]</strong> on <strong>[Insert Website URL]</strong> is for general informational purposes only. All information on the Site is provided in good faith; however, we make no representation or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, reliability, availability, or completeness of any information on the Site.</p>\n\n<h2>2. "As-Is" Disclaimer</h2>\n<p>The Site and its contents are provided on an <strong>"as-is" and "as-available"</strong> basis. Under no circumstance shall we have any liability to you for any loss or damage of any kind incurred as a result of the use of the Site or reliance on any information provided. Your use of the Site and your reliance on any information is solely at your own risk.</p>\n\n<h2>3. Professional Advice Disclaimer</h2>\n<p>The Site cannot and does not contain [legal / medical / financial / professional] advice. Any information is provided for general informational and educational purposes only and is not a substitute for professional advice. You should consult the appropriate professional before taking any action.</p>\n\n<h2>4. Third-Party Links</h2>\n<p>The Site may contain links to other websites or content belonging to or originating from third parties. We do not investigate, monitor, or check such external links for accuracy, adequacy, validity, reliability, availability, or completeness. We do not warrant, endorse, guarantee, or assume responsibility for any information offered by third-party websites linked from the Site.</p>\n\n<h2>5. Errors and Omissions</h2>\n<p>While we strive to keep the information on the Site current and accurate, errors can occur. We are not responsible for any errors or omissions, or for the results obtained from the use of this information.</p>\n\n<h2>6. Contact</h2>\n<p>Questions about this Disclaimer can be sent to <strong>[Insert Contact Email]</strong>.</p>`,
    footerSnippet: `<footer class="site-footer">\n  <p>&copy; [Insert Year] <strong>[Insert Company Name]</strong>. All rights reserved.</p>\n  <p>[Insert Product or Brand Name]&trade; is a trademark of [Insert Company Name].</p>\n  <nav class="site-footer__links">\n    <a href="/privacy">Privacy Policy</a> ·\n    <a href="/terms">Terms of Service</a> ·\n    <a href="/disclaimer">Disclaimer</a> ·\n    <a href="/contact">Contact</a>\n  </nav>\n</footer>`,
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
  workProjects: [
    {
      id: "wp1",
      image: p1,
      title: "NOMADS.ONE",
      description: "Global community network for digital nomads, creators and remote professionals. Currently iterating on the onboarding flow and profile system.",
      status: "LIVE",
      tag: "COMMUNITY",
      url: "https://nomads.one",
    },
    {
      id: "wp2",
      image: p2,
      title: "MERQATO.APP",
      description: "All-in-one hospitality operating system for resorts — reservations, housekeeping, revenue, maintenance and guest services in one synced backoffice.",
      status: "LIVE",
      tag: "OPERATIONS",
      url: "https://merqato.app",
    },
    {
      id: "wp3",
      image: p3,
      title: "SANVICENTE.PH",
      description: "Interactive map and business directory of San Vicente, Palawan. Discovery platform for the local ecosystem.",
      status: "LIVE",
      tag: "DIRECTORY",
      url: "https://sanvicente.ph",
    },
    {
      id: "wp4",
      image: p4,
      title: "HERMES WORKSPACE",
      description: "The AI agent workspace you are looking at right now. Built to give merQato a transparent live view of what Hermes is shipping.",
      status: "BUILDING",
      tag: "INTERNAL",
      url: "",
    },
  ],
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
