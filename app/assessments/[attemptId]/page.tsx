"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { LikertScale } from "@/components/assessment/LikertScale"
import { MultipleChoice } from "@/components/assessment/MultipleChoice"
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AssessmentQuestion, AssessmentModule, AssessmentResponse } from "@/lib/types"

export default function AssessmentFlowPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()

  const [assessment, setAssessment] = useState<any>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<Map<string, AssessmentResponse>>(
    new Map()
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/assessments")
    }
  }, [status, router])

  // Load assessment data
  useEffect(() => {
    async function loadAssessment() {
      try {
        const assessmentId = searchParams.get("assessmentId") || "assessment-001"
        const response = await fetch(`/api/assessments/${assessmentId}`)

        if (!response.ok) {
          throw new Error("Failed to load assessment")
        }

        const data = await response.json()
        setAssessment(data)

        // Create or load attempt
        if (params.attemptId === "new") {
          const attemptResponse = await fetch("/api/assessments/attempts", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ assessmentId }),
          })

          if (!attemptResponse.ok) {
            throw new Error("Failed to create attempt")
          }

          const attemptData = await attemptResponse.json()
          setAttemptId(attemptData.attemptId)

          // Update URL without reload
          window.history.replaceState({}, "", `/assessments/${attemptData.attemptId}`)
        } else {
          setAttemptId(params.attemptId as string)

          // Load saved progress
          const progressResponse = await fetch(
            `/api/assessments/attempts/${params.attemptId}`
          )

          if (progressResponse.ok) {
            const progressData = await progressResponse.json()
            const savedResponses = new Map<string, AssessmentResponse>(
              progressData.responses.map((r: AssessmentResponse) => [r.questionId, r] as [string, AssessmentResponse])
            )
            setResponses(savedResponses)
            setCurrentModuleIndex(progressData.currentModuleIndex || 0)
          }
        }

        setIsLoading(false)
      } catch (error) {
        console.error("Error loading assessment:", error)
        toast.error("Failed to load assessment")
        router.push("/assessments")
      }
    }

    if (status === "authenticated") {
      loadAssessment()
    }
  }, [params.attemptId, searchParams, status, router])

  // Auto-save progress
  useEffect(() => {
    const saveProgress = async () => {
      if (!attemptId || !assessment || isSaving) return

      setIsSaving(true)
      try {
        await fetch(`/api/assessments/attempts/${attemptId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            responses: Array.from(responses.values()),
            currentModuleIndex,
          }),
        })
      } catch (error) {
        console.error("Failed to save progress:", error)
      } finally {
        setIsSaving(false)
      }
    }

    const timeoutId = setTimeout(saveProgress, 1000)
    return () => clearTimeout(timeoutId)
  }, [responses, currentModuleIndex, attemptId, assessment, isSaving])

  if (status === "loading" || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!assessment || !attemptId) {
    return null
  }

  const sortedModules = [...assessment.modules].sort((a, b) => a.order - b.order)
  const currentModule = sortedModules[currentModuleIndex]
  const currentQuestion = currentModule.questions[currentQuestionIndex]
  const totalQuestions = sortedModules.reduce(
    (sum, module) => sum + module.questions.length,
    0
  )
  const answeredQuestions = responses.size
  const progressPercent = (answeredQuestions / totalQuestions) * 100

  const currentResponse = responses.get(currentQuestion.id)

  const handleResponse = (value: number | string) => {
    const response: AssessmentResponse = {
      questionId: currentQuestion.id,
      value,
      timestamp: new Date(),
    }
    setResponses(new Map(responses.set(currentQuestion.id, response)))
  }

  const canGoNext = responses.has(currentQuestion.id)
  const isLastQuestionInModule =
    currentQuestionIndex === currentModule.questions.length - 1
  const isLastModule = currentModuleIndex === sortedModules.length - 1

  const handleNext = () => {
    if (isLastQuestionInModule) {
      if (isLastModule) {
        // Assessment complete
        handleSubmit()
      } else {
        // Move to next module
        setCurrentModuleIndex(currentModuleIndex + 1)
        setCurrentQuestionIndex(0)
      }
    } else {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    } else if (currentModuleIndex > 0) {
      const prevModule = sortedModules[currentModuleIndex - 1]
      setCurrentModuleIndex(currentModuleIndex - 1)
      setCurrentQuestionIndex(prevModule.questions.length - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/assessments/attempts/${attemptId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          responses: Array.from(responses.values()),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit assessment")
      }

      const data = await response.json()
      toast.success("Assessment completed!")
      router.push(`/recommendations?attemptId=${attemptId}`)
    } catch (error) {
      console.error("Error submitting assessment:", error)
      toast.error("Failed to submit assessment")
      setIsSubmitting(false)
    }
  }

  const canGoPrevious = currentModuleIndex > 0 || currentQuestionIndex > 0

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="container max-w-3xl">
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium">
              {answeredQuestions} of {totalQuestions} questions answered
            </span>
            <span className="text-muted-foreground">{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="outline">
                Module {currentModuleIndex + 1} of {sortedModules.length}
              </Badge>
              {isSaving && (
                <span className="text-xs text-muted-foreground">Saving...</span>
              )}
            </div>
            <h2 className="mt-4 text-xl font-bold">{currentModule.title}</h2>
            <p className="text-sm text-muted-foreground">
              {currentModule.description}
            </p>
            <div className="mt-2 text-sm text-muted-foreground">
              Question {currentQuestionIndex + 1} of {currentModule.questions.length}
            </div>
          </CardHeader>

          <CardContent className="pt-6">
            {currentQuestion.type === "likert" && (
              <LikertScale
                questionId={currentQuestion.id}
                question={currentQuestion.text}
                value={
                  typeof currentResponse?.value === "number"
                    ? currentResponse.value
                    : undefined
                }
                onChange={handleResponse}
              />
            )}

            {currentQuestion.type === "mcq" && currentQuestion.options && (
              <MultipleChoice
                questionId={currentQuestion.id}
                question={currentQuestion.text}
                options={currentQuestion.options}
                value={
                  typeof currentResponse?.value === "string"
                    ? currentResponse.value
                    : undefined
                }
                onChange={handleResponse}
              />
            )}
          </CardContent>

          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={!canGoPrevious || isSubmitting}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>

            <Button
              onClick={handleNext}
              disabled={!canGoNext || isSubmitting}
            >
              {isLastQuestionInModule && isLastModule ? (
                <>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Complete Assessment
                      <CheckCircle2 className="ml-2 h-4 w-4" />
                    </>
                  )}
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>

        {/* Help Text */}
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Your progress is saved automatically. You can return to this assessment anytime.
        </p>
      </div>
    </div>
  )
}
