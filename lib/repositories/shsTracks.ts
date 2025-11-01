import { SHSTrack } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";

let cache: SHSTrack[] | null = null;

/**
 * Get all SHS tracks from JSON file
 */
export async function getAllSHSTracks(): Promise<SHSTrack[]> {
  if (cache) {
    return cache;
  }

  const filePath = path.join(process.cwd(), "data", "shsTracks.json");
  const fileContents = await fs.readFile(filePath, "utf8");
  cache = JSON.parse(fileContents);

  return cache!;
}

/**
 * Get a specific SHS track by ID
 */
export async function getSHSTrackById(id: string): Promise<SHSTrack | null> {
  const tracks = await getAllSHSTracks();
  return tracks.find((track) => track.id === id) || null;
}

/**
 * Get SHS tracks by track type (Academic, TVL, Sports, Arts and Design)
 */
export async function getSHSTracksByType(
  trackType: string
): Promise<SHSTrack[]> {
  const tracks = await getAllSHSTracks();
  return tracks.filter((track) => track.trackType === trackType);
}

/**
 * Get SHS tracks by strand (STEM, ABM, HUMSS, GAS, ICT, etc.)
 */
export async function getSHSTracksByStrand(
  strand: string
): Promise<SHSTrack[]> {
  const tracks = await getAllSHSTracks();
  return tracks.filter((track) => track.strand === strand);
}

/**
 * Search SHS tracks by query string
 */
export async function searchSHSTracks(query: string): Promise<SHSTrack[]> {
  const tracks = await getAllSHSTracks();
  const lowerQuery = query.toLowerCase();

  return tracks.filter(
    (track) =>
      track.title.toLowerCase().includes(lowerQuery) ||
      track.description.toLowerCase().includes(lowerQuery) ||
      track.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      track.collegePrograms.some((program) =>
        program.toLowerCase().includes(lowerQuery)
      )
  );
}

/**
 * Clear the cache (useful for testing or updates)
 */
export function clearSHSTracksCache(): void {
  cache = null;
}
