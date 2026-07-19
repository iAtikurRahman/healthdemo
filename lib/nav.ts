import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  MapPinned,
  Sparkles,
  Building2,
  Activity,
  Boxes,
  Siren,
  MonitorPlay,
  Network,
  Target,
} from "lucide-react";

export interface NavItem {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", description: "Executive overview & KPIs", icon: LayoutDashboard },
  { href: "/gis", label: "GIS Intelligence", description: "Interactive national health map", icon: MapPinned },
  { href: "/ai-insights", label: "AI Insights", description: "AI executive assistant", icon: Sparkles },
  { href: "/hospitals", label: "Hospital Performance", description: "Facility benchmarking", icon: Building2 },
  { href: "/diseases", label: "Disease Surveillance", description: "Outbreak monitoring", icon: Activity },
  { href: "/resources", label: "Resource Management", description: "Staff, stock & equipment", icon: Boxes },
  { href: "/emergency", label: "Emergency Response", description: "Live incident coordination", icon: Siren },
  { href: "/actiondashboard", label: "Action Dashboard", description: "Worst hospital hotspots, ranked for support", icon: Target },
  { href: "/command-center", label: "Command Center", description: "Full-screen national ops view", icon: MonitorPlay },
  { href: "/architecture", label: "Architecture", description: "Platform data architecture", icon: Network },
];
