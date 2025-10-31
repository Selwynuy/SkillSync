---
title: SkillSync – MVP Product Requirements Document (PRD)
owner: Product
version: 0.1 (MVP)
status: Draft
date: 2025-10-31
---

## 1) Introduction / Overview

SkillSync is a Next.js web application that helps users discover aligned career paths through interactive assessments, personalized recommendations, and a progress dashboard. The MVP targets high‑school students in the Philippines and focuses on three core capabilities:

- Interactive career assessments
- Personalized path recommendations
- Dashboard and progress tracking

Two secondary capabilities are planned with mock data in MVP: College/Scholarship Matching and Local Labor Market insights.

Primary CTA on landing: “Take Assessment Now”. Design follows the provided blue/white modern glassmorphism style, implemented using shadcn/ui components and responsive layouts for desktop, tablet, and mobile.

## 2) Goals

- Enable users to complete a multi‑module assessment (interests, skills, values) with Likert and multiple‑choice items.
- Generate job path recommendations mapped to user traits (Big Five‑style) with clear rationales.
- Provide a dashboard to view assessment history, saved job paths, and a simple learning plan/milestones.
- Showcase mock local market opportunities and mock college/scholarship matches with useful filters.
- Deliver an accessible, responsive landing and onboarding flow with a clear CTA and friction‑light auth.

## 3) User Stories

1. As a high‑school student in the Philippines, I want to take a quick, engaging assessment so I can discover suitable job paths.
2. As a user, I want to see recommendations explained in plain English so I can understand why a job fits me.
3. As a user, I want to save interesting job paths so I can revisit them later.
4. As a user, I want to view my past assessment results and how they changed over time.
5. As a user, I want to see mock local jobs and salaries for my area so I can gauge opportunities.
6. As a user, I want to browse mock colleges and scholarships with filters (degree level, tuition, location, modality, acceptance rate, program match, scholarship types and deadlines).
7. As a user, I want to sign up with email/password or magic link so I can keep my progress.

## 4) Functional Requirements

1. Landing Page
   1.1. Hero with headline, subcopy, and primary CTA button labeled “Take Assessment Now”.
   1.2. Job Paths section under hero: grid of available paths with brief descriptions and skill alignment tags.
   1.3. Navbar with brand, primary links (Inshort‑style: About/Services/Projects/Contact may be adapted), Login/Signup.
   1.4. Footer with links (About, Terms, Privacy, Contact) and social icons.
   1.5. Fully responsive (desktop/tablet/mobile) and accessible (semantic HTML, keyboard navigation, sufficient contrast).

2. Authentication (MVP)
   2.1. Email/password signup & login.
   2.2. Magic link login option.
   2.3. Guest assessment allowed is NOT required in MVP (not selected).

3. Assessments
   3.1. Multi‑module flow: Interests, Skills, Values; 10–20 items per module.
   3.2. Item types: Likert (1–5 agreement) and Multiple Choice.
   3.3. Scoring: Map responses to Big Five‑style traits; traits map to skill categories.
   3.4. Retakes allowed; store each attempt with timestamp (history view in dashboard).
   3.5. Progress persistence per step; safe to refresh or continue later when authenticated.

4. Recommendations
   4.1. Compute job‑fit using vector similarity between user trait/skill vector and each job path vector.
   4.2. Display top N job paths with match score and key drivers.
   4.3. Provide human‑readable rationales (LLM‑generated) summarizing why each path matches.
   4.4. Allow user to save/unsave job paths.

5. Local Market (Mock in MVP)
   5.1. Show mock job listings for the Philippines with title, employer, location, salary range (mock), and link.
   5.2. Filter by city/region (mock options) and salary bands.
   5.3. Clearly label as mock data.

6. College & Scholarship Matching (Mock in MVP)
   6.1. Browse mock colleges/programs with filters: degree level, tuition, location, modality, acceptance rate, program match.
   6.2. Browse mock scholarships with filters: need‑based, merit‑based, deadlines.
   6.3. Clearly label as mock data.

7. Dashboard & Progress
   7.1. Assessment history timeline with attempt date and trait/score summary.
   7.2. Saved job paths list with ability to remove.
   7.3. Simple learning plan/milestones editor (e.g., checklist with due dates) tied to selected job path.

8. Notifications
   8.1. None for MVP (no email, in‑app, or push). UI may display passive toasts.

9. Privacy & Data Control
   9.1. Provide data export (JSON) for a user’s assessment history and saved paths.
   9.2. Provide account deletion endpoint and UI affordance.

## 5) Non‑Goals (Out of Scope)

- Real external job APIs (Indeed/Adzuna/LinkedIn), government LMI, or real college/scholarship APIs in MVP.
- Advanced SEO beyond basics.
- Roles beyond standard end‑user (no admin console in MVP).
- Mobile app (web only responsive).

## 6) Design Considerations

- Follow the provided landing aesthetic (blue/white, soft gradients, glassmorphism cards, rounded corners, subtle shadows).
- Use shadcn/ui for all interactive components (Button, Card, Input, Tabs/Accordion, Navbar, Footer, Dialog, Toast, Badge, Progress, Chart wrapper if applicable).
- Accessibility: aim for semantic structure and keyboard operability; contrast at least basic compliant.
- Layout: App Router (Next.js 15) with responsive grid/stack sections; prefer server components for data display, client components for interactivity.

Hero contents:
- Headline: “Let AI Handle Career Discovery While You Rest” (adjust copy to brand voice).
- Subcopy: Brief value statement for high‑school students in the Philippines.
- Primary CTA: “Take Assessment Now”.

Job Paths preview grid (under hero):
- 6–12 cards showing path name, short blurb, representative skills, and a “See details” action.

## 7) Technical Considerations

- Framework: Next.js 15 App Router, TypeScript.
- UI: Tailwind CSS with shadcn/ui components.
- Auth: Email/password + magic link. Provider implementation can use Auth.js/NextAuth or custom route handlers; exact choice is a build decision. For MVP with mock data elsewhere, simple credential provider acceptable.
- Data: For MVP, assessments, job paths, and listings may use in‑repo JSON/seed data or edge KV; design repository structure to later swap to real APIs/DB.
- LLM: Optional for rationale generation; abstract behind a service to stub with deterministic mock outputs in development.
- Deployment: Vercel.
- Internationalization: English only.
- Analytics/telemetry: basic page view tracking (Vercel Analytics) optional.
- Performance: server rendering for landing and details; client components for assessment flow.

## 8) Data Model (MVP sketch)

- User: { id, email, passwordHash?, createdAt }
- AssessmentAttempt: { id, userId, module: "interests"|"skills"|"values", responses: [{itemId, value}], traitVector: number[], createdAt }
- JobPath: { id, title, description, skills: string[], vector: number[], tags: string[] }
- SavedJobPath: { userId, jobPathId, savedAt }
- LearningMilestone: { id, userId, jobPathId, title, dueDate, completedAt? }
- MockJobListing: { id, title, employer, location, salaryMin, salaryMax, url }
- MockCollege: { id, name, programs: string[], tuition, location, modality, acceptanceRate }
- MockScholarship: { id, name, type: "need"|"merit", deadline, amount, eligibility }

Note: For MVP these can be JSON files; ensure a clean abstraction layer to swap to APIs later.

## 9) Matching & Scoring (MVP)

1. Convert module responses to normalized trait scores (Big Five‑style) via per‑item weights.
2. Construct a user vector; construct job vectors for each job path.
3. Compute cosine similarity; present top N with score 0–100.
4. Generate rationale text (stubbed or via LLM) citing 2–3 strongest matching traits/skills.

## 10) API/Integration Strategy

- All external data is mocked in MVP per request. Provide a single `data/` directory with JSON sources and a thin repository layer to read them.
- When moving beyond MVP, plan to integrate: O*NET/SOC mapping for titles/skills, PH government LMI, and third‑party college/scholarship sources.

## 11) Success Metrics

- 70%+ completion rate for the assessment flow among signed‑up users.
- 50%+ of users save at least one job path.
- Median time to first recommendation < 5 minutes.
- < 1s P75 interaction latency for assessment item navigation.

## 12) Acceptance Criteria

- Landing page renders with hero CTA, Job Paths preview, navbar, and footer; responsive across breakpoints.
- Users can create an account, log in (email/password or magic link), and log out.
- Assessment supports Likert and multiple‑choice items across three modules; retakes stored as history.
- Recommendations page shows top matches with scores and rationale; user can save/unsave paths.
- Dashboard shows assessment history, saved job paths, and an editable milestones checklist.
- Mock local jobs and mock college/scholarship pages load with the specified filters and clear mock labeling.
- Data export and account deletion endpoints implemented and reachable from settings.

## 13) Open Questions

1. Finalize brand voice, logo, and exact color tokens beyond base blue/white palette.
2. Choose the concrete auth implementation (NextAuth vs custom credentials + magic link provider).
3. Determine initial list of job paths and the seed vectors (manual curation vs heuristic generation).
4. Do we need parental consent flows for minors (PH‑specific regulations) in future versions?
5. Which cities/regions to include for mock job filters by default?

## 14) Delivery Plan (MVP Scope Only)

1. Scaffold Next.js 15 project with shadcn/ui and Tailwind.
2. Build landing (hero CTA, Job Paths grid, navbar, footer).
3. Implement auth (email/password + magic link).
4. Implement assessment engine and UI (Likert/MCQ, multi‑module, scoring to Big Five).
5. Implement recommendations (cosine similarity + rationale stub/LLM optional).
6. Implement dashboard (history, saved paths, milestones).
7. Implement mock local market, colleges, scholarships with filters.
8. Implement data export and account deletion.
9. Deploy to Vercel.

## 15) Component Baseline (shadcn/ui)

- Button, Card, Input, Textarea, Label, Select, Tabs, Accordion, Dialog, Tooltip, Badge, Progress, Table, Pagination, Navbar (custom using primitives), Footer (custom), Toast, Skeleton, Separator.

All UI should be implemented using shadcn/ui components or primitives as the base.


