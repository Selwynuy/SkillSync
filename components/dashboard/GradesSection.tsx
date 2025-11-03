"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GraduationCap,
  Edit,
  Trophy,
  Heart,
  Users,
  Briefcase,
  Languages as LanguagesIcon,
  ExternalLink
} from "lucide-react";
import { PersonalInformation, AcademicAchievement, Hobby, ExtracurricularActivity } from "@/lib/types";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface GradesSectionProps {
  initialGrades: PersonalInformation | null;
  onUpdate: (grades: PersonalInformation) => void;
}

export function GradesSection({ initialGrades, onUpdate }: GradesSectionProps) {
  const hasGrades = initialGrades !== null;

  // Calculate if user has any grades filled
  const hasAnyGrades = hasGrades && (
    initialGrades.grade7 ||
    initialGrades.grade8 ||
    initialGrades.grade9 ||
    initialGrades.grade10 ||
    initialGrades.grade11 ||
    initialGrades.grade12
  );

  const hasPersonalInfo = hasGrades && (
    (initialGrades.achievements && initialGrades.achievements.length > 0) ||
    (initialGrades.hobbies && initialGrades.hobbies.length > 0) ||
    (initialGrades.extracurriculars && initialGrades.extracurriculars.length > 0) ||
    (initialGrades.skills && initialGrades.skills.length > 0) ||
    (initialGrades.languages && initialGrades.languages.length > 0)
  );

  return (
    <div className="space-y-6">
      {/* Academic Grades Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>
                  {hasGrades
                    ? "Your academic background and personal profile"
                    : "Add your information to enhance AI recommendations"}
                </CardDescription>
              </div>
            </div>
            <Link href="/assessments/grades">
              <Button variant="outline" size="sm">
                <Edit className="h-4 w-4 mr-2" />
                {hasGrades ? "Edit" : "Add Info"}
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {!hasGrades || (!hasAnyGrades && !hasPersonalInfo) ? (
            <div className="text-center py-8 text-muted-foreground">
              <p className="mb-4">
                No personal information on file. Adding your grades, achievements, and interests can help provide more
                personalized career recommendations.
              </p>
              <Link href="/assessments/grades">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Add Your Information
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Grades Summary */}
              {hasAnyGrades && (
                <div className="space-y-4">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <GraduationCap className="h-4 w-4" />
                    Academic Grades
                  </h3>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {initialGrades.grade7 && Object.keys(initialGrades.grade7).length > 0 && (
                      <GradeSummaryCard title="Grade 7" grades={initialGrades.grade7} />
                    )}
                    {initialGrades.grade8 && Object.keys(initialGrades.grade8).length > 0 && (
                      <GradeSummaryCard title="Grade 8" grades={initialGrades.grade8} />
                    )}
                    {initialGrades.grade9 && Object.keys(initialGrades.grade9).length > 0 && (
                      <GradeSummaryCard title="Grade 9" grades={initialGrades.grade9} />
                    )}
                    {initialGrades.grade10 && Object.keys(initialGrades.grade10).length > 0 && (
                      <GradeSummaryCard title="Grade 10" grades={initialGrades.grade10} />
                    )}
                    {initialGrades.grade11 && Object.keys(initialGrades.grade11).length > 0 && (
                      <GradeSummaryCard title="Grade 11" grades={initialGrades.grade11} />
                    )}
                    {initialGrades.grade12 && Object.keys(initialGrades.grade12).length > 0 && (
                      <GradeSummaryCard title="Grade 12" grades={initialGrades.grade12} />
                    )}
                  </div>
                </div>
              )}

              {/* Achievements */}
              {initialGrades.achievements && initialGrades.achievements.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-600" />
                    Achievements & Awards ({initialGrades.achievements.length})
                  </h3>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {initialGrades.achievements.slice(0, 4).map((achievement) => (
                      <AchievementCard key={achievement.id} achievement={achievement} />
                    ))}
                  </div>
                  {initialGrades.achievements.length > 4 && (
                    <p className="text-xs text-muted-foreground">
                      +{initialGrades.achievements.length - 4} more achievements
                    </p>
                  )}
                </div>
              )}

              {/* Hobbies */}
              {initialGrades.hobbies && initialGrades.hobbies.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4 text-pink-600" />
                    Hobbies & Interests ({initialGrades.hobbies.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {initialGrades.hobbies.map((hobby) => (
                      <HobbyBadge key={hobby.id} hobby={hobby} />
                    ))}
                  </div>
                </div>
              )}

              {/* Extracurriculars */}
              {initialGrades.extracurriculars && initialGrades.extracurriculars.length > 0 && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    Extracurricular Activities ({initialGrades.extracurriculars.length})
                  </h3>
                  <div className="space-y-2">
                    {initialGrades.extracurriculars.slice(0, 3).map((activity) => (
                      <ExtracurricularItem key={activity.id} activity={activity} />
                    ))}
                  </div>
                  {initialGrades.extracurriculars.length > 3 && (
                    <p className="text-xs text-muted-foreground">
                      +{initialGrades.extracurriculars.length - 3} more activities
                    </p>
                  )}
                </div>
              )}

              {/* Skills & Languages */}
              <div className="grid gap-6 sm:grid-cols-2 pt-4 border-t">
                {initialGrades.skills && initialGrades.skills.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-purple-600" />
                      Skills
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {initialGrades.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {initialGrades.languages && initialGrades.languages.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm flex items-center gap-2">
                      <LanguagesIcon className="h-4 w-4 text-green-600" />
                      Languages
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {initialGrades.languages.map((language, index) => (
                        <Badge key={index} variant="secondary">
                          {language}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Additional Notes */}
              {initialGrades.additionalNotes && (
                <div className="space-y-2 pt-4 border-t">
                  <h3 className="font-semibold text-sm">Additional Notes</h3>
                  <p className="text-sm text-muted-foreground">{initialGrades.additionalNotes}</p>
                </div>
              )}

              {/* Consent Status */}
              <div className="text-sm pt-4 border-t">
                {initialGrades.consentToUse ? (
                  <p className="text-green-600 dark:text-green-400">
                    ✓ Information is being used for AI-powered career recommendations
                  </p>
                ) : (
                  <p className="text-amber-600 dark:text-amber-400">
                    ⚠ Consent not provided - information won't be used for AI analysis
                  </p>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Grade Summary Card Component
function GradeSummaryCard({ title, grades }: { title: string; grades: any }) {
  const subjects = [];

  if (grades.math !== undefined) subjects.push({ name: "Math", value: grades.math });
  if (grades.english !== undefined) subjects.push({ name: "English", value: grades.english });
  if (grades.science !== undefined) subjects.push({ name: "Science", value: grades.science });
  if (grades.filipino !== undefined) subjects.push({ name: "Filipino", value: grades.filipino });
  if (grades.totalAverage !== undefined) subjects.push({ name: "Total Average", value: grades.totalAverage });
  if (grades.gpa !== undefined) subjects.push({ name: "GPA", value: grades.gpa });

  // Add custom subjects
  if (grades.customSubjects && grades.customSubjects.length > 0) {
    grades.customSubjects.forEach((subject: any) => {
      subjects.push({ name: subject.name, value: subject.grade });
    });
  }

  // Calculate average
  const average = subjects.length > 0
    ? (subjects.reduce((sum, s) => sum + s.value, 0) / subjects.length).toFixed(2)
    : "—";

  return (
    <div className="p-4 border rounded-lg bg-muted/50">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-sm">{title}</h4>
        <span className="text-xs text-muted-foreground">
          Avg: <span className="font-semibold text-foreground">{average}</span>
        </span>
      </div>
      <div className="space-y-1">
        {subjects.slice(0, 4).map((subject, index) => (
          <div key={index} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{subject.name}</span>
            <span className="font-medium">{subject.value}</span>
          </div>
        ))}
        {subjects.length > 4 && (
          <p className="text-xs text-muted-foreground">+{subjects.length - 4} more</p>
        )}
      </div>
    </div>
  );
}

// Achievement Card Component
function AchievementCard({ achievement }: { achievement: AcademicAchievement }) {
  const categoryColors: Record<string, string> = {
    academic: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    extracurricular: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    competition: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
    leadership: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
    other: "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300",
  };

  return (
    <div className="p-3 border rounded-lg bg-card">
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="font-medium text-sm line-clamp-1">{achievement.title}</h4>
        {achievement.category && (
          <Badge
            variant="secondary"
            className={`text-xs shrink-0 ${categoryColors[achievement.category] || ""}`}
          >
            {achievement.category}
          </Badge>
        )}
      </div>
      {achievement.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">
          {achievement.description}
        </p>
      )}
      {achievement.dateReceived && (
        <p className="text-xs text-muted-foreground">
          {new Date(achievement.dateReceived).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

// Hobby Badge Component
function HobbyBadge({ hobby }: { hobby: Hobby }) {
  const skillLevelColors: Record<string, string> = {
    beginner: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    intermediate: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    advanced: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
    expert: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300",
  };

  return (
    <div
      className={`px-3 py-1.5 rounded-full text-sm font-medium ${
        hobby.skillLevel ? skillLevelColors[hobby.skillLevel] : "bg-secondary text-secondary-foreground"
      }`}
      title={hobby.description || undefined}
    >
      {hobby.name}
      {hobby.skillLevel && (
        <span className="ml-1 text-xs opacity-70">
          ({hobby.skillLevel})
        </span>
      )}
    </div>
  );
}

// Extracurricular Item Component
function ExtracurricularItem({ activity }: { activity: ExtracurricularActivity }) {
  return (
    <div className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
      <div className="mt-0.5">
        <Users className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <h4 className="font-medium text-sm">{activity.name}</h4>
          {activity.yearsActive && activity.yearsActive > 0 && (
            <span className="text-xs text-muted-foreground shrink-0">
              {activity.yearsActive}yr{activity.yearsActive > 1 ? "s" : ""}
            </span>
          )}
        </div>
        {activity.role && (
          <p className="text-xs text-muted-foreground">{activity.role}</p>
        )}
        {activity.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
            {activity.description}
          </p>
        )}
      </div>
    </div>
  );
}
