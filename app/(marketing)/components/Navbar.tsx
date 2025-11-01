"use client"

import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/common/theme-toggle"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Menu, LogOut, Settings, LayoutDashboard, ChevronDown } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu"

export function Navbar() {
  const { data: session } = useSession()

  const navItems = [
    { href: "/assessments", label: "Take Assessment" },
    { href: "/market", label: "Job Market" },
    { href: "/colleges", label: "Colleges" },
    { href: "/scholarships", label: "Scholarships" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" aria-label="Main navigation">
      <div className="mx-auto w-full max-w-7xl px-4 md:px-6 lg:px-8 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2" aria-label="SkillSync home">
          <Image
            src="/logo.png"
            alt="SkillSync Logo"
            width={32}
            height={32}
            className="h-8 w-8 object-cover"
            priority
          />
          <span className="text-xl font-bold">SkillSync</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:gap-2">
            {session ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 px-2">
                    <Avatar className="size-8">
                      <AvatarFallback>
                        {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium">
                      {session.user?.name || session.user?.email?.split("@")[0] || "User"}
                    </span>
                    <ChevronDown className="hidden sm:block size-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name || "User"}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="flex items-center w-full">
                      <LayoutDashboard className="mr-2 size-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex items-center w-full">
                      <Settings className="mr-2 size-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut()}
                    className="text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 size-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/signin">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link href="/auth/signup">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu */}
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {session && (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-2">
                        <Avatar className="size-8">
                          <AvatarFallback>
                            {session.user?.name?.[0]?.toUpperCase() || session.user?.email?.[0]?.toUpperCase() || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-0.5">
                          <p className="text-sm font-medium leading-none">
                            {session.user?.name || "User"}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {session.user?.email}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center w-full">
                        <LayoutDashboard className="mr-2 size-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center w-full">
                        <Settings className="mr-2 size-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => signOut()}
                      className="text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 size-4" />
                      Sign Out
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                {navItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <Link href={item.href} className="w-full">
                      {item.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
                {!session && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/auth/signin" className="w-full">
                        Sign In
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/auth/signup" className="w-full">
                        Get Started
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  )
}
