import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarDays, ClipboardList, Stethoscope, Users } from 'lucide-react';
import api from '../../services/api';

interface DashboardData {
  doctors: any[];
  staff: any[];
  appointments: any[];
}

const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData>({ doctors: [], staff: [], appointments: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [doctorsRes, staffRes, appointmentsRes] = await Promise.all([
          api.get('/auth/doctors'),
          api.get('/auth/staff'),
          api.get('/appointments')
        ]);
        setData({
          doctors: doctorsRes.data || [],
          staff: staffRes.data || [],
          appointments: appointmentsRes.data || []
        });
      } catch {
        setError('Could not load dashboard data. Check your connection and try again.');
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const today = new Date().toDateString();
  const todayAppointments = data.appointments.filter((appointment) =>
    appointment.date && new Date(appointment.date).toDateString() === today
  );
  const pendingAppointments = data.appointments.filter((appointment) => appointment.status === 'Pending');
  const paidTotal = data.appointments
    .filter((appointment) => appointment.paymentStatus === 'Paid')
    .reduce((total, appointment) => total + (Number(appointment.amount) || 0), 0);

  const metrics = [
    { label: 'Doctors', value: data.doctors.length, icon: Stethoscope, accent: 'text-blue-700 bg-blue-50' },
    { label: 'Staff accounts', value: data.staff.length, icon: Users, accent: 'text-emerald-700 bg-emerald-50' },
    { label: "Today's appointments", value: todayAppointments.length, icon: CalendarDays, accent: 'text-amber-700 bg-amber-50' },
    { label: 'Pending appointments', value: pendingAppointments.length, icon: ClipboardList, accent: 'text-rose-700 bg-rose-50' }
  ];

  const actions = [
    { title: 'Doctors & staff', detail: 'Add accounts, update profiles, or revoke access.', href: '/admin/staff', action: 'Manage staff' },
    { title: 'Clinic services', detail: 'Maintain specialties, service prices, and durations.', href: '/admin/services', action: 'Manage services' },
    { title: 'Center settings', detail: 'Review the center configuration.', href: '/admin/settings', action: 'Open settings' },
    { title: 'Reception desk', detail: 'Review and manage today’s reservations.', href: '/reception', action: 'Open reception' }
  ];

  return (
    <div className="space-y-8 pb-16 animate-in fade-in duration-500">
      <header className="flex flex-col gap-5 border-b border-gray-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-blue-700">Administration</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950">Medical center overview</h1>
          <p className="mt-2 text-sm text-gray-500">Manage people, appointments, and clinic operations.</p>
        </div>
        <Link to="/admin/staff" className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-950 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-blue-700">
          Add a doctor <ArrowUpRight className="h-4 w-4" />
        </Link>
      </header>

      {error && <p role="alert" className="border-l-4 border-rose-500 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{error}</p>}

      <section aria-label="Center metrics" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="border-b border-gray-200 bg-white px-5 py-5 sm:border sm:rounded-xl">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-500">{label}</span>
              <span className={`rounded-lg p-2 ${accent}`}><Icon className="h-5 w-5" /></span>
            </div>
            <p className="mt-5 text-3xl font-black text-gray-950">{loading ? '—' : value}</p>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1.6fr)_minmax(280px,0.8fr)]">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-gray-950">Today’s appointments</h2>
              <p className="mt-1 text-sm text-gray-500">Live records from the appointment system.</p>
            </div>
            <Link to="/reception" className="text-sm font-bold text-blue-700 hover:text-blue-900">Open reception</Link>
          </div>
          <div className="divide-y divide-gray-100 border-y border-gray-200 bg-white">
            {!loading && todayAppointments.length === 0 && (
              <p className="px-5 py-8 text-sm text-gray-500">No appointments scheduled for today.</p>
            )}
            {todayAppointments.map((appointment) => (
              <div key={appointment._id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
                <div>
                  <p className="font-bold text-gray-900">
                    {appointment.patientId?.firstName || 'Patient'} {appointment.patientId?.lastName || ''}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    Dr. {appointment.doctorId?.firstName || ''} {appointment.doctorId?.lastName || ''}
                    {appointment.doctorId?.specialty ? ` · ${appointment.doctorId.specialty}` : ''}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-800">{appointment.timeSlot}</p>
                  <p className="mt-1 text-xs text-gray-500">{appointment.status}</p>
                </div>
              </div>
            ))}
          </div>
          {!loading && paidTotal > 0 && (
            <p className="mt-4 text-sm text-gray-500">Recorded paid total: <strong className="text-gray-900">EGP {paidTotal.toLocaleString()}</strong></p>
          )}
        </div>

        <div>
          <h2 className="mb-4 text-lg font-black text-gray-950">Administration</h2>
          <div className="divide-y divide-gray-100 border-y border-gray-200 bg-white">
            {actions.map((item) => (
              <Link key={item.href} to={item.href} className="group flex items-center justify-between gap-4 px-4 py-4 hover:bg-gray-50">
                <span>
                  <span className="block text-sm font-bold text-gray-900">{item.title}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-gray-500">{item.detail}</span>
                </span>
                <span className="shrink-0 text-xs font-bold text-blue-700 group-hover:text-blue-900">{item.action} →</span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
