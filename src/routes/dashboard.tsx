import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowUpRight, CheckCircle2, Circle, Loader2, AlertTriangle,
  Calendar, ClipboardList, MessageSquare, Package, TrendingUp,
  Bell, Settings, Plus, Filter, Search, ChevronRight, Clock,
  Users, DollarSign, Wifi, Shield, Zap,
} from "lucide-react";
import { AdminTrigger } from "@/components/AdminPanel";

export const Route = createFileRoute("/dashboard")({
  component: DashboardPage,
  head: () => ({
    meta: [
      { title: "Business Dashboard — merQato.digital" },
      { name: "description", content: "Automate your resort operations with AI-powered workflows." },
    ],
  }),
});

function Dot({ className = "" }: { className?: string }) {
  return <span className={`inline-block w-1.5 h-1.5 rounded-full bg-accent ${className}`} />;
}

// ────── Stats Overview ──────

const stats: {
  label: string;
  value: string;
  icon: typeof Calendar;
  change: string;
  up: boolean;
}[] = [];

function StatsRow() {
  if (stats.length === 0) {
    return (
      <div className="corner border border-line p-8 text-center text-ink-dim text-[12px]">
        <div className="c1" /><div className="c2" />
        No live metrics connected yet.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((s) => (
        <div key={s.label} className="corner border border-line p-4">
          <div className="c1" /><div className="c2" />
          <div className="flex items-start justify-between mb-3">
            <s.icon className="w-5 h-5 text-accent" />
            <span className={`text-[9px] uppercase tracking-[0.14em] ${s.up ? "text-accent" : "text-amber-400"}`}>{s.change}</span>
          </div>
          <div className="text-2xl font-serif text-ink">{s.value}</div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-ink-dim mt-1">{s.label}</div>
        </div>
      ))}
    </div>
  );
}

// ────── Automation Workflows ──────

type Workflow = {
  id: string;
  name: string;
  trigger: string;
  action: string;
  status: "active" | "paused" | "error";
  lastRun: string;
  runs: number;
};

const workflows: Workflow[] = [];

function WorkflowsTable() {
  if (workflows.length === 0) {
    return (
      <div className="corner border border-line overflow-hidden">
        <div className="c1" /><div className="c2" />
        <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface/50">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]">
            <Zap className="w-4 h-4 text-accent" />
            <span className="text-accent">AUTOMATION WORKFLOWS</span>
          </div>
        </div>
        <div className="p-8 text-center text-ink-dim text-[12px]">No workflows configured yet.</div>
      </div>
    );
  }
  const statusStyle = (s: Workflow["status"]) => {
    if (s === "active") return "border-accent/50 text-accent";
    if (s === "paused") return "border-ink-dim text-ink-dim";
    return "border-red-400/50 text-red-400";
  };
  return (
    <div className="corner border border-line overflow-hidden">
      <div className="c1" /><div className="c2" />
      <div className="flex items-center justify-between px-4 py-3 border-b border-line bg-surface/50">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]">
          <Zap className="w-4 h-4 text-accent" />
          <span className="text-accent">AUTOMATION WORKFLOWS</span>
        </div>
        <button className="flex items-center gap-1.5 text-[9px] uppercase tracking-[0.14em] border border-line px-2.5 py-1.5 text-ink-dim hover:border-accent hover:text-accent transition-colors">
          <Plus className="w-3 h-3" /> New Workflow
        </button>
      </div>
      <div className="divide-y divide-line-soft">
        {workflows.map((w) => (
          <div key={w.id} className="px-4 py-3 flex items-center gap-4 hover:bg-surface/20 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-ink font-mono">{w.name}</div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-ink-dim mt-0.5">
                {w.trigger} → {w.action}
              </div>
            </div>
            <div className="hidden md:block text-[10px] text-ink-dim w-20">{w.lastRun}</div>
            <div className="hidden md:block text-[10px] text-ink-dim w-12 text-right">{w.runs} runs</div>
            <span className={`text-[8px] uppercase tracking-[0.14em] border px-1.5 py-0.5 ${statusStyle(w.status)}`}>
              {w.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────── Task Board ──────

type Task = {
  id: string;
  title: string;
  assignee: string;
  priority: "high" | "medium" | "low";
  due: string;
};

const tasks: Task[] = [];

function TaskBoard() {
  if (tasks.length === 0) {
    return (
      <div className="corner border border-line overflow-hidden">
        <div className="c1" /><div className="c2" />
        <div className="px-4 py-3 border-b border-line bg-surface/50">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]">
            <ClipboardList className="w-4 h-4 text-accent" />
            <span className="text-accent">TODAY'S TASKS</span>
          </div>
        </div>
        <div className="p-8 text-center text-ink-dim text-[12px]">No tasks yet.</div>
      </div>
    );
  }
  const pColor = (p: Task["priority"]) => p === "high" ? "text-red-400" : p === "medium" ? "text-amber-400" : "text-ink-dim";
  return (
    <div className="corner border border-line overflow-hidden">
      <div className="c1" /><div className="c2" />
      <div className="px-4 py-3 border-b border-line bg-surface/50">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]">
          <ClipboardList className="w-4 h-4 text-accent" />
          <span className="text-accent">TODAY'S TASKS</span>
        </div>
      </div>
      <div className="divide-y divide-line-soft">
        {tasks.map((t) => (
          <div key={t.id} className="px-4 py-3 flex items-start gap-3">
            <Circle className="w-3.5 h-3.5 text-ink-dim shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-ink">{t.title}</div>
              <div className="flex items-center gap-3 mt-1 text-[9px] uppercase tracking-[0.12em]">
                <span className="text-ink-dim">{t.assignee}</span>
                <span className={pColor(t.priority)}>{t.priority}</span>
                <span className="text-ink-mute flex items-center gap-1"><Clock className="w-2.5 h-2.5" />{t.due}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────── Guest Messages ──────

type GuestMessage = {
  id: string;
  guest: string;
  channel: "whatsapp" | "facebook" | "website";
  message: string;
  time: string;
  status: "new" | "replied" | "auto";
};

const messages: GuestMessage[] = [];

function GuestMessages() {
  if (messages.length === 0) {
    return (
      <div className="corner border border-line overflow-hidden">
        <div className="c1" /><div className="c2" />
        <div className="px-4 py-3 border-b border-line bg-surface/50">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]">
            <MessageSquare className="w-4 h-4 text-accent" />
            <span className="text-accent">GUEST MESSAGES</span>
            <Dot className="animate-pulse" />
          </div>
        </div>
        <div className="p-8 text-center text-ink-dim text-[12px]">No messages yet.</div>
      </div>
    );
  }
  const channelIcon = (c: GuestMessage["channel"]) => {
    if (c === "whatsapp") return "WA";
    if (c === "facebook") return "FB";
    return "WB";
  };
  const statusStyle = (s: GuestMessage["status"]) => {
    if (s === "new") return "border-accent/50 text-accent";
    if (s === "replied") return "border-ink-dim text-ink-dim";
    return "border-blue-400/50 text-blue-400";
  };
  return (
    <div className="corner border border-line overflow-hidden">
      <div className="c1" /><div className="c2" />
      <div className="px-4 py-3 border-b border-line bg-surface/50">
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em]">
          <MessageSquare className="w-4 h-4 text-accent" />
          <span className="text-accent">GUEST MESSAGES</span>
          <Dot className="animate-pulse" />
        </div>
      </div>
      <div className="divide-y divide-line-soft">
        {messages.map((m) => (
          <div key={m.id} className="px-4 py-3 flex items-start gap-3">
            <div className="w-7 h-7 border border-line-soft flex items-center justify-center text-[8px] uppercase tracking-[0.1em] text-accent shrink-0">
              {channelIcon(m.channel)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="text-[11px] text-ink font-mono">{m.guest}</div>
                <span className={`text-[7px] uppercase tracking-[0.14em] border px-1.5 py-0.5 ${statusStyle(m.status)}`}>{m.status}</span>
              </div>
              <div className="text-[10px] text-ink-dim mt-0.5 truncate">{m.message}</div>
              <div className="text-[9px] uppercase tracking-[0.14em] text-ink-mute mt-0.5">{m.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ────── Header ──────

function DashboardHeader() {
  return (
    <header className="px-4 md:px-6 lg:px-10 pt-5 md:pt-6 pb-4">
      <div className="grid grid-cols-12 gap-3 md:gap-4 text-[10px] uppercase tracking-[0.14em]">
        <div className="col-span-6 md:col-span-4">
          <Link to="/" className="hover:text-accent transition-colors">
            <div className="text-ink">MERQATO.DIGITAL</div>
            <div className="text-ink-mute mt-0.5 text-[9px] md:text-[10px]">BUSINESS AUTOMATION</div>
          </Link>
        </div>
        <div className="col-span-6 md:col-span-4 flex justify-end md:justify-center items-start gap-4 md:gap-6">
          <Link to="/" className="text-ink-dim hover:text-accent transition-colors">HOME</Link>
          <Link to="/agents" className="text-ink-dim hover:text-accent transition-colors">OPERATORS</Link>
          <Link to="/workspace" className="text-ink-dim hover:text-accent transition-colors">WORKSPACE</Link>
          <span className="text-accent border-b border-accent">DASHBOARD</span>
        </div>
        <div className="hidden md:flex col-span-4 justify-end items-start gap-3">
          <button className="border border-line p-1.5 text-ink-dim hover:text-accent hover:border-accent transition-colors">
            <Bell className="w-3 h-3" />
          </button>
          <button className="border border-line p-1.5 text-ink-dim hover:text-accent hover:border-accent transition-colors">
            <Settings className="w-3 h-3" />
          </button>
        </div>
      </div>
    </header>
  );
}

// ────── Main Page ──────

function DashboardPage() {
  return (
    <main className="min-h-screen bg-background text-ink">
      <DashboardHeader />

      {/* Hero */}
      <section className="px-4 md:px-6 lg:px-10 pt-4">
        <div className="corner border border-line relative overflow-hidden">
          <div className="c1" /><div className="c2" />
          <div className="relative py-8 md:py-12 px-6 md:px-10">
            <div className="label text-[9px] md:text-[10px] mb-2 text-accent">/ BUSINESS AUTOMATION</div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl text-ink leading-[0.95]">
              Operations Dashboard
            </h1>
            <p className="mt-3 max-w-xl text-ink-dim text-[11px] md:text-[12px] leading-relaxed">
              AI-powered workflows automating bookings, guest communications, housekeeping, and revenue tracking for Palawan micro-resorts.
            </p>
            <div className="mt-3 flex items-center gap-4 text-[9px] uppercase tracking-[0.14em]">
              <span className="flex items-center gap-1.5"><Wifi className="w-3 h-3 text-accent" /><span className="text-accent">CONNECTED</span></span>
              <span className="flex items-center gap-1.5"><Shield className="w-3 h-3 text-accent" /><span className="text-accent">SECURED</span></span>
              <span className="text-ink-mute">Last sync: Just now</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="px-4 md:px-6 lg:px-10 pt-6">
        <StatsRow />
      </section>

      {/* Workflows + Tasks */}
      <section className="px-4 md:px-6 lg:px-10 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <WorkflowsTable />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <TaskBoard />
            <GuestMessages />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 lg:px-10 pt-12 pb-6 mt-8 border-t border-line">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.14em]">
          <div className="text-ink-dim">© 2026 MERQATO.DIGITAL</div>
          <div className="flex gap-4">
            <Link to="/privacy" className="text-ink-dim hover:text-accent transition-colors">PRIVACY</Link>
            <Link to="/terms" className="text-ink-dim hover:text-accent transition-colors">TERMS</Link>
          </div>
        </div>
      </footer>
      <AdminTrigger />
    </main>
  );
}
