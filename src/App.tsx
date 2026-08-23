import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import AdminDashboard from './pages/AdminDashboard';
import AdminDoctors from './pages/AdminDoctors';
import AdminPatients from './pages/AdminPatients';
import AdminAppointments from './pages/AdminAppointments';
import AdminAnalytics from './pages/AdminAnalytics';
import DoctorDashboard from './pages/DoctorDashboard';
import DoctorAppointments from './pages/DoctorAppointments';
import DoctorPatients from './pages/DoctorPatients';
import PatientDashboard from './pages/PatientDashboard';
import PatientAppointments from './pages/PatientAppointments';
import PatientPrescriptions from './pages/PatientPrescriptions';
import AppointmentBooking from './pages/AppointmentBooking';
import DiagnosisSystem from './pages/DiagnosisSystem';
import DoctorMessages from './pages/DoctorMessages';
import PatientMessages from './pages/PatientMessages';
import Login from "./pages/Login";
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
// import FirestoreTest from './components/FirestoreTest';

function ProtectedRoute({ children, role }: { children: React.ReactNode; role?: string }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="flex items-center justify-center h-screen bg-[#f5f2ed]">
    <div className="w-12 h-12 border-4 border-stone-900 border-t-transparent rounded-full animate-spin" />
  </div>;
  if (!user) return <Navigate to="/" />;
  if (role && user.role !== role) return <Navigate to="/" />;

  return <>{children}</>;
}

function HomeRedirect() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f5f2ed]">
        <div className="w-12 h-12 border-4 border-stone-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Landing />;
  }

  if (user.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "doctor") {
    return <Navigate to="/doctor/dashboard" replace />;
  }

  return <Navigate to="/patient/dashboard" replace />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-stone-900 font-sans selection:bg-stone-900 selection:text-white">
      {/* <FirestoreTest /> */}
      <Navbar />
      <div className="flex">
        {user && <Sidebar />}
        <main className={cn("flex-1 p-8 transition-all duration-500", !user && "p-0")}>
          <Routes>
            <Route path="/" element={<HomeRedirect />} />
            <Route path="/login" element={<Login />} />

            {/* Admin Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute role="admin"><AdminDoctors /></ProtectedRoute>} />
            <Route path="/admin/patients" element={<ProtectedRoute role="admin"><AdminPatients /></ProtectedRoute>} />
            <Route path="/admin/appointments" element={<ProtectedRoute role="admin"><AdminAppointments /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute role="admin"><AdminAnalytics /></ProtectedRoute>} />
            <Route path="/admin/profile" element={<ProtectedRoute role="admin"><Profile /></ProtectedRoute>} />
            
            {/* Doctor Routes */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute role="doctor"><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute role="doctor"><DoctorAppointments /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute role="doctor"><DoctorPatients /></ProtectedRoute>} />
            <Route path="/doctor/diagnoses" element={<ProtectedRoute role="doctor"><DiagnosisSystem /></ProtectedRoute>} />
            <Route path="/doctor/messages" element={<ProtectedRoute role="doctor"><DoctorMessages /></ProtectedRoute>} />
            <Route path="/doctor/messages/:chatId" element={<ProtectedRoute role="doctor"><Chat /></ProtectedRoute>} />
            <Route path="/doctor/profile" element={<ProtectedRoute role="doctor"><Profile /></ProtectedRoute>} />
            
            {/* Patient Routes */}
            <Route path="/patient/dashboard" element={<ProtectedRoute role="patient"><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute role="patient"><PatientAppointments /></ProtectedRoute>} />
            <Route path="/patient/book" element={<ProtectedRoute role="patient"><AppointmentBooking /></ProtectedRoute>} />
            <Route path="/patient/diagnoses" element={<ProtectedRoute role="patient"><DiagnosisSystem /></ProtectedRoute>} />
            <Route path="/patient/prescriptions" element={<ProtectedRoute role="patient"><PatientPrescriptions /></ProtectedRoute>} />
            <Route path="/patient/chat" element={<ProtectedRoute role="patient"><PatientMessages /></ProtectedRoute>}/>
            <Route path="/patient/chat/:chatId" element={<ProtectedRoute role="patient"><Chat /></ProtectedRoute>} />
            <Route path="/patient/profile" element={<ProtectedRoute role="patient"><Profile /></ProtectedRoute>} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

import { cn } from './lib/utils';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
