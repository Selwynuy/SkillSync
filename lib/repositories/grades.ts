/**
 * User Grades Repository (Personal Information)
 *
 * Handles CRUD operations for user personal information including
 * academic grades, achievements, hobbies, and skills
 */

import { supabaseAdmin } from "@/lib/supabase/server";
import {
  UserGrades,
  GradeLevel,
  PersonalInformation,
  AcademicAchievement,
  Hobby,
  ExtracurricularActivity
} from "@/lib/types";

/**
 * Convert database row to PersonalInformation/UserGrades object
 */
function mapRowToUserGrades(data: any): UserGrades {
  return {
    id: data.id,
    userId: data.user_id,
    grade7: {
      math: data.grade_7_math,
      english: data.grade_7_english,
      science: data.grade_7_science,
      filipino: data.grade_7_filipino,
      totalAverage: data.grade_7_total_average,
      gpa: data.grade_7_gpa, // Keep for backwards compatibility
      customSubjects: data.grade_7_custom_subjects || [],
    },
    grade8: {
      math: data.grade_8_math,
      english: data.grade_8_english,
      science: data.grade_8_science,
      filipino: data.grade_8_filipino,
      totalAverage: data.grade_8_total_average,
      gpa: data.grade_8_gpa,
      customSubjects: data.grade_8_custom_subjects || [],
    },
    grade9: {
      math: data.grade_9_math,
      english: data.grade_9_english,
      science: data.grade_9_science,
      filipino: data.grade_9_filipino,
      totalAverage: data.grade_9_total_average,
      gpa: data.grade_9_gpa,
      customSubjects: data.grade_9_custom_subjects || [],
    },
    grade10: {
      math: data.grade_10_math,
      english: data.grade_10_english,
      science: data.grade_10_science,
      filipino: data.grade_10_filipino,
      totalAverage: data.grade_10_total_average,
      gpa: data.grade_10_gpa,
      customSubjects: data.grade_10_custom_subjects || [],
    },
    grade11: data.grade_11_math || data.grade_11_english || data.grade_11_science || data.grade_11_filipino
      ? {
          math: data.grade_11_math,
          english: data.grade_11_english,
          science: data.grade_11_science,
          filipino: data.grade_11_filipino,
          totalAverage: data.grade_11_total_average,
          customSubjects: data.grade_11_custom_subjects || [],
        }
      : undefined,
    grade12: data.grade_12_math || data.grade_12_english || data.grade_12_science || data.grade_12_filipino
      ? {
          math: data.grade_12_math,
          english: data.grade_12_english,
          science: data.grade_12_science,
          filipino: data.grade_12_filipino,
          totalAverage: data.grade_12_total_average,
          customSubjects: data.grade_12_custom_subjects || [],
        }
      : undefined,
    achievements: data.achievements || [],
    hobbies: data.hobbies || [],
    extracurriculars: data.extracurriculars || [],
    skills: data.skills || [],
    languages: data.languages || [],
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
 * Create or update user personal information (grades, achievements, hobbies, etc.)
 */
export async function upsertUserGrades(
  userId: string,
  info: Partial<PersonalInformation> & { consentToUse: boolean }
): Promise<UserGrades | null> {
  try {
    const insertData: any = {
      user_id: userId,
      // Grade 7
      grade_7_math: info.grade7?.math ?? null,
      grade_7_english: info.grade7?.english ?? null,
      grade_7_science: info.grade7?.science ?? null,
      grade_7_filipino: info.grade7?.filipino ?? null,
      grade_7_total_average: info.grade7?.totalAverage ?? null,
      grade_7_gpa: info.grade7?.gpa ?? null,
      grade_7_custom_subjects: info.grade7?.customSubjects ?? [],
      // Grade 8
      grade_8_math: info.grade8?.math ?? null,
      grade_8_english: info.grade8?.english ?? null,
      grade_8_science: info.grade8?.science ?? null,
      grade_8_filipino: info.grade8?.filipino ?? null,
      grade_8_total_average: info.grade8?.totalAverage ?? null,
      grade_8_gpa: info.grade8?.gpa ?? null,
      grade_8_custom_subjects: info.grade8?.customSubjects ?? [],
      // Grade 9
      grade_9_math: info.grade9?.math ?? null,
      grade_9_english: info.grade9?.english ?? null,
      grade_9_science: info.grade9?.science ?? null,
      grade_9_filipino: info.grade9?.filipino ?? null,
      grade_9_total_average: info.grade9?.totalAverage ?? null,
      grade_9_gpa: info.grade9?.gpa ?? null,
      grade_9_custom_subjects: info.grade9?.customSubjects ?? [],
      // Grade 10
      grade_10_math: info.grade10?.math ?? null,
      grade_10_english: info.grade10?.english ?? null,
      grade_10_science: info.grade10?.science ?? null,
      grade_10_filipino: info.grade10?.filipino ?? null,
      grade_10_total_average: info.grade10?.totalAverage ?? null,
      grade_10_gpa: info.grade10?.gpa ?? null,
      grade_10_custom_subjects: info.grade10?.customSubjects ?? [],
      // Grade 11
      grade_11_math: info.grade11?.math ?? null,
      grade_11_english: info.grade11?.english ?? null,
      grade_11_science: info.grade11?.science ?? null,
      grade_11_filipino: info.grade11?.filipino ?? null,
      grade_11_total_average: info.grade11?.totalAverage ?? null,
      grade_11_custom_subjects: info.grade11?.customSubjects ?? [],
      // Grade 12
      grade_12_math: info.grade12?.math ?? null,
      grade_12_english: info.grade12?.english ?? null,
      grade_12_science: info.grade12?.science ?? null,
      grade_12_filipino: info.grade12?.filipino ?? null,
      grade_12_total_average: info.grade12?.totalAverage ?? null,
      grade_12_custom_subjects: info.grade12?.customSubjects ?? [],
      // Personal info
      achievements: info.achievements ?? [],
      hobbies: info.hobbies ?? [],
      extracurriculars: info.extracurriculars ?? [],
      skills: info.skills ?? [],
      languages: info.languages ?? [],
      additional_notes: info.additionalNotes ?? null,
      consent_to_use: info.consentToUse,
    };

    const { data, error } = await supabaseAdmin
      .from("user_grades")
      .upsert(insertData, {
        onConflict: "user_id",
      })
      .select()
      .single();

    if (error) {
      console.error("Error upserting user personal information:", error);
      return null;
    }

    return mapRowToUserGrades(data);
  } catch (error) {
    console.error("Error upserting user personal information:", error);
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
