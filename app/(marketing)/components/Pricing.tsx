import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

export function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-32" aria-label="Pricing section">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-1.5">
            Pricing
          </Badge>
          <h2 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
            Start Free, Upgrade When Ready
          </h2>
          <p className="text-lg text-muted-foreground md:text-xl">
            Discover your perfect career path for free. Unlock advanced features with Premium.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid gap-8 lg:grid-cols-3 mx-auto max-w-6xl">
          {/* Free Plan */}
          <Card className="relative border-2">
            <CardHeader>
              <CardTitle className="text-2xl">Free</CardTitle>
              <CardDescription>Perfect for exploring career options</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>One career assessment</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Top 5 career recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Basic trait analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Save up to 3 career paths</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Access to career database</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/signup">Get Started Free</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Premium Plan */}
          <Card className="relative border-2 border-primary shadow-lg scale-105">
            <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
              Most Popular
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl">Premium</CardTitle>
              <CardDescription>For serious career explorers</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$9.99</span>
                <span className="text-muted-foreground">/month</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium text-primary">Everything in Free, plus:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Unlimited assessments</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>AI-powered career insights</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Detailed trait breakdown</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Unlimited saved careers</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Personalized milestone tracking</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>College & scholarship matches</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>SHS track recommendations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Priority email support</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button className="w-full" asChild>
                <Link href="/auth/signup?plan=premium">Start Premium Trial</Link>
              </Button>
            </CardFooter>
          </Card>

          {/* Lifetime Plan */}
          <Card className="relative border-2">
            <Badge variant="secondary" className="absolute -top-3 left-1/2 -translate-x-1/2">
              Best Value
            </Badge>
            <CardHeader>
              <CardTitle className="text-2xl">Lifetime</CardTitle>
              <CardDescription>One-time investment in your future</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">$49.99</span>
                <span className="text-muted-foreground ml-2">once</span>
              </div>
              <p className="text-sm text-muted-foreground">Save over 50%</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm font-medium text-primary">All Premium features, forever:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Lifetime access to all features</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>All future updates included</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>No recurring payments</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Premium support forever</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>Early access to new features</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href="/auth/signup?plan=lifetime">Get Lifetime Access</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground">
            All plans include secure data storage and privacy protection.{" "}
            <Link href="#" className="text-primary hover:underline">
              View detailed comparison
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
