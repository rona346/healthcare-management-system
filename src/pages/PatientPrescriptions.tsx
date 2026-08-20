import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { FileText, Download, Search, Loader2, Calendar, User } from 'lucide-react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../hooks/useAuth';
import { handleFirestoreError, OperationType } from '../lib/firestore-errors';
import jsPDF from 'jspdf';

export default function PatientPrescriptions() {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchPrescriptions();
  }, [user]);

  const fetchPrescriptions = async () => {
    try {
      const q = query(
        collection(db, 'prescriptions'), 
        where('patientId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(q);
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      setPrescriptions(docs);
      setLoading(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, 'prescriptions');
    }
  };
  const handleDownloadPrescription = (pres: any) => {
    const pdf = new jsPDF();

    const createdDate = pres.createdAt?.toDate
      ? pres.createdAt.toDate().toLocaleDateString()
      : 'N/A';

    pdf.setFontSize(20);
    pdf.text('HealthCare OS', 20, 20);

    pdf.setFontSize(14);
    pdf.text('Medical Prescription', 20, 35);

    pdf.setFontSize(11);
    pdf.text(`Prescription ID: ${pres.id}`, 20, 50);
    pdf.text(`Date: ${createdDate}`, 20, 60);
    pdf.text(`Doctor: ${pres.doctorName || 'Doctor'}`, 20, 70);
    pdf.text(`Patient: ${pres.patientName || 'Patient'}`, 20, 80);

    pdf.setFontSize(13);
    pdf.text('Medicines', 20, 100);

    let y = 110;

    pres.medicines?.forEach((med: any, index: number) => {
      pdf.setFontSize(11);
      pdf.text(`${index + 1}. ${med.name}`, 20, y);
      pdf.text(`Dosage: ${med.dosage}`, 30, y + 8);
      pdf.text(`Duration: ${med.duration}`, 30, y + 16);

      y += 30;
    });

    if (pres.notes) {
      pdf.setFontSize(13);
      pdf.text('Notes', 20, y + 5);

      pdf.setFontSize(11);
      pdf.text(pres.notes, 20, y + 15);
    }

    pdf.save(`Prescription-${pres.id.slice(0, 8)}.pdf`);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header>
        <h1 className="text-3xl font-serif text-stone-900">My Prescriptions</h1>
        <p className="text-stone-500 font-sans">View and download your medical prescriptions.</p>
      </header>

      <div className="grid md:grid-cols-2 gap-6">
        {loading ? (
          <div className="col-span-2 py-12 text-center">
            <Loader2 className="w-6 h-6 animate-spin mx-auto text-stone-300" />
          </div>
        ) : prescriptions.length === 0 ? (
          <div className="col-span-2 py-12 text-center text-stone-400 text-sm">
            No prescriptions found.
          </div>
        ) : (
          prescriptions.map((pres) => (
            <motion.div 
              key={pres.id}
              whileHover={{ y: -4 }}
              className="bg-white border border-stone-100 rounded-3xl p-8 shadow-sm"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6" />
                </div>
                <button 
                  onClick={() => handleDownloadPrescription(pres)}
                  className="p-2 text-stone-400 hover:text-stone-900 transition-colors"
                  title="Download prescription"
                >
                    <Download className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-serif text-stone-900">Prescription #{pres.id.slice(0, 8)}</h3>
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <Calendar className="w-3.5 h-3.5" />
                      {pres.createdAt?.toDate
                        ? pres.createdAt.toDate().toLocaleDateString()
                        : 'N/A'}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-400">
                      <User className="w-3.5 h-3.5" />
                       {pres.doctorName || 'Doctor'}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-stone-50">
                  <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-3">Medicines</h4>
                  <div className="space-y-3">
                    {pres.medicines.map((med: any, i: number) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-stone-900">{med.name}</span>
                        <span className="text-stone-500">{med.dosage} • {med.duration}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {pres.notes && (
                  <div className="pt-4 border-t border-stone-50">
                    <h4 className="text-[10px] uppercase tracking-widest text-stone-400 font-bold mb-2">Notes</h4>
                    <p className="text-xs text-stone-500 leading-relaxed">{pres.notes}</p>
                  </div>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
