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

export interface CriticalHospital {
  id: string;
  name: string;
  type: string;
  districtName: string;
  divisionName: string;
  districtRiskLevel: string;
  beds: number;
  availableBeds: number;
  occupancyRate: number;
  icuBeds: number;
  icuAvailable: number;
  ventilators: number;
  ventilatorsInUse: number;
  waitingTimeMin: number;
  hasEmergency: boolean;
  activePatients: number;
  criticalPatients: number;
  severePatients: number;
  criticalRatio: number;
  activeDistrictIncidents: number;
  criticalityScore: number;
  concerns: string[];
}

export interface CriticalHospitalDetail extends CriticalHospital {
  nursesCount: number;
  doctorsTotal: number;
  doctorsAvailable: number;
  scoreBreakdown: {
    patientSeverityPressure: number;
    occupancyPressure: number;
    icuPressure: number;
    ventilatorPressure: number;
    waitingPressure: number;
  };
  severityBreakdown: { mild: number; moderate: number; severe: number; critical: number };
  recentIncidents: {
    id: string;
    type: string;
    severity: string;
    status: string;
    startedAt: string;
    affectedPopulation: number;
    description: string;
  }[];
  recentAlerts: {
    id: string;
    title: string;
    description: string;
    category: string;
    priority: string;
    aiGenerated: boolean;
    createdAt: string;
  }[];
}

export interface SavedReport {
  id: string;
  title: string;
  category: "Today's Summary" | "Disease Analysis" | "Hospital Analysis" | "National Reports";
  createdAt: string;
}
