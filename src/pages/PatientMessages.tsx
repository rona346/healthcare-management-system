import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';

import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';

export default function PatientMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'chats'),
      where('patientId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          console.log('No chat found for patient:', user.uid);
          return;
        }

        const latestChatId = snapshot.docs[0].id;

        navigate(`/patient/chat/${latestChatId}`, {
          replace: true,
        });
      },
      (error) => {
        console.error('Error loading patient chats:', error);
      }
    );

    return () => unsubscribe();
  }, [user, navigate]);

  return (
    <div className="flex items-center justify-center h-[calc(100vh-160px)]">
      <div className="w-8 h-8 border-4 border-stone-300 border-t-stone-900 rounded-full animate-spin" />
    </div>
  );
}