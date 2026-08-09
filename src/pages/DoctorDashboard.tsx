import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { Calendar, Users, Activity, Clock, User, ArrowRight, CheckCircle, AlertCircle, XCircle} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../lib/utils';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getDashboardStats, getRecentActivities } from "../services/doctorDashboardService";
import { getDoctorAppointments } from "../services/appointmentService";
// import { get } from 'http';

export default function DoctorDashboard() {
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = useState(false);


  const [stats, setStats] = useState({
    today: 0,
    totalPatients: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0
  });

  const [activities, setActivities] = useState<any[]>([]);

  const [appointments, setAppointments] = useState<any[]>([]);

  const chartData: { name: string; patients: number }[] = [];

  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const patientCount: { [key: string]: number } = {};

  appointments.forEach((appointment) => {
    const day = days[new Date(appointment.date).getDay()];
    patientCount[day] = (patientCount[day] || 0) + 1;

  });
    days.forEach((day) => {
      chartData.push({
          name: day,
          patients: patientCount[day] || 0,
      });
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);
  useEffect(() => {
  if (user) {
    fetchDashboardStats();
    fetchAppointments();
  }
  }, [user]);

async function fetchDashboardStats() {

  if (!user) return;
  try {
    const data = await getDashboardStats(user.uid);
    console.log("Dashboard Stats:", data);
    setStats(data);
    const recentActivities = await getRecentActivities(user.uid);
    setActivities(recentActivities);

  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
}
async function fetchAppointments(){

  if(!user) return;
  try{
    const data = await getDoctorAppointments(user.uid);
    console.table(
      data.map((a: any) => ({
        patientId: a.patientId,
        patientName: a.patientName,
        doctorId: a.doctorId,
      }))
    );
    console.log(data);
    setAppointments(data);
  }catch(error){
    console.error("Error fetching appointments:", error);
  }
}

const today = new Date().toISOString().split("T")[0];

const todayAppointments = appointments.filter(
    (appointment) => appointment.date === today
  );
const dashboardCards = [
  {
    label: "Today",
    value: stats.today,
    icon: Calendar,
    color: "bg-blue-50 text-blue-600",
  },
  {
    label: "Total Patients",
    value: stats.totalPatients,
    icon: Users,
    color: "bg-green-50 text-green-600",
  },
  {
    label: "Pending",
    value: stats.pending,
    icon: AlertCircle,
    color: "bg-orange-50 text-orange-600",
  },
  {
    label: "Confirmed",
    value: stats.confirmed,
    icon: CheckCircle,
    color: "bg-purple-50 text-purple-600",
  },
    {
    label: "Cancelled",
    value: stats.cancelled,
    icon: XCircle,
    color: "bg-purple-50 text-purple-600",
  },

  

];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-stone-900">Welcome back, {user?.displayName}</h1>
          <p className="text-stone-500 font-sans">You have {stats.today} appointment{stats.today !== 1 ? "s" : ""} scheduled for today.</p>
        </div>
        <div className="flex gap-4">
          <button className="px-6 py-3 border border-stone-200 text-stone-600 rounded-xl hover:bg-stone-50 transition-colors text-sm font-sans" onClick={() => navigate("/doctor/appointments")}>
            View Schedule 
          </button>
          <button className="px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors flex items-center gap-2 text-sm font-sans" onClick={() => navigate("/doctor/diagnoses")}>
            <Activity className="w-4 h-4" />
            Start Consultation
          </button>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {dashboardCards.map((stat) => (
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
              <h2 className="text-xl font-serif text-stone-900">Today's Appointments</h2>
              <Link to="/doctor/appointments" className="text-sm text-stone-400 hover:text-stone-900 transition-colors">View Full List</Link>
            </div>
             <div className="space-y-4">
                {todayAppointments.length === 0 ? (
                  <p className="text-center text-stone-400">
                    No appointments for today.
                  </p>
                ) : (
                  todayAppointments.map((app) => (
                    <PatientAppointmentCard
                      key={app.id}
                      patient={app.patientName}
                      age="-"
                      time={app.timeSlot}
                      symptoms={app.symptoms || "No symptoms"}
                      status={app.status}
                    />
                  ))
                )}
             </div>
          </section>

          <section className="bg-white border border-stone-100 rounded-3xl p-8">
            <h2 className="text-xl font-serif text-stone-900 mb-8">Patient Growth</h2>
            <div className="h-64 w-full min-w-0">
              {isMounted && (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={100}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                    <YAxis axisLine={false} tickLine={false} allowDecimals={false} tick={{ fontSize: 12, fill: '#a8a29e' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      cursor={{ fill: '#f5f2ed' }}
                    />
                    <Bar dataKey="patients" fill="#1c1917" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-stone-900 text-white rounded-3xl p-8">
            <h2 className="text-xl font-serif mb-6">Quick Actions</h2>
            <div className="space-y-4">
              <QuickAction icon={Activity} label="AI Diagnosis Tool" light onClick={() => navigate("/doctor/diagnoses")}/>
              <QuickAction icon={Users} label="Manage Patients" dark onClick={() => navigate("/doctor/patients")}/>
              <QuickAction icon={Clock} label="Update Availability" dark onClick={() => navigate("/doctor/profile")}/>
            </div>
          </section>

          <section className="bg-white border border-stone-100 rounded-3xl p-8">
            <h2 className="text-xl font-serif text-stone-900 mb-6">Recent Activity</h2>
            <div className="space-y-6">
              {activities.map((activity) => (
                <ActivityItem
                  key={activity.id}
                  title={activity.title}
                  desc={activity.desc}
                  time={activity.time}
                />
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function PatientAppointmentCard({ patient, age, time, symptoms, status }: any) {
  return (
    <div className="flex items-center justify-between p-6 border border-stone-50 rounded-2xl hover:bg-stone-50 transition-colors group">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-medium text-stone-900">{patient}, {age}</h4>
          <p className="text-xs text-stone-400 line-clamp-1">{symptoms}</p>
        </div>
      </div>
      <div className="text-right flex items-center gap-8">
        <div className="hidden md:block">
          <div className="flex items-center gap-2 text-sm text-stone-600">
            <Clock className="w-3.5 h-3.5" />
            {time}
          </div>
        </div>
        <span
            className={cn(
              "px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-bold",
              status === "pending"
                ? "bg-orange-50 text-orange-600"
                : status === "confirmed"
                ? "bg-green-50 text-green-600"
                : status === "cancelled"
                ? "bg-red-50 text-red-600"
                : "bg-blue-50 text-blue-600"
            )}
          >
          {status}
        </span>
        <button className="p-2 bg-stone-900 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-all">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}


function QuickAction({ icon: Icon, label, dark, onClick}: any) {
  return (
    <button onClick={onClick} className={cn(
      "flex items-center gap-3 p-4 rounded-2xl transition-all text-left w-full group",
      dark 
        ? "bg-white/5 hover:bg-white/10 text-white" 
        : "border border-stone-50 hover:bg-stone-50 text-stone-600"
    )}>
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
        dark ? "bg-white/10 text-white" : "bg-stone-50 text-stone-400 group-hover:text-stone-900"
      )}>
        <Icon className="w-5 h-5" />
      </div>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
}

function ActivityItem({ title, desc, time }: any) {
  return (
    <div className="flex gap-4">
      <div className="w-2 h-2 bg-stone-900 rounded-full mt-2 shrink-0" />
      <div>
        <h4 className="text-sm font-medium text-stone-900">{title}</h4>
        <p className="text-xs text-stone-400 mb-1">{desc}</p>
        <p className="text-[10px] uppercase tracking-widest text-stone-300">{time}</p>
      </div>
    </div>
  );
}
