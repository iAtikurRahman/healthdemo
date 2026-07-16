import { create } from "zustand";

interface GisFilterState {
  division: string;
  district: string;
  disease: string;
  gender: string;
  ageRange: [number, number];
  dateFrom: string;
  dateTo: string;
  showHospitals: boolean;
  showAmbulances: boolean;
  setDivision: (v: string) => void;
  setDistrict: (v: string) => void;
  setDisease: (v: string) => void;
  setGender: (v: string) => void;
  setAgeRange: (v: [number, number]) => void;
  setDateFrom: (v: string) => void;
  setDateTo: (v: string) => void;
  toggleHospitals: () => void;
  toggleAmbulances: () => void;
  reset: () => void;
}

const DEFAULTS = {
  division: "all",
  district: "all",
  disease: "all",
  gender: "all",
  ageRange: [0, 100] as [number, number],
  dateFrom: "",
  dateTo: "",
  showHospitals: true,
  showAmbulances: false,
};

export const useGisStore = create<GisFilterState>((set) => ({
  ...DEFAULTS,
  setDivision: (v) => set({ division: v, district: "all" }),
  setDistrict: (v) => set({ district: v }),
  setDisease: (v) => set({ disease: v }),
  setGender: (v) => set({ gender: v }),
  setAgeRange: (v) => set({ ageRange: v }),
  setDateFrom: (v) => set({ dateFrom: v }),
  setDateTo: (v) => set({ dateTo: v }),
  toggleHospitals: () => set((s) => ({ showHospitals: !s.showHospitals })),
  toggleAmbulances: () => set((s) => ({ showAmbulances: !s.showAmbulances })),
  reset: () => set(DEFAULTS),
}));
