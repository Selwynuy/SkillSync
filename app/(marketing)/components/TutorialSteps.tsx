"use client"

import { CheckCircle2, Compass, FileCheck, Save, UserPlus } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const STEPS = [
  {
    icon: UserPlus,
    title: "Create your account",
    description: "Sign up in seconds to save progress and sync across devices.",
  },
  {
    icon: FileCheck,
    title: "Take the assessment",
    description: "Answer a quick set of questions about interests and strengths.",
  },
  {
    icon: Compass,
    title: "See your matches",
    description: "Get AI-curated career paths aligned to your profile.",
  },
  {
    icon: Save,
    title: "Save your path",
    description: "Bookmark favorites, track progress, and refine over time.",
  },
]

export function TutorialSteps() {
  return (
    <section aria-label="How it works" className="py-12 md:py-16">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        <div className="mx-auto mb-8 max-w-3xl text-center md:mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Step-by-step
          </div>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
            Get started in four simple steps
          </h2>
          <p className="mt-3 text-sm text-muted-foreground md:text-base">
            Follow this quick guide to go from sign-up to your personalized career plan.
          </p>
        </div>

        <ol className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            return (
              <li key={step.title} className="group">
                <Card className="h-full transition-shadow group-hover:shadow-md">
                  <CardHeader>
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-base">
                      <span className="mr-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                        {index + 1}
                      </span>
                      {step.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              </li>
            )
          })}
        </ol>
      </div>
    </section>
  )
}

export default TutorialSteps


