import { notFound } from "next/navigation";
import { getSHSTrackById } from "@/lib/repositories/shsTracks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, GraduationCap, Award, TrendingUp, ArrowLeft } from "lucide-react";
import { Navbar } from "@/app/(marketing)/components/Navbar";
import { Footer } from "@/app/(marketing)/components/Footer";
import { SkipToContent } from "@/components/common/skip-to-content";
import Image from "next/image";
import Link from "next/link";

interface StrandDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function StrandDetailPage({ params }: StrandDetailPageProps) {
  const { id } = await params;
  const track = await getSHSTrackById(id);

  if (!track) {
    notFound();
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <Navbar />
      <main id="main-content" className="flex-1" role="main">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/strands">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Strands
            </Link>
          </Button>

          {/* Hero Image */}
          {track.imageUrl && (
            <div className="relative h-64 md:h-96 w-full rounded-lg overflow-hidden mb-8">
              <Image
                src={track.imageUrl}
                alt={track.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
                <div className="p-6 text-white">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">{track.title}</h1>
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      {track.trackType}
                    </Badge>
                    {track.strand && (
                      <Badge className="bg-primary text-primary-foreground">
                        {track.strand}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>About This Track</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">{track.description}</p>
            </CardContent>
          </Card>

          {/* Recommended Grades */}
          {track.recommendedGrades && Object.keys(track.recommendedGrades).length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Recommended Academic Performance
                </CardTitle>
                <CardDescription>
                  Suggested minimum grades to succeed in this track
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {track.recommendedGrades.math !== undefined && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{track.recommendedGrades.math}</p>
                      <p className="text-sm text-muted-foreground">Math</p>
                    </div>
                  )}
                  {track.recommendedGrades.science !== undefined && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{track.recommendedGrades.science}</p>
                      <p className="text-sm text-muted-foreground">Science</p>
                    </div>
                  )}
                  {track.recommendedGrades.english !== undefined && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{track.recommendedGrades.english}</p>
                      <p className="text-sm text-muted-foreground">English</p>
                    </div>
                  )}
                  {track.recommendedGrades.gpa !== undefined && (
                    <div className="text-center p-4 bg-muted rounded-lg">
                      <p className="text-2xl font-bold text-primary">{track.recommendedGrades.gpa.toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">GPA</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Core Subjects */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Core Subjects
              </CardTitle>
              <CardDescription>
                Fundamental subjects all students in this track will study
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {track.coreSubjects.map((subject, idx) => (
                  <Badge key={idx} variant="outline" className="px-3 py-1">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Specialized Subjects */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-primary" />
                Specialized Subjects
              </CardTitle>
              <CardDescription>
                Advanced and track-specific subjects for deeper learning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {track.specializedSubjects.map((subject, idx) => (
                  <Badge key={idx} variant="secondary" className="px-3 py-1">
                    {subject}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* College Programs */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                College Programs & Career Pathways
              </CardTitle>
              <CardDescription>
                What you can pursue in college after completing this track
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-2">
                {track.collegePrograms.map((program, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
                  >
                    <GraduationCap className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-sm">{program}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Key Traits */}
          {track.tags && track.tags.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Key Traits & Skills</CardTitle>
                <CardDescription>
                  Skills and characteristics that align well with this track
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {track.tags.map((tag, idx) => (
                    <Badge key={idx} variant="default" className="px-3 py-1 capitalize">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Call to Action */}
          <Card className="bg-primary text-primary-foreground">
            <CardContent className="pt-6">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Ready to explore this track?</h3>
                <p className="mb-4 opacity-90">
                  Take our career assessment to see how well this track matches your interests and skills
                </p>
                <Button variant="secondary" asChild>
                  <Link href="/assessments">Take Career Assessment</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
