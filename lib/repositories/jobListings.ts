import { JobListing, JobListingFilters } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";

let cache: JobListing[] | null = null;

export async function getAllJobListings(): Promise<JobListing[]> {
  if (cache) {
    return cache;
  }

  const filePath = path.join(process.cwd(), "data", "mockJobs.json");
  const fileContents = await fs.readFile(filePath, "utf8");
  const data = JSON.parse(fileContents) as JobListing[];

  // Convert date strings to Date objects
  cache = data.map((job) => ({
    ...job,
    postedAt: new Date(job.postedAt),
  }));

  return cache!;
}

export async function getJobListingById(
  id: string
): Promise<JobListing | null> {
  const listings = await getAllJobListings();
  return listings.find((job) => job.id === id) || null;
}

export async function filterJobListings(
  filters: JobListingFilters
): Promise<JobListing[]> {
  const listings = await getAllJobListings();

  return listings.filter((job) => {
    if (filters.region && job.region !== filters.region) {
      return false;
    }

    if (filters.city && job.city !== filters.city) {
      return false;
    }

    if (filters.type && job.type !== filters.type) {
      return false;
    }

    if (filters.salaryMin && job.salary.max < filters.salaryMin) {
      return false;
    }

    if (filters.salaryMax && job.salary.min > filters.salaryMax) {
      return false;
    }

    return true;
  });
}

export async function getAvailableRegions(): Promise<string[]> {
  const listings = await getAllJobListings();
  const regions = new Set(listings.map((job) => job.region));
  return Array.from(regions).sort();
}

export async function getAvailableCities(): Promise<string[]> {
  const listings = await getAllJobListings();
  const cities = new Set(listings.map((job) => job.city));
  return Array.from(cities).sort();
}

export function clearJobListingsCache(): void {
  cache = null;
}
