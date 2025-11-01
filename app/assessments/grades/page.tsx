"use client";

import { useState, useEffect } from "react";
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
import { ArrowRight, GraduationCap, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { GradeLevel } from "@/lib/types";

export default function GradesInputPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();
  const assessmentId = searchParams.get("assessmentId") || "assessment-001";

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [consentChecked, setConsentChecked] = useState(false);

  // Grade state
  const [grade7, setGrade7] = useState<GradeLevel>({});
  const [grade8, setGrade8] = useState<GradeLevel>({});
  const [grade9, setGrade9] = useState<GradeLevel>({});
  const [grade10, setGrade10] = useState<GradeLevel>({});
  const [additionalNotes, setAdditionalNotes] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/assessments/grades");
    }
  }, [status, router]);

  // Load existing grades if available
  useEffect(() => {
    async function loadGrades() {
      try {
        const response = await fetch("/api/grades");
        if (response.ok) {
          const data = await response.json();
          if (data.grades) {
            setGrade7(data.grades.grade7 || {});
            setGrade8(data.grades.grade8 || {});
            setGrade9(data.grades.grade9 || {});
            setGrade10(data.grades.grade10 || {});
            setAdditionalNotes(data.grades.additionalNotes || "");
            setConsentChecked(data.grades.consentToUse || false);
          }
        }
      } catch (error) {
        console.error("Error loading grades:", error);
      } finally {
        setIsLoading(false);
      }
    }

    if (status === "authenticated") {
      loadGrades();
    }
  }, [status]);

  const handleGradeChange = (
    gradeLevel: "grade7" | "grade8" | "grade9" | "grade10",
    subject: "math" | "english" | "science" | "gpa",
    value: string
  ) => {
    const numValue = value === "" ? undefined : parseFloat(value);
    const setters = {
      grade7: setGrade7,
      grade8: setGrade8,
      grade9: setGrade9,
      grade10: setGrade10,
    };

    setters[gradeLevel]((prev) => ({
      ...prev,
      [subject]: numValue,
    }));
  };

  const handleSkip = () => {
    router.push(`/assessments/new?assessmentId=${assessmentId}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // If no grades are filled and consent not checked, just skip
    const hasAnyGrades =
      Object.values(grade7).some((v) => v !== undefined) ||
      Object.values(grade8).some((v) => v !== undefined) ||
      Object.values(grade9).some((v) => v !== undefined) ||
      Object.values(grade10).some((v) => v !== undefined);

    if (!hasAnyGrades && !consentChecked) {
      handleSkip();
      return;
    }

    if (hasAnyGrades && !consentChecked) {
      toast.error("Please consent to the use of your grades to continue");
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
          additionalNotes,
          consentToUse: consentChecked,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save grades");
      }

      toast.success("Grades saved successfully!");
      router.push(`/assessments/new?assessmentId=${assessmentId}`);
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error("Failed to save grades. Please try again.");
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
        <div className="mx-auto w-full max-w-4xl px-4 md:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-8 w-8 text-primary" />
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight">
              Academic Background (Optional)
            </h1>
            <p className="text-lg text-muted-foreground">
              Share your academic grades to help us provide more personalized career recommendations
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Enter Your Grades</CardTitle>
                <CardDescription>
                  Fill in your recent grades from grades 7-10. All fields are optional. Leave blank if you don't have grades for a particular subject or level.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-8">
                {/* Info Alert */}
                <Alert className="items-start">
                  <Info className="h-4 w-4 shrink-0 mt-0.5" />
                  <AlertDescription>
                    Your grades will be used to enhance AI-powered career recommendations. You can skip this step or update your grades later in your dashboard.
                  </AlertDescription>
                </Alert>

                {/* Grade 7 */}
                <GradeInputSection
                  title="Grade 7"
                  grades={grade7}
                  onChange={(subject, value) => handleGradeChange("grade7", subject, value)}
                />

                {/* Grade 8 */}
                <GradeInputSection
                  title="Grade 8"
                  grades={grade8}
                  onChange={(subject, value) => handleGradeChange("grade8", subject, value)}
                />

                {/* Grade 9 */}
                <GradeInputSection
                  title="Grade 9"
                  grades={grade9}
                  onChange={(subject, value) => handleGradeChange("grade9", subject, value)}
                />

                {/* Grade 10 */}
                <GradeInputSection
                  title="Grade 10"
                  grades={grade10}
                  onChange={(subject, value) => handleGradeChange("grade10", subject, value)}
                />

                {/* Additional Notes */}
                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Add any relevant academic achievements, awards, or context..."
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* Consent Checkbox */}
                <div className="flex items-start space-x-3 rounded-lg border p-4">
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
                      I consent to the use of my academic grades
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Your grades will be used to improve career recommendations through AI analysis. This data will be stored securely and used only for this purpose.
                    </p>
                  </div>
                </div>
              </CardContent>

              <CardFooter className="flex flex-col sm:flex-row gap-3 justify-between">
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
              </CardFooter>
            </Card>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

interface GradeInputSectionProps {
  title: string;
  grades: GradeLevel;
  onChange: (subject: "math" | "english" | "science" | "gpa", value: string) => void;
}

function GradeInputSection({ title, grades, onChange }: GradeInputSectionProps) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          <Label htmlFor={`${title}-gpa`}>GPA</Label>
          <Input
            id={`${title}-gpa`}
            type="number"
            step="0.01"
            min="0"
            max="5"
            placeholder="0-5"
            value={grades.gpa ?? ""}
            onChange={(e) => onChange("gpa", e.target.value)}
          />
        </div>
      </div>
    </div>
  );
}
