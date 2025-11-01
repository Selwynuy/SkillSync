import { DropoutSignal } from "@/lib/types";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Get dropout signal for a specific user
 */
export async function getDropoutSignal(
  userId: string
): Promise<DropoutSignal | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("dropout_signals")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return mapDropoutSignalFromDB(data);
  } catch (error) {
    console.error("Error fetching dropout signal:", error);
    return null;
  }
}

/**
 * Create or update dropout signal for a user
 */
export async function upsertDropoutSignal(
  signal: Omit<DropoutSignal, "id" | "detectedAt" | "updatedAt">
): Promise<DropoutSignal | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("dropout_signals")
      .upsert(
        {
          user_id: signal.userId,
          track_id: signal.trackId,
          risk_level: signal.riskLevel,
          risk_score: signal.riskScore,
          factors: signal.factors,
          current_gpa: signal.currentGPA,
          attendance_rate: signal.attendanceRate,
          failing_subjects: signal.failingSubjects,
          assessment_completion: signal.assessmentCompletion,
          last_login_days: signal.lastLoginDays,
          milestones_completed: signal.milestonesCompleted,
          intervention_needed: signal.interventionNeeded,
          intervention_provided: signal.interventionProvided,
          intervention_type: signal.interventionType,
        },
        {
          onConflict: "user_id",
        }
      )
      .select("*")
      .single();

    if (error || !data) {
      console.error("Error upserting dropout signal:", error);
      return null;
    }

    return mapDropoutSignalFromDB(data);
  } catch (error) {
    console.error("Error upserting dropout signal:", error);
    return null;
  }
}

/**
 * Get all users with high dropout risk
 */
export async function getHighRiskUsers(): Promise<DropoutSignal[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("dropout_signals")
      .select("*")
      .eq("risk_level", "high")
      .order("risk_score", { ascending: false });

    if (error) {
      console.error("Error fetching high risk users:", error);
      return [];
    }

    return (data || []).map(mapDropoutSignalFromDB);
  } catch (error) {
    console.error("Error fetching high risk users:", error);
    return [];
  }
}

/**
 * Get users needing intervention
 */
export async function getUsersNeedingIntervention(): Promise<DropoutSignal[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("dropout_signals")
      .select("*")
      .eq("intervention_needed", true)
      .eq("intervention_provided", false)
      .order("risk_score", { ascending: false });

    if (error) {
      console.error("Error fetching users needing intervention:", error);
      return [];
    }

    return (data || []).map(mapDropoutSignalFromDB);
  } catch (error) {
    console.error("Error fetching users needing intervention:", error);
    return [];
  }
}

/**
 * Mark intervention as provided
 */
export async function markInterventionProvided(
  userId: string,
  interventionType: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("dropout_signals")
      .update({
        intervention_provided: true,
        intervention_type: interventionType,
      })
      .eq("user_id", userId);

    return !error;
  } catch (error) {
    console.error("Error marking intervention provided:", error);
    return false;
  }
}

/**
 * Delete dropout signal for a user
 */
export async function deleteDropoutSignal(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("dropout_signals")
      .delete()
      .eq("user_id", userId);

    return !error;
  } catch (error) {
    console.error("Error deleting dropout signal:", error);
    return false;
  }
}

// Helper function to map database row to TypeScript type
function mapDropoutSignalFromDB(data: any): DropoutSignal {
  return {
    id: data.id,
    userId: data.user_id,
    trackId: data.track_id,
    riskLevel: data.risk_level as "low" | "medium" | "high",
    riskScore: data.risk_score,
    factors: data.factors,
    currentGPA: data.current_gpa,
    attendanceRate: data.attendance_rate,
    failingSubjects: data.failing_subjects,
    assessmentCompletion: data.assessment_completion,
    lastLoginDays: data.last_login_days,
    milestonesCompleted: data.milestones_completed,
    interventionNeeded: data.intervention_needed,
    interventionProvided: data.intervention_provided,
    interventionType: data.intervention_type,
    detectedAt: new Date(data.detected_at),
    updatedAt: new Date(data.updated_at),
  };
}
