import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Lazy-loaded pages
const Doctors = lazy(() => import("./pages/Doctors"));
const DoctorProfile = lazy(() => import("./pages/DoctorProfile"));
const Hospitals = lazy(() => import("./pages/Hospitals"));
const HospitalDetail = lazy(() => import("./pages/HospitalDetail"));
const DiagnosticDetail = lazy(() => import("./pages/DiagnosticDetail"));
const VerifyDoctor = lazy(() => import("./pages/VerifyDoctor"));
const HealthFeed = lazy(() => import("./pages/Articles"));
const HealthFeedDetail = lazy(() => import("./pages/ArticleDetail"));
const PatientDashboard = lazy(() => import("./pages/PatientDashboard"));
const PatientEHR = lazy(() => import("./pages/PatientEHR"));
const BookAppointment = lazy(() => import("./pages/BookAppointment"));
const PatientAppointments = lazy(() => import("./pages/PatientAppointments"));
const DoctorDashboard = lazy(() => import("./pages/DoctorDashboard"));
const DoctorAppointments = lazy(() => import("./pages/DoctorAppointments"));
const DoctorMyProfile = lazy(() => import("./pages/DoctorMyProfile"));
const DoctorPatients = lazy(() => import("./pages/DoctorPatients"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AIDoctorFinder = lazy(() => import("./pages/AIDoctorFinder"));
const SignupSelection = lazy(() => import("./pages/SignupSelection"));
const PatientSignup = lazy(() => import("./pages/PatientSignup"));
const DoctorSignup = lazy(() => import("./pages/DoctorSignup"));
const Login = lazy(() => import("./pages/Login"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ProfileSettings = lazy(() => import("./pages/ProfileSettings"));

const queryClient = new QueryClient();

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route element={<MainLayout />}>
              <Route path="/" element={<Index />} />
              <Route path="/doctors" element={<Doctors />} />
              <Route path="/doctors/:id" element={<DoctorProfile />} />
              <Route path="/hospitals" element={<Hospitals />} />
              <Route path="/hospitals/:id" element={<HospitalDetail />} />
              <Route path="/diagnostics" element={<Hospitals />} />
              <Route path="/diagnostics/:id" element={<DiagnosticDetail />} />
              <Route path="/verify-doctor" element={<VerifyDoctor />} />
              <Route path="/health-feed" element={<HealthFeed />} />
              <Route path="/health-feed/:id" element={<HealthFeedDetail />} />
              {/* Legacy routes */}
              <Route path="/articles" element={<HealthFeed />} />
              <Route path="/articles/:id" element={<HealthFeedDetail />} />
              <Route path="/ai-doctor-finder" element={<AIDoctorFinder />} />
              {/* Protected Dashboard Routes */}
              <Route path="/patient" element={<ProtectedRoute requiredRole="patient"><PatientDashboard /></ProtectedRoute>} />
              <Route path="/patient/dashboard" element={<ProtectedRoute requiredRole="patient"><PatientDashboard /></ProtectedRoute>} />
              <Route path="/patient/ehr" element={<ProtectedRoute requiredRole="patient"><PatientEHR /></ProtectedRoute>} />
              <Route path="/patient/book-appointment" element={<ProtectedRoute requiredRole="patient"><BookAppointment /></ProtectedRoute>} />
              <Route path="/patient/appointments" element={<ProtectedRoute requiredRole="patient"><PatientAppointments /></ProtectedRoute>} />
              <Route path="/doctor" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/doctor/dashboard" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
              <Route path="/doctor/appointments" element={<ProtectedRoute requiredRole="doctor"><DoctorAppointments /></ProtectedRoute>} />
              <Route path="/doctor/profile" element={<ProtectedRoute requiredRole="doctor"><DoctorMyProfile /></ProtectedRoute>} />
              <Route path="/doctor/patients" element={<ProtectedRoute requiredRole="doctor"><DoctorPatients /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
            </Route>
            {/* Auth routes */}
            <Route path="/signup" element={<SignupSelection />} />
            <Route path="/signup/patient" element={<PatientSignup />} />
            <Route path="/signup/doctor" element={<DoctorSignup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/auth" element={<Login />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
