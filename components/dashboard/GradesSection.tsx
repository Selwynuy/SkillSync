"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Edit, Save, X, Loader2 } from "lucide-react";
import { UserGrades, GradeLevel } from "@/lib/types";
import { toast } from "sonner";

interface GradesSectionProps {
  initialGrades: UserGrades | null;
  onUpdate: (grades: UserGrades) => void;
}

export function GradesSection({ initialGrades, onUpdate }: GradesSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [grade7, setGrade7] = useState<GradeLevel>(initialGrades?.grade7 || {});
  const [grade8, setGrade8] = useState<GradeLevel>(initialGrades?.grade8 || {});
  const [grade9, setGrade9] = useState<GradeLevel>(initialGrades?.grade9 || {});
  const [grade10, setGrade10] = useState<GradeLevel>(initialGrades?.grade10 || {});
  const [additionalNotes, setAdditionalNotes] = useState(
    initialGrades?.additionalNotes || ""
  );
  const [consentChecked, setConsentChecked] = useState(
    initialGrades?.consentToUse || false
  );

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

  const handleCancel = () => {
    // Reset to initial values
    setGrade7(initialGrades?.grade7 || {});
    setGrade8(initialGrades?.grade8 || {});
    setGrade9(initialGrades?.grade9 || {});
    setGrade10(initialGrades?.grade10 || {});
    setAdditionalNotes(initialGrades?.additionalNotes || "");
    setConsentChecked(initialGrades?.consentToUse || false);
    setIsEditing(false);
  };

  const handleSave = async () => {
    // Validate consent if grades are provided
    const hasAnyGrades =
      Object.values(grade7).some((v) => v !== undefined) ||
      Object.values(grade8).some((v) => v !== undefined) ||
      Object.values(grade9).some((v) => v !== undefined) ||
      Object.values(grade10).some((v) => v !== undefined);

    if (hasAnyGrades && !consentChecked) {
      toast.error("Please consent to the use of your grades");
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

      const data = await response.json();
      onUpdate(data.grades);
      setIsEditing(false);
      toast.success("Grades updated successfully!");
    } catch (error) {
      console.error("Error saving grades:", error);
      toast.error("Failed to save grades");
    } finally {
      setIsSaving(false);
    }
  };

  const hasGrades = initialGrades !== null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <GraduationCap className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Academic Grades</CardTitle>
              <CardDescription>
                {hasGrades
                  ? "Your academic performance from grades 7-10"
                  : "Add your grades to enhance AI recommendations"}
              </CardDescription>
            </div>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              {hasGrades ? "Edit" : "Add Grades"}
            </Button>
          )}
          {isEditing && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                disabled={isSaving}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Save
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {!hasGrades && !isEditing ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className="mb-4">
              No grades on file. Adding your grades can help provide more
              personalized career recommendations.
            </p>
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              Add Your Grades
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <GradeInputSection
              title="Grade 7"
              grades={grade7}
              onChange={(subject, value) =>
                handleGradeChange("grade7", subject, value)
              }
              readOnly={!isEditing}
            />
            <GradeInputSection
              title="Grade 8"
              grades={grade8}
              onChange={(subject, value) =>
                handleGradeChange("grade8", subject, value)
              }
              readOnly={!isEditing}
            />
            <GradeInputSection
              title="Grade 9"
              grades={grade9}
              onChange={(subject, value) =>
                handleGradeChange("grade9", subject, value)
              }
              readOnly={!isEditing}
            />
            <GradeInputSection
              title="Grade 10"
              grades={grade10}
              onChange={(subject, value) =>
                handleGradeChange("grade10", subject, value)
              }
              readOnly={!isEditing}
            />

            {/* Additional Notes */}
            <div className="space-y-2 pt-4 border-t">
              <Label htmlFor="notes">Additional Notes</Label>
              {isEditing ? (
                <Textarea
                  id="notes"
                  placeholder="Add any relevant academic achievements, awards, or context..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                  rows={3}
                />
              ) : additionalNotes ? (
                <p className="text-sm text-muted-foreground">{additionalNotes}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No additional notes</p>
              )}
            </div>

            {/* Consent */}
            {isEditing && (
              <div className="flex items-start space-x-3 rounded-lg border p-4 bg-muted/50">
                <Checkbox
                  id="consent"
                  checked={consentChecked}
                  onCheckedChange={(checked) =>
                    setConsentChecked(checked === true)
                  }
                />
                <div className="space-y-1 leading-none">
                  <Label
                    htmlFor="consent"
                    className="text-sm font-medium cursor-pointer"
                  >
                    I consent to the use of my academic grades
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Your grades will be used to improve career recommendations
                    through AI analysis.
                  </p>
                </div>
              </div>
            )}
            {!isEditing && (
              <div className="text-sm text-muted-foreground pt-4 border-t">
                {consentChecked ? (
                  <p className="text-green-600 dark:text-green-400">
                    ✓ Consent provided for AI analysis
                  </p>
                ) : (
                  <p className="text-amber-600 dark:text-amber-400">
                    ⚠ Consent not provided - grades won't be used for AI analysis
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface GradeInputSectionProps {
  title: string;
  grades: GradeLevel;
  onChange: (subject: "math" | "english" | "science" | "gpa", value: string) => void;
  readOnly?: boolean;
}

function GradeInputSection({
  title,
  grades,
  onChange,
  readOnly = false,
}: GradeInputSectionProps) {
  const hasAnyGrade = Object.values(grades).some((v) => v !== undefined);

  if (readOnly && !hasAnyGrade) {
    return null; // Don't show empty grade levels in read-only mode
  }

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-sm text-muted-foreground">{title}</h3>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <Label htmlFor={`${title}-math`} className="text-xs">
            Math
          </Label>
          {readOnly ? (
            <div className="text-sm font-medium">
              {grades.math !== undefined ? grades.math : "—"}
            </div>
          ) : (
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
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${title}-english`} className="text-xs">
            English
          </Label>
          {readOnly ? (
            <div className="text-sm font-medium">
              {grades.english !== undefined ? grades.english : "—"}
            </div>
          ) : (
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
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${title}-science`} className="text-xs">
            Science
          </Label>
          {readOnly ? (
            <div className="text-sm font-medium">
              {grades.science !== undefined ? grades.science : "—"}
            </div>
          ) : (
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
          )}
        </div>
        <div className="space-y-1">
          <Label htmlFor={`${title}-gpa`} className="text-xs">
            GPA
          </Label>
          {readOnly ? (
            <div className="text-sm font-medium">
              {grades.gpa !== undefined ? grades.gpa : "—"}
            </div>
          ) : (
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
          )}
        </div>
      </div>
    </div>
  );
}
