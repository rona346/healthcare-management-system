import { useAuth } from '../hooks/useAuth';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Users, Stethoscope, Calendar, Activity, TrendingUp, AlertCircle, Search, MoreVertical, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { collection, query, where, getDocs, setDoc, } from 'firebase/firestore';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { User as UserType } from '../types';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { getAdminDashboardStats, getPatientGrowth  } from "../services/adminDashboardService";

type DashboardDoctor = UserType & {
  patientCount: number;
};


export default function AdminDashboard() {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [doctors, setDoctors] = useState<DashboardDoctor[]>([]);
  const [patientCount, setPatientCount] = useState(0);
  const [appointmentCount, setAppointmentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState<
    { name: string; patients: number }[]
  >([]);
  
  useEffect(() => {
    setIsMounted(true);
    fetchData();
  }, []);


const fetchData = async () => {
  try {
    const data = await getAdminDashboardStats();
    const growth = await getPatientGrowth();
    console.log(data); 

    setDoctors(data.doctors);
    setPatientCount(data.patientCount);
    setAppointmentCount(data.appointmentCount);

    setChartData(growth);

    setLoading(false);
  } catch (error) {
    console.error(error);
  }
};
  const stats = [
    { label: 'Total Patients', value: patientCount.toLocaleString(), icon: Users, color: 'bg-blue-50 text-blue-600', trend: '+12%' },
    { label: 'Total Doctors', value: doctors.length.toString(), icon: Stethoscope, color: 'bg-green-50 text-green-600', trend: '+2' },
    { label: 'Consultations', value: appointmentCount.toLocaleString(), icon: Calendar, color: 'bg-purple-50 text-purple-600', trend: '+18%' },
    { label: 'System Health', value: '99.9%', icon: Activity, color: 'bg-orange-50 text-orange-600', trend: 'Stable' },
  ];

  const toggleDoctorStatus = async (doctor: UserType) => {
  try {
    await updateDoc(doc(db, "users", doctor.uid), {
      isActive: !doctor.isActive,
    });
        setDoctors((prev) =>
      prev.map((d) =>
        d.uid === doctor.uid
          ? { ...d, isActive: !d.isActive }
          : d
      )
    );
  } catch (error) {
    console.error("Failed to update doctor status:", error);
  }
};

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-stone-900">Admin Control Center</h1>
          <p className="text-stone-500 font-sans">System overview and management dashboard.</p>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div
            key={stat.label}
            whileHover={{ y: -4 }}
            className="p-6 bg-white border border-stone-100 rounded-2xl shadow-sm"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", stat.color)}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                {stat.trend}
              </span>
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
              <h2 className="text-xl font-serif text-stone-900">Patient Growth Analytics</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-xs bg-stone-900 text-white rounded-full">Monthly</button>
                <button className="px-3 py-1 text-xs text-stone-400 hover:bg-stone-50 rounded-full">Weekly</button>
              </div>
            </div>
            <div className="h-80 w-full min-w-0">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorPatients" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1c1917" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#1c1917" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Area type="monotone" dataKey="patients" stroke="#1c1917" fillOpacity={1} fill="url(#colorPatients)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>

          <section className="bg-white border border-stone-100 rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-serif text-stone-900">Recent Doctors</h2>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                <input 
                  type="text" 
                  placeholder="Search doctors..." 
                  className="pl-10 pr-4 py-2 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-stone-200 outline-none w-64"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-xs uppercase tracking-widest text-stone-400 border-b border-stone-50">
                    <th className="pb-4 font-medium">Doctor</th>
                    <th className="pb-4 font-medium">Specialization</th>
                    <th className="pb-4 font-medium">Patients</th>
                    <th className="pb-4 font-medium">Status</th>
                    <th className="pb-4 font-medium"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-300" />
                      </td>
                    </tr>
                  ) : doctors.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-stone-400 text-sm">
                        No doctors found in the system.
                      </td>
                    </tr>
                  ) : (
                    doctors.map((doc) => (
                      <DoctorRow 
                        key={doc.uid}
                        doctor={doc}
                        name={doc.displayName} 
                        specialization={doc.specialization} 
                        patients={doc.patientCount}
                        status={doc.isActive ? 'Active' : 'Inactive'} 
                        img={doc.photoURL}
                        onToggleStatus={toggleDoctorStatus}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-stone-900 text-white rounded-3xl p-8">
            <h2 className="text-xl font-serif mb-6">System Status</h2>
            <div className="space-y-6">
              <StatusItem label="Database" status="Healthy" />
              <StatusItem label="AI Engine" status="Healthy" />
              <StatusItem label="Auth Service" status="Healthy" />
              <StatusItem label="File Storage" status="Healthy" />
            </div>
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 text-stone-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Last backup: 2h ago</span>
              </div>
            </div>
          </section>

          <section className="bg-white border border-stone-100 rounded-3xl p-8">
            <h2 className="text-xl font-serif text-stone-900 mb-6">Audit Logs</h2>
            <div className="space-y-4">
              <LogItem text="New doctor profile created" time="10m ago" />
              <LogItem text="System backup completed" time="2h ago" />
              <LogItem text="Security patch applied" time="5h ago" />
              <LogItem text="Admin login detected" time="8h ago" />
            </div>
            <button className="w-full mt-6 py-3 text-sm text-stone-400 hover:text-stone-900 transition-colors">
              View All Logs
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

function DoctorRow({ doctor, name, specialization, patients, status, img , onToggleStatus, }: any) {
  return (
    <tr className="group hover:bg-stone-50 transition-colors">
      <td className="py-4">
        <div className="flex items-center gap-3">
          <img src={img} alt={name} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
          <span className="font-medium text-stone-900">{name}</span>
        </div>
      </td>
      <td className="py-4 text-sm text-stone-600">{specialization}</td>
      <td className="py-4 text-sm text-stone-600">{patients}</td>
      <td className="py-4">
        <button
          onClick={() => onToggleStatus(doctor)}
          className={cn(
            "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold cursor-pointer",
            status === "Active"
              ? "bg-green-50 text-green-600"
              : "bg-orange-50 text-orange-600"
          )}
        >
          {status}
        </button>
      </td>

      <td className="py-4 text-right">
        <button className="p-2 text-stone-300 hover:text-stone-900 transition-colors">
          <MoreVertical className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

function StatusItem({ label, status }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-stone-400 text-sm">{label}</span>
      <div className="flex items-center gap-2">
        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
        <span className="text-sm font-medium">{status}</span>
      </div>
    </div>
  );
}

function LogItem({ text, time }: any) {
  return (
    <div className="flex justify-between items-start gap-4">
      <p className="text-sm text-stone-600 line-clamp-1">{text}</p>
      <span className="text-[10px] uppercase tracking-widest text-stone-300 whitespace-nowrap">{time}</span>
    </div>
  );
}
