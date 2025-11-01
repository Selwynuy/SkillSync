import { UserMilestones, Milestone } from "@/lib/types";

// In-memory storage for user milestones (MVP)
// In production, this would be a database
const userMilestones: Map<string, UserMilestones> = new Map();

/**
 * Get all milestones for a user across all job paths.
 *
 * @param userId - User ID
 * @returns Array of UserMilestones records
 */
export async function getUserMilestones(
  userId: string
): Promise<UserMilestones[]> {
  return Array.from(userMilestones.values())
    .filter((um) => um.userId === userId)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

/**
 * Get milestones for a specific job path.
 *
 * @param userId - User ID
 * @param jobPathId - Job path ID
 * @returns UserMilestones record or null
 */
export async function getMilestonesByJobPath(
  userId: string,
  jobPathId: string
): Promise<UserMilestones | null> {
  const key = `${userId}-${jobPathId}`;
  return userMilestones.get(key) || null;
}

/**
 * Save or update milestones for a job path.
 *
 * @param userId - User ID
 * @param jobPathId - Job path ID
 * @param milestones - Array of milestones
 * @returns Updated UserMilestones record
 */
export async function saveMilestones(
  userId: string,
  jobPathId: string,
  milestones: Milestone[]
): Promise<UserMilestones> {
  const key = `${userId}-${jobPathId}`;
  const existing = userMilestones.get(key);

  const userMilestonesRecord: UserMilestones = {
    id: existing?.id || `um-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    userId,
    jobPathId,
    milestones,
    updatedAt: new Date(),
  };

  userMilestones.set(key, userMilestonesRecord);
  return userMilestonesRecord;
}

/**
 * Delete milestones for a specific job path.
 *
 * @param userId - User ID
 * @param jobPathId - Job path ID
 * @returns True if deleted, false if not found
 */
export async function deleteMilestones(
  userId: string,
  jobPathId: string
): Promise<boolean> {
  const key = `${userId}-${jobPathId}`;
  return userMilestones.delete(key);
}

/**
 * Validate milestone data.
 *
 * @param milestone - Milestone to validate
 * @returns Validation error message or null if valid
 */
export function validateMilestone(milestone: any): string | null {
  if (!milestone || typeof milestone !== "object") {
    return "Milestone must be an object";
  }

  if (!milestone.id || typeof milestone.id !== "string") {
    return "Milestone must have a valid id";
  }

  if (!milestone.text || typeof milestone.text !== "string") {
    return "Milestone must have a valid text";
  }

  if (milestone.text.trim().length === 0) {
    return "Milestone text cannot be empty";
  }

  if (milestone.text.length > 500) {
    return "Milestone text cannot exceed 500 characters";
  }

  if (typeof milestone.completed !== "boolean") {
    return "Milestone completed must be a boolean";
  }

  if (milestone.completedAt !== undefined && milestone.completedAt !== null) {
    const completedAt = new Date(milestone.completedAt);
    if (isNaN(completedAt.getTime())) {
      return "Milestone completedAt must be a valid date";
    }
  }

  return null;
}

/**
 * Validate an array of milestones.
 *
 * @param milestones - Array of milestones to validate
 * @returns Validation error message or null if valid
 */
export function validateMilestones(milestones: any): string | null {
  if (!Array.isArray(milestones)) {
    return "Milestones must be an array";
  }

  if (milestones.length > 50) {
    return "Cannot have more than 50 milestones per job path";
  }

  for (let i = 0; i < milestones.length; i++) {
    const error = validateMilestone(milestones[i]);
    if (error) {
      return `Milestone ${i + 1}: ${error}`;
    }
  }

  // Check for duplicate IDs
  const ids = new Set<string>();
  for (const milestone of milestones) {
    if (ids.has(milestone.id)) {
      return `Duplicate milestone ID: ${milestone.id}`;
    }
    ids.add(milestone.id);
  }

  return null;
}

/**
 * Delete all milestones for a user.
 *
 * @param userId - User ID
 * @returns Number of milestone records deleted
 */
export async function deleteUserMilestones(userId: string): Promise<number> {
  let deletedCount = 0;

  for (const [key, um] of userMilestones.entries()) {
    if (um.userId === userId) {
      userMilestones.delete(key);
      deletedCount++;
    }
  }

  return deletedCount;
}
