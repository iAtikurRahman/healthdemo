import type { SavedReport } from "@/types";

export const SAVED_REPORTS: (SavedReport & { prompt: string })[] = [
  { id: "r1", title: "Morning Executive Briefing", category: "Today's Summary", createdAt: "Today, 07:30", prompt: "Generate an executive summary" },
  { id: "r2", title: "Evening Wrap-up", category: "Today's Summary", createdAt: "Yesterday, 20:15", prompt: "Generate an executive summary" },
  { id: "r3", title: "Dengue Surge Analysis", category: "Disease Analysis", createdAt: "2 days ago", prompt: "Which districts have the highest Dengue risk?" },
  { id: "r4", title: "COVID-19 Weekly Trend", category: "Disease Analysis", createdAt: "3 days ago", prompt: "Show me the COVID-19 trend" },
  { id: "r5", title: "ICU Capacity Review", category: "Hospital Analysis", createdAt: "1 day ago", prompt: "Predict ICU demand for the next week" },
  { id: "r6", title: "Dhaka vs Chattogram Audit", category: "Hospital Analysis", createdAt: "4 days ago", prompt: "Compare Dhaka and Chattogram" },
  { id: "r7", title: "National Medicine Stock Report", category: "National Reports", createdAt: "5 days ago", prompt: "Show medicine shortages" },
  { id: "r8", title: "Q2 National Health Report", category: "National Reports", createdAt: "1 week ago", prompt: "Generate an executive summary" },
];

export const CATEGORIES: SavedReport["category"][] = [
  "Today's Summary",
  "Disease Analysis",
  "Hospital Analysis",
  "National Reports",
];

export const EXAMPLE_PROMPTS = [
  "Which districts have the highest Dengue risk?",
  "Predict ICU demand for the next week.",
  "Show me current medicine shortages.",
  "Compare Dhaka and Chattogram.",
  "Generate an executive summary.",
];
