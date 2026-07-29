export interface KpiDatum {
  id: string;
  label: string;
  value: number;
  formattedValue: string;
  unit?: string;
  deltaPercent: number;
  trend: "up" | "down" | "flat";
  sentiment: "good" | "warning" | "critical";
  icon: string;
}

export interface ChartPoint {
  label: string;
  [seriesKey: string]: string | number;
}

export interface DistrictMapDatum {
  id: string;
  name: string;
  nameBn: string;
  division: string;
  lat: number;
  lng: number;
  population: number;
  riskLevel: "Low" | "Moderate" | "High" | "Severe";
  healthIndex: number;
  activeCases: number;
  hospitalsCount: number;
  bedsAvailable: number;
}

export interface HospitalMapDatum {
  id: string;
  name: string;
  type: string;
  districtName: string;
  lat: number;
  lng: number;
  occupancyRate: number;
  hasEmergency: boolean;
}

export interface AmbulanceMapDatum {
  id: string;
  code: string;
  districtName: string;
  status: string;
  lat: number;
  lng: number;
}

export interface AlertItem {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  districtName: string | null;
  aiGenerated: boolean;
  createdAt: string;
}

export interface HospitalStatisticItem {
  id: number;
  reportYear: number;
  hospitalName: string;
  beds: number;
  admissionsTotal: number;
  deathsTotal: number;
  outdoorVisitsTotal: number;
}

// Sum of hospital_statistics report columns across every hospital in an area.
export interface AreaHealthStats {
  beds: number;
  admissionMale: number;
  admissionFemale: number;
  admissionTotal: number;
  deathMale: number;
  deathFemale: number;
  deathTotal: number;
  outdoorVisitMale: number;
  outdoorVisitFemale: number;
  outdoorVisitChild: number;
  outdoorVisitTotal: number;
}

export interface UpazilaHospitalGroup {
  id: number;
  name: string;
  nameBn: string | null;
  hospitalsCount: number;
  stats: AreaHealthStats;
  hospitals: HospitalStatisticItem[];
}

export interface DistrictHospitalGroup {
  id: number;
  name: string;
  nameBn: string | null;
  hospitalsCount: number;
  stats: AreaHealthStats;
  upazilas: UpazilaHospitalGroup[];
}

export interface DivisionHospitalGroup {
  id: number;
  name: string;
  nameBn: string | null;
  hospitalsCount: number;
  stats: AreaHealthStats;
  districts: DistrictHospitalGroup[];
}

export interface NationalGisOverview {
  reportYear: number;
  divisions: DivisionHospitalGroup[];
  totals: { divisions: number; districts: number; upazilas: number; hospitals: number };
}

export interface GisFilters {
  division?: string;
  district?: string;
  disease?: string;
  gender?: string;
  ageMin?: number;
  ageMax?: number;
  dateFrom?: string;
  dateTo?: string;
}

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  id: string;
  role: ChatRole;
  content: string;
  createdAt: string;
  charts?: {
    type: "bar" | "line" | "pie";
    title: string;
    data: ChartPoint[];
    seriesKeys: string[];
  }[];
  table?: {
    title: string;
    columns: string[];
    rows: (string | number)[][];
  };
  recommendations?: string[];
  riskScore?: number;
}

export interface HospitalRow {
  id: string;
  name: string;
  type: string;
  districtName: string;
  divisionName: string;
  lat: number;
  lng: number;
  beds: number;
  availableBeds: number;
  icuBeds: number;
  icuAvailable: number;
  ventilators: number;
  ventilatorsInUse: number;
  occupancyRate: number;
  waitingTimeMin: number;
  satisfactionScore: number;
  performanceScore: number;
  hasEmergency: boolean;
  doctorsTotal: number;
  doctorsAvailable: number;
}

// Sourced from the real `hospital_statistics` report table (2011), joined to
// `area_info` for division/district/upazila names — see services/hospitals.service.ts.
export interface CriticalHospital {
  id: number;
  name: string;
  reportYear: number;
  upazilaName: string;
  districtName: string;
  divisionName: string;
  beds: number;
  admissionMale: number;
  admissionFemale: number;
  admissionTotal: number;
  deathMale: number;
  deathFemale: number;
  deathTotal: number;
  outdoorVisitMale: number;
  outdoorVisitFemale: number;
  outdoorVisitChild: number;
  outdoorVisitTotal: number;
  caseFatalityRate: number;
  admissionsPerBed: number;
  outdoorVisitsPerBed: number;
  criticalityScore: number;
  concerns: string[];
  hasReportedActivity: boolean;
}

export interface AiSuggestion {
  title: string;
  detail: string;
  priority: "High" | "Medium" | "Low";
}

export interface AiSuggestionsResponse {
  summary: string;
  suggestions: AiSuggestion[];
}

export interface CriticalHospitalDetail extends CriticalHospital {
  nationalRank: number;
  totalHospitalsNational: number;
  districtRank: number;
  totalHospitalsInDistrict: number;
  divisionRank: number;
  totalHospitalsInDivision: number;
  scoreBreakdown: {
    fatalityPressure: number;
    overcrowdingPressure: number;
    outdoorBurdenPressure: number;
  };
  districtPeers: { id: number; name: string; upazilaName: string; criticalityScore: number }[];
}

export interface SavedReport {
  id: string;
  title: string;
  category: "Today's Summary" | "Disease Analysis" | "Hospital Analysis" | "National Reports";
  createdAt: string;
}
