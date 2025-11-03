"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Navbar } from "@/app/(marketing)/components/Navbar";
import { Footer } from "@/app/(marketing)/components/Footer";
import { SkipToContent } from "@/components/common/skip-to-content";
import {
  ArrowRight,
  GraduationCap,
  Info,
  Loader2,
  Plus,
  Trash2,
  Trophy,
  Heart,
  Users,
  Briefcase,
  Languages
} from "lucide-react";
import { toast } from "sonner";
import {
  GradeLevel,
  CustomSubject,
  AcademicAchievement,
  Hobby,
  ExtracurricularActivity,
  PersonalInformation
} from "@/lib/types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

function PersonalInformationPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const assessmentId = searchParams.get("assessmentId") || "assessment-001";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Grade state - now includes grades 11 and 12
  const [grade7, setGrade7] = useState<GradeLevel>({});
  const [grade8, setGrade8] = useState<GradeLevel>({});
  const [grade9, setGrade9] = useState<GradeLevel>({});
  const [grade10, setGrade10] = useState<GradeLevel>({});
  const [grade11, setGrade11] = useState<GradeLevel>({});
  const [grade12, setGrade12] = useState<GradeLevel>({});

  // Personal information state
  const [achievements, setAchievements] = useState<AcademicAchievement[]>([]);
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [extracurriculars, setExtracurriculars] = useState<ExtracurricularActivity[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [additionalNotes, setAdditionalNotes] = useState("");

  // UI state
  const [showGrade11, setShowGrade11] = useState(false);
  const [showGrade12, setShowGrade12] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/assessments/grades");
    }
  }, [status, router]);

  // Load existing data if available
  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/grades");
        if (response.ok) {
          const data = await response.json();
          if (data.grades) {
            const info: PersonalInformation = data.grades;
            setGrade7(info.grade7 || {});
            setGrade8(info.grade8 || {});
            setGrade9(info.grade9 || {});
            setGrade10(info.grade10 || {});
            if (info.grade11) {
              setGrade11(info.grade11);
              setShowGrade11(true);
            }
            if (info.grade12) {
              setGrade12(info.grade12);
              setShowGrade12(true);
            }
            setAchievements(info.achievements || []);
            setHobbies(info.hobbies || []);
            setExtracurriculars(info.extracurriculars || []);
            setSkills(info.skills || []);
            setLanguages(info.languages || []);
            setAdditionalNotes(info.additionalNotes || "");
            setConsentChecked(info.consentToUse || false);
          }
        }
      } catch (error) {
        console.error("Error loading personal information:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      loadData();
    }
  }, [status]);

  const handleGradeChange = (
    gradeLevel: "grade7" | "grade8" | "grade9" | "grade10" | "grade11" | "grade12",
    subject: "math" | "english" | "science" | "filipino" | "totalAverage",
    value: string
  ) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    const setters = {
      grade7: setGrade7,
      grade8: setGrade8,
      grade9: setGrade9,
      grade10: setGrade10,
      grade11: setGrade11,
      grade12: setGrade12,
    };

    setters[gradeLevel]((prev) => ({
      ...prev,
      [subject]: numValue,
    }));
  };

  const handleAddCustomSubject = (gradeLevel: "grade7" | "grade8" | "grade9" | "grade10" | "grade11" | "grade12") => {
    const setters = {
      grade7: setGrade7,
      grade8: setGrade8,
      grade9: setGrade9,
      grade10: setGrade10,
      grade11: setGrade11,
      grade12: setGrade12,
    };

    setters[gradeLevel]((prev) => ({
      ...prev,
      customSubjects: [
        ...(prev.customSubjects || []),
        { id: Date.now().toString(), name: "", grade: 0 },
      ],
    }));
  };

  const handleUpdateCustomSubject = (
    gradeLevel: "grade7" | "grade8" | "grade9" | "grade10" | "grade11" | "grade12",
    subjectId: string,
    field: "name" | "grade",
    value: string | number
  ) => {
    const setters = {
      grade7: setGrade7,
      grade8: setGrade8,
      grade9: setGrade9,
      grade10: setGrade10,
      grade11: setGrade11,
      grade12: setGrade12,
    };

    setters[gradeLevel]((prev) => ({
      ...prev,
      customSubjects: (prev.customSubjects || []).map((subject) =>
        subject.id === subjectId
          ? { ...subject, [field]: field === "grade" ? parseFloat(value as string) || 0 : value }
          : subject
      ),
    }));
  };

  const handleRemoveCustomSubject = (
    gradeLevel: "grade7" | "grade8" | "grade9" | "grade10" | "grade11" | "grade12",
    subjectId: string
  ) => {
    const setters = {
      grade7: setGrade7,
      grade8: setGrade8,
      grade9: setGrade9,
      grade10: setGrade10,
      grade11: setGrade11,
      grade12: setGrade12,
    };

    setters[gradeLevel]((prev) => ({
      ...prev,
      customSubjects: (prev.customSubjects || []).filter((subject) => subject.id !== subjectId),
    }));
  };

  const handleSkip = () => {
    router.push(`/assessments/new?assessmentId=${assessmentId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check if any data is filled
    const hasAnyGrades =
      Object.values(grade7).some((v) => v !== undefined) ||
      Object.values(grade8).some((v) => v !== undefined) ||
      Object.values(grade9).some((v) => v !== undefined) ||
      Object.values(grade10).some((v) => v !== undefined) ||
      Object.values(grade11).some((v) => v !== undefined) ||
      Object.values(grade12).some((v) => v !== undefined);

    const hasPersonalInfo =
      achievements.length > 0 ||
      hobbies.length > 0 ||
      extracurriculars.length > 0 ||
      skills.length > 0 ||
      languages.length > 0;

    if (!hasAnyGrades && !hasPersonalInfo && !consentChecked) {
      handleSkip();
      return;
    }

    if ((hasAnyGrades || hasPersonalInfo) && !consentChecked) {
      toast.error("Please consent to the use of your information to continue");
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          grade7,
          grade8,
          grade9,
          grade10,
          grade11: showGrade11 ? grade11 : undefined,
          grade12: showGrade12 ? grade12 : undefined,
          achievements,
          hobbies,
          extracurriculars,
          skills,
          languages,
          additionalNotes,
          consentToUse: consentChecked,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save personal information");
      }

      toast.success("Personal information saved successfully!");
      router.push(`/assessments/new?assessmentId=${assessmentId}`);
    } catch (error) {
      console.error("Error saving personal information:", error);
      toast.error("Failed to save personal information. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <Navbar />
      <main id="main-content" className="flex-1" role="main">
        <div className="mx-auto w-full max-w-5xl px-4 md:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              Personal Information (Optional)
            </h1>
            <p className="text-lg text-muted-foreground">
              Share your academic background, achievements, interests, and skills for personalized career recommendations
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Academic Grades Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5" />
                  Academic Grades
                </CardTitle>
                <CardDescription>
                  Enter your grades from grades 7-12. For high school, use Total Average instead of GPA. All fields are optional.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6">
                <Alert className="items-start">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <AlertDescription>
                    Your academic information will enhance AI-powered career recommendations. You can skip this step or update later.
                  </AlertDescription>
                </Alert>

                {/* Grade 7-10 */}
                <GradeInputSection
                  title="Grade 7"
                  grades={grade7}
                  onChange={(subject, value) => handleGradeChange("grade7", subject, value)}
                  onAddCustomSubject={() => handleAddCustomSubject("grade7")}
                  onUpdateCustomSubject={(id, field, value) => handleUpdateCustomSubject("grade7", id, field, value)}
                  onRemoveCustomSubject={(id) => handleRemoveCustomSubject("grade7", id)}
                />

                <GradeInputSection
                  title="Grade 8"
                  grades={grade8}
                  onChange={(subject, value) => handleGradeChange("grade8", subject, value)}
                  onAddCustomSubject={() => handleAddCustomSubject("grade8")}
                  onUpdateCustomSubject={(id, field, value) => handleUpdateCustomSubject("grade8", id, field, value)}
                  onRemoveCustomSubject={(id) => handleRemoveCustomSubject("grade8", id)}
                />

                <GradeInputSection
                  title="Grade 9"
                  grades={grade9}
                  onChange={(subject, value) => handleGradeChange("grade9", subject, value)}
                  onAddCustomSubject={() => handleAddCustomSubject("grade9")}
                  onUpdateCustomSubject={(id, field, value) => handleUpdateCustomSubject("grade9", id, field, value)}
                  onRemoveCustomSubject={(id) => handleRemoveCustomSubject("grade9", id)}
                />

                <GradeInputSection
                  title="Grade 10"
                  grades={grade10}
                  onChange={(subject, value) => handleGradeChange("grade10", subject, value)}
                  onAddCustomSubject={() => handleAddCustomSubject("grade10")}
                  onUpdateCustomSubject={(id, field, value) => handleUpdateCustomSubject("grade10", id, field, value)}
                  onRemoveCustomSubject={(id) => handleRemoveCustomSubject("grade10", id)}
                />

                {/* Grade 11 (Optional) */}
                {!showGrade11 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGrade11(true)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Grade 11
                  </Button>
                )}

                {showGrade11 && (
                  <GradeInputSection
                    title="Grade 11"
                    grades={grade11}
                    onChange={(subject, value) => handleGradeChange("grade11", subject, value)}
                    onAddCustomSubject={() => handleAddCustomSubject("grade11")}
                    onUpdateCustomSubject={(id, field, value) => handleUpdateCustomSubject("grade11", id, field, value)}
                    onRemoveCustomSubject={(id) => handleRemoveCustomSubject("grade11", id)}
                    onRemove={() => {
                      setShowGrade11(false);
                      setGrade11({});
                    }}
                  />
                )}

                {/* Grade 12 (Optional) */}
                {!showGrade12 && showGrade11 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowGrade12(true)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Grade 12
                  </Button>
                )}

                {showGrade12 && (
                  <GradeInputSection
                    title="Grade 12"
                    grades={grade12}
                    onChange={(subject, value) => handleGradeChange("grade12", subject, value)}
                    onAddCustomSubject={() => handleAddCustomSubject("grade12")}
                    onUpdateCustomSubject={(id, field, value) => handleUpdateCustomSubject("grade12", id, field, value)}
                    onRemoveCustomSubject={(id) => handleRemoveCustomSubject("grade12", id)}
                    onRemove={() => {
                      setShowGrade12(false);
                      setGrade12({});
                    }}
                  />
                )}
              </CardContent>
            </Card>

            {/* Achievements Section */}
            <AchievementsSection
              achievements={achievements}
              onChange={setAchievements}
            />

            {/* Hobbies Section */}
            <HobbiesSection
              hobbies={hobbies}
              onChange={setHobbies}
            />

            {/* Extracurricular Activities Section */}
            <ExtracurricularsSection
              extracurriculars={extracurriculars}
              onChange={setExtracurriculars}
            />

            {/* Skills and Languages Section */}
            <SkillsLanguagesSection
              skills={skills}
              languages={languages}
              onSkillsChange={setSkills}
              onLanguagesChange={setLanguages}
            />

            {/* Additional Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Additional Notes</CardTitle>
                <CardDescription>
                  Any other relevant information you'd like to share
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Add any additional context about your academic background, career goals, or personal circumstances..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={4}
                />
              </CardContent>
            </Card>

            {/* Consent Checkbox */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="consent"
                    checked={consentChecked}
                    onCheckedChange={(checked) => setConsentChecked(checked === true)}
                  />
                  <div className="space-y-1 leading-none">
                    <Label
                      htmlFor="consent"
                      className="text-sm font-medium cursor-pointer"
                    >
                      I consent to the use of my personal information
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Your information will be used to improve career recommendations through AI analysis. This data will be stored securely and used only for this purpose.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-between">
              <Button
                type="button"
                variant="outline"
                onClick={handleSkip}
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                Skip for Now
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="w-full sm:w-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    Continue to Assessment
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

// Grade Input Section Component
interface GradeInputSectionProps {
  title: string;
  grades: GradeLevel;
  onChange: (subject: "math" | "english" | "science" | "filipino" | "totalAverage", value: string) => void;
  onAddCustomSubject: () => void;
  onUpdateCustomSubject: (id: string, field: "name" | "grade", value: string | number) => void;
  onRemoveCustomSubject: (id: string) => void;
  onRemove?: () => void;
}

function GradeInputSection({
  title,
  grades,
  onChange,
  onAddCustomSubject,
  onUpdateCustomSubject,
  onRemoveCustomSubject,
  onRemove,
}: GradeInputSectionProps) {
  return (
    <div className="space-y-4 p-4 border rounded-lg">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">{title}</h3>
        {onRemove && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRemove}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Core Subjects */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor={`${title}-math`}>Math</Label>
          <Input
            id={`${title}-math`}
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0-100"
            value={grades.math ?? ""}
            onChange={(e) => onChange("math", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${title}-english`}>English</Label>
          <Input
            id={`${title}-english`}
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0-100"
            value={grades.english ?? ""}
            onChange={(e) => onChange("english", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${title}-science`}>Science</Label>
          <Input
            id={`${title}-science`}
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0-100"
            value={grades.science ?? ""}
            onChange={(e) => onChange("science", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${title}-filipino`}>Filipino</Label>
          <Input
            id={`${title}-filipino`}
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0-100"
            value={grades.filipino ?? ""}
            onChange={(e) => onChange("filipino", e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`${title}-totalAverage`}>Total Average</Label>
          <Input
            id={`${title}-totalAverage`}
            type="number"
            step="0.01"
            min="0"
            max="100"
            placeholder="0-100"
            value={grades.totalAverage ?? ""}
            onChange={(e) => onChange("totalAverage", e.target.value)}
          />
        </div>
      </div>

      {/* Custom Subjects */}
      {grades.customSubjects && grades.customSubjects.length > 0 && (
        <div className="space-y-3 pt-4 border-t">
          <h4 className="text-sm font-medium">Custom Subjects</h4>
          {grades.customSubjects.map((subject) => (
            <div key={subject.id} className="flex gap-2">
              <Input
                placeholder="Subject name"
                value={subject.name}
                onChange={(e) => onUpdateCustomSubject(subject.id, "name", e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="Grade"
                value={subject.grade}
                onChange={(e) => onUpdateCustomSubject(subject.id, "grade", e.target.value)}
                className="w-24"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => onRemoveCustomSubject(subject.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Subject Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onAddCustomSubject}
        className="w-full"
      >
        <Plus className="mr-2 h-4 w-4" />
        Add Custom Subject
      </Button>
    </div>
  );
}

// Achievements Section Component
interface AchievementsSectionProps {
  achievements: AcademicAchievement[];
  onChange: (achievements: AcademicAchievement[]) => void;
}

function AchievementsSection({ achievements, onChange }: AchievementsSectionProps) {
  const addAchievement = () => {
    onChange([
      ...achievements,
      {
        id: Date.now().toString(),
        title: "",
        description: "",
        dateReceived: "",
        category: "academic",
      },
    ]);
  };

  const updateAchievement = (id: string, field: keyof AcademicAchievement, value: any) => {
    onChange(
      achievements.map((achievement) =>
        achievement.id === id ? { ...achievement, [field]: value } : achievement
      )
    );
  };

  const removeAchievement = (id: string) => {
    onChange(achievements.filter((achievement) => achievement.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5" />
          Achievements & Awards
        </CardTitle>
        <CardDescription>
          Add your academic achievements, awards, or recognitions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {achievements.map((achievement) => (
          <div key={achievement.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-start gap-2">
              <Input
                placeholder="Achievement title"
                value={achievement.title}
                onChange={(e) => updateAchievement(achievement.id, "title", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeAchievement(achievement.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={achievement.description}
              onChange={(e) => updateAchievement(achievement.id, "description", e.target.value)}
              rows={2}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={achievement.category}
                  onValueChange={(value) => updateAchievement(achievement.id, "category", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="academic">Academic</SelectItem>
                    <SelectItem value="extracurricular">Extracurricular</SelectItem>
                    <SelectItem value="competition">Competition</SelectItem>
                    <SelectItem value="leadership">Leadership</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Date Received</Label>
                <Input
                  type="date"
                  value={achievement.dateReceived}
                  onChange={(e) => updateAchievement(achievement.id, "dateReceived", e.target.value)}
                />
              </div>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addAchievement} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Achievement
        </Button>
      </CardContent>
    </Card>
  );
}

// Hobbies Section Component
interface HobbiesSectionProps {
  hobbies: Hobby[];
  onChange: (hobbies: Hobby[]) => void;
}

function HobbiesSection({ hobbies, onChange }: HobbiesSectionProps) {
  const addHobby = () => {
    onChange([
      ...hobbies,
      {
        id: Date.now().toString(),
        name: "",
        description: "",
        skillLevel: "beginner",
      },
    ]);
  };

  const updateHobby = (id: string, field: keyof Hobby, value: any) => {
    onChange(
      hobbies.map((hobby) =>
        hobby.id === id ? { ...hobby, [field]: value } : hobby
      )
    );
  };

  const removeHobby = (id: string) => {
    onChange(hobbies.filter((hobby) => hobby.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Hobbies & Interests
        </CardTitle>
        <CardDescription>
          Share your hobbies and personal interests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hobbies.map((hobby) => (
          <div key={hobby.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-start gap-2">
              <Input
                placeholder="Hobby name"
                value={hobby.name}
                onChange={(e) => updateHobby(hobby.id, "name", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeHobby(hobby.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              placeholder="Description (optional)"
              value={hobby.description}
              onChange={(e) => updateHobby(hobby.id, "description", e.target.value)}
              rows={2}
            />
            <div className="space-y-2">
              <Label>Skill Level</Label>
              <Select
                value={hobby.skillLevel}
                onValueChange={(value) => updateHobby(hobby.id, "skillLevel", value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addHobby} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Hobby
        </Button>
      </CardContent>
    </Card>
  );
}

// Extracurriculars Section Component
interface ExtracurricularsSectionProps {
  extracurriculars: ExtracurricularActivity[];
  onChange: (extracurriculars: ExtracurricularActivity[]) => void;
}

function ExtracurricularsSection({ extracurriculars, onChange }: ExtracurricularsSectionProps) {
  const addActivity = () => {
    onChange([
      ...extracurriculars,
      {
        id: Date.now().toString(),
        name: "",
        role: "",
        description: "",
        yearsActive: 0,
      },
    ]);
  };

  const updateActivity = (id: string, field: keyof ExtracurricularActivity, value: any) => {
    onChange(
      extracurriculars.map((activity) =>
        activity.id === id ? { ...activity, [field]: value } : activity
      )
    );
  };

  const removeActivity = (id: string) => {
    onChange(extracurriculars.filter((activity) => activity.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Extracurricular Activities
        </CardTitle>
        <CardDescription>
          List your extracurricular activities, clubs, or organizations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {extracurriculars.map((activity) => (
          <div key={activity.id} className="p-4 border rounded-lg space-y-3">
            <div className="flex justify-between items-start gap-2">
              <Input
                placeholder="Activity name"
                value={activity.name}
                onChange={(e) => updateActivity(activity.id, "name", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeActivity(activity.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            <Input
              placeholder="Your role (optional)"
              value={activity.role}
              onChange={(e) => updateActivity(activity.id, "role", e.target.value)}
            />
            <Textarea
              placeholder="Description (optional)"
              value={activity.description}
              onChange={(e) => updateActivity(activity.id, "description", e.target.value)}
              rows={2}
            />
            <div className="space-y-2">
              <Label>Years Active</Label>
              <Input
                type="number"
                min="0"
                max="20"
                placeholder="0"
                value={activity.yearsActive}
                onChange={(e) => updateActivity(activity.id, "yearsActive", parseInt(e.target.value) || 0)}
              />
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={addActivity} className="w-full">
          <Plus className="mr-2 h-4 w-4" />
          Add Activity
        </Button>
      </CardContent>
    </Card>
  );
}

// Skills and Languages Section Component
interface SkillsLanguagesSectionProps {
  skills: string[];
  languages: string[];
  onSkillsChange: (skills: string[]) => void;
  onLanguagesChange: (languages: string[]) => void;
}

function SkillsLanguagesSection({
  skills,
  languages,
  onSkillsChange,
  onLanguagesChange,
}: SkillsLanguagesSectionProps) {
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  const addSkill = () => {
    if (newSkill.trim()) {
      onSkillsChange([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    onSkillsChange(skills.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (newLanguage.trim()) {
      onLanguagesChange([...languages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    onLanguagesChange(languages.filter((_, i) => i !== index));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Briefcase className="h-5 w-5" />
          Skills & Languages
        </CardTitle>
        <CardDescription>
          Add your technical skills, soft skills, and languages you speak
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills */}
        <div className="space-y-3">
          <Label>Skills</Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., Programming, Communication, Leadership"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
            />
            <Button type="button" onClick={addSkill}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {skills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Languages */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <Languages className="h-4 w-4" />
            Languages
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="e.g., English, Filipino, Spanish"
              value={newLanguage}
              onChange={(e) => setNewLanguage(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), addLanguage())}
            />
            <Button type="button" onClick={addLanguage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {languages.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {languages.map((language, index) => (
                <div
                  key={index}
                  className="flex items-center gap-1 bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm"
                >
                  {language}
                  <button
                    type="button"
                    onClick={() => removeLanguage(index)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default function PersonalInformationPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <PersonalInformationPageContent />
    </Suspense>
  );
}
