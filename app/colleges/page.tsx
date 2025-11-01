"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { College } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { MapPin, GraduationCap, DollarSign, TrendingUp, AlertCircle, Laptop } from "lucide-react";
import { Navbar } from "@/app/(marketing)/components/Navbar";
import { Footer } from "@/app/(marketing)/components/Footer";
import { SkipToContent } from "@/components/common/skip-to-content";

export default function CollegesPage() {
  const [colleges, setColleges] = useState<College[]>([]);
  const [filteredColleges, setFilteredColleges] = useState<College[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDegreeLevel, setSelectedDegreeLevel] = useState<string>("all");
  const [selectedState, setSelectedState] = useState<string>("all");
  const [selectedModality, setSelectedModality] = useState<string>("all");
  const [maxTuition, setMaxTuition] = useState<string>("");
  const [minAcceptanceRate, setMinAcceptanceRate] = useState<string>("");
  const [maxAcceptanceRate, setMaxAcceptanceRate] = useState<string>("");
  const [programSearch, setProgramSearch] = useState<string>("");

  // Available filter options
  const [states, setStates] = useState<string[]>([]);
  const [degreeLevels, setDegreeLevels] = useState<string[]>([]);
  const [modalities, setModalities] = useState<string[]>([]);

  useEffect(() => {
    fetchColleges();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [
    colleges,
    selectedDegreeLevel,
    selectedState,
    selectedModality,
    maxTuition,
    minAcceptanceRate,
    maxAcceptanceRate,
    programSearch,
  ]);

  async function fetchColleges() {
    try {
      setLoading(true);
      const response = await fetch("/api/colleges");

      if (!response.ok) {
        throw new Error("Failed to fetch colleges");
      }

      const data = await response.json();
      setColleges(data.colleges);

      // Extract unique values for filters
      const allDegreeLevels = new Set<string>();
      const allModalities = new Set<string>();
      const allStates = new Set<string>();

      data.colleges.forEach((college: College) => {
        college.degreeLevel.forEach((level) => allDegreeLevels.add(level));
        college.modality.forEach((mod) => allModalities.add(mod));
        allStates.add(college.state);
      });

      setDegreeLevels(Array.from(allDegreeLevels).sort());
      setModalities(Array.from(allModalities).sort());
      setStates(Array.from(allStates).sort());
    } catch (error) {
      console.error("Error fetching colleges:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...colleges];

    if (selectedDegreeLevel !== "all") {
      filtered = filtered.filter((c) => c.degreeLevel.includes(selectedDegreeLevel as any));
    }

    if (selectedState !== "all") {
      filtered = filtered.filter((c) => c.state === selectedState);
    }

    if (selectedModality !== "all") {
      filtered = filtered.filter((c) => c.modality.includes(selectedModality as any));
    }

    if (maxTuition) {
      const maxTuitionNum = parseInt(maxTuition);
      filtered = filtered.filter((c) => {
        const minTuition = Math.min(c.tuition.inState, c.tuition.outOfState);
        return minTuition <= maxTuitionNum;
      });
    }

    if (minAcceptanceRate) {
      const minRate = parseInt(minAcceptanceRate);
      filtered = filtered.filter((c) => c.acceptanceRate >= minRate);
    }

    if (maxAcceptanceRate) {
      const maxRate = parseInt(maxAcceptanceRate);
      filtered = filtered.filter((c) => c.acceptanceRate <= maxRate);
    }

    if (programSearch.trim()) {
      const searchLower = programSearch.toLowerCase();
      filtered = filtered.filter((c) =>
        c.programs.some((program) => program.toLowerCase().includes(searchLower)) ||
        c.name.toLowerCase().includes(searchLower)
      );
    }

    setFilteredColleges(filtered);
  }

  function clearFilters() {
    setSelectedDegreeLevel("all");
    setSelectedState("all");
    setSelectedModality("all");
    setMaxTuition("");
    setMinAcceptanceRate("");
    setMaxAcceptanceRate("");
    setProgramSearch("");
  }

  const hasActiveFilters =
    selectedDegreeLevel !== "all" ||
    selectedState !== "all" ||
    selectedModality !== "all" ||
    maxTuition ||
    minAcceptanceRate ||
    maxAcceptanceRate ||
    programSearch.trim();

  // Generate consistent college image URL using Unsplash
  function getCollegeImageUrl(collegeId: string, index: number): string {
    // Use different college/campus themed images with proper Unsplash photo URLs
    const imageUrls = [
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f", // Campus building
      "https://images.unsplash.com/photo-1562774053-701939374585", // University campus
      "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a", // Students studying
      "https://images.unsplash.com/photo-1523050854058-8df90110c9f1", // University building
      "https://images.unsplash.com/photo-1607237138185-eedd9c632b0b", // Library interior
      "https://images.unsplash.com/photo-1519406596751-0a3ccc4937fe", // Campus architecture
      "https://images.unsplash.com/photo-1546519638-68e109498ffc", // Modern university
      "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45", // Students on campus
    ];

    const imageUrl = imageUrls[index % imageUrls.length];
    return `${imageUrl}?w=400&h=240&fit=crop&auto=format`;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <SkipToContent />
        <Navbar />
        <main id="main-content" className="flex-1" role="main">
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
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
        <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Colleges & Universities</h1>
        <p className="text-muted-foreground">
          Find the right college for your career path
        </p>

        {/* Mock Data Notice */}
        <div className="mt-4 flex items-start gap-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-100">
              Mock Data for Demonstration
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              These college listings are sample data for prototype purposes. In production, this would connect to college database APIs.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter Colleges</CardTitle>
          <CardDescription>
            Find colleges by degree level, location, cost, and programs
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="degree-filter" className="text-sm font-medium mb-2 block">
                  Degree Level
                </label>
                <Select value={selectedDegreeLevel} onValueChange={setSelectedDegreeLevel}>
                  <SelectTrigger id="degree-filter">
                    <SelectValue placeholder="All degrees" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Degree Levels</SelectItem>
                    {degreeLevels.map((level) => (
                      <SelectItem key={level} value={level}>
                        {level}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="state-filter" className="text-sm font-medium mb-2 block">
                  State
                </label>
                <Select value={selectedState} onValueChange={setSelectedState}>
                  <SelectTrigger id="state-filter">
                    <SelectValue placeholder="All states" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All States</SelectItem>
                    {states.map((state) => (
                      <SelectItem key={state} value={state}>
                        {state}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="modality-filter" className="text-sm font-medium mb-2 block">
                  Modality
                </label>
                <Select value={selectedModality} onValueChange={setSelectedModality}>
                  <SelectTrigger id="modality-filter">
                    <SelectValue placeholder="All modalities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modalities</SelectItem>
                    {modalities.map((modality) => (
                      <SelectItem key={modality} value={modality}>
                        {modality}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="tuition-filter" className="text-sm font-medium mb-2 block">
                  Max Tuition ($)
                </label>
                <Input
                  id="tuition-filter"
                  type="number"
                  placeholder="e.g., 30000"
                  value={maxTuition}
                  onChange={(e) => setMaxTuition(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="acceptance-min-filter" className="text-sm font-medium mb-2 block">
                  Min Acceptance Rate (%)
                </label>
                <Input
                  id="acceptance-min-filter"
                  type="number"
                  placeholder="e.g., 20"
                  value={minAcceptanceRate}
                  onChange={(e) => setMinAcceptanceRate(e.target.value)}
                  min="0"
                  max="100"
                />
              </div>

              <div>
                <label htmlFor="acceptance-max-filter" className="text-sm font-medium mb-2 block">
                  Max Acceptance Rate (%)
                </label>
                <Input
                  id="acceptance-max-filter"
                  type="number"
                  placeholder="e.g., 80"
                  value={maxAcceptanceRate}
                  onChange={(e) => setMaxAcceptanceRate(e.target.value)}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <label htmlFor="program-filter" className="text-sm font-medium mb-2 block">
                Search Programs or College Name
              </label>
              <Input
                id="program-filter"
                type="text"
                placeholder="e.g., Computer Science, Nursing, Business"
                value={programSearch}
                onChange={(e) => setProgramSearch(e.target.value)}
              />
            </div>

            {hasActiveFilters && (
              <div className="flex items-center justify-between pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  Showing {filteredColleges.length} of {colleges.length} colleges
                </p>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* College Listings */}
      {filteredColleges.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">
              No colleges found matching your criteria. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredColleges.map((college, index) => (
          <Card key={college.id} className="hover:shadow-lg transition-shadow overflow-hidden">
            <div className="relative w-full h-48">
              <Image
                src={getCollegeImageUrl(college.id, index)}
                alt={`${college.name} campus`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{college.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    {college.location}
                  </CardDescription>
                </div>
                <Badge variant="secondary">{college.state}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Programs */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Programs Offered:</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {college.programs.slice(0, 4).map((program) => (
                      <Badge key={program} variant="outline" className="text-xs">
                        {program}
                      </Badge>
                    ))}
                    {college.programs.length > 4 && (
                      <Badge variant="outline" className="text-xs">
                        +{college.programs.length - 4} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm pt-2 border-t">
                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <DollarSign className="h-3 w-3" />
                      <span className="text-xs">Tuition (In-State)</span>
                    </div>
                    <div className="font-medium">
                      ${college.tuition.inState.toLocaleString()}/year
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-xs">Acceptance Rate</span>
                    </div>
                    <div className="font-medium">{college.acceptanceRate}%</div>
                  </div>

                  <div className="col-span-2">
                    <div className="flex items-center gap-1 text-muted-foreground mb-1">
                      <Laptop className="h-3 w-3" />
                      <span className="text-xs">Modality</span>
                    </div>
                    <div className="flex gap-1">
                      {college.modality.map((mod) => (
                        <Badge key={mod} variant="secondary" className="text-xs">
                          {mod}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">
                      Degree Levels
                    </div>
                    <div className="flex gap-1">
                      {college.degreeLevel.map((level) => (
                        <Badge key={level} variant="outline" className="text-xs">
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {college.url && (
                  <div className="pt-2 border-t">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <a href={college.url} target="_blank" rel="noopener noreferrer">
                        Learn More
                      </a>
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
