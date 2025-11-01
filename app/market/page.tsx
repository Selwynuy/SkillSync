"use client";

import { useEffect, useState } from "react";
import { JobListing } from "@/lib/types";
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
import { MapPin, Building2, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function MarketPage() {
  const [listings, setListings] = useState<JobListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<JobListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedRegion, setSelectedRegion] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>("all");

  // Available filter options
  const [regions, setRegions] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [types, setTypes] = useState<string[]>([]);

  useEffect(() => {
    fetchListings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [listings, selectedRegion, selectedCity, selectedType, selectedSalaryRange]);

  async function fetchListings() {
    try {
      setLoading(true);
      const response = await fetch("/api/market/listings");

      if (!response.ok) {
        throw new Error("Failed to fetch listings");
      }

      const data = await response.json();

      // Convert date strings back to Date objects
      const listingsWithDates = data.listings.map((listing: any) => ({
        ...listing,
        postedAt: new Date(listing.postedAt),
      }));

      setListings(listingsWithDates);

      // Extract unique values for filters
      const uniqueRegions = [...new Set<string>(listingsWithDates.map((l: JobListing) => l.region))];
      const uniqueCities = [...new Set<string>(listingsWithDates.map((l: JobListing) => l.city))];
      const uniqueTypes = [...new Set<string>(listingsWithDates.map((l: JobListing) => l.type))];

      setRegions(uniqueRegions.sort());
      setCities(uniqueCities.sort());
      setTypes(uniqueTypes.sort());
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...listings];

    if (selectedRegion !== "all") {
      filtered = filtered.filter((l) => l.region === selectedRegion);
    }

    if (selectedCity !== "all") {
      filtered = filtered.filter((l) => l.city === selectedCity);
    }

    if (selectedType !== "all") {
      filtered = filtered.filter((l) => l.type === selectedType);
    }

    if (selectedSalaryRange !== "all") {
      filtered = filtered.filter((l) => {
        const maxSalary = l.salary.max;
        switch (selectedSalaryRange) {
          case "0-40k":
            return maxSalary <= 40000;
          case "40k-60k":
            return maxSalary > 40000 && maxSalary <= 60000;
          case "60k-80k":
            return maxSalary > 60000 && maxSalary <= 80000;
          case "80k+":
            return maxSalary > 80000;
          default:
            return true;
        }
      });
    }

    setFilteredListings(filtered);
  }

  function clearFilters() {
    setSelectedRegion("all");
    setSelectedCity("all");
    setSelectedType("all");
    setSelectedSalaryRange("all");
  }

  const hasActiveFilters =
    selectedRegion !== "all" ||
    selectedCity !== "all" ||
    selectedType !== "all" ||
    selectedSalaryRange !== "all";

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Local Job Market</h1>
        <p className="text-muted-foreground">
          Explore job opportunities in your area
        </p>

        {/* Mock Data Notice */}
        <div className="mt-4 flex items-start gap-2 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-500 shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-900 dark:text-amber-100">
              Mock Data for Demonstration
            </p>
            <p className="text-amber-800 dark:text-amber-200">
              These job listings are sample data for prototype purposes. In production, this would connect to live job market APIs.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filter Jobs</CardTitle>
          <CardDescription>
            Narrow down results by location, type, and salary
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label htmlFor="region-filter" className="text-sm font-medium mb-2 block">
                Region
              </label>
              <Select value={selectedRegion} onValueChange={setSelectedRegion}>
                <SelectTrigger id="region-filter">
                  <SelectValue placeholder="All regions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  {regions.map((region) => (
                    <SelectItem key={region} value={region}>
                      {region}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="city-filter" className="text-sm font-medium mb-2 block">
                City
              </label>
              <Select value={selectedCity} onValueChange={setSelectedCity}>
                <SelectTrigger id="city-filter">
                  <SelectValue placeholder="All cities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="type-filter" className="text-sm font-medium mb-2 block">
                Job Type
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
              <label htmlFor="salary-filter" className="text-sm font-medium mb-2 block">
                Salary Range
              </label>
              <Select value={selectedSalaryRange} onValueChange={setSelectedSalaryRange}>
                <SelectTrigger id="salary-filter">
                  <SelectValue placeholder="All salaries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Salaries</SelectItem>
                  <SelectItem value="0-40k">$0 - $40,000</SelectItem>
                  <SelectItem value="40k-60k">$40,000 - $60,000</SelectItem>
                  <SelectItem value="60k-80k">$60,000 - $80,000</SelectItem>
                  <SelectItem value="80k+">$80,000+</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {hasActiveFilters && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredListings.length} of {listings.length} jobs
              </p>
              <Button variant="outline" size="sm" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Job Listings */}
      {filteredListings.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center py-12">
            <p className="text-muted-foreground">
              No jobs found matching your filters. Try adjusting your search criteria.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {filteredListings.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    {job.company}
                  </CardDescription>
                </div>
                <Badge>{job.type}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm line-clamp-2">{job.description}</p>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{job.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                    <span>
                      ${job.salary.min.toLocaleString()} - ${job.salary.max.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    Posted {formatDistanceToNow(job.postedAt, { addSuffix: true })}
                  </div>
                  {job.url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={job.url} target="_blank" rel="noopener noreferrer">
                        View Details
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
