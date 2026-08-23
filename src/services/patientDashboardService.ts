import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";

import { db } from "../firebase";

import {
  handleFirestoreError,
  OperationType,
} from "../lib/firestore-errors";

export const getPatientDashboardStats = async (userId: string) => {
  try {
    const appointmentsQuery = query(
      collection(db, "appointments"),
      where("patientId", "==", userId)
    );

    const notificationsQuery = query(
      collection(db, "notifications"),
      where("userId", "==", userId)
    );

    const diagnosesQuery = query(
      collection(db, "diagnoses"),
      where("patientId", "==", userId)
    );

    const prescriptionsQuery = query(
      collection(db, "prescriptions"),
      where("patientId", "==", userId)
    );

    const [appointmentsSnapshot, notificationsSnapshot, diagnosesSnapshot, prescriptionsSnapshot] =
      await Promise.all([
        getDocs(appointmentsQuery),
        getDocs(notificationsQuery),
        getDocs(diagnosesQuery),
        getDocs(prescriptionsQuery),
      ]);

    return {
      upcoming: appointmentsSnapshot.size,
      diagnoses: 0,
      prescriptions: prescriptionsSnapshot.size,
      messages: notificationsSnapshot.size,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "dashboard");
    return {
      upcoming: 0,
      diagnoses: 0,
      prescriptions: 0,
      messages: 0,
    };
  }
};

export const getUpcomingAppointments = async (userId: string) => {
  try {
    const q = query(
      collection(db, "appointments"),
      where("patientId", "==", userId),
      orderBy("date", "asc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, "appointments");
    return [];
  }
};