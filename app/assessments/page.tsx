import { requireUser } from "@/lib/auth/session"
import { getAllAssessments } from "@/lib/repositories"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, ClipboardList, Clock } from "lucide-react"
import { Navbar } from "@/app/(marketing)/components/Navbar"
import { Footer } from "@/app/(marketing)/components/Footer"
import { SkipToContent } from "@/components/common/skip-to-content"

export default async function AssessmentsPage() {
  const user = await requireUser()
  const assessments = await getAllAssessments()

  // For MVP, we only have one assessment
  const mainAssessment = assessments[0]

  if (!mainAssessment) {
    return (
      <div className="flex min-h-screen flex-col">
        <SkipToContent />
        <Navbar />
        <main id="main-content" className="flex-1" role="main">
          <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex min-h-[60vh] items-center justify-center">
            <p className="text-muted-foreground">No assessments available</p>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <Navbar />
      <main id="main-content" className="flex-1" role="main">
        <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 py-12">
          <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold tracking-tight">
            Career Assessment
          </h1>
          <p className="text-lg text-muted-foreground">
            Discover your ideal career path through our comprehensive assessment
          </p>
        </div>

        {/* Main Assessment Card */}
        <Card className="overflow-hidden">
          <CardHeader className="bg-gradient-to-br from-primary/10 to-transparent">
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="text-2xl">{mainAssessment.title}</CardTitle>
                <CardDescription className="mt-2 text-base">
                  {mainAssessment.description}
                </CardDescription>
              </div>
              <Badge variant="secondary" className="text-sm">
                {mainAssessment.modules.length} Modules
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            <div className="space-y-6">
              {/* Modules Overview */}
              <div>
                <h3 className="mb-4 font-semibold">What You'll Explore:</h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {mainAssessment.modules
                    .sort((a, b) => a.order - b.order)
                    .map((module) => (
                      <div
                        key={module.id}
                        className="flex items-start gap-3 rounded-lg border p-3"
                      >
                        <ClipboardList className="mt-0.5 h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{module.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {module.questions.length} questions
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Time Estimate */}
              <div className="flex items-center gap-2 rounded-lg bg-muted p-4">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Estimated Time</p>
                  <p className="text-sm text-muted-foreground">
                    10-15 minutes to complete
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-2 text-sm text-muted-foreground">
                <p>
                  <strong>Instructions:</strong> Answer each question honestly
                  based on your preferences and interests. There are no right or
                  wrong answers.
                </p>
                <p>
                  Your responses will be used to calculate your career
                  compatibility scores and provide personalized recommendations.
                </p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="bg-muted/50">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href={`/assessments/new?assessmentId=${mainAssessment.id}`}>
                Start Assessment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* History Section (placeholder) */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Your assessment history will be available in your{" "}
            <Link href="/dashboard" className="font-medium text-primary hover:underline">
              dashboard
            </Link>
            .
          </p>
        </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
