import Link from "next/link";
import { Activity } from "lucide-react";
import { NAV_ITEMS } from "@/lib/nav";

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-[var(--brand-primary)] text-white">
                <Activity className="size-5" />
              </div>
              <p className="text-sm font-semibold">National Health Executive Decision Support Platform</p>
            </div>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              An AI-powered GIS command platform concept for national health surveillance, resource
              allocation, and emergency response. Built for demonstration purposes with fully synthetic data.
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Platform</p>
            <ul className="mt-3 space-y-2 text-sm">
              {NAV_ITEMS.slice(0, 5).map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Technology</p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>Next.js 15 &middot; TypeScript</li>
              <li>MySQL &middot; Prisma ORM</li>
              <li>Recharts &middot; MapLibre/Leaflet</li>
              <li>Framer Motion &middot; Tailwind CSS</li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-center justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground md:flex-row">
          <p>&copy; {new Date().getFullYear()} National Health Decision Support Platform &mdash; Demo build. Not affiliated with any government entity.</p>
          <p>All statistics shown are synthetic demo data.</p>
        </div>
      </div>
    </footer>
  );
}
