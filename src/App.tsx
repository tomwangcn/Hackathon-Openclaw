import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import PublicLayout from "@/layouts/PublicLayout"
import BusinessLayout from "@/layouts/BusinessLayout"
import TesterLayout from "@/layouts/TesterLayout"
import Landing from "@/pages/Landing"
import BusinessAuth from "@/pages/auth/BusinessAuth"
import TesterAuth from "@/pages/auth/TesterAuth"
import BusinessDashboard from "@/pages/business/Dashboard"
import StudyBuilder from "@/pages/business/StudyBuilder"
import Reports from "@/pages/business/Reports"
import TesterDashboard from "@/pages/tester/Dashboard"
import Marketplace from "@/pages/tester/Marketplace"
import LiveSession from "@/pages/tester/LiveSession"

function App() {
  return (
    <div className="grain-overlay">
      <BrowserRouter>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Landing />} />
          </Route>

          <Route path="/business/auth" element={<BusinessAuth />} />
          <Route path="/tester/auth" element={<TesterAuth />} />

          <Route path="/business" element={<BusinessLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<BusinessDashboard />} />
            <Route path="studies/new" element={<StudyBuilder />} />
            <Route path="studies/:id" element={<StudyBuilder />} />
            <Route path="reports" element={<Reports />} />
            <Route path="reports/:id" element={<Reports />} />
          </Route>

          <Route path="/tester" element={<TesterLayout />}>
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<TesterDashboard />} />
            <Route path="marketplace" element={<Marketplace />} />
          </Route>

          <Route path="/tester/session/:id" element={<LiveSession />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
