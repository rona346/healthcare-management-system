import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'motion/react';
import { BrainCircuit, Stethoscope, AlertCircle, ArrowRight, Loader2, ClipboardList, Send } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';
import { db } from '../firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp, query, where, getDocs,} from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import {  useNavigate, useSearchParams } from 'react-router-dom';

export default function DiagnosisSystem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const patientId = searchParams.get('patientId');
  const [patientName, setPatientName] = useState('');
  const [patients, setPatients] = useState<any[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [showPrescriptionForm, setShowPrescriptionForm] = useState(false);
  const [medicineName, setMedicineName] = useState('');
  const [dosage, setDosage] = useState('');
  const [duration, setDuration] = useState('');
  const [notes, setNotes] = useState('');
  const [savingPrescription, setSavingPrescription] = useState(false);
  useEffect(() => {
  if (!patientId) return;

  const loadPatient = async () => {
    try {
      const patientDoc = await getDoc(doc(db, 'users', patientId));

      if (patientDoc.exists()) {
        const data = patientDoc.data();
        setPatientName(data.displayName || 'Patient');
      }
    } catch (error) {
      console.error('Error loading patient:', error);
    }
  };

  loadPatient();
}, [patientId]);
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string | null>(null);

  useEffect(() => {
  const loadPatients = async () => {
    if (!user || user.role !== 'doctor') return;

    try {
      const q = query(
        collection(db, 'users'),
        where('role', '==', 'patient')
      );

      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((patientDoc) => ({
        id: patientDoc.id,
        ...patientDoc.data(),
      }));

      setPatients(data);
    } catch (error) {
      console.error('Error loading patients:', error);
    }
  };

  loadPatients();
}, [user]);

const handlePatientSelect = (id: string) => {
  if (!id) return;

  setSelectedPatientId(id);
  navigate(`/doctor/diagnoses?patientId=${id}`);
};
  const handleAnalyze = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    const response = await fetch("/api/diagnosis", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ symptoms }),
    });

    const data = await response.json();

    setSuggestions(data.result || "No suggestions found.");
        setLoading(false);
  };
  
  const handleSavePrescription = async () => {
    if (!user || !patientId) return;

    if (!medicineName.trim() || !dosage.trim() || !duration.trim()) {
      alert('Please fill Medicine Name, Dosage and Duration.');
      return;
    }

    setSavingPrescription(true);

    try {
      await addDoc(collection(db, 'prescriptions'), {
        patientId,
        patientName: patientName || 'Patient',
        doctorId: user.uid,
        doctorName: user.displayName || 'Doctor',
        createdAt: serverTimestamp(),
        medicines: [
          {
            name: medicineName.trim(),
            dosage: dosage.trim(),
            duration: duration.trim(),
          },
        ],
        notes: notes.trim(),
      });

      alert('Prescription saved successfully!');

      setMedicineName('');
      setDosage('');
      setDuration('');
      setNotes('');
      setShowPrescriptionForm(false);
    } catch (error) {
      console.error('Error saving prescription:', error);

      handleFirestoreError(
        error,
        OperationType.WRITE,
        'prescriptions'
      );
    } finally {
      setSavingPrescription(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <header className="text-center space-y-4">
        <div className="w-16 h-16 bg-stone-900 rounded-2xl flex items-center justify-center text-white mx-auto shadow-xl">
          <BrainCircuit className="w-8 h-8" />
        </div>
        {!patientId && user?.role === 'doctor' && (
          <div className="max-w-md mx-auto">
            <label className="block text-xs uppercase tracking-widest text-stone-400 font-bold mb-2">
              Select Patient
            </label>

            <select
              value={selectedPatientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-stone-100 rounded-xl text-sm outline-none focus:ring-2 focus:ring-stone-200"
            >
              <option value="">Choose a patient...</option>

              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.displayName || patient.email}
                </option>
              ))}
            </select>
          </div>
        )}
        {patientId && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-stone-100 rounded-xl text-sm text-stone-600">
            Patient:
            <span className="font-medium text-stone-900">
              {patientName || 'Loading...'}
            </span>
          </div>
        )}
        <h1 className="text-4xl font-serif text-stone-900">AI Diagnosis Assistant</h1>
        <p className="text-stone-500 max-w-xl mx-auto font-sans">
          Input patient symptoms for AI-powered diagnostic suggestions and clinical guidance.
        </p>
      </header>

      <div className="grid md:grid-cols-1 gap-8">
        <section className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm">
          <div className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-400 font-bold mb-4">
                Patient Symptoms & Medical History
              </label>
              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="Describe symptoms in detail (e.g., duration, severity, associated pain, etc.)"
                className="w-full h-48 p-6 bg-stone-50 border-none rounded-2xl text-stone-900 focus:ring-2 focus:ring-stone-200 outline-none resize-none font-sans leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-stone-400 text-xs italic">
                <AlertCircle className="w-4 h-4" />
                <span>AI suggestions are for guidance only. Doctor's final authority is required.</span>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={loading || !symptoms.trim()}
                className="px-8 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-sans"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <BrainCircuit className="w-4 h-4" />
                    Analyze Symptoms
                  </>
                )}
              </button>
            </div>
          </div>
        </section>

        {suggestions && (
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-stone-900 text-white rounded-3xl p-12 shadow-2xl relative overflow-hidden"
          >
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <h2 className="text-2xl font-serif">AI Diagnostic Suggestions</h2>
              </div>
              
              <div className="prose prose-invert max-w-none font-sans leading-relaxed text-stone-300">
                <ReactMarkdown>{suggestions}</ReactMarkdown>
              </div>

              {user?.role === 'doctor' && (
                <div className="mt-12 pt-12 border-t border-white/10 flex flex-col md:flex-row gap-6 items-center justify-between">
                  <p className="text-sm text-stone-400 italic">
                    Would you like to proceed with this diagnosis and generate a prescription?
                  </p>
                  <button 
                  onClick={() => setShowPrescriptionForm(true)}
                  className="px-8 py-3 bg-white text-stone-900 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-2 font-bold text-sm">
                    Proceed to Prescription
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <BrainCircuit className="absolute -bottom-12 -right-12 w-64 h-64 text-white/5" />
          </motion.section>
        )}

        {showPrescriptionForm && (
          <div className="mt-8 bg-white text-stone-900 rounded-3xl p-8">
            <h2 className="text-2xl font-serif mb-4">
              Create Prescription for {patientName || 'Patient'}
            </h2>

           <div className="space-y-6">

            <div>
              <label className="block text-xs uppercase tracking-widest text-stone-400 font-bold mb-2">
                Medicine Name
              </label>
              <input
                type="text"
                value={medicineName}
                onChange={(e) => setMedicineName(e.target.value)}
                placeholder="e.g. Paracetamol"
                className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-stone-200"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">

              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-400 font-bold mb-2">
                  Dosage
                </label>
                <input
                  type="text"
                  value={dosage}
                  onChange={(e) => setDosage(e.target.value)}
                  placeholder="e.g. 500mg twice daily"
                  className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-stone-200"
                />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest text-stone-400 font-bold mb-2">
                    Duration
                  </label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 5 days"
                    className="w-full px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-stone-200"
                  />
                </div>

              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-stone-400 font-bold mb-2">
                  Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional instructions..."
                  className="w-full h-28 px-4 py-3 bg-stone-50 rounded-xl outline-none focus:ring-2 focus:ring-stone-200 resize-none"
                />
              </div>

              <button
                type="button"
                onClick={handleSavePrescription}
                disabled={savingPrescription}
                className="px-6 py-3 bg-stone-900 text-white rounded-xl hover:bg-stone-800 transition-colors"
              >
                {savingPrescription ? 'Saving...' : 'Save Prescription'}
              </button>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}
