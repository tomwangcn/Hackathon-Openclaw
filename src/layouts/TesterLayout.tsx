import { useState } from "react"
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "@/context/AuthContext"
import { Logo } from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  ListChecks,
  PlayCircle,
  UserCircle,
  Settings,
  Search,
  Bell,
  ChevronDown,
  LogOut,
  User,
} from "lucide-react"

const sidebarNav = [
  { label: "Dashboard", href: "/tester/dashboard", icon: LayoutDashboard },
  { label: "Available Tests", href: "/tester/marketplace", icon: ListChecks },
  { label: "My Sessions", href: "/tester/sessions", icon: PlayCircle },
  { label: "Profile", href: "/tester/profile", icon: UserCircle },
  { label: "Settings", href: "/tester/settings", icon: Settings },
]

export default function TesterLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  return (
    <div className="flex h-screen bg-[var(--color-background)]">
      {/* Sidebar */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-[var(--color-border)]">
        <div className="flex h-16 items-center px-5 border-b border-[var(--color-border)]">
          <Link to="/tester/dashboard">
            <Logo size="sm" />
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {sidebarNav.map((item) => {
            const isActive =
              location.pathname === item.href ||
              location.pathname.startsWith(item.href + "/")

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-all duration-150",
                  isActive
                    ? "bg-[var(--color-accent-muted)] text-[var(--color-accent)]"
                    : "text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
                )}
              >
                <item.icon
                  className={cn(
                    "h-4.5 w-4.5",
                    isActive
                      ? "text-[var(--color-accent)]"
                      : "text-[var(--color-text-muted)]"
                  )}
                />
                {item.label}
                {isActive && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-[var(--color-border)] p-3">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-secondary)]"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-[var(--color-border)] px-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-text-muted)]" />
            <Input
              placeholder="Search tests, sessions..."
              className="pl-9 bg-[var(--color-surface-elevated)] border-transparent focus-visible:border-[var(--color-border)]"
            />
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4.5 w-4.5 text-[var(--color-text-secondary)]" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[var(--color-accent)]" />
            </Button>

            <Separator orientation="vertical" className="mx-1 h-6" />

            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-2 py-1.5 transition-colors hover:bg-[var(--color-surface-hover)]"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-accent-muted)] text-sm font-semibold text-[var(--color-accent)]">
                  {user?.name?.charAt(0) || "T"}
                </div>
                <div className="hidden text-left lg:block">
                  <p className="text-sm font-medium text-[var(--color-text-primary)]">
                    {user?.name || "Tester"}
                  </p>
                  <p className="text-xs text-[var(--color-text-muted)]">
                    Member
                  </p>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-[var(--color-text-muted)]" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-[var(--radius-lg)] border border-[var(--color-border)] bg-[var(--color-surface)] p-1.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
                  <Link
                    to="/tester/profile"
                    className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    to="/tester/settings"
                    className="flex items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-hover)] hover:text-[var(--color-text-primary)]"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                  <Separator className="my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-3 py-2 text-sm text-[var(--color-danger)] transition-colors hover:bg-[var(--color-surface-hover)]"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
