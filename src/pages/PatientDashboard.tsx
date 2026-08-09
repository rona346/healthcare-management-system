import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Calendar, ClipboardList, FileText, MessageSquare, ArrowRight, Activity, Clock, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { getPatientDashboardStats , getUpcomingAppointments } from "../services/patientDashboardService";
import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";

export default function PatientDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
  upcoming: 0,
  diagnoses: 0,
  prescriptions: 0,
  messages: 0,
});

const quickActions = [
  {
    icon: MessageSquare,
    label: "Chat with Doctor",
    path: "/patient/chat",
  },
  {
    icon: FileText,
    label: "Download Prescriptions",
    path: "/patient/prescriptions",
  },
  {
    icon: Activity,
    label: "Symptom Checker",
    path: "/patient/diagnosis",
  },
];
  // const [appointments, setAppointments] = useState<any[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<any[]>([]);
const loadDashboardStats = async () => {
  if (!user) return;

  const dashboardStats = await getPatientDashboardStats(user.uid);

  setStats(dashboardStats);
};

const loadUpcomingAppointments = async () => {
  if (!user) return;

  const data = await getUpcomingAppointments(user.uid);

  setUpcomingAppointments(data);

  console.log(data);
};

useEffect(() => {
  if (user) {
    loadDashboardStats();
    loadUpcomingAppointments();
  }
}, [user]);

  const statcards = [
    { label: 'Upcoming', value: stats.upcoming, icon: Calendar, color: 'bg-blue-50 text-blue-600' },
    { label: 'Diagnoses', value: stats.diagnoses, icon: ClipboardList, color: 'bg-green-50 text-green-600' },
    { label: 'Prescriptions', value: stats.prescriptions, icon: FileText, color: 'bg-purple-50 text-purple-600' },
    { label: 'Messages', value: stats.messages, icon: MessageSquare, color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-stone-900">Welcome back, {user?.displayName}</h1>
          <p className="text-stone-500 font-sans">Here's an overview of your health status.</p>
        </div>
        <Link
          to="/patient/book"
          className="px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 text-sm font-sans w-fit"
        >
          <Calendar className="w-4 h-4" />
          Book New Appointment
        </Link>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {statcards.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="p-6 bg-white border border-stone-100 rounded-2xl shadow-sm"
          >
            <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-4", stat.color)}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-2xl font-bold text-stone-900">{stat.value}</p>
            <p className="text-xs text-stone-400 uppercase tracking-widest">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="bg-white border border-stone-100 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif text-stone-900">Upcoming Appointments</h2>
              <Link to="/patient/appointments" className="text-sm text-stone-400 hover:text-stone-900 transition-colors">View All</Link>
            </div>
            <div className="space-y-4">
              {upcomingAppointments.length === 0 ? (
                <p className="text-stone-400 text-center py-8">
                  No upcoming appointments
                </p>
              ) : (
                upcomingAppointments.map((appointment) => (
                  <AppointmentCard
                    key={appointment.id}
                    doctor={appointment.doctorName}
                    specialization="General Physician"
                    date={appointment.date}
                    time={appointment.timeSlot}
                    status={appointment.status}
                  />
                ))
              )}
            </div>
          </section>

          <section className="bg-white border border-stone-100 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif text-stone-900">Recent Diagnoses</h2>
              <Link to="/patient/diagnoses" className="text-sm text-stone-400 hover:text-stone-900 transition-colors">View All</Link>
            </div>
            <div className="space-y-4">
              <DiagnosisCard
                condition="Mild Hypertension"
                doctor="Dr. Sharma"
                date="Sep 12, 2024"
              />
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-stone-900 text-white rounded-3xl p-8 overflow-hidden relative">
            <div className="relative z-10">
              <h2 className="text-xl font-serif mb-4">Health Score</h2>
              <div className="flex items-end gap-2 mb-6">
                <span className="text-5xl font-light">84</span>
                <span className="text-stone-400 mb-2">/100</span>
              </div>
              <p className="text-sm text-stone-400 mb-8 font-sans">Your health is improving! Keep up the good work with your medication.</p>
              <button className="w-full py-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-sm font-sans">
                View Detailed Report
              </button>
            </div>
            <Activity className="absolute -bottom-4 -right-4 w-32 h-32 text-white/5" />
          </section>

          <section className="bg-white border border-stone-100 rounded-3xl p-8">
            <h2 className="text-xl font-serif text-stone-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action) => (
                <QuickAction
                  key={action.label}
                  icon={action.icon}
                  label={action.label}
                  path={action.path}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function AppointmentCard({ doctor, specialization, date, time, status }: any) {
  return (
    <div className="flex items-center justify-between p-6 border border-stone-50 rounded-2xl hover:bg-stone-50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-medium text-stone-900">{doctor}</h4>
          <p className="text-xs text-stone-400">{specialization}</p>
        </div>
      </div>
      <div className="text-right flex items-center gap-8">
        <div className="hidden md:block">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Calendar className="w-3.5 h-3.5" />
            {date}
          </div>
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Clock className="w-3.5 h-3.5" />
            {time}
          </div>
        </div>
        <span className={cn(
          "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold",
          status === 'confirmed' ? "bg-green-50 text-green-600" : "bg-orange-50 text-orange-600"
        )}>
          {status}
        </span>
        <ArrowRight className="w-4 h-4 text-stone-200 group-hover:text-stone-900 transition-colors" />
      </div>
    </div>
  );
}

function DiagnosisCard({ condition, doctor, date }: any) {
  return (
    <div className="p-6 border border-stone-50 rounded-2xl hover:bg-stone-50 transition-colors flex items-center justify-between">
      <div>
        <h4 className="font-medium text-stone-900">{condition}</h4>
        <p className="text-xs text-stone-400">Diagnosed by {doctor}</p>
      </div>
      <div className="text-right">
        <p className="text-sm text-stone-600">{date}</p>
        <button className="text-xs text-stone-400 hover:text-stone-900 underline mt-1">View Details</button>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label,path }: any) {
  const navigate = useNavigate()
  return (
    <button   onClick={() => navigate(path)} className="flex items-center gap-3 p-4 border border-stone-50 rounded-2xl hover:bg-stone-50 transition-colors text-left group">
      <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:text-stone-900 transition-colors">
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium text-stone-600 group-hover:text-stone-900">{label}</span>
    </button>
  );
}
