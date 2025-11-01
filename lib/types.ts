// ============================================================================
// Core Data Models for SkillSync
// ============================================================================

// ----------------------------------------------------------------------------
// Job Paths & Career Data
// ----------------------------------------------------------------------------

export interface JobPath {
  id: string;
  title: string;
  description: string;
  category: string;
  vector: number[]; // Trait vector for cosine similarity matching
  tags: string[]; // e.g., ["creative", "analytical", "hands-on"]
  salaryRange: {
    min: number;
    max: number;
  };
  educationLevel: string; // e.g., "High School", "Associate", "Bachelor's", "Master's"
  growthRate: number; // Job market growth percentage
  imageUrl?: string;
}

// ----------------------------------------------------------------------------
// SHS Tracks & Strands (Philippine Senior High School)
// ----------------------------------------------------------------------------

export type SHSTrackType = "Academic" | "TVL" | "Sports" | "Arts and Design";
export type AcademicStrand = "STEM" | "ABM" | "HUMSS" | "GAS";
export type TVLStrand = "Agri-Fishery Arts" | "Home Economics" | "Industrial Arts" | "ICT";

export interface SHSTrack {
  id: string;
  trackType: SHSTrackType;
  strand?: AcademicStrand | TVLStrand; // Only for Academic and TVL tracks
  title: string; // e.g., "STEM - Science, Technology, Engineering, Mathematics"
  description: string;
  vector: number[]; // Trait vector for matching
  tags: string[];

  // Academic requirements
  recommendedGrades: {
    math?: number; // Minimum recommended grade (0-100)
    science?: number;
    english?: number;
    gpa?: number;
  };

  // Career pathways
  careerPathways: string[]; // Job path IDs that align with this track

  // Higher education alignment
  collegePrograms: string[]; // e.g., ["Computer Science", "Engineering", "Mathematics"]

  // Practical information
  coreSubjects: string[];
  specializedSubjects: string[];

  imageUrl?: string;
}

// Enrollment trends and outcomes
export interface EnrollmentTrend {
  id: string;
  trackId: string;
  region: string; // Philippine region (e.g., "NCR", "Region IV-A")
  schoolYear: string; // e.g., "2024-2025"

  // Enrollment data
  enrollmentCount: number;
  capacity: number;
  enrollmentRate: number; // Percentage of capacity filled

  // Outcome data
  completionRate: number; // Percentage who complete the track
  dropoutRate: number; // Percentage who drop out
  collegeTransitionRate: number; // Percentage who proceed to college
  employmentRate: number; // Percentage who find employment

  // Performance metrics
  averageGrade: number;
  passRate: number; // Percentage passing all subjects

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

// Dropout risk factors
export interface DropoutSignal {
  id: string;
  userId: string;
  trackId?: string;

  // Risk indicators
  riskLevel: "low" | "medium" | "high"; // Overall dropout risk
  riskScore: number; // 0-100, higher = more risk

  // Contributing factors
  factors: {
    academicStruggle: boolean; // Failing grades
    financialDifficulty: boolean; // Economic challenges
    healthIssues: boolean;
    familyObligations: boolean;
    lackOfInterest: boolean; // Mismatch with track
    peerInfluence: boolean;
    transportation: boolean; // Distance/access issues
  };

  // Academic indicators
  currentGPA?: number;
  attendanceRate?: number; // Percentage
  failingSubjects?: number; // Count of failing subjects

  // Engagement indicators
  assessmentCompletion: boolean; // Did they complete career assessment?
  lastLoginDays: number; // Days since last platform access
  milestonesCompleted: number; // Career planning milestones

  // Intervention status
  interventionNeeded: boolean;
  interventionProvided: boolean;
  interventionType?: string; // e.g., "counseling", "tutoring", "financial aid"

  // Timestamps
  detectedAt: Date;
  updatedAt: Date;
}

// Regional guidance outcomes
export interface RegionalOutcome {
  id: string;
  region: string;
  trackId: string;
  schoolYear: string;

  // Success metrics
  studentSatisfaction: number; // 1-5 scale
  parentSatisfaction: number;
  employerSatisfaction: number;

  // Employment outcomes
  averageSalary?: number;
  employmentWithinSixMonths: number; // Percentage
  workAlignmentRate: number; // Percentage working in field of study

  // Education outcomes
  collegeAcceptanceRate: number;
  scholarshipRate: number; // Percentage receiving scholarships

  // Regional factors
  industryDemand: Record<string, number>; // Industry -> demand score
  availableJobs: number;
  averageCommute: number; // Minutes

  createdAt: Date;
  updatedAt: Date;
}

// ----------------------------------------------------------------------------
// Assessment Engine
// ----------------------------------------------------------------------------

export type QuestionType = "likert" | "mcq";

export interface AssessmentQuestion {
  id: string;
  moduleId: string;
  type: QuestionType;
  text: string;
  options?: string[]; // For MCQ
  weights: Record<string, number>; // Trait -> weight mapping
}

export interface AssessmentModule {
  id: string;
  title: string;
  description: string;
  questions: AssessmentQuestion[];
  order: number;
}

export interface Assessment {
  id: string;
  title: string;
  description: string;
  modules: AssessmentModule[];
}

export interface AssessmentResponse {
  questionId: string;
  value: number | string; // Likert: 1-5, MCQ: option index or text
  timestamp: Date;
}

export interface AssessmentAttempt {
  id: string;
  userId: string;
  assessmentId: string;
  responses: AssessmentResponse[];
  traitVector: number[]; // Computed from responses
  traitSummary: Record<string, number>; // Named traits with scores
  completedAt: Date;
  createdAt: Date;
}

// ----------------------------------------------------------------------------
// Recommendations
// ----------------------------------------------------------------------------

export interface Recommendation {
  jobPath: JobPath;
  score: number; // Cosine similarity score (0-1)
  drivers: string[]; // Key traits that drove the match
  rationale: string; // AI-generated or deterministic explanation
}

export interface SHSTrackRecommendation {
  track: SHSTrack;
  score: number; // Cosine similarity score (0-1)
  drivers: string[]; // Key traits that drove the match
  rationale: string; // AI-generated or deterministic explanation

  // Academic fit analysis
  gradeAlignment: {
    meetsRequirements: boolean;
    strengthAreas: string[]; // e.g., ["math", "science"]
    improvementAreas: string[];
  };

  // Trend analysis for the user's region
  enrollmentTrend?: EnrollmentTrend;
  regionalOutcome?: RegionalOutcome;

  // Risk assessment
  dropoutRisk: {
    level: "low" | "medium" | "high";
    factors: string[];
    recommendations: string[]; // Suggestions to mitigate risks
  };

  // Career preview
  topCareerPaths: JobPath[]; // Top 3 careers aligned with this track
}

export interface SavedJobPath {
  id: string;
  userId: string;
  jobPathId: string;
  savedAt: Date;
}

// ----------------------------------------------------------------------------
// User & Milestones
// ----------------------------------------------------------------------------

export interface Milestone {
  id: string;
  text: string;
  completed: boolean;
  completedAt?: Date;
}

export interface UserMilestones {
  id: string;
  userId: string;
  jobPathId: string;
  milestones: Milestone[];
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  emailVerified?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface GradeLevel {
  math?: number;
  english?: number;
  science?: number;
  gpa?: number;
}

export interface UserGrades {
  id: string;
  userId: string;
  grade7?: GradeLevel;
  grade8?: GradeLevel;
  grade9?: GradeLevel;
  grade10?: GradeLevel;
  additionalNotes?: string;
  consentToUse: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ----------------------------------------------------------------------------
// Mock Data: Local Market
// ----------------------------------------------------------------------------

export interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  city: string;
  region: string; // e.g., "Northeast", "Midwest"
  salary: {
    min: number;
    max: number;
  };
  type: string; // e.g., "Full-time", "Part-time", "Internship"
  description: string;
  postedAt: Date;
  url?: string;
}

// ----------------------------------------------------------------------------
// Mock Data: Colleges
// ----------------------------------------------------------------------------

export type DegreeLevel = "Associate" | "Bachelor's" | "Master's" | "Doctorate";
export type Modality = "On-campus" | "Online" | "Hybrid";

export interface College {
  id: string;
  name: string;
  location: string;
  state: string;
  programs: string[]; // e.g., ["Computer Science", "Engineering"]
  degreeLevel: DegreeLevel[];
  tuition: {
    inState: number;
    outOfState: number;
  };
  acceptanceRate: number; // 0-100
  modality: Modality[];
  url?: string;
  imageUrl?: string;
}

// ----------------------------------------------------------------------------
// Mock Data: Scholarships
// ----------------------------------------------------------------------------

export type ScholarshipType = "Merit" | "Need-based" | "Demographic" | "Field-specific";

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: number;
  type: ScholarshipType;
  deadline: Date;
  eligibility: string[];
  description: string;
  url?: string;
}

// ----------------------------------------------------------------------------
// API Request/Response Types
// ----------------------------------------------------------------------------

export interface DataExportResponse {
  user: User;
  attempts: AssessmentAttempt[];
  savedPaths: SavedJobPath[];
  milestones: UserMilestones[];
  exportedAt: Date;
}

export interface AccountDeleteRequest {
  userId: string;
  confirmation: string;
}

// ----------------------------------------------------------------------------
// Filter Types
// ----------------------------------------------------------------------------

export interface JobListingFilters {
  region?: string;
  city?: string;
  salaryMin?: number;
  salaryMax?: number;
  type?: string;
}

export interface CollegeFilters {
  degreeLevel?: DegreeLevel;
  tuitionMax?: number;
  state?: string;
  modality?: Modality;
  acceptanceRateMin?: number;
  acceptanceRateMax?: number;
  program?: string;
}

export interface ScholarshipFilters {
  type?: ScholarshipType;
  amountMin?: number;
  deadlineAfter?: Date;
  deadlineBefore?: Date;
}

// ----------------------------------------------------------------------------
// Session & Auth Types
// ----------------------------------------------------------------------------

export interface Session {
  user: {
    id: string;
    email: string;
    name?: string;
  };
  expires: string;
}
