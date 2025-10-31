"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Bookmark,
  BookmarkCheck,
  TrendingUp,
  GraduationCap,
  DollarSign,
  Sparkles,
  AlertCircle,
  Loader2
} from "lucide-react";
import type { Recommendation } from "@/lib/types";

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [savedPaths, setSavedPaths] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingPath, setSavingPath] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
    fetchSavedPaths();
  }, []);

  async function fetchRecommendations() {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/recommendations?limit=10");

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 404) {
          setError("Please complete an assessment to get recommendations.");
          return;
        }
        throw new Error(data.error || "Failed to load recommendations");
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(err instanceof Error ? err.message : "Failed to load recommendations");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSavedPaths() {
    try {
      const response = await fetch("/api/saved-paths");
      if (response.ok) {
        const data = await response.json();
        const saved = new Set<string>(data.savedPaths.map((jp: any) => jp.id));
        setSavedPaths(saved);
      }
    } catch (err) {
      console.error("Error fetching saved paths:", err);
    }
  }

  async function toggleSavePath(jobPathId: string) {
    setSavingPath(jobPathId);
    try {
      const isSaved = savedPaths.has(jobPathId);

      if (isSaved) {
        // Unsave
        const response = await fetch(`/api/saved-paths/${jobPathId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          setSavedPaths((prev) => {
            const next = new Set(prev);
            next.delete(jobPathId);
            return next;
          });
        }
      } else {
        // Save
        const response = await fetch("/api/saved-paths", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobPathId }),
        });

        if (response.ok) {
          setSavedPaths((prev) => new Set(prev).add(jobPathId));
        }
      }
    } catch (err) {
      console.error("Error toggling save:", err);
    } finally {
      setSavingPath(null);
    }
  }

  function formatSalary(amount: number): string {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  }

  if (loading) {
    return (
      <div className="container flex min-h-screen items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your recommendations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12">
        <div className="mx-auto max-w-2xl">
          <Card className="border-destructive/50">
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-destructive" />
                <CardTitle>No Recommendations Available</CardTitle>
              </div>
              <CardDescription>{error}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push("/assessments")}>
                Take Assessment
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              Your Career Recommendations
            </h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Based on your assessment, here are the career paths that match your unique strengths and interests.
          </p>
        </div>

        {/* Recommendations Grid */}
        {recommendations.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No recommendations available. Please try retaking the assessment.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {recommendations.map((rec, index) => {
              const isSaved = savedPaths.has(rec.jobPath.id);
              const isSaving = savingPath === rec.jobPath.id;
              const matchPercentage = Math.round(rec.score * 100);

              return (
                <Card key={rec.jobPath.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-br from-primary/5 to-transparent">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary">#{index + 1}</Badge>
                          <Badge variant="outline">{rec.jobPath.category}</Badge>
                        </div>
                        <CardTitle className="text-2xl mb-2">
                          {rec.jobPath.title}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {rec.jobPath.description}
                        </CardDescription>
                      </div>

                      <Button
                        variant={isSaved ? "default" : "outline"}
                        size="icon"
                        onClick={() => toggleSavePath(rec.jobPath.id)}
                        disabled={isSaving}
                      >
                        {isSaving ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : isSaved ? (
                          <BookmarkCheck className="h-4 w-4" />
                        ) : (
                          <Bookmark className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="pt-6">
                    <div className="space-y-6">
                      {/* Match Score */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Match Score</span>
                          <span className="text-2xl font-bold text-primary">
                            {matchPercentage}%
                          </span>
                        </div>
                        <Progress value={matchPercentage} className="h-3" />
                      </div>

                      {/* Key Drivers */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Key Strengths Match</h4>
                        <div className="flex flex-wrap gap-2">
                          {rec.drivers.map((driver) => (
                            <Badge key={driver} variant="secondary">
                              {driver}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Rationale */}
                      <div>
                        <h4 className="text-sm font-medium mb-2">Why This Matches You</h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {rec.rationale}
                        </p>
                      </div>

                      {/* Career Details */}
                      <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t">
                        <div className="flex items-start gap-3">
                          <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Salary Range</p>
                            <p className="font-medium">
                              {formatSalary(rec.jobPath.salaryRange.min)} -{" "}
                              {formatSalary(rec.jobPath.salaryRange.max)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <GraduationCap className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Education Level</p>
                            <p className="font-medium">{rec.jobPath.educationLevel}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <TrendingUp className="h-5 w-5 text-muted-foreground mt-0.5" />
                          <div>
                            <p className="text-xs text-muted-foreground">Growth Rate</p>
                            <p className="font-medium">
                              {rec.jobPath.growthRate > 0 ? "+" : ""}
                              {rec.jobPath.growthRate}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tags */}
                      {rec.jobPath.tags && rec.jobPath.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                          {rec.jobPath.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Actions Footer */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border p-6 bg-muted/50">
          <div>
            <p className="font-medium">Want to explore more?</p>
            <p className="text-sm text-muted-foreground">
              View your saved paths in the dashboard or retake the assessment.
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => router.push("/dashboard")}>
              Go to Dashboard
            </Button>
            <Button onClick={() => router.push("/assessments")}>
              Retake Assessment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
