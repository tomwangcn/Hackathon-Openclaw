import { useState } from "react"
import { Outlet, Link } from "react-router-dom"
import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  ChevronDown,
  Building2,
  User,
  Twitter,
  Github,
  Linkedin,
} from "lucide-react"

const navLinks = [
  { label: "How it Works", href: "/#how-it-works" },
  { label: "Privacy & Consent", href: "/privacy" },
  { label: "Pricing", href: "/pricing" },
  { label: "Contact", href: "/contact" },
]

export default function PublicLayout() {
  const [signInOpen, setSignInOpen] = useState(false)

  return (
    <div className="grain-overlay min-h-screen flex flex-col">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-[rgba(255,255,255,0.06)] bg-[var(--color-background)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-10">
            <Link to="/">
              <Logo size="md" />
            </Link>
            <nav className="hidden items-center gap-0.5 md:flex">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="rounded-[var(--radius-md)] px-3.5 py-2 text-sm font-light text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)] hover:bg-[rgba(255,255,255,0.05)]"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5"
                onClick={() => setSignInOpen(!signInOpen)}
                onBlur={() => setTimeout(() => setSignInOpen(false), 150)}
              >
                Sign In
                <ChevronDown className="h-3.5 w-3.5" />
              </Button>
              {signInOpen && (
                <div className="absolute right-0 top-full mt-2 w-52 rounded-[var(--radius-lg)] border border-[rgba(255,255,255,0.1)] bg-[var(--color-surface)] p-1.5 shadow-[0_16px_48px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                  <Link
                    to="/business/auth"
                    className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-text-primary)]"
                  >
                    <Building2 className="h-4 w-4 text-[var(--color-gold)]" />
                    Business
                  </Link>
                  <Link
                    to="/tester/auth"
                    className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[rgba(255,255,255,0.06)] hover:text-[var(--color-text-primary)]"
                  >
                    <User className="h-4 w-4 text-[var(--color-accent)]" />
                    Tester
                  </Link>
                </div>
              )}
            </div>
            <Link to="/business/auth">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        <Outlet />
      </main>

      <footer className="border-t border-[rgba(255,255,255,0.06)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-7xl px-6 py-14">
          <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
            <div className="space-y-4">
              <Logo size="sm" />
              <p className="text-sm font-light text-[var(--color-text-muted)] max-w-xs leading-relaxed">
                AI-powered accessibility and neurodiversity usability testing platform.
              </p>
              <div className="flex items-center gap-2">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[rgba(255,255,255,0.08)] text-[var(--color-text-muted)] transition-all hover:border-[var(--color-gold)]/30 hover:text-[var(--color-gold)]"
                  >
                    <Icon className="h-3.5 w-3.5" />
                  </a>
                ))}
              </div>
            </div>

            {[
              {
                title: "Product",
                links: [
                  { label: "How it Works", href: "/#how-it-works" },
                  { label: "Pricing", href: "/pricing" },
                  { label: "Contact", href: "/contact" },
                ],
              },
              {
                title: "Legal",
                links: [
                  { label: "Privacy Policy", href: "/privacy" },
                  { label: "Terms of Service", href: "/terms" },
                  { label: "Cookie Policy", href: "/cookies" },
                ],
              },
              {
                title: "Resources",
                links: [
                  { label: "Documentation", href: "/docs" },
                  { label: "Blog", href: "/blog" },
                  { label: "Changelog", href: "/changelog" },
                ],
              },
            ].map((group) => (
              <div key={group.title} className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-text-muted)]">
                  {group.title}
                </h4>
                <div className="flex flex-col gap-2.5">
                  {group.links.map((link) => (
                    <Link
                      key={link.label}
                      to={link.href}
                      className="text-sm font-light text-[var(--color-text-secondary)] hover:text-[var(--color-gold)] transition-colors"
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-8 bg-[rgba(255,255,255,0.06)]" />

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-xs font-light text-[var(--color-text-muted)]">
              &copy; {new Date().getFullYear()} OpenScouter. All rights reserved.
            </p>
            <p className="text-xs font-light text-[var(--color-text-muted)]">
              Built with care for accessibility and inclusion.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
