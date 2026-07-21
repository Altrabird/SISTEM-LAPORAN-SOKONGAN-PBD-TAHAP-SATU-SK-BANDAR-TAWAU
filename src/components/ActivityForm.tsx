import React, { useState, useEffect } from 'react';
import { ActivityLog, Student } from '../types';
import { compressImage, savePhoto, resolveImages } from '../lib/photoStore';
import {
  AVAILABLE_GROUPS,
  MALAYSIAN_DAYS,
  AVAILABLE_CLASSES,
  COMMON_ACTIVITIES_BM,
  COMMON_ACTIVITIES_BI
} from '../data';
import {
  Trash2,
  Plus,
  Calendar,
  User,
  Check,
  Sparkles,
  Upload,
  X,
  BookOpen
} from 'lucide-react';

interface ActivityFormProps {
  onSave: (activity: ActivityLog) => void;
  initialActivity?: ActivityLog | null;
  onCancel: () => void;
  availableClasses?: string[];
  commonActivitiesBm?: string[];
  commonActivitiesBi?: string[];
}

export default function ActivityForm({
  onSave,
  initialActivity,
  onCancel,
  availableClasses = AVAILABLE_CLASSES,
  commonActivitiesBm = COMMON_ACTIVITIES_BM,
  commonActivitiesBi = COMMON_ACTIVITIES_BI
}: ActivityFormProps) {
  // Main form states
  const [groupName, setGroupName] = useState('Ancala');
  const [customGroupName, setCustomGroupName] = useState('');
  const [isCustomGroup, setIsCustomGroup] = useState(false);

  const [teacherOnDuty, setTeacherOnDuty] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [day, setDay] = useState('Isnin');
  // Kelas lalai diambil daripada senarai tetapan; '3 Kritis' berkod keras
  // akan menghasilkan pilihan tidak sah jika sekolah menukar senarai kelas.
  const [className, setClassName] = useState(availableClasses[0] ?? '');
  const [customClassName, setCustomClassName] = useState('');
  const [isCustomClass, setIsCustomClass] = useState(false);

  const [subject, setSubject] = useState<'BM' | 'BI'>('BM');
  const [activityName, setActivityName] = useState('');
  const [customActivityName, setCustomActivityName] = useState('');
  const [isCustomActivity, setIsCustomActivity] = useState(false);
  const [activityDesc, setActivityDesc] = useState('');
  const [subjectTeacher, setSubjectTeacher] = useState('');
  
  const [notes, setNotes] = useState('');
  /** Rujukan gambar yang akan disimpan bersama rekod ("idb:<id>"). */
  const [images, setImages] = useState<string[]>(['', '', '', '']);
  /** Data URL untuk paparan sahaja — tidak pernah disimpan ke localStorage. */
  const [imagePreviews, setImagePreviews] = useState<string[]>(['', '', '', '']);
  const [imageCaptions, setImageCaptions] = useState<string[]>(['', '', '', '']);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  // Student list state
  const [students, setStudents] = useState<Student[]>([
    { id: 'stud-temp-1', name: '', currentTp: 2, targetTp: 3, notes: '' }
  ]);

  // Handle auto-day detection when date changes
  useEffect(() => {
    if (date) {
      const selectedDate = new Date(date);
      const dayIndex = selectedDate.getDay(); // 0 is Ahad, 1 is Isnin, etc.
      if (dayIndex >= 0 && dayIndex < MALAYSIAN_DAYS.length) {
        setDay(MALAYSIAN_DAYS[dayIndex]);
      }
    }
  }, [date]);

  // Set default values if we are editing an activity
  useEffect(() => {
    if (initialActivity) {
      if (AVAILABLE_GROUPS.includes(initialActivity.groupName)) {
        setGroupName(initialActivity.groupName);
        setIsCustomGroup(false);
      } else {
        setCustomGroupName(initialActivity.groupName);
        setIsCustomGroup(true);
      }
      
      setTeacherOnDuty(initialActivity.teacherOnDuty);
      setDate(initialActivity.date);
      setDay(initialActivity.day);

      if (availableClasses.includes(initialActivity.className)) {
        setClassName(initialActivity.className);
        setIsCustomClass(false);
      } else {
        setCustomClassName(initialActivity.className);
        setIsCustomClass(true);
      }

      setSubject(initialActivity.subject);
      
      const commonActs = initialActivity.subject === 'BM' ? commonActivitiesBm : commonActivitiesBi;
      if (commonActs.includes(initialActivity.activityName)) {
        setActivityName(initialActivity.activityName);
        setIsCustomActivity(false);
      } else {
        setCustomActivityName(initialActivity.activityName);
        setIsCustomActivity(true);
      }

      setActivityDesc(initialActivity.activityDesc);
      setSubjectTeacher(initialActivity.subjectTeacher);
      setNotes(initialActivity.notes);
      setStudents(initialActivity.students);
      
      const loadedImages = ['', '', '', ''];
      const loadedCaptions = ['', '', '', ''];
      if (initialActivity.images) {
        initialActivity.images.forEach((img, i) => {
          if (i < 4) loadedImages[i] = img;
        });
      }
      if (initialActivity.imageCaptions) {
        initialActivity.imageCaptions.forEach((cap, i) => {
          if (i < 4) loadedCaptions[i] = cap;
        });
      }
      setImages(loadedImages);
      setImageCaptions(loadedCaptions);

      // Gambar disimpan sebagai rujukan IndexedDB — muatkan semula untuk pratonton.
      resolveImages(loadedImages)
        .then(setImagePreviews)
        .catch(() => setImagePreviews(loadedImages));
    } else {
      // Set some nice initial defaults for a new record
      setTeacherOnDuty('');
      setSubjectTeacher('');
      setActivityDesc('');
      setNotes('');
      setImages(['', '', '', '']);
      setImagePreviews(['', '', '', '']);
      setImageCaptions(['', '', '', '']);
      setStudents([{ id: 'stud-temp-1', name: '', currentTp: 2, targetTp: 3, notes: '' }]);
      
      // Default activity based on subject
      if (subject === 'BM') {
        setActivityName(commonActivitiesBm[0] || '');
      } else {
        setActivityName(commonActivitiesBi[0] || '');
      }
    }
  }, [initialActivity, availableClasses, commonActivitiesBm, commonActivitiesBi]);

  // Reset default activity selection when subject changes
  const handleSubjectChange = (newSubject: 'BM' | 'BI') => {
    setSubject(newSubject);
    setIsCustomActivity(false);
    if (newSubject === 'BM') {
      setActivityName(commonActivitiesBm[0] || '');
    } else {
      setActivityName(commonActivitiesBi[0] || '');
    }
  };

  // Add a new student to roster
  const addStudent = () => {
    const newId = `stud-temp-${Date.now()}`;
    setStudents([
      ...students,
      { id: newId, name: '', currentTp: 2, targetTp: 3, notes: '' }
    ]);
  };

  // Remove a student from roster
  const removeStudent = (id: string) => {
    if (students.length === 1) {
      alert('Sila tinggalkan sekurang-kurangnya seorang murid dalam senarai.');
      return;
    }
    setStudents(students.filter(s => s.id !== id));
  };

  // Update specific student field
  const updateStudent = (id: string, field: keyof Student, value: any) => {
    setStudents(students.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  /**
   * Muat naik gambar untuk satu slot.
   *
   * Gambar dimampatkan terlebih dahulu (1280px / JPEG q0.72) kemudian disimpan
   * ke IndexedDB. Rekod aktiviti hanya memegang rujukan ringkas, jadi kuota
   * localStorage tidak lagi boleh dilanggar oleh gambar.
   */
  const handleImageSlotChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    e.target.value = ''; // benarkan fail sama dipilih semula

    if (!file.type.startsWith('image/')) {
      alert('Sila pilih fail gambar (JPG atau PNG).');
      return;
    }

    setUploadingSlot(index);
    try {
      const dataUrl = await compressImage(file);
      const ref = await savePhoto(dataUrl);

      setImages(prev => {
        const baharu = [...prev];
        baharu[index] = ref;
        return baharu;
      });
      setImagePreviews(prev => {
        const baharu = [...prev];
        baharu[index] = dataUrl;
        return baharu;
      });

      setImageCaptions(prev => {
        if (prev[index]) return prev;
        const defaultCaptions = [
          'Sesi penerangan awal tajuk dan objektif pembelajaran oleh guru bertugas.',
          'Murid-murid berbincang dan bekerjasama dalam kumpulan kecil.',
          'Bimbingan rapat secara bersemuka (intervensi) diberikan kepada murid sasaran.',
          'Murid membuat simulasi pembentangan hasil tugasan di hadapan kelas.'
        ];
        const baharu = [...prev];
        baharu[index] = defaultCaptions[index] ?? '';
        return baharu;
      });
    } catch (err: any) {
      console.error('Muat naik gambar gagal', err);
      alert(`Gambar tidak dapat diproses: ${err?.message || err}`);
    } finally {
      setUploadingSlot(null);
    }
  };

  const removeImageSlot = (index: number) => {
    const newImages = [...images];
    newImages[index] = '';
    setImages(newImages);

    const newPreviews = [...imagePreviews];
    newPreviews[index] = '';
    setImagePreviews(newPreviews);

    // Gambar dalam IndexedDB tidak dipadam di sini — jika pengguna membatalkan
    // suntingan, rekod asal masih memerlukannya. App.handleSaveActivity yang
    // membuang gambar yatim selepas simpanan disahkan.
    const newCaptions = [...imageCaptions];
    newCaptions[index] = '';
    setImageCaptions(newCaptions);
  };

  const handleCaptionSlotChange = (index: number, text: string) => {
    const newCaptions = [...imageCaptions];
    newCaptions[index] = text;
    setImageCaptions(newCaptions);
  };

  // Submit handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validations
    const finalGroupName = isCustomGroup ? customGroupName.trim() : groupName;
    const finalClassName = isCustomClass ? customClassName.trim() : className;
    const finalActivityName = isCustomActivity ? customActivityName.trim() : activityName;

    if (!finalGroupName) {
      alert('Sila masukkan atau pilih Kumpulan.');
      return;
    }
    if (!teacherOnDuty.trim()) {
      alert('Sila masukkan nama Guru Bertugas.');
      return;
    }
    if (!finalClassName) {
      alert('Sila masukkan atau pilih Kelas.');
      return;
    }
    if (!finalActivityName) {
      alert('Sila masukkan atau pilih Nama Aktiviti.');
      return;
    }
    if (!activityDesc.trim()) {
      alert('Sila masukkan deskripsi ringkas aktiviti.');
      return;
    }
    if (!subjectTeacher.trim()) {
      alert('Sila masukkan nama Guru BM/BI yang terlibat.');
      return;
    }

    // Check students
    const invalidStudents = students.filter(s => !s.name.trim());
    if (invalidStudents.length > 0) {
      alert('Sila masukkan nama untuk semua murid yang tersenarai atau buang baris kosong.');
      return;
    }

    const activityData: ActivityLog = {
      id: initialActivity?.id || `act-${Date.now()}`,
      groupName: finalGroupName,
      teacherOnDuty: teacherOnDuty.trim(),
      date,
      day,
      className: finalClassName,
      subject,
      activityName: finalActivityName,
      activityDesc: activityDesc.trim(),
      subjectTeacher: subjectTeacher.trim(),
      students: students.map(s => ({
        ...s,
        name: s.name.trim(),
        notes: s.notes?.trim() || ''
      })),
      notes: notes.trim(),
      images: images.filter(img => img !== ''),
      imageCaptions: imageCaptions.filter((_, idx) => images[idx] !== ''),
      createdAt: initialActivity?.createdAt || new Date().toISOString()
    };

    onSave(activityData);
  };

  const activeCommonActivities = subject === 'BM' ? commonActivitiesBm : commonActivitiesBi;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Header Form */}
      <div className="flex items-center justify-between border-b border-white/8 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-bright">
            {initialActivity ? 'Kemaskini Laporan Aktiviti' : 'Daftar & Rekod Aktiviti Sokongan PBD'}
          </h1>
          <p className="text-xs text-muted mt-1">
            Isikan borang maklumat di bawah untuk menjana laporan bergambar dan statistik interaktif.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-muted hover:text-soft bg-white/5 hover:bg-white/8 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-lime-core px-5 py-2 text-sm font-medium text-[#0a0f08] transition hover:bg-lime-deep shadow-sm"
          >
            <Check className="h-4 w-4" />
            Simpan Rekod
          </button>
        </div>
      </div>

      {/* Main Form Fields */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Columns - Core Details */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Maklumat Am & Pentadbiran */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-sm font-bold text-bright uppercase tracking-wider flex items-center gap-2 mb-2 border-b border-white/8 pb-2">
              <span className="h-4 w-1 rounded-full bg-lime-core"></span>
              1. Maklumat Pentadbiran & Bertugas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group Name Selector */}
              <div>
                <label className="block text-xs font-semibold text-soft uppercase mb-1">Kumpulan Guru</label>
                {!isCustomGroup ? (
                  <div className="flex gap-2">
                    <select
                      value={groupName}
                      onChange={(e) => {
                        if (e.target.value === 'CUSTOM') {
                          setIsCustomGroup(true);
                        } else {
                          setGroupName(e.target.value);
                        }
                      }}
                      className="field !text-sm"
                    >
                      {AVAILABLE_GROUPS.map(grp => (
                        <option key={grp} value={grp}>{grp}</option>
                      ))}
                      <option value="CUSTOM">+ Kumpulan Lain...</option>
                    </select>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Masukkan nama kumpulan"
                      value={customGroupName}
                      onChange={(e) => setCustomGroupName(e.target.value)}
                      className="w-full rounded-xl border border-lime-core/30 bg-lime-core/8 px-3.5 py-2 text-sm focus:border-lime-core focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomGroup(false)}
                      className="px-2.5 text-xs text-lime-core hover:underline"
                    >
                      Senarai
                    </button>
                  </div>
                )}
              </div>

              {/* Teacher on duty */}
              <div>
                <label className="block text-xs font-semibold text-soft uppercase mb-1">Guru Bertugas Utama</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-faint">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Siti Noraidah / Ahmad"
                    value={teacherOnDuty}
                    onChange={(e) => setTeacherOnDuty(e.target.value)}
                    className="field !text-sm !pl-10"
                  />
                </div>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-semibold text-soft uppercase mb-1">Tarikh Aktiviti</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-faint">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="field !text-sm !pl-10"
                  />
                </div>
              </div>

              {/* Day selection */}
              <div>
                <label className="block text-xs font-semibold text-soft uppercase mb-1">Hari (Auto-Kira)</label>
                <input
                  type="text"
                  readOnly
                  value={day}
                  className="w-full rounded-xl bg-white/8 py-2.5 px-3.5 text-sm text-muted font-medium cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* Class Selector */}
              <div>
                <label className="block text-xs font-semibold text-soft uppercase mb-1">Kelas</label>
                {!isCustomClass ? (
                  <select
                    value={className}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomClass(true);
                      } else {
                        setClassName(e.target.value);
                      }
                    }}
                    className="field !text-sm"
                  >
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                    <option value="CUSTOM">+ Kelas Lain...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. 3 Pintar"
                      value={customClassName}
                      onChange={(e) => setCustomClassName(e.target.value)}
                      className="w-full rounded-xl border border-lime-core/30 bg-lime-core/8 px-3.5 py-2 text-sm focus:border-lime-core focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomClass(false)}
                      className="px-2.5 text-xs text-lime-core hover:underline"
                    >
                      Senarai
                    </button>
                  </div>
                )}
              </div>

              {/* Subject teacher involved */}
              <div>
                <label className="block text-xs font-semibold text-soft uppercase mb-1">Guru BM/BI yang terlibat</label>
                <input
                  type="text"
                  required
                  placeholder="Nama guru subjek"
                  value={subjectTeacher}
                  onChange={(e) => setSubjectTeacher(e.target.value)}
                  className="field !text-sm"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Maklumat Subjek & Aktiviti */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-sm font-bold text-bright uppercase tracking-wider flex items-center gap-2 mb-2 border-b border-white/8 pb-2">
              <span className="h-4 w-1 rounded-full bg-lime-core"></span>
              2. Butiran Aktiviti Akademik PBD
            </h3>

            {/* Subject Selector Buttons */}
            <div>
              <label className="block text-xs font-semibold text-soft uppercase mb-2">Pilih Subjek Sokongan</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSubjectChange('BM')}
                  className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold border text-sm transition-all ${
                    subject === 'BM'
                      ? 'bg-lime-core/12 border-lime-core text-lime-glow shadow-sm shadow-lime-core/20'
                      : 'bg-white/5 border-white/8 text-soft hover:bg-white/8'
                  }`}
                >
                  <BookOpen className="h-4.5 w-4.5" />
                  Bahasa Melayu (BM)
                </button>
                <button
                  type="button"
                  onClick={() => handleSubjectChange('BI')}
                  className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold border text-sm transition-all ${
                    subject === 'BI'
                      ? 'bg-fuchsia-400/12 border-pink-500 text-fuchsia-300 shadow-sm shadow-pink-100'
                      : 'bg-white/5 border-white/8 text-soft hover:bg-white/8'
                  }`}
                >
                  <Sparkles className="h-4.5 w-4.5" />
                  Bahasa Inggeris (BI)
                </button>
              </div>
            </div>

            <div className="space-y-4 mt-2">
              {/* Activity name */}
              <div>
                <label className="block text-xs font-semibold text-soft uppercase mb-1">Nama Aktiviti</label>
                {!isCustomActivity ? (
                  <select
                    value={activityName}
                    onChange={(e) => {
                      if (e.target.value === 'CUSTOM') {
                        setIsCustomActivity(true);
                      } else {
                        setActivityName(e.target.value);
                      }
                    }}
                    className="field !text-sm"
                  >
                    {activeCommonActivities.map(act => (
                      <option key={act} value={act}>{act}</option>
                    ))}
                    <option value="CUSTOM">+ Aktiviti Khas Lain...</option>
                  </select>
                ) : (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g. Spelling Bee Khas Tahap 1"
                      value={customActivityName}
                      onChange={(e) => setCustomActivityName(e.target.value)}
                      className="w-full rounded-xl border border-lime-core/30 bg-lime-core/8 px-3.5 py-2.5 text-sm focus:border-lime-core focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomActivity(false)}
                      className="px-2.5 text-xs text-lime-core hover:underline"
                    >
                      Cadangan
                    </button>
                  </div>
                )}
              </div>

              {/* Activity description */}
              <div>
                <label className="block text-xs font-semibold text-soft uppercase mb-1">Deskripsi Aktiviti & Langkah Pelaksanaan</label>
                <textarea
                  rows={4}
                  required
                  placeholder={
                    subject === 'BM'
                      ? "e.g. Murid melakonkan dialog di hadapan kelas secara berkumpulan. Bimbingan diberikan kepada murid yang gagap sebutan."
                      : "e.g. Students spin the Wheel of Phonics to read sound combinations. Special attention was given to short vowels segmentation."
                  }
                  value={activityDesc}
                  onChange={(e) => setActivityDesc(e.target.value)}
                  className="field !text-sm resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Senarai Murid Terlibat & Pencapaian TP */}
          <div className="glass p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-3">
              <h3 className="text-sm font-bold text-bright uppercase tracking-wider flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-lime-core"></span>
                3. Murid Terlibat & Rekod TP PBD (Tahap Penguasaan)
              </h3>
              <button
                type="button"
                onClick={addStudent}
                className="inline-flex items-center gap-1 text-xs font-bold text-lime-core glass-inset bg-lime-core/10 px-3 py-1.5 rounded-xl hover:bg-lime-core/20 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Murid
              </button>
            </div>

            <p className="text-xs text-muted">
              Masukkan <strong>TP Sebelum</strong> (tahap ketika aktiviti bermula) dan <strong>TP Sasaran</strong> semasa merancang.
              Selepas sesi tamat, kembali ke rekod ini dan isi <strong>TP Selepas</strong> — itulah tahap sebenar yang dicapai murid.
              Hanya TP Selepas dikira sebagai bukti impak dalam papan pemuka dan laporan rasmi.
            </p>

            <div className="space-y-3">
              {students.map((student, index) => (
                <div
                  key={student.id}
                  className="glass-inset p-3 sm:p-4 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4"
                >
                  {/*
                    Pada telefon, nombor murid diletakkan dalam aliran biasa
                    bersebelahan medan nama. Kedudukan mutlak menyebabkannya
                    bertindih dengan medan input apabila baris bertindan menegak.
                  */}
                  <div className="flex items-center gap-2 md:contents">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-lime-core/20 text-[11px] font-bold text-lime-glow">
                      {index + 1}
                    </span>

                    {/* Name field */}
                    <div className="flex-1">
                      <input
                        type="text"
                        required
                        placeholder="Nama penuh murid"
                        value={student.name}
                        onChange={(e) => updateStudent(student.id, 'name', e.target.value)}
                        className="field !py-1.5"
                      />
                    </div>
                  </div>

                  {/* Tiga medan TP dibariskan bersebelahan pada telefon supaya
                      satu murid tidak memakan skrin penuh secara menegak. */}
                  <div className="grid grid-cols-3 gap-2 md:contents">

                  {/* TP Sebelum */}
                  <div className="md:w-24">
                    <label className="block md:hidden text-[10px] text-muted font-semibold mb-1">TP Sebelum</label>
                    <select
                      value={student.currentTp}
                      onChange={(e) => updateStudent(student.id, 'currentTp', parseInt(e.target.value))}
                      className="field !px-2 !py-1.5"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>TP {num}</option>
                      ))}
                    </select>
                  </div>

                  {/* TP Sasaran */}
                  <div className="md:w-24">
                    <label className="block md:hidden text-[10px] text-muted font-semibold mb-1">TP Sasaran</label>
                    <select
                      value={student.targetTp}
                      onChange={(e) => updateStudent(student.id, 'targetTp', parseInt(e.target.value))}
                      className="field !px-2 !py-1.5"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>TP {num}</option>
                      ))}
                    </select>
                  </div>

                  {/* Icon separator arrow */}
                  <div className="hidden md:block text-faint">
                    <Check className="h-4 w-4" />
                  </div>

                  {/*
                    TP Selepas — keputusan sebenar selepas aktiviti.
                    Sengaja dibiarkan "Belum dinilai" secara lalai supaya laporan
                    tidak mendakwa pencapaian yang belum disahkan oleh guru.
                  */}
                  <div className="md:w-36">
                    <label className="block md:hidden text-[10px] text-muted font-semibold mb-1 truncate">TP Selepas</label>
                    <select
                      value={student.tpAfter ?? ''}
                      onChange={(e) =>
                        updateStudent(
                          student.id,
                          'tpAfter',
                          e.target.value === '' ? undefined : parseInt(e.target.value)
                        )
                      }
                      className={`field !px-2 !py-1.5 ${
                        typeof student.tpAfter === 'number'
                          ? student.tpAfter > student.currentTp
                            ? '!text-emerald-300 font-bold'
                            : ''
                          : '!text-amber-300'
                      }`}
                    >
                      <option value="">Belum dinilai</option>
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>TP {num} (dicapai)</option>
                      ))}
                    </select>
                  </div>
                  </div>

                  {/* Student Remarks */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Catatan kemajuan murid..."
                      value={student.notes || ''}
                      onChange={(e) => updateStudent(student.id, 'notes', e.target.value)}
                      className="field !py-1.5"
                    />
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => removeStudent(student.id)}
                    className="absolute top-2 right-2 md:static p-1.5 text-faint hover:text-rose-400 hover:bg-rose-500/12 rounded-lg transition"
                    title="Hapus Murid"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Catatan Keseluruhan */}
          <div className="glass p-6 space-y-4">
            <h3 className="text-sm font-bold text-bright uppercase tracking-wider flex items-center gap-2 mb-2 border-b border-white/8 pb-2">
              <span className="h-4 w-1 rounded-full bg-lime-core"></span>
              4. Catatan Impak / Catatan Refleksi Keseluruhan
            </h3>
            <textarea
              rows={3}
              placeholder="e.g. Semua murid yang terlibat berjaya melakonkan watak berdasarkan dialog masing-masing dengan penuh seronok. Tiga murid menunjukkan kebolehan bertutur dengan sebutan yang jelas."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="field !text-sm resize-none"
            />
          </div>

        </div>

        {/* Right Column - Images Upload & Pictorial Section */}
        <div className="space-y-6">
          <div className="glass p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-white/8 pb-2.5">
              <h3 className="text-sm font-bold text-bright uppercase tracking-wider flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-lime-core"></span>
                5. Foto Laporan Bergambar (4 Panel)
              </h3>
            </div>

            {/*
              Butang "Guna Contoh Foto Lengkap" dibuang — ia memuatkan empat foto
              stok Unsplash ke dalam rekod. Gambar itu bukan bukti pelaksanaan
              sebenar, dan sebuah laporan rasmi yang ditandatangani GPK tidak
              sepatutnya boleh diisi dengan foto rekaan hanya dengan satu klik.
            */}
            {images.some(img => img !== '') && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setImages(['', '', '', '']);
                    setImagePreviews(['', '', '', '']);
                    setImageCaptions(['', '', '', '']);
                  }}
                  className="btn-danger !py-2 !text-xs"
                >
                  Kosongkan Semua Foto
                </button>
              </div>
            )}

            <p className="text-xs text-muted leading-relaxed">
              Sila muat naik foto bagi setiap daripada 4 fasa bimbingan berikut untuk melengkapkan helaian laporan bergambar formal:
            </p>

            {/* 4 Panels List */}
            <div className="space-y-4">
              {[
                { label: 'Fasa 1: Set Induksi (Permulaan)', desc: 'Sesi penerangan awal tajuk dan modul.' },
                { label: 'Fasa 2: Aktiviti Utama (Kumpulan)', desc: 'Murid bekerjasama dalam kumpulan/tugasan.' },
                { label: 'Fasa 3: Sesi Bimbingan (Intervensi)', desc: 'Bimbingan personal rapat bersemuka dengan murid.' },
                { label: 'Fasa 4: Hasil Kerja (Penutup)', desc: 'Murid mementaskan dialog atau hasil kerja.' }
              ].map((panel, idx) => {
                const img = imagePreviews[idx];
                const caption = imageCaptions[idx];
                const sedangMuatNaik = uploadingSlot === idx;

                return (
                  <div key={idx} className="rounded-xl p-3 bg-white/5 space-y-2.5 transition hover:border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-bright flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full bg-lime-core/20 text-lime-glow font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        {panel.label}
                      </span>
                    </div>
                    
                    {img ? (
                      <div className="space-y-2">
                        {/* Image Preview */}
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-white/8 shadow-sm">
                          <img
                            src={img}
                            alt={`Preview ${panel.label}`}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageSlot(idx)}
                            className="absolute top-1.5 right-1.5 p-1 bg-black/70 hover:bg-black/90 text-white rounded-full transition shadow-sm"
                            title="Padam Foto"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>

                        {/* Caption input */}
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-faint uppercase">Kapsyen Foto {idx + 1}</label>
                          <input
                            type="text"
                            required
                            value={caption || ''}
                            onChange={(e) => handleCaptionSlotChange(idx, e.target.value)}
                            placeholder={panel.desc}
                            className="field !py-1.5"
                          />
                        </div>
                      </div>
                    ) : (
                      <div>
                        {/* File upload click zone */}
                        <input
                          id={`image-slot-input-${idx}`}
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageSlotChange(idx, e)}
                          className="hidden"
                        />
                        <label
                          htmlFor={`image-slot-input-${idx}`}
                          className={`flex flex-col items-center justify-center gap-1.5 aspect-video rounded-lg border border-dashed bg-white/5 transition p-3 text-center ${
                            sedangMuatNaik
                              ? 'border-lime-core/40 bg-lime-core/10 cursor-wait'
                              : 'border-white/10 hover:bg-white/5 hover:border-lime-core/40 cursor-pointer'
                          }`}
                        >
                          {sedangMuatNaik ? (
                            <>
                              <Upload className="h-5 w-5 text-lime-core animate-pulse" />
                              <span className="text-[11px] font-bold text-lime-glow block">
                                Memampat &amp; menyimpan…
                              </span>
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5 text-faint" />
                              <div>
                                <span className="text-[11px] font-bold text-soft block">Muat Naik Foto {idx + 1}</span>
                                <span className="text-[10px] text-faint block max-w-[180px] mx-auto leading-tight mt-0.5">
                                  {panel.desc}
                                </span>
                              </div>
                            </>
                          )}
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>

      {/* Sticky Bottom Actions Bar */}
      <div className="border-t border-white/8 pt-6 flex items-center justify-end gap-3 bg-white/80 backdrop-blur-md py-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-muted hover:text-soft bg-white/5 hover:bg-white/8 rounded-xl transition"
        >
          Kembali Ke Senarai
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-lime-core px-6 py-2.5 text-sm font-bold text-[#0a0f08] transition hover:bg-lime-deep shadow-md shadow-lime-core/25"
        >
          <Check className="h-4.5 w-4.5" />
          Simpan Laporan Aktiviti
        </button>
      </div>
    </form>
  );
}
