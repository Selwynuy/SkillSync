"use client";

import { useEffect, useState } from "react";
import { JobPath } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { JobPathCard } from "@/app/(marketing)/components/JobPathCard";
import { Navbar } from "@/app/(marketing)/components/Navbar";
import { Footer } from "@/app/(marketing)/components/Footer";
import { SkipToContent } from "@/components/common/skip-to-content";
import { Search, Filter, Briefcase } from "lucide-react";

export default function CareersPage() {
  const [jobPaths, setJobPaths] = useState<JobPath[]>([]);
  const [filteredJobPaths, setFilteredJobPaths] = useState<JobPath[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedEducation, setSelectedEducation] = useState<string>("all");
  const [minGrowthRate, setMinGrowthRate] = useState<string>("");

  // Available filter options
  const [categories, setCategories] = useState<string[]>([]);
  const [educationLevels, setEducationLevels] = useState<string[]>([]);

  useEffect(() => {
    fetchJobPaths();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [jobPaths, searchQuery, selectedCategory, selectedEducation, minGrowthRate]);

  async function fetchJobPaths() {
    try {
      setLoading(true);
      const response = await fetch("/api/job-paths");

      if (!response.ok) {
        throw new Error("Failed to fetch job paths");
      }

      const data = await response.json();
      setJobPaths(data.jobPaths);

      // Extract unique categories and education levels
      const uniqueCategories = [...new Set<string>(data.jobPaths.map((jp: JobPath) => jp.category))];
      const uniqueEducationLevels = [...new Set<string>(data.jobPaths.map((jp: JobPath) => jp.educationLevel))];

      setCategories(uniqueCategories.sort());
      setEducationLevels(uniqueEducationLevels.sort());
    } catch (error) {
      console.error("Error fetching job paths:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...jobPaths];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (jp) =>
          jp.title.toLowerCase().includes(query) ||
          jp.description.toLowerCase().includes(query) ||
          jp.tags.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((jp) => jp.category === selectedCategory);
    }

    // Education filter
    if (selectedEducation !== "all") {
      filtered = filtered.filter((jp) => jp.educationLevel === selectedEducation);
    }

    // Growth rate filter
    if (minGrowthRate) {
      const minRate = parseInt(minGrowthRate);
      filtered = filtered.filter((jp) => jp.growthRate >= minRate);
    }

    setFilteredJobPaths(filtered);
  }

  function clearFilters() {
    setSearchQuery("");
    setSelectedCategory("all");
    setSelectedEducation("all");
    setMinGrowthRate("");
  }

  const hasActiveFilters =
    searchQuery.trim() ||
    selectedCategory !== "all" ||
    selectedEducation !== "all" ||
    minGrowthRate;

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
            <div className="flex items-center gap-2 mb-2">
              <Briefcase className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">All Career Paths</h1>
            </div>
            <p className="text-muted-foreground">
              Explore {jobPaths.length} diverse career opportunities across industries
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                <CardTitle className="text-lg">Filter & Search</CardTitle>
              </div>
              <CardDescription>
                Find the perfect career path for you
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search */}
                <div>
                  <label htmlFor="search" className="text-sm font-medium mb-2 block">
                    Search
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="search"
                      type="text"
                      placeholder="Search by title, description, or tags..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Filter Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="category-filter" className="text-sm font-medium mb-2 block">
                      Category
                    </label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger id="category-filter">
                        <SelectValue placeholder="All categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="education-filter" className="text-sm font-medium mb-2 block">
                      Education Level
                    </label>
                    <Select value={selectedEducation} onValueChange={setSelectedEducation}>
                      <SelectTrigger id="education-filter">
                        <SelectValue placeholder="All education levels" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Education Levels</SelectItem>
                        {educationLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label htmlFor="growth-filter" className="text-sm font-medium mb-2 block">
                      Min Growth Rate (%)
                    </label>
                    <Input
                      id="growth-filter"
                      type="number"
                      placeholder="e.g., 10"
                      value={minGrowthRate}
                      onChange={(e) => setMinGrowthRate(e.target.value)}
                      min="0"
                    />
                  </div>
                </div>

                {hasActiveFilters && (
                  <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-muted-foreground">
                      Showing {filteredJobPaths.length} of {jobPaths.length} career paths
                    </p>
                    <Button variant="outline" size="sm" onClick={clearFilters}>
                      Clear All Filters
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Career Paths Grid */}
          {filteredJobPaths.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">
                  No career paths found matching your criteria. Try adjusting your filters.
                </p>
              </CardContent>
            </Card>
          )}

          {filteredJobPaths.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredJobPaths.map((jobPath) => (
                <JobPathCard key={jobPath.id} jobPath={jobPath} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
