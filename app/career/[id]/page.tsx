import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getJobPathById } from "@/lib/repositories";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/app/(marketing)/components/Navbar";
import { Footer } from "@/app/(marketing)/components/Footer";
import { SkipToContent } from "@/components/common/skip-to-content";
import {
  DollarSign,
  GraduationCap,
  TrendingUp,
  ArrowLeft,
  Briefcase,
  Target,
  BookOpen,
  Award,
} from "lucide-react";

interface CareerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CareerPage({ params }: CareerPageProps) {
  const { id } = await params;
  const jobPath = await getJobPathById(id);

  if (!jobPath) {
    notFound();
  }

  const formatSalary = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(0)}K`;
    }
    return `$${amount}`;
  };

  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <Navbar />
      <main id="main-content" className="flex-1" role="main">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Back Button */}
          <Button variant="ghost" asChild className="mb-6">
            <Link href="/careers">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to All Careers
            </Link>
          </Button>

          {/* Hero Section with Image */}
          <div className="mb-8">
            <div className="relative h-[300px] md:h-[400px] rounded-lg overflow-hidden mb-6">
              <Image
                src={jobPath.imageUrl || "/images/careers/default.jpg"}
                alt={jobPath.title}
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8 text-white">
                <Badge variant="secondary" className="mb-3">
                  {jobPath.category}
                </Badge>
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2">
                  {jobPath.title}
                </h1>
                <p className="text-lg md:text-xl text-gray-200">
                  {jobPath.description}
                </p>
              </div>
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  Salary Range
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatSalary(jobPath.salaryRange.min)} - {formatSalary(jobPath.salaryRange.max)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">Per year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <GraduationCap className="h-4 w-4" />
                  Education Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{jobPath.educationLevel}</div>
                <p className="text-sm text-muted-foreground mt-1">Typically required</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                  <TrendingUp className="h-4 w-4" />
                  Job Growth Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {jobPath.growthRate > 0 ? "+" : ""}
                  {jobPath.growthRate}%
                </div>
                <p className="text-sm text-muted-foreground mt-1">Next 10 years</p>
              </CardContent>
            </Card>
          </div>

          {/* Skills & Traits */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Key Skills & Traits
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {jobPath.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-sm">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Career Overview */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Career Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  What You'll Do
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {jobPath.description}
                </p>
                <ul className="mt-4 space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Develop and apply specialized skills in {jobPath.category.toLowerCase()}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Collaborate with professionals and contribute to team success</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Continuously learn and adapt to industry changes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-1">•</span>
                    <span>Build expertise through hands-on experience and professional development</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-primary" />
                  Career Advancement
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  With a {jobPath.growthRate > 0 ? "growing" : "stable"} job market and increasing demand,
                  this career path offers {jobPath.growthRate > 10 ? "excellent" : "good"} opportunities for advancement.
                  Professionals in this field can progress to senior positions, leadership roles, or specialize in niche areas.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold mb-3">Typical Work Environment</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Work settings vary based on the specific role and industry, but may include office environments,
                  remote work opportunities, field work, or specialized facilities. The nature of work often requires
                  collaboration, independent problem-solving, and adaptability to changing priorities.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Education & Training */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5" />
                Education & Training Requirements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Minimum Education</h4>
                  <p className="text-muted-foreground">
                    {jobPath.educationLevel} degree or equivalent experience
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Common Majors/Fields of Study</h4>
                  <p className="text-muted-foreground">
                    Related fields in {jobPath.category}, specialized programs, or relevant technical training
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Additional Certifications</h4>
                  <p className="text-muted-foreground">
                    Professional certifications, licenses, or specialized training may be required or beneficial
                    depending on the specific role and industry regulations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA Section */}
          <Card className="bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <h3 className="text-2xl font-bold">Ready to Explore This Career?</h3>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Take our assessment to discover how well this career matches your unique skills and interests,
                  or explore more career options.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
                  <Button size="lg" asChild>
                    <Link href="/assessments">Take Assessment</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="/careers">Explore More Careers</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
