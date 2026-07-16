import { Bug, Wind, Stethoscope, Droplet, HeartPulse, Ribbon, Baby, ShieldPlus, type LucideIcon } from "lucide-react";

export const DISEASE_ICON: Record<string, LucideIcon> = {
  Dengue: Bug,
  "COVID-19": Wind,
  Tuberculosis: Stethoscope,
  Diabetes: Droplet,
  Hypertension: HeartPulse,
  Cancer: Ribbon,
  "Maternal Health": Baby,
  "Child Health": ShieldPlus,
};
