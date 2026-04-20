"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  Calendar,
  FileText,
  Globe,
  LayoutDashboard,
  ListChecks,
  Search,
  Settings,
  Users,
  Zap,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/generate", label: "Authority Engine", icon: Zap },
  { href: "/dashboard/analyze", label: "Analyzer", icon: Search },
  { href: "/dashboard/calendar", label: "Calendar", icon: Calendar },
  { href: "/dashboard/queue", label: "Queue", icon: ListChecks },
  { href: "/dashboard/clients", label: "Clients", icon: Users },
  { href: "/dashboard/reports", label: "Reports", icon: FileText },
  { href: "/dashboard/portal", label: "Portal", icon: Globe },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const title = nav.find((n) => pathname === n.href)?.label ?? "Overview";

  return (
    <div className="min-h-screen bg-surface lg:flex">
      <aside className="w-full border-b border-electric/20 bg-charcoal text-white lg:fixed lg:h-screen lg:w-72 lg:border-b-0 lg:border-r">
        <div className="border-b border-white/10 px-5 py-5">
          <p className="font-display text-xl font-semibold">
            InstantAuthority<span className="text-cyan">.ai</span>
          </p>
        </div>
        <nav className="p-3">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm ${
                  active ? "border-l-4 border-cyan bg-white/10" : "text-white/80 hover:bg-white/5"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <div className="flex-1 lg:ml-72">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-electric/10 bg-white px-4 py-4 sm:px-6">
          <h1 className="font-display text-2xl text-charcoal">{title}</h1>
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-slate-500" />
            <Link href="/dashboard/generate" className="rounded-lg bg-cyan px-4 py-2 text-sm font-semibold text-charcoal">
              Generate Release
            </Link>
            <UserButton />
          </div>
        </header>
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
