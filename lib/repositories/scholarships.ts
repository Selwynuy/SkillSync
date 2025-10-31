import { Scholarship, ScholarshipFilters } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";

let cache: Scholarship[] | null = null;

export async function getAllScholarships(): Promise<Scholarship[]> {
  if (cache) {
    return cache;
  }

  const filePath = path.join(process.cwd(), "data", "mockScholarships.json");
  const fileContents = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(fileContents) as Scholarship[];

  // Convert date strings to Date objects
  cache = data.map((scholarship) => ({
    ...scholarship,
    deadline: new Date(scholarship.deadline),
  }));

  return cache!;
}

export async function getScholarshipById(
  id: string
): Promise<Scholarship | null> {
  const scholarships = await getAllScholarships();
  return scholarships.find((scholarship) => scholarship.id === id) || null;
}

export async function filterScholarships(
  filters: ScholarshipFilters
): Promise<Scholarship[]> {
  const scholarships = await getAllScholarships();

  return scholarships.filter((scholarship) => {
    if (filters.type && scholarship.type !== filters.type) {
      return false;
    }

    if (filters.amountMin && scholarship.amount < filters.amountMin) {
      return false;
    }

    if (
      filters.deadlineAfter &&
      scholarship.deadline < filters.deadlineAfter
    ) {
      return false;
    }

    if (
      filters.deadlineBefore &&
      scholarship.deadline > filters.deadlineBefore
    ) {
      return false;
    }

    return true;
  });
}

export async function getUpcomingScholarships(
  limit: number = 10
): Promise<Scholarship[]> {
  const scholarships = await getAllScholarships();
  const now = new Date();

  return scholarships
    .filter((scholarship) => scholarship.deadline > now)
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, limit);
}

export function clearScholarshipsCache(): void {
  cache = null;
}
