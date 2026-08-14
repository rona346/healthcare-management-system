import { useState, useEffect, useRef, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp, doc, getDoc, setDoc } from 'firebase/firestore';
import { Message } from '../types';
import { Send, User, Loader2 } from 'lucide-react';
import { cn, formatTime } from '../lib/utils';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useParams } from 'react-router-dom';

export default function Chat() {
  const { user } = useAuth();
  const { chatId } = useParams();

  const [chatDoctorName, setChatDoctorName] = useState('');
  const [chatData, setChatData] = useState<any>(null);

  const doctorId = chatData?.doctorId;
  const patientId = chatData?.patientId;

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!chatId) return;

    const loadChat = async () => {
      try {
        const chatDoc = await getDoc(doc(db, 'chats', chatId));

        if (chatDoc.exists()) {
          const data = chatDoc.data();

          setChatData(data);

          setChatDoctorName(
            user?.role === 'patient'
              ? data.doctorName || 'Doctor'
              : data.patientName || 'Patient'
          );
        } else {
          console.log('Chat document not found:', chatId);
        }
      } catch (error) {
        console.error('Error loading chat:', error);
      }
    };

    loadChat();
  }, [chatId, user]);

  useEffect(() => {
    if (!user || !chatId) return;

    const q = query(
      collection(db, `chats/${chatId}/messages`),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Message[];

        setMessages(msgs);
        setLoading(false);

        setTimeout(() => {
          scrollRef.current?.scrollIntoView({
            behavior: 'smooth',
          });
        }, 100);
      },
      (error) => {
        handleFirestoreError(
          error,
          OperationType.GET,
          `chats/${chatId}/messages`
        );
      }
    );

    return () => unsubscribe();
  }, [user, chatId]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!newMessage.trim() || !user || !chatId || !chatData) return;

    const text = newMessage.trim();
    setNewMessage('');

    try {
      // Update chat metadata
      await setDoc(
        doc(db, 'chats', chatId),
        {
          doctorId: chatData.doctorId,
          doctorName: chatData.doctorName,
          patientId: chatData.patientId,
          patientName: chatData.patientName,
          updatedAt: serverTimestamp(),
          lastMessage: text,
        },
        { merge: true }
      );

      // Save message
      await addDoc(
        collection(db, `chats/${chatId}/messages`),
        {
          chatId,
          senderId: user.uid,
          text,
          timestamp: serverTimestamp(),
        }
      );
    } catch (error) {
      handleFirestoreError(
        error,
        OperationType.WRITE,
        `chats/${chatId}/messages`
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-160px)] flex flex-col bg-white border border-stone-100 rounded-3xl shadow-sm overflow-hidden">
      <header className="p-6 border-b border-stone-50 flex items-center gap-4">
        <div className="w-12 h-12 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
          <User className="w-6 h-6" />
        </div>
        <div>
          <h2 className="font-serif text-lg text-stone-900">
            {chatData ? chatDoctorName : 'Loading...'}
          </h2>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full" />
            <span className="text-[10px] uppercase tracking-widest text-stone-400">Online</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-6 h-6 animate-spin text-stone-300" />
          </div>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className={cn(
                "flex flex-col max-w-[70%]",
                msg.senderId === user?.uid ? "ml-auto items-end" : "mr-auto items-start"
              )}
            >
              <div
                className={cn(
                  "p-4 rounded-2xl text-sm font-sans leading-relaxed",
                  msg.senderId === user?.uid
                    ? "bg-stone-900 text-white rounded-tr-none"
                    : "bg-stone-50 text-stone-900 rounded-tl-none"
                )}
              >
                {msg.text}
              </div>
              <span className="text-[10px] text-stone-300 mt-1 uppercase tracking-widest">
                {msg.timestamp ? formatTime(msg.timestamp) : 'Sending...'}
              </span>
            </div>
          ))
        )}
        <div ref={scrollRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-6 border-t border-stone-50 flex gap-4">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          className="flex-1 px-6 py-3 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-stone-200 outline-none font-sans"
        />
        <button
          type="submit"
          disabled={!newMessage.trim()}
          className="p-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors disabled:opacity-50"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
