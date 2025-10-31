import { College, CollegeFilters } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";

let cache: College[] | null = null;

export async function getAllColleges(): Promise<College[]> {
  if (cache) {
    return cache;
  }

  const filePath = path.join(process.cwd(), "data", "mockColleges.json");
  const fileContents = await fs.readFile(filePath, "utf8");
  cache = JSON.parse(fileContents);

  return cache!;
}

export async function getCollegeById(id: string): Promise<College | null> {
  const colleges = await getAllColleges();
  return colleges.find((college) => college.id === id) || null;
}

export async function filterColleges(
  filters: CollegeFilters
): Promise<College[]> {
  const colleges = await getAllColleges();

  return colleges.filter((college) => {
    if (
      filters.degreeLevel &&
      !college.degreeLevel.includes(filters.degreeLevel)
    ) {
      return false;
    }

    if (filters.state && college.state !== filters.state) {
      return false;
    }

    if (filters.modality && !college.modality.includes(filters.modality)) {
      return false;
    }

    if (filters.tuitionMax) {
      const minTuition = Math.min(
        college.tuition.inState,
        college.tuition.outOfState
      );
      if (minTuition > filters.tuitionMax) {
        return false;
      }
    }

    if (
      filters.acceptanceRateMin &&
      college.acceptanceRate < filters.acceptanceRateMin
    ) {
      return false;
    }

    if (
      filters.acceptanceRateMax &&
      college.acceptanceRate > filters.acceptanceRateMax
    ) {
      return false;
    }

    if (filters.program) {
      const hasProgram = college.programs.some((program) =>
        program.toLowerCase().includes(filters.program!.toLowerCase())
      );
      if (!hasProgram) {
        return false;
      }
    }

    return true;
  });
}

export async function getAvailableStates(): Promise<string[]> {
  const colleges = await getAllColleges();
  const states = new Set(colleges.map((college) => college.state));
  return Array.from(states).sort();
}

export async function getAvailablePrograms(): Promise<string[]> {
  const colleges = await getAllColleges();
  const programs = new Set<string>();

  colleges.forEach((college) => {
    college.programs.forEach((program) => programs.add(program));
  });

  return Array.from(programs).sort();
}

export function clearCollegesCache(): void {
  cache = null;
}
