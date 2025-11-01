/**
 * User Grades Repository
 *
 * Handles CRUD operations for user academic grades
 */

import { supabaseAdmin } from "@/lib/supabase/server";
import { UserGrades, GradeLevel } from "@/lib/types";

/**
 * Convert database row to UserGrades object
 */
function mapRowToUserGrades(data: any): UserGrades {
  return {
    id: data.id,
    userId: data.user_id,
    grade7: {
      math: data.grade_7_math,
      english: data.grade_7_english,
      science: data.grade_7_science,
      gpa: data.grade_7_gpa,
    },
    grade8: {
      math: data.grade_8_math,
      english: data.grade_8_english,
      science: data.grade_8_science,
      gpa: data.grade_8_gpa,
    },
    grade9: {
      math: data.grade_9_math,
      english: data.grade_9_english,
      science: data.grade_9_science,
      gpa: data.grade_9_gpa,
    },
    grade10: {
      math: data.grade_10_math,
      english: data.grade_10_english,
      science: data.grade_10_science,
      gpa: data.grade_10_gpa,
    },
    additionalNotes: data.additional_notes,
    consentToUse: data.consent_to_use,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

/**
 * Get user grades by user ID
 */
export async function getUserGrades(userId: string): Promise<UserGrades | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_grades")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // No grades found
        return null;
      }
      console.error("Error fetching user grades:", error);
      return null;
    }

    return mapRowToUserGrades(data);
  } catch (error) {
    console.error("Error fetching user grades:", error);
    return null;
  }
}

/**
 * Create or update user grades
 */
export async function upsertUserGrades(
  userId: string,
  grades: {
    grade7?: GradeLevel;
    grade8?: GradeLevel;
    grade9?: GradeLevel;
    grade10?: GradeLevel;
    additionalNotes?: string;
    consentToUse: boolean;
  }
): Promise<UserGrades | null> {
  try {
    const insertData = {
      user_id: userId,
      grade_7_math: grades.grade7?.math ?? null,
      grade_7_english: grades.grade7?.english ?? null,
      grade_7_science: grades.grade7?.science ?? null,
      grade_7_gpa: grades.grade7?.gpa ?? null,
      grade_8_math: grades.grade8?.math ?? null,
      grade_8_english: grades.grade8?.english ?? null,
      grade_8_science: grades.grade8?.science ?? null,
      grade_8_gpa: grades.grade8?.gpa ?? null,
      grade_9_math: grades.grade9?.math ?? null,
      grade_9_english: grades.grade9?.english ?? null,
      grade_9_science: grades.grade9?.science ?? null,
      grade_9_gpa: grades.grade9?.gpa ?? null,
      grade_10_math: grades.grade10?.math ?? null,
      grade_10_english: grades.grade10?.english ?? null,
      grade_10_science: grades.grade10?.science ?? null,
      grade_10_gpa: grades.grade10?.gpa ?? null,
      additional_notes: grades.additionalNotes ?? null,
      consent_to_use: grades.consentToUse,
    };

    const { data, error } = await supabaseAdmin
      .from("user_grades")
      .upsert(insertData, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (error) {
      console.error("Error upserting user grades:", error);
      return null;
    }

    return mapRowToUserGrades(data);
  } catch (error) {
    console.error("Error upserting user grades:", error);
    return null;
  }
}

/**
 * Delete user grades
 */
export async function deleteUserGrades(userId: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from("user_grades")
      .delete()
      .eq("user_id", userId);

    if (error) {
      console.error("Error deleting user grades:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting user grades:", error);
    return false;
  }
}
