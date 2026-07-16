"use client";

import { useMemo } from "react";
import { Cloud, CloudRain, Sun, CloudSun, Wind } from "lucide-react";
import { createRng, randFloat, pick } from "@/utils/random";

const CONDITIONS = [
  { label: "Partly Cloudy", icon: CloudSun },
  { label: "Clear Sky", icon: Sun },
  { label: "Light Rain", icon: CloudRain },
  { label: "Overcast", icon: Cloud },
] as const;

export function WeatherWidget() {
  const weather = useMemo(() => {
    const hourKey = new Date().toISOString().slice(0, 13);
    const rng = createRng(`weather-dhaka-${hourKey}`);
    const condition = pick(rng, CONDITIONS);
    return {
      tempC: Math.round(randFloat(rng, 26, 35, 1)),
      humidity: Math.round(randFloat(rng, 55, 92, 0)),
      windKph: Math.round(randFloat(rng, 5, 28, 0)),
      condition,
    };
  }, []);

  const Icon = weather.condition.icon;

  return (
    <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-white">
      <Icon className="size-6 text-[var(--brand-accent)]" />
      <div className="leading-tight">
        <p className="text-sm font-semibold">{weather.tempC}&deg;C &middot; Dhaka</p>
        <p className="text-[10px] text-white/60">
          {weather.condition.label} &middot; {weather.humidity}% humidity &middot; <Wind className="inline size-2.5" /> {weather.windKph} km/h
        </p>
      </div>
    </div>
  );
}
