import { EnrollmentTrend, RegionalOutcome } from "@/lib/types";
import { supabaseAdmin } from "@/lib/supabase/server";

/**
 * Get enrollment trends for a specific track
 */
export async function getEnrollmentTrendsByTrack(
  trackId: string
): Promise<EnrollmentTrend[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("enrollment_trends")
      .select("*")
      .eq("track_id", trackId)
      .order("school_year", { ascending: false });

    if (error) {
      console.error("Error fetching enrollment trends:", error);
      return [];
    }

    return (data || []).map(mapEnrollmentTrendFromDB);
  } catch (error) {
    console.error("Error fetching enrollment trends:", error);
    return [];
  }
}

/**
 * Get enrollment trends for a specific region
 */
export async function getEnrollmentTrendsByRegion(
  region: string
): Promise<EnrollmentTrend[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("enrollment_trends")
      .select("*")
      .eq("region", region)
      .order("school_year", { ascending: false });

    if (error) {
      console.error("Error fetching enrollment trends:", error);
      return [];
    }

    return (data || []).map(mapEnrollmentTrendFromDB);
  } catch (error) {
    console.error("Error fetching enrollment trends:", error);
    return [];
  }
}

/**
 * Get enrollment trend for a specific track in a region
 */
export async function getEnrollmentTrend(
  trackId: string,
  region: string,
  schoolYear?: string
): Promise<EnrollmentTrend | null> {
  try {
    let query = supabaseAdmin
      .from("enrollment_trends")
      .select("*")
      .eq("track_id", trackId)
      .eq("region", region);

    if (schoolYear) {
      query = query.eq("school_year", schoolYear);
    }

    query = query.order("school_year", { ascending: false }).limit(1);

    const { data, error } = await query.single();

    if (error || !data) {
      return null;
    }

    return mapEnrollmentTrendFromDB(data);
  } catch (error) {
    console.error("Error fetching enrollment trend:", error);
    return null;
  }
}

/**
 * Get regional outcomes for a specific track
 */
export async function getRegionalOutcomesByTrack(
  trackId: string
): Promise<RegionalOutcome[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("regional_outcomes")
      .select("*")
      .eq("track_id", trackId)
      .order("school_year", { ascending: false });

    if (error) {
      console.error("Error fetching regional outcomes:", error);
      return [];
    }

    return (data || []).map(mapRegionalOutcomeFromDB);
  } catch (error) {
    console.error("Error fetching regional outcomes:", error);
    return [];
  }
}

/**
 * Get regional outcomes for a specific region
 */
export async function getRegionalOutcomesByRegion(
  region: string
): Promise<RegionalOutcome[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from("regional_outcomes")
      .select("*")
      .eq("region", region)
      .order("school_year", { ascending: false});

    if (error) {
      console.error("Error fetching regional outcomes:", error);
      return [];
    }

    return (data || []).map(mapRegionalOutcomeFromDB);
  } catch (error) {
    console.error("Error fetching regional outcomes:", error);
    return [];
  }
}

/**
 * Get regional outcome for a specific track in a region
 */
export async function getRegionalOutcome(
  trackId: string,
  region: string,
  schoolYear?: string
): Promise<RegionalOutcome | null> {
  try {
    let query = supabaseAdmin
      .from("regional_outcomes")
      .select("*")
      .eq("track_id", trackId)
      .eq("region", region);

    if (schoolYear) {
      query = query.eq("school_year", schoolYear);
    }

    query = query.order("school_year", { ascending: false }).limit(1);

    const { data, error } = await query.single();

    if (error || !data) {
      return null;
    }

    return mapRegionalOutcomeFromDB(data);
  } catch (error) {
    console.error("Error fetching regional outcome:", error);
    return null;
  }
}

/**
 * Get user's region
 */
export async function getUserRegion(userId: string): Promise<string | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from("user_regions")
      .select("region")
      .eq("user_id", userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.region;
  } catch (error) {
    console.error("Error fetching user region:", error);
    return null;
  }
}

/**
 * Set user's region
 */
export async function setUserRegion(
  userId: string,
  region: string,
  province?: string,
  cityMunicipality?: string
): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin.from("user_regions").upsert(
      {
        user_id: userId,
        region,
        province,
        city_municipality: cityMunicipality,
      },
      {
        onConflict: "user_id",
      }
    );

    return !error;
  } catch (error) {
    console.error("Error setting user region:", error);
    return false;
  }
}

// Helper functions to map database rows to TypeScript types
function mapEnrollmentTrendFromDB(data: any): EnrollmentTrend {
  return {
    id: data.id,
    trackId: data.track_id,
    region: data.region,
    schoolYear: data.school_year,
    enrollmentCount: data.enrollment_count,
    capacity: data.capacity,
    enrollmentRate: parseFloat(data.enrollment_rate),
    completionRate: parseFloat(data.completion_rate),
    dropoutRate: parseFloat(data.dropout_rate),
    collegeTransitionRate: parseFloat(data.college_transition_rate),
    employmentRate: parseFloat(data.employment_rate),
    averageGrade: parseFloat(data.average_grade),
    passRate: parseFloat(data.pass_rate),
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}

function mapRegionalOutcomeFromDB(data: any): RegionalOutcome {
  return {
    id: data.id,
    region: data.region,
    trackId: data.track_id,
    schoolYear: data.school_year,
    studentSatisfaction: parseFloat(data.student_satisfaction),
    parentSatisfaction: parseFloat(data.parent_satisfaction),
    employerSatisfaction: parseFloat(data.employer_satisfaction),
    averageSalary: data.average_salary,
    employmentWithinSixMonths: parseFloat(data.employment_within_six_months),
    workAlignmentRate: parseFloat(data.work_alignment_rate),
    collegeAcceptanceRate: parseFloat(data.college_acceptance_rate),
    scholarshipRate: parseFloat(data.scholarship_rate),
    industryDemand: data.industry_demand || {},
    availableJobs: data.available_jobs || 0,
    averageCommute: data.average_commute || 0,
    createdAt: new Date(data.created_at),
    updatedAt: new Date(data.updated_at),
  };
}
