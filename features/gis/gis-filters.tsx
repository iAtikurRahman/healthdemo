"use client";

import { RotateCcw, Hospital, Ambulance } from "lucide-react";
import { GlassCard } from "@/components/shared/glass-card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DIVISIONS, DISTRICTS, DISEASES } from "@/mock-data/geo";
import { useGisStore } from "./gis-store";

export function GisFilters() {
  const store = useGisStore();
  const districtOptions = store.division === "all" ? DISTRICTS : DISTRICTS.filter((d) => d.division === store.division);

  return (
    <GlassCard className="p-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Division</Label>
          <Select value={store.division} onValueChange={store.setDivision}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Divisions</SelectItem>
              {DIVISIONS.map((d) => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">District</Label>
          <Select value={store.district} onValueChange={store.setDistrict}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent className="max-h-64">
              <SelectItem value="all">All Districts</SelectItem>
              {districtOptions.map((d) => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Disease</Label>
          <Select value={store.disease} onValueChange={store.setDisease}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Diseases</SelectItem>
              {DISEASES.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Gender</Label>
          <Select value={store.gender} onValueChange={store.setGender}>
            <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Genders</SelectItem>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Date From</Label>
          <Input type="date" value={store.dateFrom} onChange={(e) => store.setDateFrom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Date To</Label>
          <Input type="date" value={store.dateTo} onChange={(e) => store.setDateTo(e.target.value)} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-6 border-t border-border pt-4">
        <div className="min-w-[220px] flex-1 space-y-2">
          <Label className="text-xs text-muted-foreground">
            Age Range: {store.ageRange[0]} &ndash; {store.ageRange[1]} years
          </Label>
          <Slider
            min={0}
            max={100}
            step={1}
            value={store.ageRange}
            onValueChange={(v) => store.setAgeRange(v as [number, number])}
          />
        </div>

        <div className="flex items-center gap-2">
          <Hospital className="size-4 text-muted-foreground" />
          <Label htmlFor="show-hospitals" className="text-xs">Hospitals</Label>
          <Switch id="show-hospitals" checked={store.showHospitals} onCheckedChange={store.toggleHospitals} />
        </div>
        <div className="flex items-center gap-2">
          <Ambulance className="size-4 text-muted-foreground" />
          <Label htmlFor="show-ambulances" className="text-xs">Ambulances</Label>
          <Switch id="show-ambulances" checked={store.showAmbulances} onCheckedChange={store.toggleAmbulances} />
        </div>

        <Button variant="outline" size="sm" onClick={store.reset} className="ml-auto gap-1.5">
          <RotateCcw className="size-3.5" /> Reset Filters
        </Button>
      </div>
    </GlassCard>
  );
}
