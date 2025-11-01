"use client";

import { useEffect, useState } from "react";
import { Scholarship } from "@/lib/types";
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
import { DollarSign, Calendar, Award, AlertCircle, Clock } from "lucide-react";
import { format, formatDistanceToNow, isBefore } from "date-fns";
import { Navbar } from "@/app/(marketing)/components/Navbar";
import { Footer } from "@/app/(marketing)/components/Footer";
import { SkipToContent } from "@/components/common/skip-to-content";

export default function ScholarshipsPage() {
  const [scholarships, setScholarships] = useState<Scholarship[]>([]);
  const [filteredScholarships, setFilteredScholarships] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedType, setSelectedType] = useState<string>("all");
  const [minAmount, setMinAmount] = useState<string>("");
  const [deadlineFilter, setDeadlineFilter] = useState<string>("all");

  // Available filter options
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchScholarships();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [scholarships, selectedType, minAmount, deadlineFilter]);

  async function fetchScholarships() {
    try {
      setLoading(true);
      const response = await fetch("/api/scholarships");

      if (!response.ok) {
        throw new Error("Failed to fetch scholarships");
      }

      const data = await response.json();

      // Convert date strings back to Date objects
      const scholarshipsWithDates = data.scholarships.map((scholarship: any) => ({
        ...scholarship,
        deadline: new Date(scholarship.deadline),
      }));

      setScholarships(scholarshipsWithDates);

      // Extract unique types
      const uniqueTypes = [...new Set<string>(scholarshipsWithDates.map((s: Scholarship) => s.type))];
      setTypes(uniqueTypes.sort());
    } catch (error) {
      console.error("Error fetching scholarships:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...scholarships];
    const now = new Date();

    if (selectedType !== "all") {
      filtered = filtered.filter((s) => s.type === selectedType);
    }

    if (minAmount) {
      const minAmountNum = parseInt(minAmount);
      filtered = filtered.filter((s) => s.amount >= minAmountNum);
    }

    if (deadlineFilter !== "all") {
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);

      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(now.getDate() + 60);

      switch (deadlineFilter) {
        case "upcoming":
          // Deadlines within next 30 days
          filtered = filtered.filter(
            (s) => s.deadline > now && s.deadline <= thirtyDaysFromNow
          );
          break;
        case "next-60-days":
          // Deadlines within next 60 days
          filtered = filtered.filter(
            (s) => s.deadline > now && s.deadline <= sixtyDaysFromNow
          );
          break;
        case "future":
          // All future deadlines
          filtered = filtered.filter((s) => s.deadline > now);
          break;
      }
    }

    // Sort by deadline (soonest first)
    filtered.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());

    setFilteredScholarships(filtered);
  }

  function clearFilters() {
    setSelectedType("all");
    setMinAmount("");
    setDeadlineFilter("all");
  }

  const hasActiveFilters =
    selectedType !== "all" || minAmount || deadlineFilter !== "all";

  function isDeadlineSoon(deadline: Date): boolean {
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return deadline > now && deadline <= thirtyDaysFromNow;
  }

  function isDeadlinePassed(deadline: Date): boolean {
    return isBefore(deadline, new Date());
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
        <h1 className="text-3xl font-bold mb-2">Scholarships & Financial Aid</h1>
        <p className="text-muted-foreground">
          Discover funding opportunities for your education
        </p>

        {/* Mock Data Notice */}
        <div className="mt-4 flex items-start gap-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-100">
              Mock Data for Demonstration
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              These scholarships are sample data for prototype purposes. In production, this would connect to scholarship database APIs.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter Scholarships</CardTitle>
          <CardDescription>
            Find scholarships by type, amount, and deadline
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="type-filter" className="text-sm font-medium mb-2 block">
                Scholarship Type
              </label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger id="type-filter">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  {types.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="amount-filter" className="text-sm font-medium mb-2 block">
                Minimum Amount ($)
              </label>
              <Input
                id="amount-filter"
                type="number"
                placeholder="e.g., 5000"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="deadline-filter" className="text-sm font-medium mb-2 block">
                Deadline
              </label>
              <Select value={deadlineFilter} onValueChange={setDeadlineFilter}>
                <SelectTrigger id="deadline-filter">
                  <SelectValue placeholder="All deadlines" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Deadlines</SelectItem>
                  <SelectItem value="upcoming">Next 30 Days</SelectItem>
                  <SelectItem value="next-60-days">Next 60 Days</SelectItem>
                  <SelectItem value="future">All Future</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredScholarships.length} of {scholarships.length} scholarships
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Scholarship Listings */}
      {filteredScholarships.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">
              No scholarships found matching your criteria. Try adjusting your filters.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredScholarships.map((scholarship) => {
          const deadlineSoon = isDeadlineSoon(scholarship.deadline);
          const deadlinePassed = isDeadlinePassed(scholarship.deadline);

          return (
            <Card key={scholarship.id} className={`hover:shadow-lg transition-shadow ${deadlinePassed ? 'opacity-60' : ''}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <CardTitle className="text-lg">{scholarship.name}</CardTitle>
                      {deadlineSoon && !deadlinePassed && (
                        <Badge variant="destructive" className="text-xs">
                          <Clock className="h-3 w-3 mr-1" />
                          Deadline Soon
                        </Badge>
                      )}
                      {deadlinePassed && (
                        <Badge variant="secondary" className="text-xs">
                          Closed
                        </Badge>
                      )}
                    </div>
                    <CardDescription>{scholarship.provider}</CardDescription>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-primary">
                      ${scholarship.amount.toLocaleString()}
                    </div>
                    <Badge>{scholarship.type}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm">{scholarship.description}</p>

                  {/* Eligibility */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Eligibility Requirements:</span>
                    </div>
                    <ul className="list-disc list-inside text-sm space-y-1 text-muted-foreground">
                      {scholarship.eligibility.map((req, idx) => (
                        <li key={idx}>{req}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Details */}
                  <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div className="text-sm">
                        <span className="text-muted-foreground">Deadline: </span>
                        <span className={`font-medium ${deadlineSoon ? 'text-destructive' : ''}`}>
                          {format(scholarship.deadline, "MMM d, yyyy")}
                        </span>
                        {!deadlinePassed && (
                          <span className="text-muted-foreground ml-1">
                            ({formatDistanceToNow(scholarship.deadline, { addSuffix: true })})
                          </span>
                        )}
                      </div>
                    </div>

                    {scholarship.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        disabled={deadlinePassed}
                      >
                        <a href={scholarship.url} target="_blank" rel="noopener noreferrer">
                          {deadlinePassed ? 'Closed' : 'Apply Now'}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
