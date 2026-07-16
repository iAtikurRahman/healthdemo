import {
  Users, Stethoscope, BedDouble, Siren, BedSingle, Pill, HeartPulse, Activity, BrainCircuit,
  type LucideIcon,
} from "lucide-react";

export const ICON_MAP: Record<string, LucideIcon> = {
  Users,
  Stethoscope,
  BedDouble,
  Siren,
  BedSingle,
  Pill,
  HeartPulse,
  Activity,
  BrainCircuit,
};

export function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Activity;
}
