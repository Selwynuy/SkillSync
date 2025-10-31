import { JobPath } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";

let cache: JobPath[] | null = null;

export async function getAllJobPaths(): Promise<JobPath[]> {
  if (cache) {
    return cache;
  }

  const filePath = path.join(process.cwd(), "data", "jobPaths.json");
  const fileContents = await fs.readFile(filePath, "utf8");
  cache = JSON.parse(fileContents);

  return cache!;
}

export async function getJobPathById(id: string): Promise<JobPath | null> {
  const jobPaths = await getAllJobPaths();
  return jobPaths.find((jp) => jp.id === id) || null;
}

export async function getJobPathsByCategory(
  category: string
): Promise<JobPath[]> {
  const jobPaths = await getAllJobPaths();
  return jobPaths.filter((jp) => jp.category === category);
}

export async function searchJobPaths(query: string): Promise<JobPath[]> {
  const jobPaths = await getAllJobPaths();
  const lowerQuery = query.toLowerCase();

  return jobPaths.filter(
    (jp) =>
      jp.title.toLowerCase().includes(lowerQuery) ||
      jp.description.toLowerCase().includes(lowerQuery) ||
      jp.tags.some((tag) => tag.toLowerCase().includes(lowerQuery))
  );
}

export function clearJobPathsCache(): void {
  cache = null;
}
