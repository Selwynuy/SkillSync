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
  Loader2,
  Trophy,
  Medal,
  Award as AwardIcon,
  Building2,
  ArrowRight,
} from "lucide-react";
import type { Recommendation, College } from "@/lib/types";
import { Navbar } from "@/app/(marketing)/components/Navbar";
import { Footer } from "@/app/(marketing)/components/Footer";
import { SkipToContent } from "@/components/common/skip-to-content";
import Image from "next/image";

export default function RecommendationsPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);
  const [savedPaths, setSavedPaths] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingPath, setSavingPath] = useState<string | null>(null);

  useEffect(() => {
    fetchRecommendations();
    fetchSavedPaths();
    fetchColleges();
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

  async function fetchColleges() {
    try {
      const response = await fetch("/api/colleges");
      if (response.ok) {
        const data = await response.json();
        setColleges(data.colleges || []);
      }
    } catch (err) {
      console.error("Error fetching colleges:", err);
    }
  }

  async function toggleSavePath(jobPathId: string) {
    setSavingPath(jobPathId);
    try {
      const isSaved = savedPaths.has(jobPathId);

      if (isSaved) {
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

  // Find matching colleges for a job path based on education requirements
  function getMatchingColleges(jobPath: any): College[] {
    const keywords = [
      ...jobPath.title.toLowerCase().split(" "),
      jobPath.category.toLowerCase(),
      ...jobPath.tags,
    ];

    return colleges
      .filter((college) => {
        return college.programs.some((program) =>
          keywords.some((keyword) =>
            program.toLowerCase().includes(keyword) || keyword.includes(program.toLowerCase())
          )
        );
      })
      .slice(0, 3);
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SkipToContent />
        <Navbar />
        <main id="main-content" className="flex-1" role="main">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex min-h-[60vh] items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading your recommendations...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <SkipToContent />
        <Navbar />
        <main id="main-content" className="flex-1" role="main">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 py-12">
            <div className="mx-auto max-w-2xl">
              <Card className="border-destructive/50 pt-0">
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
        </main>
        <Footer />
      </div>
    );
  }

  const topThree = recommendations.slice(0, 3);
  const remaining = recommendations.slice(3);

  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <Navbar />
      <main id="main-content" className="flex-1" role="main">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full">
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="text-sm font-medium text-primary">Personalized For You</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Your Career Recommendations
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Based on your assessment, here are the career paths that match your unique strengths and interests.
            </p>
          </div>

          {recommendations.length === 0 ? (
            <Card className="pt-0">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No recommendations available. Please try retaking the assessment.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Podium - Top 3 */}
              {topThree.length > 0 && (
                <div className="mb-16">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
                      <Trophy className="h-6 w-6 text-yellow-500" />
                      Top Matches
                    </h2>
                    <p className="text-muted-foreground">Your best career path recommendations</p>
                  </div>

                  {/* Podium Layout */}
                  <div className="grid grid-cols-1 md:grid-cols-[1fr_1.1fr_1fr] gap-6 items-end max-w-5xl mx-auto">
                    {/* 2nd Place - Left */}
                    {topThree[1] && (
                      <PodiumCard
                        recommendation={topThree[1]}
                        rank={2}
                        isSaved={savedPaths.has(topThree[1].jobPath.id)}
                        isSaving={savingPath === topThree[1].jobPath.id}
                        onSave={() => toggleSavePath(topThree[1].jobPath.id)}
                        onLearnMore={() => router.push(`/career/${topThree[1].jobPath.id}`)}
                        formatSalary={formatSalary}
                        matchingColleges={getMatchingColleges(topThree[1].jobPath)}
                      />
                    )}

                    {/* 1st Place - Center (Taller) */}
                    {topThree[0] && (
                      <PodiumCard
                        recommendation={topThree[0]}
                        rank={1}
                        isSaved={savedPaths.has(topThree[0].jobPath.id)}
                        isSaving={savingPath === topThree[0].jobPath.id}
                        onSave={() => toggleSavePath(topThree[0].jobPath.id)}
                        onLearnMore={() => router.push(`/career/${topThree[0].jobPath.id}`)}
                        formatSalary={formatSalary}
                        matchingColleges={getMatchingColleges(topThree[0].jobPath)}
                        isFirst
                      />
                    )}

                    {/* 3rd Place - Right */}
                    {topThree[2] && (
                      <PodiumCard
                        recommendation={topThree[2]}
                        rank={3}
                        isSaved={savedPaths.has(topThree[2].jobPath.id)}
                        isSaving={savingPath === topThree[2].jobPath.id}
                        onSave={() => toggleSavePath(topThree[2].jobPath.id)}
                        onLearnMore={() => router.push(`/career/${topThree[2].jobPath.id}`)}
                        formatSalary={formatSalary}
                        matchingColleges={getMatchingColleges(topThree[2].jobPath)}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Remaining Recommendations */}
              {remaining.length > 0 && (
                <div>
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold mb-2">More Great Matches</h2>
                    <p className="text-muted-foreground">Additional career paths that align with your profile</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {remaining.map((rec, index) => {
                      const isSaved = savedPaths.has(rec.jobPath.id);
                      const isSaving = savingPath === rec.jobPath.id;
                      const matchPercentage = Math.round(rec.score * 100);
                      const actualRank = index + 4;
                      const matchingColleges = getMatchingColleges(rec.jobPath);

                      return (
                        <Card key={rec.jobPath.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 pt-0">
                          {rec.jobPath.imageUrl && (
                            <div className="relative h-40 w-full">
                              <Image
                                src={rec.jobPath.imageUrl}
                                alt={rec.jobPath.title}
                                fill
                                className="object-cover"
                              />
                              <div className="absolute top-3 left-3">
                                <Badge className="bg-background/90 text-foreground border">
                                  #{actualRank}
                                </Badge>
                              </div>
                              <div className="absolute top-3 right-3">
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-8 w-8 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-gray-300 dark:border-gray-600 shadow-xl hover:bg-white dark:hover:bg-gray-900 hover:shadow-2xl"
                                  onClick={() => toggleSavePath(rec.jobPath.id)}
                                  disabled={isSaving}
                                >
                                  {isSaving ? (
                                    <Loader2 className="h-4 w-4 animate-spin text-foreground" />
                                  ) : isSaved ? (
                                    <BookmarkCheck className="h-4 w-4 text-primary fill-primary" />
                                  ) : (
                                    <Bookmark className="h-4 w-4 text-foreground" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          )}

                          <CardHeader>
                            <CardTitle className="text-xl">{rec.jobPath.title}</CardTitle>
                            <CardDescription>{rec.jobPath.description}</CardDescription>
                          </CardHeader>

                          <CardContent className="space-y-4">
                            {/* Match Score */}
                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium">Match Score</span>
                                <span className="text-xl font-bold text-primary">{matchPercentage}%</span>
                              </div>
                              <Progress value={matchPercentage} className="h-2" />
                            </div>

                            {/* Career Stats */}
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <p className="text-muted-foreground">Salary Range</p>
                                <p className="font-medium">
                                  {formatSalary(rec.jobPath.salaryRange.min)} - {formatSalary(rec.jobPath.salaryRange.max)}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Growth Rate</p>
                                <p className="font-medium text-green-600">
                                  +{rec.jobPath.growthRate}%
                                </p>
                              </div>
                            </div>

                            {/* Matching Colleges */}
                            {matchingColleges.length > 0 && (
                              <div>
                                <p className="text-sm font-medium mb-2">Recommended Schools</p>
                                <div className="space-y-1">
                                  {matchingColleges.slice(0, 2).map((college) => (
                                    <div key={college.id} className="flex items-center gap-2 text-sm">
                                      <Building2 className="h-3 w-3 text-muted-foreground" />
                                      <span className="text-muted-foreground truncate">{college.name}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            <Button
                              className="w-full"
                              variant="outline"
                              onClick={() => router.push(`/career/${rec.jobPath.id}`)}
                            >
                              Learn More
                              <ArrowRight className="h-4 w-4 ml-2" />
                            </Button>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Actions Footer */}
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border p-6 bg-gradient-to-br from-primary/5 to-transparent">
            <div>
              <p className="font-medium">Want to explore more?</p>
              <p className="text-sm text-muted-foreground">
                View your saved paths in the dashboard or retake the assessment for updated results.
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
      </main>
      <Footer />
    </div>
  );
}

// Podium Card Component
function PodiumCard({
  recommendation,
  rank,
  isSaved,
  isSaving,
  onSave,
  onLearnMore,
  formatSalary,
  matchingColleges,
  isFirst = false,
}: {
  recommendation: Recommendation;
  rank: number;
  isSaved: boolean;
  isSaving: boolean;
  onSave: () => void;
  onLearnMore: () => void;
  formatSalary: (amount: number) => string;
  matchingColleges: College[];
  isFirst?: boolean;
}) {
  const matchPercentage = Math.round(recommendation.score * 100);

  const getMedalIcon = () => {
    switch (rank) {
      case 1:
        return <Trophy className="h-8 w-8 text-yellow-500" />;
      case 2:
        return <Medal className="h-7 w-7 text-gray-400" />;
      case 3:
        return <AwardIcon className="h-6 w-6 text-amber-600" />;
      default:
        return null;
    }
  };

  const getMedalColor = () => {
    switch (rank) {
      case 1:
        return "from-yellow-500/20 to-yellow-600/5 border-yellow-500/30";
      case 2:
        return "from-gray-400/20 to-gray-500/5 border-gray-400/30";
      case 3:
        return "from-amber-600/20 to-amber-700/5 border-amber-600/30";
      default:
        return "";
    }
  };

  return (
    <Card className={`overflow-hidden ${isFirst ? "ring-2 ring-primary shadow-2xl scale-105" : "shadow-lg"} transition-all duration-300 hover:shadow-xl bg-gradient-to-br ${getMedalColor()} pt-0`}>
      {/* Medal Badge */}
      <div className="absolute top-4 left-4 z-10">
        {getMedalIcon()}
      </div>

      {/* Save Button */}
      <div className="absolute top-4 right-4 z-10">
        <Button
          variant="secondary"
          size="icon"
          className="h-9 w-9 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-2 border-gray-300 dark:border-gray-600 shadow-xl hover:bg-white dark:hover:bg-gray-900 hover:shadow-2xl"
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin text-foreground" />
          ) : isSaved ? (
            <BookmarkCheck className="h-4 w-4 text-primary fill-primary" />
          ) : (
            <Bookmark className="h-4 w-4 text-foreground" />
          )}
        </Button>
      </div>

      {/* Image */}
      {recommendation.jobPath.imageUrl && (
        <div className={`relative w-full ${isFirst ? "h-56" : "h-48"}`}>
          <Image
            src={recommendation.jobPath.imageUrl}
            alt={recommendation.jobPath.title}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="space-y-2">
          <Badge variant="secondary" className="w-fit">
            {recommendation.jobPath.category}
          </Badge>
          <CardTitle className={`${isFirst ? "text-2xl" : "text-xl"}`}>
            {recommendation.jobPath.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {recommendation.jobPath.description}
          </CardDescription>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Match Score */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Match Score</span>
            <span className={`${isFirst ? "text-2xl" : "text-xl"} font-bold text-primary`}>
              {matchPercentage}%
            </span>
          </div>
          <Progress value={matchPercentage} className={`${isFirst ? "h-3" : "h-2"}`} />
        </div>

        {/* Key Strengths */}
        <div>
          <p className="text-sm font-medium mb-2">Key Strengths Match</p>
          <div className="flex flex-wrap gap-1.5">
            {recommendation.drivers.slice(0, 3).map((driver) => (
              <Badge key={driver} variant="outline" className="text-xs">
                {driver}
              </Badge>
            ))}
          </div>
        </div>

        {/* Career Stats */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t text-sm">
          <div>
            <p className="text-muted-foreground mb-1">Salary</p>
            <p className="font-semibold">
              {formatSalary(recommendation.jobPath.salaryRange.min)} - {formatSalary(recommendation.jobPath.salaryRange.max)}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground mb-1">Growth</p>
            <p className="font-semibold text-green-600">+{recommendation.jobPath.growthRate}%</p>
          </div>
        </div>

        {/* Matching Colleges */}
        {matchingColleges.length > 0 && (
          <div className="pt-2 border-t">
            <p className="text-sm font-medium mb-2 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Recommended Schools
            </p>
            <div className="space-y-1.5">
              {matchingColleges.slice(0, 2).map((college) => (
                <div key={college.id} className="flex items-start gap-2 text-sm">
                  <Building2 className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{college.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {college.programs.find((p) =>
                        recommendation.jobPath.title.toLowerCase().includes(p.toLowerCase().split(" ")[0]) ||
                        p.toLowerCase().includes(recommendation.jobPath.category.toLowerCase())
                      ) || college.programs[0]}
                    </p>
                  </div>
                </div>
              ))}
              {matchingColleges.length > 2 && (
                <p className="text-xs text-muted-foreground">
                  +{matchingColleges.length - 2} more schools
                </p>
              )}
            </div>
          </div>
        )}

        <Button className="w-full" onClick={onLearnMore}>
          Learn More
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
}
