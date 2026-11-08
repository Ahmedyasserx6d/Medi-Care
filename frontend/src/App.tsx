import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Appointments from './pages/Appointments';
import BookingPage from './pages/BookingPage';
import DoctorRecords from './pages/Doctor/DoctorRecords';
import AllPatients from './pages/Doctor/AllPatients';
import MySchedule from './pages/Doctor/MySchedule';
import ReceptionPanel from './pages/Reception/ReceptionPanel';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ManageStaff from './pages/Admin/ManageStaff';
import AdminSetup from './pages/Admin/AdminSetup';
import ClinicServices from './pages/Admin/ClinicServices';
import CenterSettings from './pages/Admin/CenterSettings';
import PatientFiles from './pages/Patient/PatientFiles';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ className: 'font-sans font-bold text-xs rounded-2xl shadow-xl' }} />
        <Router>
          <DashboardLayout>
            <ErrorBoundary>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/setup-admin" element={<AdminSetup />} />
                <Route path="/" element={<Home />} />
                
                {/* Patient Routes */}
                <Route element={<ProtectedRoute allowedRoles={['Patient']} />}>
                  <Route path="/patient/files" element={<PatientFiles />} />
                  <Route path="/appointments" element={<Appointments />} />
                  <Route path="/book" element={<BookingPage />} />
                  <Route path="/success" element={<div className="p-20 text-center"><h1 className="text-4xl font-black text-gray-900">Booking Confirmed! ✅</h1><p className="mt-4 text-gray-500 font-bold">Your slot is reserved. See you soon!</p></div>} />
                </Route>

                {/* Doctor Routes */}
                <Route element={<ProtectedRoute allowedRoles={['Doctor']} />}>
                  <Route path="/doctor/clinic" element={<DoctorRecords />} />
                  <Route path="/doctor/records" element={<AllPatients />} />
                  <Route path="/doctor/schedule" element={<MySchedule />} />
                </Route>

                {/* Reception Routes */}
                <Route element={<ProtectedRoute allowedRoles={['Receptionist', 'Admin']} />}>
                  <Route path="/reception" element={<ReceptionPanel />} />
                </Route>

                {/* Admin Routes */}
                <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
                  <Route path="/admin" element={<AdminDashboard />} />
                  <Route path="/admin/staff" element={<ManageStaff />} />
                  <Route path="/admin/services" element={<ClinicServices />} />
                  <Route path="/admin/settings" element={<CenterSettings />} />
                </Route>
              </Routes>
            </ErrorBoundary>
          </DashboardLayout>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
