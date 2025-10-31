import { Assessment } from "@/lib/types";
import { promises as fs } from "fs";
import path from "path";

const cache: Map<string, Assessment> = new Map();

export async function getAssessmentById(
  id: string
): Promise<Assessment | null> {
  if (cache.has(id)) {
    return cache.get(id)!;
  }

  // For now, we only have one assessment file
  // In the future, this could be dynamic based on id
  const fileName = "career-fit-assessment.json";
  const filePath = path.join(
    process.cwd(),
    "data",
    "assessments",
    fileName
  );

  try {
    const fileContents = await fs.readFile(filePath, "utf8");
    const assessment: Assessment = JSON.parse(fileContents);

    cache.set(assessment.id, assessment);
    return assessment;
  } catch (error) {
    console.error(`Failed to load assessment ${id}:`, error);
    return null;
  }
}

export async function getAllAssessments(): Promise<Assessment[]> {
  // For MVP, we only have one assessment
  // In production, this would scan the assessments directory
  const assessment = await getAssessmentById("assessment-001");
  return assessment ? [assessment] : [];
}

export function clearAssessmentsCache(): void {
  cache.clear();
}
