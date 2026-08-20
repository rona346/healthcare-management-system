import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { UserRound, Search, Loader2, Mail, Calendar, ArrowRight } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import { useNavigate } from 'react-router-dom';

export default function DoctorPatients() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (user) fetchPatients();
  }, [user]);

  const fetchPatients = async () => {
    try {
      // In a real app, we'd query appointments to find patients assigned to this doctor
      // For this demo, we'll fetch all patients
      const q = query(collection(db, 'users'), where('role', '==', 'patient'));
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPatients(docs);
      setLoading(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'users');
    }
  };

  const filteredPatients = patients.filter(p => 
    p.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-serif text-stone-900">My Patients</h1>
        <p className="text-stone-500 font-sans">View and manage your assigned patients.</p>
      </header>

      <div className="bg-white border border-stone-100 rounded-3xl p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <input 
              type="text" 
              placeholder="Search by name or email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-stone-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-stone-200 outline-none w-full"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs uppercase tracking-widest text-stone-400 border-b border-stone-50">
                <th className="pb-4 font-medium">Patient</th>
                <th className="pb-4 font-medium">Contact</th>
                <th className="pb-4 font-medium">Last Visit</th>
                <th className="pb-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-300" />
                  </td>
                </tr>
              ) : filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-stone-400 text-sm">
                    No patients found.
                  </td>
                </tr>
              ) : (
                filteredPatients.map((patient) => (
                  <tr key={patient.uid} className="group hover:bg-stone-50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center text-stone-400">
                          {patient.photoURL ? (
                            <img src={patient.photoURL} alt={patient.displayName} className="w-10 h-10 rounded-full object-cover" referrerPolicy="no-referrer" />
                          ) : (
                            <UserRound className="w-5 h-5" />
                          )}
                        </div>
                        <span className="font-medium text-stone-900">{patient.displayName}</span>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center gap-2 text-xs text-stone-500">
                        <Mail className="w-3 h-3" />
                        {patient.email}
                      </div>
                    </td>
                    <td className="py-4 text-sm text-stone-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-stone-300" />
                        {patient.createdAt ? new Date(patient.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <button 
                        onClick={() =>
                          navigate(`/doctor/diagnoses?patientId=${patient.uid}`)
                        }
                      className="p-2 text-stone-900 hover:bg-stone-100 rounded-lg transition-colors">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
