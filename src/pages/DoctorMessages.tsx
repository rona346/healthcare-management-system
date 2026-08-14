import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from 'firebase/firestore';
import { MessageSquare, Loader2, User } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';

type ChatItem = {
  id: string;
  doctorId: string;
  doctorName?: string;
  patientId: string;
  patientName?: string;
  lastMessage?: string;
  updatedAt?: any;
};

export default function DoctorMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [chats, setChats] = useState<ChatItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    const q = query(
      collection(db, 'chats'),
      where('doctorId', '==', user.uid),
      orderBy('updatedAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const chatList = snapshot.docs.map((chatDoc) => ({
          id: chatDoc.id,
          ...chatDoc.data(),
        })) as ChatItem[];

        setChats(chatList);
        setLoading(false);
      },
      (error) => {
        console.error('Error loading doctor chats:', error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-160px)]">
        <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-serif text-stone-900">
          Messages
        </h1>
        <p className="text-stone-500 mt-2">
          Your conversations with patients
        </p>
      </div>

      {chats.length === 0 ? (
        <div className="bg-white border border-stone-100 rounded-3xl p-10 text-center">
          <MessageSquare className="w-10 h-10 mx-auto text-stone-300 mb-4" />
          <h2 className="text-lg font-serif text-stone-900">
            No conversations yet
          </h2>
          <p className="text-sm text-stone-400 mt-2">
            Patient conversations will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {chats.map((chat) => (
            <button
              key={chat.id}
              onClick={() =>
                navigate(`/doctor/messages/${chat.id}`)
              }
              className="w-full bg-white border border-stone-100 rounded-2xl p-5 flex items-center gap-4 text-left hover:bg-stone-50 transition-colors"
            >
              <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                <User className="w-6 h-6" />
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-stone-900">
                  {chat.patientName || 'Patient'}
                </h3>

                <p className="text-sm text-stone-400 truncate mt-1">
                  {chat.lastMessage || 'No messages yet'}
                </p>
              </div>

              <MessageSquare className="w-5 h-5 text-stone-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}