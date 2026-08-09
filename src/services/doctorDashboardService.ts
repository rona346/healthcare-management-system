import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

import { formatDistanceToNow } from "date-fns";

import { db } from "../firebase";

export async function getDashboardStats(doctorId: string) {
  try {
    // Query
    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId)
    );

    // Fetch Data
    const snapshot = await getDocs(q);

    const appointments = snapshot.docs.map((doc) => doc.data());
    console.log("Dashboard Appointments:", appointments);
    console.table(
        appointments.map(a => ({
          patientId: a.patientId,
          patientName: a.patientName,
          doctorId: a.doctorId,
        }))
      );

    console.log(
  "Unique Patient IDs:",
  [...new Set(appointments.map((a: any) => a.patientId))]
);
    
    const today = new Date().toISOString().split("T")[0];

    // Dashboard Stats
    const todayCount = appointments.filter(
      (appointment) => appointment.date === today
    ).length;

    const pendingCount = appointments.filter(
      (appointment) => appointment.status === "pending"
    ).length;

    const confirmedCount = appointments.filter(
      (appointment) => appointment.status === "confirmed"
      // Agar tumhare database me "completed" hai to usko use karna.
    ).length;

    const cancelledCount = appointments.filter(
      (appointment) => appointment.status === "cancelled"
    ).length;

    const totalPatients = new Set(
      appointments.map((appointment) => appointment.patientId)
    ).size;


  return {
      today: todayCount,
      pending: pendingCount,
      confirmed: confirmedCount,
      cancelled: cancelledCount,
      totalPatients,
    };
  } catch (error) {
    throw error;
  }
}

export async function getRecentActivities(doctorId: string) {
  try {
    const q = query(
      collection(db, "appointments"),
      where("doctorId", "==", doctorId),
      orderBy("createdAt", "desc"),
      limit(5)
    );

    const snapshot = await getDocs(q);

    const activities = snapshot.docs.map((doc) => {
      const appointment = doc.data();

      let title = "Appointment";

      switch (appointment.status) {
        case "confirmed":
          title = "Appointment Confirmed";
          break;

        case "pending":
          title = "New Appointment";
          break;

        case "cancelled":
          title = "Appointment Cancelled";
          break;

        case "completed":
          title = "Consultation Completed";
          break;

        default:
          title = "Appointment Updated";
      }

      return {
        id: doc.id,
        title,
        desc: appointment.patientName,
        time: appointment.createdAt
          ? formatDistanceToNow(new Date(appointment.createdAt), {
              addSuffix: true,
            })
          : "Recently",
      };
    });

    return activities;
  } catch (error) {
    console.error("Recent Activity Error:", error);
    return [];
  }
}