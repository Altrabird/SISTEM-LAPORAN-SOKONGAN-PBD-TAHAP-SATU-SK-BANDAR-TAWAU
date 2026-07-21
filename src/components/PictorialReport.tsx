import { ActivityLog, AppSettings, isAssessed, tpGain, defaultOfficer } from '../types';
import { useResolvedImages } from '../lib/useResolvedImages';
import { TAHAP_PENGUASAAN_DESCS } from '../data';
import {
  Printer,
  ChevronLeft,
  Info
} from 'lucide-react';

interface PictorialReportProps {
  activity: ActivityLog;
  onBack: () => void;
  schoolName?: string;
  settings?: AppSettings;
}

export default function PictorialReport({
  activity,
  onBack,
  schoolName = 'SK BANDAR TAWAU',
  settings
}: PictorialReportProps) {
  // Pegawai penandatangan diambil daripada tetapan sekolah supaya blok
  // tandatangan tidak perlu ditaip semula pada setiap laporan.
  const penyemak = defaultOfficer(settings?.penyemakList);
  const isBM = activity.subject === 'BM';

  // Gambar disimpan dalam IndexedDB — selesaikan rujukan sebelum dipaparkan/dicetak.
  const photoUrls = useResolvedImages(activity.images);

  // Statistik impak dikira daripada TP Selepas yang telah dinilai sahaja.
  const totalStudents = activity.students.length;
  const assessedStudents = activity.students.filter(isAssessed);
  const improvedStudents = assessedStudents.filter(s => (tpGain(s) ?? 0) > 0);
  const improvedCount = improvedStudents.length;
  const improvementRate = assessedStudents.length > 0
    ? Math.round((improvedCount / assessedStudents.length) * 100)
    : 0;

  // Handle printing
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      
      {/* Interactive Controls Bar - Hidden on print */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/8 pb-5 print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted transition hover:text-bright cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
          Kembali ke Senarai
        </button>

        <button onClick={handlePrint} className="btn-primary !px-5 !py-2.5 !text-sm">
          <Printer className="h-4 w-4" />
          Cetak / Simpan PDF
        </button>
      </div>

      {/* Nota cetakan — tersembunyi semasa mencetak */}
      <div className="glass-inset flex gap-3 p-4 text-xs leading-relaxed text-soft print:hidden">
        <Info className="mt-0.5 h-5 w-5 shrink-0 text-lime-core" />
        <div>
          <span className="font-bold text-bright">Tips mencetak:</span> pilih{' '}
          <span className="font-bold text-lime-core">Save as PDF</span> dalam dialog pencetak
          untuk menyimpan laporan secara digital. Laporan sengaja dicetak hitam atas putih —
          tema gelap adalah untuk skrin sahaja, dan mencetaknya akan membazir dakwat serta
          menghasilkan dokumen rasmi yang sukar dibaca.
        </div>
      </div>

      {/* A4 Printable Layout Container */}
      <div 
        id="printable-report-card" 
        className="mx-auto max-w-[800px] border border-gray-200 bg-white p-8 md:p-12 shadow-md rounded-2xl print:shadow-none print:border-none print:p-0 print:max-w-none"
      >
        {/* School Document Header */}
        <div className="text-center space-y-2 border-b-2 border-double border-gray-900 pb-6 mb-6">
          <h2 className="text-xl md:text-2xl font-bold uppercase tracking-tight text-gray-950 font-display">
            {schoolName}
          </h2>
          <h3 className="text-sm font-bold uppercase tracking-widest text-gray-700">
            LAPORAN AKTIVITI SOKONGAN PBD TAHAP 1
          </h3>
          <p className="text-xs text-gray-500 font-medium font-mono">
            Siri Laporan Bersepadu • BM & BI Akademik • Tahun 2026
          </p>
        </div>

        {/* 1. Administrative Table */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-l-4 border-gray-900 pl-2">
            1. Butiran Am & Sesi Pembelajaran
          </h4>
          
          <table className="w-full text-xs border-collapse border border-gray-900 text-left">
            <tbody>
              <tr className="border-b border-gray-900">
                <th className="w-1/3 bg-gray-50 p-2.5 font-bold border-r border-gray-900">Kumpulan Guru</th>
                <td className="p-2.5 border-r border-gray-900">{activity.groupName}</td>
                <th className="w-1/4 bg-gray-50 p-2.5 font-bold border-r border-gray-900">Tarikh</th>
                <td className="p-2.5">{activity.date}</td>
              </tr>
              <tr className="border-b border-gray-900">
                <th className="bg-gray-50 p-2.5 font-bold border-r border-gray-900">Guru Bertugas Utama</th>
                <td className="p-2.5 border-r border-gray-900">{activity.teacherOnDuty}</td>
                <th className="bg-gray-50 p-2.5 font-bold border-r border-gray-900">Hari</th>
                <td className="p-2.5">{activity.day}</td>
              </tr>
              <tr className="border-b border-gray-900">
                <th className="bg-gray-50 p-2.5 font-bold border-r border-gray-900">Kelas Terlibat</th>
                <td className="p-2.5 border-r border-gray-900 font-bold">{activity.className}</td>
                <th className="bg-gray-50 p-2.5 font-bold border-r border-gray-900">Subjek Akademik</th>
                <td className="p-2.5 font-bold">
                  {isBM ? 'Bahasa Melayu (BM)' : 'Bahasa Inggeris (BI)'}
                </td>
              </tr>
              <tr className="border-b border-gray-900">
                <th className="bg-gray-50 p-2.5 font-bold border-r border-gray-900">Nama Aktiviti</th>
                <td className="p-2.5 border-r border-gray-900 font-semibold" colSpan={3}>
                  {activity.activityName}
                </td>
              </tr>
              <tr>
                <th className="bg-gray-50 p-2.5 font-bold border-r border-gray-900">Guru Subjek Terlibat</th>
                <td className="p-2.5 border-r border-gray-900" colSpan={3}>
                  {activity.subjectTeacher}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* 2. Activity Description */}
        <div className="space-y-3 mt-6">
          <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-l-4 border-gray-900 pl-2">
            2. Deskripsi Pelaksanaan Aktiviti
          </h4>
          <div className="p-4 border border-gray-900 rounded-lg bg-gray-50/20 text-xs leading-relaxed text-gray-800">
            {activity.activityDesc}
          </div>
        </div>

        {/* 3. Student Roster and TPs */}
        <div className="space-y-3 mt-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-l-4 border-gray-900 pl-2">
              3. Prestasi & Perkembangan Tahap Penguasaan (TP) Murid
            </h4>
            <span className="text-[10px] font-mono font-bold bg-gray-100 border border-gray-300 px-2 py-0.5 rounded text-gray-800 print:border-gray-900">
              Kadar Kejayaan: {improvementRate}%
            </span>
          </div>

          <table className="w-full text-xs border-collapse border border-gray-900 text-left">
            <thead>
              <tr className="bg-gray-100 border-b border-gray-900 font-bold text-gray-900">
                <th className="w-12 text-center p-2 border-r border-gray-900">Bil.</th>
                <th className="p-2 border-r border-gray-900">Nama Murid</th>
                <th className="w-20 text-center p-2 border-r border-gray-900">TP Sebelum</th>
                <th className="w-20 text-center p-2 border-r border-gray-900">TP Sasaran</th>
                <th className="w-20 text-center p-2 border-r border-gray-900">TP Selepas</th>
                <th className="w-28 text-center p-2 border-r border-gray-900">Status Impak</th>
                <th className="p-2">Catatan Perkembangan Individu</th>
              </tr>
            </thead>
            <tbody>
              {activity.students.map((student, idx) => {
                // Status impak hanya boleh diisytiharkan selepas guru menilai murid.
                const dinilai = isAssessed(student);
                const kenaikan = tpGain(student);
                return (
                  <tr key={student.id} className="border-b border-gray-900 last:border-b-0">
                    <td className="text-center p-2 border-r border-gray-900 font-medium">{idx + 1}</td>
                    <td className="p-2 border-r border-gray-900 font-semibold text-gray-950">{student.name}</td>
                    <td className="text-center p-2 border-r border-gray-900 font-bold text-gray-500">TP {student.currentTp}</td>
                    <td className="text-center p-2 border-r border-gray-900 text-gray-500">TP {student.targetTp}</td>
                    <td className="text-center p-2 border-r border-gray-900 font-bold text-indigo-800">
                      {dinilai ? `TP ${student.tpAfter}` : '—'}
                    </td>
                    <td className="text-center p-2 border-r border-gray-900 font-semibold">
                      {!dinilai ? (
                        <span className="inline-flex rounded bg-amber-50 border border-amber-300 px-1.5 py-0.5 text-[9px] text-amber-800 print:bg-white print:border-gray-900 print:text-black">
                          Belum dinilai
                        </span>
                      ) : (kenaikan ?? 0) > 0 ? (
                        <span className="inline-flex rounded bg-emerald-50 border border-emerald-300 px-1.5 py-0.5 text-[9px] text-emerald-800 print:bg-white print:border-gray-900 print:text-black">
                          Meningkat +{kenaikan} ▲
                        </span>
                      ) : (kenaikan ?? 0) < 0 ? (
                        <span className="inline-flex rounded bg-red-50 border border-red-300 px-1.5 py-0.5 text-[9px] text-red-800 print:bg-white print:border-gray-900 print:text-black">
                          Menurun {kenaikan} ▼
                        </span>
                      ) : (
                        <span className="inline-flex rounded bg-gray-50 border border-gray-200 px-1.5 py-0.5 text-[9px] text-gray-600 print:bg-white print:border-gray-900 print:text-black">
                          Mengekalkan •
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-gray-700 italic">{student.notes || '-'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. Photo Gallery (Laporan Bergambar) */}
        {activity.images && activity.images.length > 0 && (
          <div className="space-y-4 mt-6 page-break-before">
            <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-l-4 border-gray-900 pl-2">
              4. Dokumentasi Bergambar Aktiviti Sokongan PBD
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              {photoUrls.map((img, idx) => (
                <div key={idx} className="border border-gray-900 p-2 rounded-lg space-y-2 flex flex-col justify-between">
                  <div className="aspect-video w-full rounded overflow-hidden bg-gray-100 border border-gray-200">
                    <img
                      src={img}
                      alt={`Dokumentasi ${idx + 1}: ${activity.imageCaptions?.[idx] || activity.activityName}`}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <p className="text-[10px] text-center italic text-gray-700 font-medium px-1">
                    Foto {idx + 1}: {activity.imageCaptions?.[idx] || 'Sesi aktiviti sokongan murid.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 5. Overall Notes / Reflection */}
        {activity.notes && (
          <div className="space-y-3 mt-6">
            <h4 className="text-xs font-bold text-gray-950 uppercase tracking-wider border-l-4 border-gray-900 pl-2">
              5. Rumusan Impak & Refleksi Keseluruhan
            </h4>
            <div className="p-4 border border-gray-900 rounded-lg bg-gray-50/20 text-xs leading-relaxed text-gray-800 italic">
              "{activity.notes}"
            </div>
          </div>
        )}

        {/* 6. Signature Validation Block */}
        <div className="mt-12 pt-8 border-t border-gray-200 grid grid-cols-2 gap-12 text-xs">
          <div className="space-y-12">
            <div className="space-y-1">
              <p>Disediakan oleh,</p>
              <p className="font-mono text-[9px] text-gray-400">Tandatangan & Tarikh</p>
            </div>
            <div className="space-y-0.5 border-t border-gray-900 w-4/5 pt-1">
              <p className="font-bold uppercase">{activity.teacherOnDuty}</p>
              <p className="text-gray-500">Guru Bertugas Kumpulan {activity.groupName}</p>
            </div>
          </div>

          <div className="space-y-12">
            <div className="space-y-1">
              <p>Disemak dan Disahkan oleh,</p>
              <p className="font-mono text-[9px] text-gray-400">Tandatangan &amp; Tarikh</p>
            </div>
            <div className="space-y-0.5 border-t border-gray-900 w-4/5 pt-1">
              {/*
                Nama penyemak dahulunya dikodkan keras di sini — termasuk salah
                taip "SAMSIAN SUNDU" yang tercetak pada setiap laporan rasmi.
                Kini diambil daripada senarai penyemak dalam Tetapan & Admin.
              */}
              <p className="font-bold uppercase">{penyemak?.name || '—'}</p>
              <p className="text-gray-500">{penyemak?.position || 'Pentadbir Sekolah'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
