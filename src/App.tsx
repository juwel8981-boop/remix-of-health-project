import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/layout/MainLayout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import Index from "./pages/Index";
import Doctors from "./pages/Doctors";
import DoctorProfile from "./pages/DoctorProfile";
import Hospitals from "./pages/Hospitals";
import VerifyDoctor from "./pages/VerifyDoctor";
import HealthFeed from "./pages/Articles";
import HealthFeedDetail from "./pages/ArticleDetail";
import PatientDashboard from "./pages/PatientDashboard";
import PatientEHR from "./pages/PatientEHR";
import BookAppointment from "./pages/BookAppointment";
import PatientAppointments from "./pages/PatientAppointments";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorMyProfile from "./pages/DoctorMyProfile";
import DoctorPatients from "./pages/DoctorPatients";
import AdminDashboard from "./pages/AdminDashboard";
import AIDoctorFinder from "./pages/AIDoctorFinder";
import SignupSelection from "./pages/SignupSelection";
import PatientSignup from "./pages/PatientSignup";
import DoctorSignup from "./pages/DoctorSignup";
import Login from "./pages/Login";
import AdminLogin from "./pages/AdminLogin";
import ResetPassword from "./pages/ResetPassword";
import ProfileSettings from "./pages/ProfileSettings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="/diagnostics" element={<Hospitals />} />
            <Route path="/verify-doctor" element={<VerifyDoctor />} />
            <Route path="/health-feed" element={<HealthFeed />} />
            <Route path="/health-feed/:id" element={<HealthFeedDetail />} />
            {/* Legacy routes - redirect to health-feed */}
            <Route path="/articles" element={<HealthFeed />} />
            <Route path="/articles/:id" element={<HealthFeedDetail />} />
            <Route path="/ai-doctor-finder" element={<AIDoctorFinder />} />
            {/* Protected Dashboard Routes with Role-Based Access */}
            <Route path="/patient" element={<ProtectedRoute requiredRole="patient"><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/ehr" element={<ProtectedRoute requiredRole="patient"><PatientEHR /></ProtectedRoute>} />
            <Route path="/patient/book-appointment" element={<ProtectedRoute requiredRole="patient"><BookAppointment /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute requiredRole="patient"><PatientAppointments /></ProtectedRoute>} />
            <Route path="/doctor" element={<ProtectedRoute requiredRole="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute requiredRole="doctor"><DoctorAppointments /></ProtectedRoute>} />
            <Route path="/doctor/profile" element={<ProtectedRoute requiredRole="doctor"><DoctorMyProfile /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute requiredRole="doctor"><DoctorPatients /></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
            {/* Profile Settings - Protected but no specific role required */}
            <Route path="/settings" element={<ProtectedRoute><ProfileSettings /></ProtectedRoute>} />
          </Route>
          {/* Auth routes - outside MainLayout */}
          <Route path="/signup" element={<SignupSelection />} />
          <Route path="/signup/patient" element={<PatientSignup />} />
          <Route path="/signup/doctor" element={<DoctorSignup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          {/* Legacy auth route redirect */}
          <Route path="/auth" element={<Login />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
