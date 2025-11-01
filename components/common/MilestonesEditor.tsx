"use client";

import { useState } from "react";
import { Milestone, JobPath } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface MilestonesEditorProps {
  jobPath: JobPath;
  initialMilestones?: Milestone[];
  onSave: (milestones: Milestone[]) => Promise<void>;
}

export function MilestonesEditor({
  jobPath,
  initialMilestones = [],
  onSave,
}: MilestonesEditorProps) {
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [newMilestoneText, setNewMilestoneText] = useState("");
  const [saving, setSaving] = useState(false);

  function addMilestone() {
    if (!newMilestoneText.trim()) {
      toast.error("Please enter a milestone description");
      return;
    }

    const newMilestone: Milestone = {
      id: `milestone-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      text: newMilestoneText.trim(),
      completed: false,
    };

    setMilestones([...milestones, newMilestone]);
    setNewMilestoneText("");
  }

  function removeMilestone(id: string) {
    setMilestones(milestones.filter((m) => m.id !== id));
  }

  function toggleMilestone(id: string) {
    setMilestones(
      milestones.map((m) =>
        m.id === id
          ? {
              ...m,
              completed: !m.completed,
              completedAt: !m.completed ? new Date() : undefined,
            }
          : m
      )
    );
  }

  async function handleSave() {
    try {
      setSaving(true);
      await onSave(milestones);
      toast.success("Milestones saved successfully");
    } catch (error) {
      console.error("Error saving milestones:", error);
      toast.error("Failed to save milestones");
    } finally {
      setSaving(false);
    }
  }

  const completedCount = milestones.filter((m) => m.completed).length;
  const progressPercentage =
    milestones.length > 0 ? (completedCount / milestones.length) * 100 : 0;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{jobPath.title}</CardTitle>
            <CardDescription>
              Track your progress toward this career path
            </CardDescription>
          </div>
          {milestones.length > 0 && (
            <div className="text-right">
              <div className="text-sm font-medium">
                {completedCount} / {milestones.length} completed
              </div>
              <div className="text-xs text-muted-foreground">
                {progressPercentage.toFixed(0)}% complete
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Progress Bar */}
          {milestones.length > 0 && (
            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary h-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          )}

          {/* Milestones List */}
          <div className="space-y-2">
            {milestones.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">
                  No milestones yet. Add your first milestone below!
                </p>
              </div>
            )}

            {milestones.map((milestone) => (
              <div
                key={milestone.id}
                className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/5 transition-colors group"
              >
                <Checkbox
                  id={milestone.id}
                  checked={milestone.completed}
                  onCheckedChange={() => toggleMilestone(milestone.id)}
                  className="mt-0.5"
                />
                <div className="flex-1 min-w-0">
                  <label
                    htmlFor={milestone.id}
                    className={`text-sm cursor-pointer ${
                      milestone.completed
                        ? "line-through text-muted-foreground"
                        : ""
                    }`}
                  >
                    {milestone.text}
                  </label>
                  {milestone.completed && milestone.completedAt && (
                    <div className="flex items-center gap-1 mt-1">
                      <Badge variant="secondary" className="text-xs">
                        Completed{" "}
                        {new Date(milestone.completedAt).toLocaleDateString()}
                      </Badge>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeMilestone(milestone.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  title="Remove milestone"
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
          </div>

          {/* Add New Milestone */}
          <div className="flex gap-2">
            <Input
              placeholder="Add a new milestone (e.g., Complete online course)"
              value={newMilestoneText}
              onChange={(e) => setNewMilestoneText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addMilestone();
                }
              }}
            />
            <Button onClick={addMilestone} size="icon" title="Add milestone">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Save Button */}
          <div className="pt-2 border-t">
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
            >
              {saving ? "Saving..." : "Save Milestones"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
