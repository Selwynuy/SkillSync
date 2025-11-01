import Link from "next/link"
import Image from "next/image"
import { ArrowRight, TrendingUp } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { JobPath } from "@/lib/types"

interface JobPathCardProps {
  jobPath: JobPath
}

export function JobPathCard({ jobPath }: JobPathCardProps) {
  const formatSalary = (min: number, max: number) => {
    const formatNumber = (num: number) => {
      if (num >= 1000) {
        return `$${(num / 1000).toFixed(0)}k`
      }
      return `$${num}`
    }
    return `${formatNumber(min)} - ${formatNumber(max)}`
  }

  return (
    <Card className="group relative overflow-hidden transition-all hover:shadow-lg pt-0" role="article" aria-label={`${jobPath.title} career path`}>
      {/* Career Image */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={jobPath.imageUrl || "/images/careers/default.jpg"}
          alt={jobPath.title}
          fill
          className="object-cover transition-transform group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <Badge variant="secondary" className="text-xs">
            {jobPath.category}
          </Badge>
          {jobPath.growthRate > 10 && (
            <Badge className="text-xs bg-green-600 hover:bg-green-700">
              <TrendingUp className="h-3 w-3 mr-1" />
              {jobPath.growthRate}%
            </Badge>
          )}
        </div>
      </div>

      <CardHeader className="relative">
        <h3 className="text-xl font-bold">{jobPath.title}</h3>
      </CardHeader>

      <CardContent className="relative">
        <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
          {jobPath.description}
        </p>

        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Salary Range</span>
            <span className="font-semibold">
              {formatSalary(jobPath.salaryRange.min, jobPath.salaryRange.max)}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Education</span>
            <span className="font-semibold">{jobPath.educationLevel}</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {jobPath.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="relative">
        <Button variant="ghost" className="w-full group/button" asChild>
          <Link href={`/career/${jobPath.id}`}>
            Learn More
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover/button:translate-x-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
