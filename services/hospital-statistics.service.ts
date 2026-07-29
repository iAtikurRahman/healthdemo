import { prisma } from "@/lib/prisma";
import { toTitleCase } from "@/lib/text";
import type {
  DivisionHospitalGroup,
  DistrictHospitalGroup,
  UpazilaHospitalGroup,
  NationalGisOverview,
  AreaHealthStats,
} from "@/types";

function emptyStats(): AreaHealthStats {
  return {
    beds: 0,
    admissionMale: 0,
    admissionFemale: 0,
    admissionTotal: 0,
    deathMale: 0,
    deathFemale: 0,
    deathTotal: 0,
    outdoorVisitMale: 0,
    outdoorVisitFemale: 0,
    outdoorVisitChild: 0,
    outdoorVisitTotal: 0,
  };
}

function addStats(target: AreaHealthStats, source: AreaHealthStats) {
  target.beds += source.beds;
  target.admissionMale += source.admissionMale;
  target.admissionFemale += source.admissionFemale;
  target.admissionTotal += source.admissionTotal;
  target.deathMale += source.deathMale;
  target.deathFemale += source.deathFemale;
  target.deathTotal += source.deathTotal;
  target.outdoorVisitMale += source.outdoorVisitMale;
  target.outdoorVisitFemale += source.outdoorVisitFemale;
  target.outdoorVisitChild += source.outdoorVisitChild;
  target.outdoorVisitTotal += source.outdoorVisitTotal;
}

// Reproduces:
//   SELECT hs.id, hs.report_year, hs.hospital_name, ai1.name division, ai2.name district, ai3.name upazila
//   FROM hospital_statistics hs
//   LEFT JOIN area_info ai1 ON ai1.id = hs.division_id AND ai1.area_type = 1
//   LEFT JOIN area_info ai2 ON ai2.id = hs.district_id AND ai2.area_type = 2
//   LEFT JOIN area_info ai3 ON ai3.id = hs.upazila_id AND ai3.area_type = 4
// grouped into a division -> district -> upazila -> hospitals tree, with each level's
// `stats` being the SUM of hospital_statistics' report columns (beds, admissions,
// deaths, outdoor visits) across every hospital underneath it. Done in application
// code (rather than a Prisma relation/SQL GROUP BY) because area_info/hospital_statistics
// have no real foreign key constraints in the database.
export async function getNationalGisOverview(): Promise<NationalGisOverview> {
  const [areas, stats] = await Promise.all([
    prisma.areaInfo.findMany({
      where: { areaType: { in: [1, 2, 4] }, status: 1 },
      select: { id: true, name: true, nameBn: true, areaType: true, parentId: true },
    }),
    prisma.hospitalStatistic.findMany({
      select: {
        id: true,
        reportYear: true,
        hospitalName: true,
        no_of_beds: true,
        admission_male: true,
        admission_female: true,
        admission_total: true,
        death_male: true,
        death_female: true,
        death_total: true,
        outdoor_visit_male: true,
        outdoor_visit_female: true,
        outdoor_visit_child: true,
        outdoor_visit_total: true,
        divisionId: true,
        districtId: true,
        upazilaId: true,
      },
    }),
  ]);

  const divisionMap = new Map<number, DivisionHospitalGroup>();
  const districtMap = new Map<number, DistrictHospitalGroup>();
  const upazilaMap = new Map<number, UpazilaHospitalGroup>();

  for (const a of areas) {
    if (a.areaType === 1) {
      divisionMap.set(a.id, { id: a.id, name: toTitleCase(a.name), nameBn: a.nameBn, hospitalsCount: 0, stats: emptyStats(), districts: [] });
    } else if (a.areaType === 2) {
      districtMap.set(a.id, { id: a.id, name: toTitleCase(a.name), nameBn: a.nameBn, hospitalsCount: 0, stats: emptyStats(), upazilas: [] });
    } else if (a.areaType === 4) {
      upazilaMap.set(a.id, { id: a.id, name: toTitleCase(a.name), nameBn: a.nameBn, hospitalsCount: 0, stats: emptyStats(), hospitals: [] });
    }
  }

  for (const a of areas) {
    if (a.areaType === 2 && a.parentId) {
      const division = divisionMap.get(a.parentId);
      const district = districtMap.get(a.id);
      if (division && district) division.districts.push(district);
    } else if (a.areaType === 4 && a.parentId) {
      const district = districtMap.get(a.parentId);
      const upazila = upazilaMap.get(a.id);
      if (district && upazila) district.upazilas.push(upazila);
    }
  }

  let reportYear = 0;
  for (const s of stats) {
    if (s.reportYear > reportYear) reportYear = s.reportYear;
    const upazila = s.upazilaId != null ? upazilaMap.get(s.upazilaId) : undefined;
    if (!upazila) continue;

    const rowStats: AreaHealthStats = {
      beds: s.no_of_beds ?? 0,
      admissionMale: s.admission_male ?? 0,
      admissionFemale: s.admission_female ?? 0,
      admissionTotal: s.admission_total ?? 0,
      deathMale: s.death_male ?? 0,
      deathFemale: s.death_female ?? 0,
      deathTotal: s.death_total ?? 0,
      outdoorVisitMale: s.outdoor_visit_male ?? 0,
      outdoorVisitFemale: s.outdoor_visit_female ?? 0,
      outdoorVisitChild: s.outdoor_visit_child ?? 0,
      outdoorVisitTotal: s.outdoor_visit_total ?? 0,
    };

    upazila.hospitals.push({
      id: s.id,
      reportYear: s.reportYear,
      hospitalName: s.hospitalName,
      beds: rowStats.beds,
      admissionsTotal: rowStats.admissionTotal,
      deathsTotal: rowStats.deathTotal,
      outdoorVisitsTotal: rowStats.outdoorVisitTotal,
    });
    addStats(upazila.stats, rowStats);
  }

  for (const district of districtMap.values()) {
    for (const upazila of district.upazilas) {
      upazila.hospitalsCount = upazila.hospitals.length;
      district.hospitalsCount += upazila.hospitalsCount;
      addStats(district.stats, upazila.stats);
    }
    district.upazilas.sort((a, b) => a.name.localeCompare(b.name));
  }
  for (const division of divisionMap.values()) {
    for (const district of division.districts) {
      division.hospitalsCount += district.hospitalsCount;
      addStats(division.stats, district.stats);
    }
    division.districts.sort((a, b) => a.name.localeCompare(b.name));
  }

  const divisions = [...divisionMap.values()].sort((a, b) => a.name.localeCompare(b.name));

  return {
    reportYear,
    divisions,
    totals: {
      divisions: divisionMap.size,
      districts: districtMap.size,
      upazilas: upazilaMap.size,
      hospitals: stats.length,
    },
  };
}
