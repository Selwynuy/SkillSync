import Link from "next/link"
import { ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function Hero() {
  return (
    <section className="relative overflow-hidden py-20 md:py-32" aria-label="Hero section">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary/5 via-background to-background" />

      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <Badge variant="secondary" className="mb-6 px-4 py-1.5">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            AI-Powered Career Guidance
          </Badge>

          {/* Headline */}
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Discover Your{" "}
            <span className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Perfect Career Path
            </span>
          </h1>

          {/* Subcopy */}
          <p className="mx-auto mb-10 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Take our comprehensive career assessment to receive personalized job
            recommendations based on your unique skills, interests, and values.
            Find your future today.
          </p>

          {/* CTAs */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild className="group">
              <Link href="/assessments">
                Start Your Assessment
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#job-paths">Explore Career Paths</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 border-t pt-8">
            <div>
              <div className="text-3xl font-bold">12+</div>
              <div className="text-sm text-muted-foreground">Career Paths</div>
            </div>
            <div>
              <div className="text-3xl font-bold">24</div>
              <div className="text-sm text-muted-foreground">
                Assessment Questions
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold">95%</div>
              <div className="text-sm text-muted-foreground">
                Match Accuracy
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
