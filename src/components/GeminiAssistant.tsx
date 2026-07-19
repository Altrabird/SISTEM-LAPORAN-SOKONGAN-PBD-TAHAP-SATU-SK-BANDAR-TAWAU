import { useState } from 'react';
import { Sparkles, BrainCircuit, BookOpen, AlertCircle, ArrowRight, HelpCircle, GraduationCap, FileText, CheckCircle } from 'lucide-react';

interface StrategyResponse {
  activityName: string;
  pedagogicalApproach: string;
  detailedSteps: string[];
  teachingMaterials: string[];
  assessmentMethods: string[];
}

export default function GeminiAssistant() {
  const [subject, setSubject] = useState<'BM' | 'BI'>('BM');
  const [topic, setTopic] = useState('Suku kata terbuka (KV)');
  const [currentTp, setCurrentTp] = useState(2);
  const [targetTp, setTargetTp] = useState(3);
  const [studentCount, setStudentCount] = useState(3);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [strategy, setStrategy] = useState<StrategyResponse | null>(null);

  // Suggested Topics based on subject
  const suggestedTopicsBM = [
    'Suku kata terbuka (KVKV)',
    'Mengeja Suku Kata Tertutup (KVK)',
    'Kelancaran Membaca Ayat Tunggal',
    'Kemahiran Bertutur & Main Peranan',
    'Menulis perkataan dengan betul'
  ];

  const suggestedTopicsBI = [
    'Phonics sounds blending (CVC)',
    'Sight Words Recognition',
    'Simple Sentence Construction',
    'Asking & Answering Questions',
    'Vocabulary: Action verbs / Animals'
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setError('');
    setStrategy(null);

    try {
      const response = await fetch('/api/gemini/generate-strategies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          topic,
          currentTp,
          targetTp,
          studentCount,
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Gagal menjana strategi pembelajaran dari Gemini.');
      }

      const data = await response.json();
      setStrategy(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Berlaku ralat semasa menyambung ke pelayan AI.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 inline-flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-indigo-600" />
            Penasihat Pintar & Penjana Intervensi PBD (Gemini AI)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Bantu murid anda melompat dari TP1/TP2 ke tahap TP3/TP4 menggunakan kaedah intervensi berasaskan pedagogi pintar KPM yang dijana AI.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Input Configuration Column */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-5 h-fit">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider border-b border-gray-50 pb-2 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-amber-500" />
            Konfigurasi Kumpulan Murid
          </h3>

          {/* 1. Subject */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Subjek Akademik</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => { setSubject('BM'); setTopic(suggestedTopicsBM[0]); }}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  subject === 'BM'
                    ? 'bg-blue-50 border-blue-400 text-blue-700'
                    : 'bg-gray-50 border-gray-150 text-gray-600 hover:bg-gray-100'
                }`}
              >
                Bahasa Melayu
              </button>
              <button
                type="button"
                onClick={() => { setSubject('BI'); setTopic(suggestedTopicsBI[0]); }}
                className={`py-2 rounded-xl text-xs font-bold border transition ${
                  subject === 'BI'
                    ? 'bg-pink-50 border-pink-400 text-pink-700'
                    : 'bg-gray-50 border-gray-150 text-gray-600 hover:bg-gray-100'
                }`}
              >
                English (BI)
              </button>
            </div>
          </div>

          {/* 2. Topic */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1.5">Fokus / Tajuk Pembelajaran</label>
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Suku kata terbuka KVKV"
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-xs text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
            />
            {/* Suggested topics buttons */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {(subject === 'BM' ? suggestedTopicsBM : suggestedTopicsBI).map((top) => (
                <button
                  key={top}
                  type="button"
                  onClick={() => setTopic(top)}
                  className={`px-2 py-1 rounded bg-gray-50 hover:bg-gray-100 text-[10px] border transition ${
                    topic === top ? 'border-blue-400 text-blue-700 bg-blue-50' : 'border-gray-200 text-gray-500'
                  }`}
                >
                  {top}
                </button>
              ))}
            </div>
          </div>

          {/* 3. Current TP vs Target TP */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">TP Semasa Murid</label>
              <select
                value={currentTp}
                onChange={(e) => setCurrentTp(parseInt(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-800 focus:outline-none"
              >
                <option value={1}>TP 1 (Sangat Terhad)</option>
                <option value={2}>TP 2 (Terhad)</option>
                <option value={3}>TP 3 (Memuaskan)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Sasaran TP Selepas</label>
              <select
                value={targetTp}
                onChange={(e) => setTargetTp(parseInt(e.target.value))}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-800 focus:outline-none"
              >
                <option value={2}>TP 2 (Terhad)</option>
                <option value={3}>TP 3 (Memuaskan)</option>
                <option value={4}>TP 4 (Baik)</option>
              </select>
            </div>
          </div>

          {/* 4. Student Count */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Bilangan Murid Terlibat</label>
            <input
              type="number"
              min={1}
              max={20}
              value={studentCount}
              onChange={(e) => setStudentCount(parseInt(e.target.value) || 1)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-800 focus:outline-none"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-xs font-bold text-white shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Menganalisis & Menjana...
              </>
            ) : (
              <>
                <BrainCircuit className="h-4.5 w-4.5" />
                Jana Strategi Intervensi
              </>
            )}
          </button>
        </div>

        {/* Right Output Display Column */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="rounded-2xl border border-gray-150 bg-white p-12 text-center shadow-sm space-y-4 flex flex-col items-center justify-center min-h-[400px]">
              <div className="relative">
                <div className="animate-ping absolute inline-flex h-12 w-12 rounded-full bg-blue-100 opacity-75"></div>
                <div className="relative rounded-full bg-blue-50 p-4 text-blue-600">
                  <Sparkles className="h-8 w-8 animate-spin" />
                </div>
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="font-bold text-gray-900 text-sm">Gemini Sedang Merumus Pedagogi...</h4>
                <p className="text-xs text-gray-400 leading-relaxed">
                  Kami sedang menganalisis sasaran Tahap Penguasaan (TP) murid anda untuk subjek {subject === 'BM' ? 'Bahasa Melayu' : 'Bahasa Inggeris'}. Gemini akan merangka modul sokongan interaktif yang mudah dilaksanakan oleh Guru Bertugas.
                </p>
              </div>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm flex gap-4 text-xs text-red-800">
              <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
              <div className="space-y-1">
                <span className="font-bold">Gagal Berhubung dengan AI:</span>
                <p className="leading-relaxed">{error}</p>
                <p className="font-mono text-[10px] text-red-500 mt-2">
                  Tips: Sila pastikan anda mempunyai kunci rahsia <strong>GEMINI_API_KEY</strong> dalam tab Secrets atau pastikan dev server menyokong API ini.
                </p>
              </div>
            </div>
          ) : strategy ? (
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-6 animate-fade-in">
              {/* Strategy Header */}
              <div className="border-b border-gray-50 pb-4 space-y-1">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 border border-indigo-150 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 uppercase">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Cadangan Pendekatan: {strategy.pedagogicalApproach}
                </div>
                <h3 className="text-lg font-bold text-indigo-950 font-display mt-2">
                  Modul Sokongan: {strategy.activityName}
                </h3>
              </div>

              {/* Steps Area */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-indigo-600" />
                  Langkah Pelaksanaan (Mesra Tahap 1)
                </h4>
                <div className="space-y-2.5">
                  {strategy.detailedSteps.map((step, idx) => (
                    <div key={idx} className="flex gap-3 text-xs leading-relaxed text-gray-700">
                      <span className="h-5 w-5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <p className="pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Two columns: Materials vs Assessment */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                {/* teaching materials */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="h-4 w-4 text-emerald-600" />
                    Bahan Bantu Mengajar (BBM)
                  </h4>
                  <ul className="space-y-1.5">
                    {strategy.teachingMaterials.map((mat, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{mat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* assessment tools */}
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-2.5">
                  <h4 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle className="h-4 w-4 text-blue-600" />
                    Instrumen Pentaksiran (PBD)
                  </h4>
                  <ul className="space-y-1.5">
                    {strategy.assessmentMethods.map((ass, idx) => (
                      <li key={idx} className="text-xs text-gray-600 flex items-start gap-1.5 leading-relaxed">
                        <span className="text-blue-500 font-bold shrink-0 mt-0.5">•</span>
                        <span>{ass}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Practical tips */}
              <div className="rounded-xl bg-indigo-50/40 p-4 border border-indigo-100/50 text-xs text-indigo-900 leading-relaxed">
                <strong>Tips Khas untuk Guru Bertugas:</strong> Memandangkan anda membimbing kumpulan kecil seramai {studentCount} orang, beri fokus kepada bimbingan personal secara giliran bersemuka. Gunakan maklumat di atas untuk menulis pengisian bahagian <span className="font-bold">"Deskripsi Aktiviti"</span> semasa membuat pendaftaran borang aktiviti!
              </div>

            </div>
          ) : (
            <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center shadow-sm flex flex-col items-center justify-center min-h-[400px]">
              <div className="rounded-full bg-indigo-50 p-4 text-indigo-600 mb-4">
                <BrainCircuit className="h-8 w-8 stroke-1.5" />
              </div>
              <h3 className="text-base font-bold text-gray-900">Pembantu Intervensi PBD</h3>
              <p className="text-xs text-gray-500 mt-1 max-w-sm leading-relaxed">
                Sila pilih subjek, tentukan sasaran Tahap Penguasaan murid, dan klik "Jana Strategi Intervensi" untuk melihat modul rancangan pembelajaran interaktif yang bersesuaian dengan Tahap 1.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
