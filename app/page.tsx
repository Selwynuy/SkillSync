import { Navbar } from "./(marketing)/components/Navbar"
import { Hero } from "./(marketing)/components/Hero"
import { TutorialSteps } from "./(marketing)/components/TutorialSteps"
import { JobPathsGrid } from "./(marketing)/components/JobPathsGrid"
import { Footer } from "./(marketing)/components/Footer"
import { SkipToContent } from "@/components/common/skip-to-content"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SkipToContent />
      <Navbar />
      <main id="main-content" className="flex-1" role="main">
        <Hero />
        <TutorialSteps />
        <JobPathsGrid />
      </main>
      <Footer />
    </div>
  )
}
