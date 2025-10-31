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
