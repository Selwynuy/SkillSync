import { AssessmentAttempt, AssessmentResponse } from "@/lib/types"

// In-memory storage for assessment attempts (MVP)
// In production, this would be a database
const attempts: Map<string, AssessmentAttempt> = new Map()

// In-progress attempts (not yet completed)
const inProgressAttempts: Map<
  string,
  {
    userId: string
    assessmentId: string
    responses: AssessmentResponse[]
    currentModuleIndex: number
    createdAt: Date
  }
> = new Map()

export async function createAttempt(
  userId: string,
  assessmentId: string
): Promise<string> {
  const attemptId = `attempt-${Date.now()}-${Math.random().toString(36).slice(2)}`

  inProgressAttempts.set(attemptId, {
    userId,
    assessmentId,
    responses: [],
    currentModuleIndex: 0,
    createdAt: new Date(),
  })

  return attemptId
}

export async function getInProgressAttempt(attemptId: string) {
  return inProgressAttempts.get(attemptId) || null
}

export async function updateAttemptProgress(
  attemptId: string,
  responses: AssessmentResponse[],
  currentModuleIndex: number
): Promise<void> {
  const attempt = inProgressAttempts.get(attemptId)
  if (!attempt) {
    throw new Error("Attempt not found")
  }

  inProgressAttempts.set(attemptId, {
    ...attempt,
    responses,
    currentModuleIndex,
  })
}

export async function completeAttempt(
  attemptId: string,
  traitVector: number[],
  traitSummary: Record<string, number>
): Promise<AssessmentAttempt> {
  const inProgress = inProgressAttempts.get(attemptId)
  if (!inProgress) {
    throw new Error("Attempt not found")
  }

  const completedAttempt: AssessmentAttempt = {
    id: attemptId,
    userId: inProgress.userId,
    assessmentId: inProgress.assessmentId,
    responses: inProgress.responses,
    traitVector,
    traitSummary,
    completedAt: new Date(),
    createdAt: inProgress.createdAt,
  }

  attempts.set(attemptId, completedAttempt)
  inProgressAttempts.delete(attemptId)

  return completedAttempt
}

export async function getAttemptById(
  attemptId: string
): Promise<AssessmentAttempt | null> {
  return attempts.get(attemptId) || null
}

export async function getUserAttempts(
  userId: string
): Promise<AssessmentAttempt[]> {
  return Array.from(attempts.values())
    .filter((attempt) => attempt.userId === userId)
    .sort((a, b) => b.completedAt.getTime() - a.completedAt.getTime())
}

export async function getLatestAttempt(
  userId: string
): Promise<AssessmentAttempt | null> {
  const userAttempts = await getUserAttempts(userId)
  return userAttempts[0] || null
}

export async function deleteUserAttempts(userId: string): Promise<number> {
  let deletedCount = 0;

  // Delete completed attempts
  for (const [id, attempt] of attempts.entries()) {
    if (attempt.userId === userId) {
      attempts.delete(id);
      deletedCount++;
    }
  }

  // Delete in-progress attempts
  for (const [id, attempt] of inProgressAttempts.entries()) {
    if (attempt.userId === userId) {
      inProgressAttempts.delete(id);
      deletedCount++;
    }
  }

  return deletedCount;
}
