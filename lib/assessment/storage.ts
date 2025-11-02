import { AssessmentAttempt, AssessmentResponse } from "@/lib/types";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Assessment Storage with Supabase
 *
 * This module handles storage of assessment attempts and progress
 * Uses Supabase for persistent storage instead of in-memory maps
 */

// ============================================================================
// In-Progress Attempts
// ============================================================================

/**
 * Create a new assessment attempt
 * Returns the attempt ID
 */
export async function createAttempt(
  userId: string,
  assessmentId: string
): Promise<string> {
  try {
    // Check if there's already an in-progress attempt for this user/assessment
    const { data: existing } = await supabaseAdmin
      .from("assessment_progress")
      .select("id")
      .eq("user_id", userId)
      .eq("assessment_id", assessmentId)
      .single();

    if (existing) {
      // Return existing attempt ID
      return existing.id;
    }

    // Create new in-progress attempt
    const { data, error } = await supabaseAdmin
      .from("assessment_progress")
      .insert({
        user_id: userId,
        assessment_id: assessmentId,
        responses: [],
        current_module_index: 0,
      })
      .select("id")
      .single();

    if (error || !data) {
      console.error("Error creating attempt:", error);
      throw new Error("Failed to create attempt");
    }

    return data.id;
  } catch (error) {
    console.error("Error creating attempt:", error);
    throw error;
  }
}

/**
 * Get an in-progress attempt by ID
 */
export async function getInProgressAttempt(attemptId: string) {
  try {
    const { data, error } = await supabaseAdmin
      .from("assessment_progress")
      .select("*")
      .eq("id", attemptId)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      userId: data.user_id,
      assessmentId: data.assessment_id,
      responses: data.responses || [],
      currentModuleIndex: data.current_module_index || 0,
      createdAt: new Date(data.created_at),
    };
  } catch (error) {
    console.error("Error getting in-progress attempt:", error);
    return null;
  }
}

/**
 * Update an in-progress attempt with new responses
 */
export async function updateAttemptProgress(
  attemptId: string,
  responses: AssessmentResponse[],
  currentModuleIndex: number
): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from("assessment_progress")
      .update({
        responses: responses as any,
        current_module_index: currentModuleIndex,
      })
      .eq("id", attemptId);

    if (error) {
      console.error("Error updating attempt progress:", error);
      throw new Error("Failed to update attempt progress");
    }
  } catch (error) {
    console.error("Error updating attempt progress:", error);
    throw error;
  }
}

// ============================================================================
// Completed Attempts
// ============================================================================

/**
 * Mark an attempt as completed
 * Moves data from assessment_progress to assessment_attempts
 */
export async function completeAttempt(
  attemptId: string,
  traitVector: number[],
  traitSummary: Record<string, number>
): Promise<AssessmentAttempt> {
  try {
    // Get the in-progress attempt
    const inProgress = await getInProgressAttempt(attemptId);
    if (!inProgress) {
      throw new Error("Attempt not found");
    }

    // Insert into completed attempts table
    const { data: completedData, error: completedError } = await supabaseAdmin
      .from("assessment_attempts")
      .insert({
        user_id: inProgress.userId,
        assessment_id: inProgress.assessmentId,
        trait_vector: traitVector,
        trait_summary: traitSummary,
        completed_at: new Date().toISOString(),
      })
      .select("*")
      .single();

    if (completedError || !completedData) {
      console.error("Error completing attempt:", completedError);
      throw new Error("Failed to complete attempt");
    }

    // Insert responses into assessment_responses table
    if (inProgress.responses.length > 0) {
      const responsesData = inProgress.responses.map((response: AssessmentResponse) => ({
        attempt_id: completedData.id,
        question_id: response.questionId,
        value: response.value,
        timestamp: response.timestamp instanceof Date
          ? response.timestamp.toISOString()
          : response.timestamp,
      }));

      const { error: responsesError } = await supabaseAdmin
        .from("assessment_responses")
        .insert(responsesData);

      if (responsesError) {
        console.error("Error inserting responses:", responsesError);
        // Don't throw here - attempt is already completed
      }
    }

    // Delete the in-progress attempt
    await supabaseAdmin
      .from("assessment_progress")
      .delete()
      .eq("id", attemptId);

    // Return the completed attempt
    return {
      id: completedData.id,
      userId: completedData.user_id,
      assessmentId: completedData.assessment_id,
      responses: inProgress.responses,
      traitVector: completedData.trait_vector,
      traitSummary: completedData.trait_summary,
      completedAt: new Date(completedData.completed_at),
      createdAt: new Date(completedData.created_at),
    };
  } catch (error) {
    console.error("Error completing attempt:", error);
    throw error;
  }
}

/**
 * Get a completed attempt by ID
 */
export async function getAttemptById(
  attemptId: string
): Promise<AssessmentAttempt | null> {
  try {
    // Get the attempt
    const { data: attemptData, error: attemptError } = await supabaseAdmin
      .from("assessment_attempts")
      .select("*")
      .eq("id", attemptId)
      .single();

    if (attemptError || !attemptData) {
      return null;
    }

    // Get the responses
    const { data: responsesData } = await supabaseAdmin
      .from("assessment_responses")
      .select("*")
      .eq("attempt_id", attemptId)
      .order("timestamp", { ascending: true });

    const responses: AssessmentResponse[] = (responsesData || []).map((r) => ({
      questionId: r.question_id,
      value: r.value as number | string,
      timestamp: new Date(r.timestamp),
    }));

    return {
      id: attemptData.id,
      userId: attemptData.user_id,
      assessmentId: attemptData.assessment_id,
      responses,
      traitVector: attemptData.trait_vector,
      traitSummary: attemptData.trait_summary,
      completedAt: new Date(attemptData.completed_at),
      createdAt: new Date(attemptData.created_at),
    };
  } catch (error) {
    console.error("Error getting attempt by ID:", error);
    return null;
  }
}

/**
 * Get all completed attempts for a user
 */
export async function getUserAttempts(
  userId: string
): Promise<AssessmentAttempt[]> {
  try {
    const { data: attemptsData, error } = await supabaseAdmin
      .from("assessment_attempts")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false });

    if (error || !attemptsData) {
      return [];
    }

    // Get responses for all attempts
    const attempts: AssessmentAttempt[] = [];

    for (const attemptData of attemptsData) {
      const { data: responsesData } = await supabaseAdmin
        .from("assessment_responses")
        .select("*")
        .eq("attempt_id", attemptData.id)
        .order("timestamp", { ascending: true });

      const responses: AssessmentResponse[] = (responsesData || []).map((r) => ({
        questionId: r.question_id,
        value: r.value as number | string,
        timestamp: new Date(r.timestamp),
      }));

      attempts.push({
        id: attemptData.id,
        userId: attemptData.user_id,
        assessmentId: attemptData.assessment_id,
        responses,
        traitVector: attemptData.trait_vector,
        traitSummary: attemptData.trait_summary,
        completedAt: new Date(attemptData.completed_at),
        createdAt: new Date(attemptData.created_at),
      });
    }

    return attempts;
  } catch (error) {
    console.error("Error getting user attempts:", error);
    return [];
  }
}

/**
 * Get the latest completed attempt for a user
 */
export async function getLatestAttempt(
  userId: string
): Promise<AssessmentAttempt | null> {
  const attempts = await getUserAttempts(userId);
  return attempts[0] || null;
}

/**
 * Delete all attempts (both in-progress and completed) for a user
 */
export async function deleteUserAttempts(userId: string): Promise<number> {
  try {
    let deletedCount = 0;

    // Delete completed attempts (responses will be deleted via CASCADE)
    const { data: deletedAttempts } = await supabaseAdmin
      .from("assessment_attempts")
      .delete()
      .eq("user_id", userId)
      .select("id");

    deletedCount += deletedAttempts?.length || 0;

    // Delete in-progress attempts
    const { data: deletedProgress } = await supabaseAdmin
      .from("assessment_progress")
      .delete()
      .eq("user_id", userId)
      .select("id");

    deletedCount += deletedProgress?.length || 0;

    return deletedCount;
  } catch (error) {
    console.error("Error deleting user attempts:", error);
    return 0;
  }
}
