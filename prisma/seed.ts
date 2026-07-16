import { PrismaClient } from "@prisma/client";
import { DIVISIONS, DISTRICTS, DISEASES } from "../mock-data/geo";
import { createRng, randInt, randFloat, pick, pickWeighted } from "../utils/random";

const prisma = new PrismaClient();

function id(prefix: string, n: number) {
  return `${prefix}_${n.toString().padStart(6, "0")}`;
}

async function chunkedCreateMany<T>(
  label: string,
  rows: T[],
  create: (batch: T[]) => Promise<unknown>,
  size = 1000
) {
  for (let i = 0; i < rows.length; i += size) {
    await create(rows.slice(i, i + size));
    process.stdout.write(`\r  ${label}: ${Math.min(i + size, rows.length)}/${rows.length}`);
  }
  console.log();
}

const BANGLADESHI_FIRST_NAMES_M = [
  "Rahim", "Karim", "Jahid", "Anisur", "Habibur", "Kamrul", "Nazmul", "Shahidul",
  "Rafiqul", "Mizanur", "Delwar", "Shamsul", "Anwar", "Masud", "Zahirul", "Ashraf",
  "Faruk", "Iqbal", "Mahmud", "Tariqul", "Rezaul", "Shafiqul", "Golam", "Aminul",
];
const BANGLADESHI_FIRST_NAMES_F = [
  "Fatema", "Rashida", "Nasrin", "Salma", "Rehana", "Shirin", "Farida", "Rokeya",
  "Momtaz", "Hasina", "Sultana", "Parveen", "Shahnaz", "Ruma", "Nilufar", "Ayesha",
  "Khadija", "Taslima", "Marium", "Selina", "Jesmin", "Laila", "Shabnam", "Rina",
];
const LAST_NAMES = [
  "Rahman", "Islam", "Hossain", "Ahmed", "Khan", "Chowdhury", "Akter", "Uddin",
  "Molla", "Sarkar", "Talukder", "Miah", "Sheikh", "Bhuiyan", "Mia", "Haque",
];

function personName(rng: () => number, gender: "Male" | "Female") {
  const first = gender === "Male" ? pick(rng, BANGLADESHI_FIRST_NAMES_M) : pick(rng, BANGLADESHI_FIRST_NAMES_F);
  return `${first} ${pick(rng, LAST_NAMES)}`;
}

const HOSPITAL_TYPES = ["Government", "Private", "Specialized", "Community Clinic"] as const;
const SPECIALTIES = [
  "General Physician", "Cardiology", "Neurology", "Pediatrics", "Gynecology & Obstetrics",
  "Orthopedics", "Oncology", "Nephrology", "Endocrinology", "Psychiatry", "Dermatology",
  "Emergency Medicine", "Anesthesiology", "Pulmonology", "Gastroenterology", "ENT",
  "Ophthalmology", "Urology",
];
const MEDICINE_CATALOG: { name: string; category: string; unit: string }[] = [
  { name: "Amoxicillin 500mg", category: "Antibiotics", unit: "strips" },
  { name: "Paracetamol 500mg", category: "Analgesics", unit: "strips" },
  { name: "Oseltamivir 75mg", category: "Antivirals", unit: "capsules" },
  { name: "Insulin (Human)", category: "Diabetes Care", unit: "vials" },
  { name: "Amlodipine 5mg", category: "Antihypertensives", unit: "strips" },
  { name: "IV Saline 0.9%", category: "IV Fluids", unit: "bags" },
  { name: "Medical Oxygen", category: "Oxygen Supplies", unit: "cylinders" },
  { name: "ORS Sachets", category: "Rehydration", unit: "sachets" },
];
const AMBULANCE_TYPES = ["Basic Ambulance", "ICU Ambulance", "Water Ambulance"] as const;
const VACCINES = ["COVID-19 Booster", "Measles-Rubella", "Pentavalent (DPT-HepB-Hib)", "Oral Polio", "HPV"];
const PATIENT_STATUSES = ["Admitted", "Under Treatment", "Recovered", "Discharged", "Critical"] as const;
const SEVERITIES = ["Mild", "Moderate", "Severe", "Critical"] as const;
const RISK_LEVELS = ["Low", "Moderate", "High", "Severe"] as const;

async function main() {
  console.log("Clearing existing data...");
  await prisma.emergencyIncident.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.ambulance.deleteMany();
  await prisma.medicineStock.deleteMany();
  await prisma.diseaseRecord.deleteMany();
  await prisma.patient.deleteMany();
  await prisma.doctor.deleteMany();
  await prisma.hospital.deleteMany();
  await prisma.district.deleteMany();
  await prisma.division.deleteMany();

  const rng = createRng("bd-health-demo-v1");

  // ---------- Divisions ----------
  console.log("Seeding divisions...");
  const divisionIds: Record<string, string> = {};
  for (let i = 0; i < DIVISIONS.length; i++) {
    const d = DIVISIONS[i];
    const divId = id("div", i + 1);
    divisionIds[d.name] = divId;
  }
  await prisma.division.createMany({
    data: DIVISIONS.map((d, i) => ({
      id: divisionIds[d.name],
      name: d.name,
      nameBn: d.nameBn,
      lat: d.lat,
      lng: d.lng,
    })),
  });

  // ---------- Districts ----------
  console.log("Seeding districts...");
  const districtIds: string[] = [];
  const districtMeta: {
    id: string;
    name: string;
    division: string;
    population: number;
    lat: number;
    lng: number;
  }[] = [];

  const districtRows = DISTRICTS.map((dist, i) => {
    const distId = id("dis", i + 1);
    districtIds.push(distId);
    const drng = createRng(`district-${dist.name}-${i}`);
    const isMajor = ["Dhaka", "Chattogram", "Gazipur", "Narayanganj", "Cumilla", "Rajshahi", "Khulna", "Sylhet"].includes(dist.name);
    const population = isMajor ? randInt(drng, 2500000, 12000000) : randInt(drng, 400000, 2200000);
    const literacyRate = randFloat(drng, 52, 82, 1);
    const areaSqKm = randFloat(drng, 700, 6200, 0);
    const healthIndex = randFloat(drng, 48, 91, 1);
    const riskLevel = pickWeighted(drng, [
      ["Low", 30],
      ["Moderate", 40],
      ["High", 22],
      ["Severe", 8],
    ] as [typeof RISK_LEVELS[number], number][]);
    districtMeta.push({ id: distId, name: dist.name, division: dist.division, population, lat: dist.lat, lng: dist.lng });
    return {
      id: distId,
      name: dist.name,
      nameBn: dist.nameBn,
      divisionId: divisionIds[dist.division],
      population,
      lat: dist.lat,
      lng: dist.lng,
      riskLevel,
      healthIndex,
      literacyRate,
      areaSqKm,
    };
  });
  await prisma.district.createMany({ data: districtRows });

  // ---------- Hospitals (500) ----------
  console.log("Seeding hospitals...");
  const TOTAL_HOSPITALS = 500;
  const totalPop = districtMeta.reduce((s, d) => s + d.population, 0);
  const baseAlloc = districtMeta.map((d) => Math.max(2, Math.round((d.population / totalPop) * (TOTAL_HOSPITALS - districtMeta.length * 2))));
  let allocSum = baseAlloc.reduce((a, b) => a + b, 0) + districtMeta.length * 2;
  const allocations = baseAlloc.map((n) => n + 2);
  let diff = TOTAL_HOSPITALS - allocSum;
  let idx = 0;
  while (diff !== 0) {
    const step = diff > 0 ? 1 : -1;
    allocations[idx % allocations.length] = Math.max(1, allocations[idx % allocations.length] + step);
    diff -= step;
    idx++;
  }

  const hospitalRows: {
    id: string; name: string; type: string; districtId: string; lat: number; lng: number;
    beds: number; availableBeds: number; icuBeds: number; icuAvailable: number;
    ventilators: number; ventilatorsInUse: number; nursesCount: number; waitingTimeMin: number;
    occupancyRate: number; satisfactionScore: number; performanceScore: number; established: number;
    hasEmergency: boolean;
  }[] = [];
  const hospitalIdsByDistrict: Record<string, string[]> = {};
  let hCounter = 0;

  for (let di = 0; di < districtMeta.length; di++) {
    const dist = districtMeta[di];
    const count = allocations[di];
    hospitalIdsByDistrict[dist.id] = [];
    for (let k = 0; k < count; k++) {
      hCounter++;
      const hId = id("hosp", hCounter);
      hospitalIdsByDistrict[dist.id].push(hId);
      const hrng = createRng(`hosp-${dist.name}-${k}`);
      const type = pickWeighted(hrng, [
        ["Government", 45],
        ["Private", 35],
        ["Specialized", 10],
        ["Community Clinic", 10],
      ] as [typeof HOSPITAL_TYPES[number], number][]);
      const namePrefix = type === "Government" ? (k === 0 ? `${dist.name} General Hospital` : `${dist.name} District Hospital ${k}`)
        : type === "Private" ? `${dist.name} Central Hospital ${k}`
        : type === "Specialized" ? `${dist.name} Specialized Care Institute ${k}`
        : `${dist.name} Community Health Complex ${k}`;
      const beds = type === "Community Clinic" ? randInt(hrng, 15, 50) : type === "Specialized" ? randInt(hrng, 60, 200) : randInt(hrng, 40, 500);
      const occupancyRate = randFloat(hrng, 45, 98, 1);
      const availableBeds = Math.max(0, Math.round(beds * (1 - occupancyRate / 100)));
      const icuBeds = Math.max(0, Math.round(beds * randFloat(hrng, 0.03, 0.12, 2)));
      const icuAvailable = Math.max(0, Math.round(icuBeds * randFloat(hrng, 0.05, 0.6, 2)));
      const ventilators = Math.max(0, Math.round(icuBeds * randFloat(hrng, 0.4, 0.9, 2)));
      const ventilatorsInUse = Math.max(0, Math.round(ventilators * randFloat(hrng, 0.2, 0.95, 2)));
      const lat = dist.lat + randFloat(hrng, -0.15, 0.15, 4);
      const lng = dist.lng + randFloat(hrng, -0.15, 0.15, 4);

      hospitalRows.push({
        id: hId,
        name: namePrefix,
        type,
        districtId: dist.id,
        lat,
        lng,
        beds,
        availableBeds,
        icuBeds,
        icuAvailable,
        ventilators,
        ventilatorsInUse,
        nursesCount: randInt(hrng, Math.round(beds * 0.6), Math.round(beds * 1.4) + 2),
        waitingTimeMin: randInt(hrng, 8, 140),
        occupancyRate,
        satisfactionScore: randFloat(hrng, 55, 97, 1),
        performanceScore: randFloat(hrng, 40, 96, 1),
        established: randInt(hrng, 1975, 2022),
        hasEmergency: hrng() > 0.25,
      });
    }
  }
  await chunkedCreateMany("hospitals", hospitalRows, (batch) => prisma.hospital.createMany({ data: batch }));

  // ---------- Doctors (1000) ----------
  console.log("Seeding doctors...");
  const TOTAL_DOCTORS = 1000;
  const doctorRows: {
    id: string; name: string; hospitalId: string; specialty: string;
    experienceYears: number; patientsPerDay: number; available: boolean; rating: number;
  }[] = [];
  const allHospitalIds = hospitalRows.map((h) => h.id);
  for (let i = 0; i < TOTAL_DOCTORS; i++) {
    const drng = createRng(`doctor-${i}`);
    const gender: "Male" | "Female" = drng() > 0.42 ? "Male" : "Female";
    const hospitalId = pick(drng, allHospitalIds);
    doctorRows.push({
      id: id("doc", i + 1),
      name: `Dr. ${personName(drng, gender)}`,
      hospitalId,
      specialty: pick(drng, SPECIALTIES),
      experienceYears: randInt(drng, 1, 35),
      patientsPerDay: randInt(drng, 8, 60),
      available: drng() > 0.18,
      rating: randFloat(drng, 3.2, 5.0, 1),
    });
  }
  await chunkedCreateMany("doctors", doctorRows, (batch) => prisma.doctor.createMany({ data: batch }));

  // ---------- Medicine Stocks ----------
  console.log("Seeding medicine stocks...");
  const medRows: {
    id: string; name: string; category: string; hospitalId: string;
    stockLevel: number; capacity: number; unit: string; status: string; reorderLevel: number;
  }[] = [];
  let medCounter = 0;
  for (const h of hospitalRows) {
    for (const med of MEDICINE_CATALOG) {
      medCounter++;
      const mrng = createRng(`med-${h.id}-${med.name}`);
      const capacity = randInt(mrng, 200, 5000);
      const stockLevel = Math.round(capacity * randFloat(mrng, 0.02, 1.05, 2));
      const reorderLevel = Math.round(capacity * 0.2);
      const ratio = stockLevel / capacity;
      const status = ratio < 0.1 ? "Critical" : ratio < 0.25 ? "Low" : ratio > 0.95 ? "Overstocked" : "Adequate";
      medRows.push({
        id: id("med", medCounter),
        name: med.name,
        category: med.category,
        hospitalId: h.id,
        stockLevel,
        capacity,
        unit: med.unit,
        status,
        reorderLevel,
      });
    }
  }
  await chunkedCreateMany("medicine stocks", medRows, (batch) => prisma.medicineStock.createMany({ data: batch }));

  // ---------- Ambulances ----------
  console.log("Seeding ambulances...");
  const ambRows: { id: string; code: string; districtId: string; status: string; type: string; lat: number; lng: number }[] = [];
  let ambCounter = 0;
  for (const dist of districtMeta) {
    const arng = createRng(`amb-${dist.id}`);
    const n = randInt(arng, 3, 8);
    for (let k = 0; k < n; k++) {
      ambCounter++;
      const status = pickWeighted(arng, [
        ["Available", 55],
        ["Dispatched", 30],
        ["Maintenance", 15],
      ] as [string, number][]);
      ambRows.push({
        id: id("amb", ambCounter),
        code: `AMB-${dist.name.slice(0, 3).toUpperCase()}-${(k + 1).toString().padStart(2, "0")}`,
        districtId: dist.id,
        status,
        type: pick(arng, AMBULANCE_TYPES),
        lat: dist.lat + randFloat(arng, -0.2, 0.2, 4),
        lng: dist.lng + randFloat(arng, -0.2, 0.2, 4),
      });
    }
  }
  await chunkedCreateMany("ambulances", ambRows, (batch) => prisma.ambulance.createMany({ data: batch }));

  // ---------- Vaccinations ----------
  console.log("Seeding vaccination records...");
  const vaxRows: {
    id: string; districtId: string; vaccine: string; date: Date;
    dosesAdministered: number; targetPopulation: number; coveragePercent: number;
  }[] = [];
  let vaxCounter = 0;
  const now = new Date();
  for (const dist of districtMeta) {
    for (const vaccine of VACCINES) {
      const vrng = createRng(`vax-${dist.id}-${vaccine}`);
      const targetPopulation = Math.round(dist.population * randFloat(vrng, 0.15, 0.35, 2));
      let cumulative = 0;
      for (let m = 11; m >= 0; m--) {
        vaxCounter++;
        const date = new Date(now.getFullYear(), now.getMonth() - m, 15);
        const monthlyDoses = Math.round(targetPopulation * randFloat(vrng, 0.02, 0.09, 3));
        cumulative = Math.min(targetPopulation, cumulative + monthlyDoses);
        vaxRows.push({
          id: id("vax", vaxCounter),
          districtId: dist.id,
          vaccine,
          date,
          dosesAdministered: cumulative,
          targetPopulation,
          coveragePercent: Math.round((cumulative / targetPopulation) * 1000) / 10,
        });
      }
    }
  }
  await chunkedCreateMany("vaccinations", vaxRows, (batch) => prisma.vaccination.createMany({ data: batch }));

  // ---------- Disease Records (~20480) ----------
  console.log("Seeding disease records...");
  const diseaseRows: {
    id: string; disease: string; districtId: string; date: Date;
    cases: number; deaths: number; recovered: number; riskScore: number;
  }[] = [];
  let drCounter = 0;
  const DAYS = 40;
  const diseaseBaseFactor: Record<string, number> = {
    Dengue: 1.4, "COVID-19": 1.2, Tuberculosis: 0.7, Diabetes: 1.0,
    Hypertension: 1.1, Cancer: 0.4, "Maternal Health": 0.6, "Child Health": 0.9,
  };
  for (const dist of districtMeta) {
    const popFactor = dist.population / 1_000_000;
    for (const disease of DISEASES) {
      const rng2 = createRng(`disease-${dist.id}-${disease}`);
      const base = Math.max(2, popFactor * 6 * (diseaseBaseFactor[disease] ?? 1));
      let trendDrift = randFloat(rng2, -0.015, 0.02, 4);
      let level = base * randFloat(rng2, 0.7, 1.4, 3);
      for (let day = DAYS - 1; day >= 0; day--) {
        drCounter++;
        const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - day);
        const weekday = date.getDay();
        const seasonality = weekday === 0 || weekday === 6 ? 0.85 : 1.05;
        level = Math.max(1, level * (1 + trendDrift) * randFloat(rng2, 0.9, 1.1, 3));
        const cases = Math.max(0, Math.round(level * seasonality));
        const deaths = Math.round(cases * randFloat(rng2, 0, disease === "Cancer" || disease === "COVID-19" ? 0.04 : 0.015, 4));
        const recovered = Math.max(0, Math.round(cases * randFloat(rng2, 0.6, 0.95, 3)));
        const riskScore = Math.min(100, Math.round((cases / (base * 2)) * 60 + deaths * 8 + randFloat(rng2, 0, 15, 1)));
        diseaseRows.push({
          id: id("dr", drCounter),
          disease,
          districtId: dist.id,
          date,
          cases,
          deaths,
          recovered,
          riskScore,
        });
      }
    }
  }
  await chunkedCreateMany("disease records", diseaseRows, (batch) => prisma.diseaseRecord.createMany({ data: batch }));

  // ---------- Patients (10000) ----------
  console.log("Seeding patients...");
  const TOTAL_PATIENTS = 10000;
  const patientRows: {
    id: string; name: string; age: number; gender: string; districtId: string;
    hospitalId: string; disease: string; admissionDate: Date; status: string; severity: string;
  }[] = [];
  for (let i = 0; i < TOTAL_PATIENTS; i++) {
    const prng = createRng(`patient-${i}`);
    const dist = pick(prng, districtMeta);
    const hospitalId = pick(prng, hospitalIdsByDistrict[dist.id]?.length ? hospitalIdsByDistrict[dist.id] : allHospitalIds);
    const gender: "Male" | "Female" = prng() > 0.49 ? "Male" : "Female";
    const daysAgo = randInt(prng, 0, 90);
    const admissionDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    patientRows.push({
      id: id("pat", i + 1),
      name: personName(prng, gender),
      age: randInt(prng, 0, 95),
      gender,
      districtId: dist.id,
      hospitalId,
      disease: pick(prng, DISEASES),
      admissionDate,
      status: pick(prng, PATIENT_STATUSES),
      severity: pick(prng, SEVERITIES),
    });
  }
  await chunkedCreateMany("patients", patientRows, (batch) => prisma.patient.createMany({ data: batch }));

  // ---------- Alerts ----------
  console.log("Seeding alerts...");
  const sortedByRisk = [...districtMeta].sort((a, b) => 0.5 - createRng(`riskrank-${a.id}${b.id}`)());
  const alertRows: {
    id: string; title: string; description: string; category: string; priority: string;
    districtId: string | null; aiGenerated: boolean; createdAt: Date;
  }[] = [];
  const alertTemplates: { category: string; priority: string; title: (d: string) => string; desc: (d: string) => string }[] = [
    { category: "Disease Outbreak", priority: "Critical", title: (d) => `High Dengue Risk Detected in ${d}`, desc: (d) => `AI surveillance model flags a sharp rise in Dengue cases in ${d} over the last 7 days, exceeding the seasonal baseline by a wide margin. Vector control teams recommended.` },
    { category: "Medicine Shortage", priority: "High", title: (d) => `Medicine Shortage Predicted in ${d}`, desc: (d) => `Inventory depletion trend for essential medicines in ${d} indicates stock-out risk within 10-14 days at current consumption rate.` },
    { category: "Emergency", priority: "Critical", title: (d) => `Flood-Affected Hospitals Reported in ${d}`, desc: (d) => `Seasonal flooding is impacting healthcare access and hospital operations in low-lying areas of ${d}. Emergency response coordination advised.` },
    { category: "AI Recommendation", priority: "Medium", title: (d) => `AI Recommends Resource Reallocation for ${d}`, desc: (d) => `Predictive model suggests reallocating ICU capacity and additional doctors to ${d} to balance projected patient load over the next 2 weeks.` },
    { category: "Hospital Capacity", priority: "High", title: (d) => `Hospital Occupancy Nearing Capacity in ${d}`, desc: (d) => `Average bed occupancy across major hospitals in ${d} has crossed 90%, risking delayed admissions for critical cases.` },
    { category: "Vaccination", priority: "Low", title: (d) => `Vaccination Coverage Gap Identified in ${d}`, desc: (d) => `Immunization coverage in ${d} trails the national average; targeted outreach campaigns recommended.` },
  ];
  let aCounter = 0;
  for (let i = 0; i < 55; i++) {
    aCounter++;
    const arng = createRng(`alert-${i}`);
    const dist = sortedByRisk[i % sortedByRisk.length];
    const tmpl = pick(arng, alertTemplates);
    const hoursAgo = randInt(arng, 0, 96);
    alertRows.push({
      id: id("alert", aCounter),
      title: tmpl.title(dist.name),
      description: tmpl.desc(dist.name),
      category: tmpl.category,
      priority: tmpl.priority,
      districtId: dist.id,
      aiGenerated: true,
      createdAt: new Date(now.getTime() - hoursAgo * 60 * 60 * 1000),
    });
  }
  await prisma.alert.createMany({ data: alertRows });

  // ---------- Emergency Incidents ----------
  console.log("Seeding emergency incidents...");
  const emergencyProneDistricts = districtMeta.filter((d) =>
    ["Cox's Bazar", "Bhola", "Barguna", "Patuakhali", "Sunamganj", "Kurigram", "Sirajganj", "Noakhali", "Chattogram", "Khulna", "Satkhira", "Bagerhat", "Rangamati", "Bandarban", "Lalmonirhat", "Gaibandha", "Jamalpur", "Netrokona", "Habiganj", "Moulvibazar"].includes(d.name)
  );
  const incidentTypes = ["Flood", "Cyclone", "Disease Outbreak", "River Erosion", "Landslide"];
  const incidentStatuses = ["Active", "Contained", "Resolved"];
  const incRows: {
    id: string; type: string; districtId: string; severity: string; status: string;
    startedAt: Date; affectedPopulation: number; description: string;
  }[] = [];
  for (let i = 0; i < 22; i++) {
    const irng = createRng(`incident-${i}`);
    const dist = pick(irng, emergencyProneDistricts.length ? emergencyProneDistricts : districtMeta);
    const type = pick(irng, incidentTypes);
    const status = pickWeighted(irng, [
      ["Active", 25],
      ["Contained", 35],
      ["Resolved", 40],
    ] as [string, number][]);
    const daysAgo = randInt(irng, 0, 60);
    incRows.push({
      id: id("inc", i + 1),
      type,
      districtId: dist.id,
      severity: pickWeighted(irng, [
        ["Critical", 20],
        ["High", 35],
        ["Medium", 45],
      ] as [string, number][]),
      status,
      startedAt: new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000),
      affectedPopulation: randInt(irng, 5000, 850000),
      description: `${type} incident reported in ${dist.name}, ${status.toLowerCase()} response coordination in progress with local disaster management authorities.`,
    });
  }
  await prisma.emergencyIncident.createMany({ data: incRows });

  console.log("\nSeed complete:");
  console.log(`  Divisions: ${DIVISIONS.length}`);
  console.log(`  Districts: ${districtRows.length}`);
  console.log(`  Hospitals: ${hospitalRows.length}`);
  console.log(`  Doctors: ${doctorRows.length}`);
  console.log(`  Medicine stocks: ${medRows.length}`);
  console.log(`  Ambulances: ${ambRows.length}`);
  console.log(`  Vaccinations: ${vaxRows.length}`);
  console.log(`  Disease records: ${diseaseRows.length}`);
  console.log(`  Patients: ${patientRows.length}`);
  console.log(`  Alerts: ${alertRows.length}`);
  console.log(`  Emergency incidents: ${incRows.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
