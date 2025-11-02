"use client";

import { useEffect, useState } from "react";
import { SHSTrack, SHSTrackType } from "@/lib/types";
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
import { BookOpen, GraduationCap, Briefcase, Award } from "lucide-react";
import { Navbar } from "@/app/(marketing)/components/Navbar";
import { Footer } from "@/app/(marketing)/components/Footer";
import { SkipToContent } from "@/components/common/skip-to-content";
import Image from "next/image";

export default function StrandsPage() {
  const [tracks, setTracks] = useState<SHSTrack[]>([]);
  const [filteredTracks, setFilteredTracks] = useState<SHSTrack[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedTrackType, setSelectedTrackType] = useState<string>("all");
  const [selectedStrand, setSelectedStrand] = useState<string>("all");

  // Available filter options
  const trackTypes: SHSTrackType[] = ["Academic", "TVL", "Sports", "Arts and Design"];

  useEffect(() => {
    fetchTracks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tracks, selectedTrackType, selectedStrand]);

  async function fetchTracks() {
    try {
      setLoading(true);
      const response = await fetch("/api/strands");

      if (!response.ok) {
        throw new Error("Failed to fetch SHS tracks");
      }

      const data = await response.json();
      setTracks(data.tracks);
    } catch (error) {
      console.error("Error fetching SHS tracks:", error);
    } finally {
      setLoading(false);
    }
  }

  function applyFilters() {
    let filtered = [...tracks];

    if (selectedTrackType !== "all") {
      filtered = filtered.filter((t) => t.trackType === selectedTrackType);
    }

    if (selectedStrand !== "all") {
      filtered = filtered.filter((t) => t.strand === selectedStrand);
    }

    setFilteredTracks(filtered);
  }

  function clearFilters() {
    setSelectedTrackType("all");
    setSelectedStrand("all");
  }

  const hasActiveFilters =
    selectedTrackType !== "all" || selectedStrand !== "all";

  // Get unique strands from current filtered tracks by track type
  const availableStrands = tracks
    .filter((t) => selectedTrackType === "all" || t.trackType === selectedTrackType)
    .filter((t) => t.strand)
    .map((t) => t.strand)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();

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
            <h1 className="text-3xl font-bold mb-2">Senior High School Strands</h1>
            <p className="text-muted-foreground">
              Explore different SHS tracks and strands to find the best fit for your interests and career goals
            </p>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter Strands</CardTitle>
              <CardDescription>
                Narrow down by track type and specific strand
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="track-type-filter" className="text-sm font-medium mb-2 block">
                    Track Type
                  </label>
                  <Select value={selectedTrackType} onValueChange={setSelectedTrackType}>
                    <SelectTrigger id="track-type-filter">
                      <SelectValue placeholder="All track types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Track Types</SelectItem>
                      {trackTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label htmlFor="strand-filter" className="text-sm font-medium mb-2 block">
                    Specific Strand
                  </label>
                  <Select
                    value={selectedStrand}
                    onValueChange={setSelectedStrand}
                    disabled={availableStrands.length === 0}
                  >
                    <SelectTrigger id="strand-filter">
                      <SelectValue placeholder="All strands" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Strands</SelectItem>
                      {availableStrands.map((strand) => (
                        <SelectItem key={strand} value={strand!}>
                          {strand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {hasActiveFilters && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredTracks.length} of {tracks.length} strands
                  </p>
                  <Button variant="outline" size="sm" onClick={clearFilters}>
                    Clear Filters
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Strands Grid */}
          {filteredTracks.length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-12">
                <p className="text-muted-foreground">
                  No strands found matching your filters. Try adjusting your search criteria.
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {filteredTracks.map((track) => (
              <Card key={track.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Image */}
                {track.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={track.imageUrl}
                      alt={track.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-2">{track.title}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="secondary">{track.trackType}</Badge>
                        {track.strand && <Badge>{track.strand}</Badge>}
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{track.description}</p>

                  {/* Core Subjects */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Core Subjects</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {track.coreSubjects.slice(0, 3).map((subject, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {track.coreSubjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{track.coreSubjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Specialized Subjects */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Award className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">Specialized Subjects</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {track.specializedSubjects.slice(0, 3).map((subject, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                      {track.specializedSubjects.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{track.specializedSubjects.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* College Programs */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <GraduationCap className="h-4 w-4 text-primary" />
                      <h3 className="text-sm font-semibold">College Programs</h3>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {track.collegePrograms.slice(0, 3).map((program, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {program}
                        </Badge>
                      ))}
                      {track.collegePrograms.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{track.collegePrograms.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Career Pathways Count */}
                  {track.careerPathways && track.careerPathways.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Briefcase className="h-4 w-4" />
                        <span>{track.careerPathways.length} career pathways available</span>
                      </div>
                    </div>
                  )}

                  {/* View Details Button */}
                  <div className="pt-2">
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`/strands/${track.id}`}>
                        View Full Details
                      </a>
                    </Button>
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
