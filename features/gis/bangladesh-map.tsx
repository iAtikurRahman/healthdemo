"use client";

import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip, useMap } from "react-leaflet";
import { useEffect } from "react";
import { useTheme } from "next-themes";
import type { DistrictMapDatum, HospitalMapDatum, AmbulanceMapDatum } from "@/types";
import { formatCompact } from "@/lib/format";

const RISK_COLOR: Record<DistrictMapDatum["riskLevel"], string> = {
  Low: "#0ca30c",
  Moderate: "#c98500",
  High: "#ec835a",
  Severe: "#d03b3b",
};

function riskRadius(activeCases: number) {
  return Math.min(26, Math.max(6, Math.sqrt(activeCases) * 1.1));
}

function FitOnData({ districts }: { districts: DistrictMapDatum[] }) {
  const map = useMap();
  useEffect(() => {
    if (!districts.length) return;
    const bounds: [number, number][] = districts.map((d) => [d.lat, d.lng]);
    map.fitBounds(bounds, { padding: [20, 20] });
  }, [districts, map]);
  return null;
}

export function BangladeshMap({
  districts,
  hospitals = [],
  ambulances = [],
  onSelectDistrict,
  showHospitals = false,
  showAmbulances = false,
  height = 480,
}: {
  districts: DistrictMapDatum[];
  hospitals?: HospitalMapDatum[];
  ambulances?: AmbulanceMapDatum[];
  onSelectDistrict?: (district: DistrictMapDatum) => void;
  showHospitals?: boolean;
  showAmbulances?: boolean;
  height?: number;
}) {
  const { resolvedTheme } = useTheme();
  const tileUrl =
    resolvedTheme === "dark"
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

  return (
    <div style={{ height }} className="overflow-hidden rounded-xl">
      <MapContainer
        center={[23.685, 90.3563]}
        zoom={7}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", background: "transparent" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors &copy; CARTO'
          url={tileUrl}
        />
        <FitOnData districts={districts} />
        {districts.map((d) => (
          <CircleMarker
            key={d.id}
            center={[d.lat, d.lng]}
            radius={riskRadius(d.activeCases)}
            pathOptions={{
              color: RISK_COLOR[d.riskLevel],
              fillColor: RISK_COLOR[d.riskLevel],
              fillOpacity: 0.45,
              weight: 1.5,
            }}
            eventHandlers={{
              click: () => onSelectDistrict?.(d),
            }}
          >
            <Tooltip direction="top" offset={[0, -4]}>
              <span className="text-xs font-medium">{d.name}</span>
            </Tooltip>
            <Popup>
              <div className="min-w-[180px] text-xs">
                <p className="mb-1 text-sm font-semibold">{d.name}</p>
                <p className="text-muted-foreground">{d.division} Division</p>
                <div className="mt-2 space-y-1">
                  <p>Population: <strong>{formatCompact(d.population)}</strong></p>
                  <p>Active Cases: <strong>{d.activeCases}</strong></p>
                  <p>Risk Level: <strong>{d.riskLevel}</strong></p>
                  <p>Health Index: <strong>{d.healthIndex}/100</strong></p>
                  <p>Hospitals: <strong>{d.hospitalsCount}</strong></p>
                  <p>Beds Available: <strong>{d.bedsAvailable}</strong></p>
                </div>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {showHospitals &&
          hospitals.map((h) => (
            <CircleMarker
              key={h.id}
              center={[h.lat, h.lng]}
              radius={4}
              pathOptions={{
                color: h.hasEmergency ? "#1976d2" : "#00bcd4",
                fillColor: h.hasEmergency ? "#1976d2" : "#00bcd4",
                fillOpacity: 0.85,
                weight: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <span className="text-xs">{h.name} &middot; {h.occupancyRate}% occupied</span>
              </Tooltip>
            </CircleMarker>
          ))}

        {showAmbulances &&
          ambulances.map((a) => (
            <CircleMarker
              key={a.id}
              center={[a.lat, a.lng]}
              radius={3}
              pathOptions={{
                color: a.status === "Available" ? "#0ca30c" : a.status === "Dispatched" ? "#ffc107" : "#898781",
                fillColor: a.status === "Available" ? "#0ca30c" : a.status === "Dispatched" ? "#ffc107" : "#898781",
                fillOpacity: 0.9,
                weight: 1,
              }}
            >
              <Tooltip direction="top" offset={[0, -4]}>
                <span className="text-xs">{a.code} &middot; {a.status}</span>
              </Tooltip>
            </CircleMarker>
          ))}
      </MapContainer>
    </div>
  );
}
