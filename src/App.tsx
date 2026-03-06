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
import Onboarding from "@/pages/tester/Onboarding"
import SessionFeedback from "@/pages/tester/SessionFeedback"
import SessionReport from "@/pages/tester/SessionReport"

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
            <Route path="onboarding" element={<Onboarding />} />
          </Route>

          <Route path="/tester/session/:id" element={<LiveSession />} />
          <Route path="/tester/session/:id/feedback" element={<SessionFeedback />} />
          <Route path="/tester/session/:id/report" element={<SessionReport />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App
