"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { AssessmentAttempt, JobPath, UserGrades } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { Trash2, Bookmark, Target } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MilestonesEditor } from "@/components/common/MilestonesEditor";
import { GradesSection } from "@/components/dashboard/GradesSection";
import type { Milestone } from "@/lib/types";
import { Navbar } from "@/app/(marketing)/components/Navbar";
import { Footer } from "@/app/(marketing)/components/Footer";
import { SkipToContent } from "@/components/common/skip-to-content";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [attempts, setAttempts] = useState<AssessmentAttempt[]>([]);
  const [savedPaths, setSavedPaths] = useState<JobPath[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedPathsLoading, setSavedPathsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedJobPathId, setSelectedJobPathId] = useState<string>("");
  const [milestones, setMilestones] = useState<Record<string, Milestone[]>>({});
  const [grades, setGrades] = useState<UserGrades | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (status === "authenticated") {
      fetchAttempts();
      fetchSavedPaths();
      fetchMilestones();
      fetchGrades();
    }
  }, [status, router]);

  async function fetchAttempts() {
    try {
      setLoading(true);
      const response = await fetch("/api/dashboard/attempts");

      if (!response.ok) {
        throw new Error("Failed to fetch attempts");
      }

      const data = await response.json();
      // Convert date strings back to Date objects
      const attemptsWithDates = data.attempts.map((attempt: any) => ({
        ...attempt,
        completedAt: new Date(attempt.completedAt),
        createdAt: new Date(attempt.createdAt),
      }));
      setAttempts(attemptsWithDates);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }

  async function fetchSavedPaths() {
    try {
      setSavedPathsLoading(true);
      const response = await fetch("/api/saved-paths");

      if (!response.ok) {
        throw new Error("Failed to fetch saved paths");
      }

      const data = await response.json();
      setSavedPaths(data.savedPaths || []);
    } catch (err) {
      console.error("Error fetching saved paths:", err);
      toast.error("Failed to load saved paths");
    } finally {
      setSavedPathsLoading(false);
    }
  }

  async function handleRemovePath(jobPathId: string, title: string) {
    try {
      const response = await fetch(`/api/saved-paths/${jobPathId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to remove job path");
      }

      // Update local state
      setSavedPaths(savedPaths.filter((path) => path.id !== jobPathId));

      // Clear selection if this was the selected path
      if (selectedJobPathId === jobPathId) {
        setSelectedJobPathId("");
      }

      toast.success(`Removed "${title}" from saved paths`);
    } catch (err) {
      console.error("Error removing job path:", err);
      toast.error("Failed to remove job path");
    }
  }

  async function fetchMilestones() {
    try {
      const response = await fetch("/api/milestones");

      if (!response.ok) {
        // If 404 or other errors, just use empty milestones
        return;
      }

      const data = await response.json();
      // Transform array to record keyed by jobPathId
      const milestonesRecord: Record<string, Milestone[]> = {};
      data.userMilestones?.forEach((um: any) => {
        milestonesRecord[um.jobPathId] = um.milestones;
      });
      setMilestones(milestonesRecord);
    } catch (err) {
      console.error("Error fetching milestones:", err);
      // Fail silently - milestones are optional
    }
  }

  async function handleSaveMilestones(jobPathId: string, milestonesData: Milestone[]) {
    const response = await fetch("/api/milestones", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobPathId, milestones: milestonesData }),
    });

    if (!response.ok) {
      throw new Error("Failed to save milestones");
    }

    // Update local state
    setMilestones({ ...milestones, [jobPathId]: milestonesData });
  }

  async function fetchGrades() {
    try {
      const response = await fetch("/api/grades");

      if (!response.ok) {
        // If 404 or other errors, just use null
        return;
      }

      const data = await response.json();
      setGrades(data.grades || null);
    } catch (err) {
      console.error("Error fetching grades:", err);
      // Fail silently - grades are optional
    }
  }

  function handleGradesUpdate(updatedGrades: UserGrades) {
    setGrades(updatedGrades);
  }

  const selectedJobPath = savedPaths.find((p) => p.id === selectedJobPathId);

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SkipToContent />
        <Navbar />
        <main id="main-content" className="flex-1" role="main">
          <div className="container mx-auto px-4 py-8">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <Navbar />
      <main id="main-content" className="flex-1" role="main">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Track your career exploration journey
        </p>
      </div>

      {/* Assessment History Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Assessment History</h2>
            <p className="text-sm text-muted-foreground">
              Your completed assessments and trait profiles
            </p>
          </div>
          <Button onClick={() => router.push("/assessments")}>
            Take New Assessment
          </Button>
        </div>

        {error && (
          <Card className="border-destructive mb-4">
            <CardContent className="pt-6">
              <p className="text-destructive">{error}</p>
            </CardContent>
          </Card>
        )}

        {attempts.length === 0 && !error && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <p className="text-muted-foreground mb-4">
                You haven&apos;t completed any assessments yet.
              </p>
              <Button onClick={() => router.push("/assessments")}>
                Take Your First Assessment
              </Button>
            </CardContent>
          </Card>
        )}

        {attempts.length > 0 && (
          <div className="space-y-4">
            {attempts.map((attempt, index) => (
              <Card key={attempt.id} className="relative">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <CardTitle className="text-lg">
                          Assessment #{attempts.length - index}
                        </CardTitle>
                        {index === 0 && (
                          <Badge variant="default">Latest</Badge>
                        )}
                      </div>
                      <CardDescription>
                        Completed{" "}
                        {formatDistanceToNow(attempt.completedAt, {
                          addSuffix: true,
                        })}
                      </CardDescription>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push("/recommendations")}
                    >
                      View Recommendations
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium mb-2">
                        Your Trait Profile
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {Object.entries(attempt.traitSummary)
                          .sort(([, a], [, b]) => b - a)
                          .map(([trait, score]) => (
                            <div
                              key={trait}
                              className="flex items-center justify-between bg-muted rounded-md px-3 py-2"
                            >
                              <span className="text-sm capitalize">
                                {trait.replace(/_/g, " ")}
                              </span>
                              <Badge variant="secondary" className="ml-2">
                                {score.toFixed(1)}
                              </Badge>
                            </div>
                          ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
                      <span>
                        Started:{" "}
                        {new Date(attempt.createdAt).toLocaleDateString()}
                      </span>
                      <span>
                        Completed:{" "}
                        {new Date(attempt.completedAt).toLocaleDateString()}
                      </span>
                      <span>{attempt.responses.length} responses</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Saved Job Paths Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold mb-1">Saved Job Paths</h2>
            <p className="text-sm text-muted-foreground">
              Career paths you&apos;ve bookmarked for future reference
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/recommendations")}
          >
            <Bookmark className="h-4 w-4 mr-2" />
            View Recommendations
          </Button>
        </div>

        {savedPathsLoading && (
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
            <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>
        )}

        {!savedPathsLoading && savedPaths.length === 0 && (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Bookmark className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                You haven&apos;t saved any career paths yet.
              </p>
              <Button onClick={() => router.push("/recommendations")}>
                Explore Recommendations
              </Button>
            </CardContent>
          </Card>
        )}

        {!savedPathsLoading && savedPaths.length > 0 && (
          <div className="grid gap-4 md:grid-cols-2">
            {savedPaths.map((jobPath) => (
              <Card key={jobPath.id} className="relative group">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">
                        {jobPath.title}
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {jobPath.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemovePath(jobPath.id, jobPath.title)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from saved"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      {jobPath.tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Salary: </span>
                        <span className="font-medium">
                          ${jobPath.salaryRange.min.toLocaleString()} - $
                          {jobPath.salaryRange.max.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Growth: </span>
                        <span className="font-medium text-green-600 dark:text-green-400">
                          +{jobPath.growthRate}%
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-muted-foreground">
                          Education:{" "}
                        </span>
                        <span className="font-medium">
                          {jobPath.educationLevel}
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Milestones Section */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1">Milestones</h2>
          <p className="text-sm text-muted-foreground">
            Set and track goals for your chosen career path
          </p>
        </div>

        {savedPaths.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center py-12">
              <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">
                Save a career path to start tracking milestones
              </p>
              <Button onClick={() => router.push("/recommendations")}>
                Explore Career Paths
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <label htmlFor="job-path-select" className="text-sm font-medium">
                Select a career path:
              </label>
              <Select value={selectedJobPathId} onValueChange={setSelectedJobPathId}>
                <SelectTrigger id="job-path-select" className="w-[300px]">
                  <SelectValue placeholder="Choose a job path" />
                </SelectTrigger>
                <SelectContent>
                  {savedPaths.map((path) => (
                    <SelectItem key={path.id} value={path.id}>
                      {path.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedJobPath && (
              <MilestonesEditor
                jobPath={selectedJobPath}
                initialMilestones={milestones[selectedJobPathId] || []}
                onSave={(milestonesData) =>
                  handleSaveMilestones(selectedJobPathId, milestonesData)
                }
              />
            )}

            {!selectedJobPath && (
              <Card>
                <CardContent className="pt-6 text-center py-12">
                  <p className="text-muted-foreground">
                    Select a career path above to manage milestones
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </section>

      {/* Grades Section */}
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold mb-1">Academic Performance</h2>
          <p className="text-sm text-muted-foreground">
            Manage your academic grades for enhanced AI recommendations
          </p>
        </div>

        <GradesSection initialGrades={grades} onUpdate={handleGradesUpdate} />
      </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
