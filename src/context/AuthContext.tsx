import { createContext, useContext, useState, useEffect, useCallback } from "react"
import type { ReactNode } from "react"
import { api } from "@/lib/api"

interface User {
  id: string
  email: string
  name: string
  role: "business" | "tester"
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<User>
  register: (data: { email: string; password: string; name: string; role: string; orgName?: string }) => Promise<User>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (!token) {
      setLoading(false)
      return
    }
    api.auth.me()
      .then((data) => setUser({ id: data.id, email: data.email, name: data.name, role: data.role }))
      .catch(() => localStorage.removeItem("token"))
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    const { user, token } = await api.auth.login(email, password)
    localStorage.setItem("token", token)
    setUser(user as User)
    return user as User
  }, [])

  const register = useCallback(async (data: { email: string; password: string; name: string; role: string; orgName?: string }) => {
    const { user, token } = await api.auth.register(data)
    localStorage.setItem("token", token)
    setUser(user as User)
    return user as User
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem("token")
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used within AuthProvider")
  return ctx
}
