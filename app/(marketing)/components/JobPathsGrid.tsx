import { getAllJobPaths } from "@/lib/repositories"
import { JobPathCard } from "./JobPathCard"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export async function JobPathsGrid() {
  const jobPaths = await getAllJobPaths()

  // Show first 6 job paths on the landing page
  const featuredPaths = jobPaths.slice(0, 6)

  return (
    <section id="job-paths" className="py-20 md:py-32" aria-labelledby="job-paths-heading">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-12 text-center">
          <h2 id="job-paths-heading" className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Explore Career Paths
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Discover diverse career opportunities across industries. Each path
            is carefully analyzed to match your unique profile.
          </p>
        </div>

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {featuredPaths.map((jobPath) => (
            <JobPathCard key={jobPath.id} jobPath={jobPath} />
          ))}
        </div>

        {/* View All CTA */}
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/careers">
              View All Career Paths
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
