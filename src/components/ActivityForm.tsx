import React, { useState, useEffect } from 'react';
import { ActivityLog, Student } from '../types';
import {
  AVAILABLE_GROUPS,
  MALAYSIAN_DAYS,
  AVAILABLE_CLASSES,
  COMMON_ACTIVITIES_BM,
  COMMON_ACTIVITIES_BI,
  PLACEHOLDER_IMAGES
} from '../data';
import {
  Trash2,
  Plus,
  Image as ImageIcon,
  Calendar,
  User,
  Users,
  Check,
  Sparkles,
  Upload,
  X,
  BookOpen,
  HelpCircle,
  FileText
} from 'lucide-react';

interface ActivityFormProps {
  onSave: (activity: ActivityLog) => void;
  initialActivity?: ActivityLog | null;
  onCancel: () => void;
}

export default function ActivityForm({ onSave, initialActivity, onCancel }: ActivityFormProps) {
  // Main form states
  const [groupName, setGroupName] = useState('Ancala');
  const [customGroupName, setCustomGroupName] = useState('');
  const [isCustomGroup, setIsCustomGroup] = useState(false);

  const [teacherOnDuty, setTeacherOnDuty] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [day, setDay] = useState('Isnin');
  const [className, setClassName] = useState('3 Kritis');
  const [customClassName, setCustomClassName] = useState('');
  const [isCustomClass, setIsCustomClass] = useState(false);

  const [subject, setSubject] = useState<'BM' | 'BI'>('BM');
  const [activityName, setActivityName] = useState('');
  const [customActivityName, setCustomActivityName] = useState('');
  const [isCustomActivity, setIsCustomActivity] = useState(false);
  const [activityDesc, setActivityDesc] = useState('');
  const [subjectTeacher, setSubjectTeacher] = useState('');
  
  const [notes, setNotes] = useState('');
  const [images, setImages] = useState<string[]>(['', '', '', '']);
  const [imageCaptions, setImageCaptions] = useState<string[]>(['', '', '', '']);

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

      if (AVAILABLE_CLASSES.includes(initialActivity.className)) {
        setClassName(initialActivity.className);
        setIsCustomClass(false);
      } else {
        setCustomClassName(initialActivity.className);
        setIsCustomClass(true);
      }

      setSubject(initialActivity.subject);
      
      const commonActs = initialActivity.subject === 'BM' ? COMMON_ACTIVITIES_BM : COMMON_ACTIVITIES_BI;
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
    } else {
      // Set some nice initial defaults for a new record
      setTeacherOnDuty('');
      setSubjectTeacher('Samsiah Sundu');
      setActivityDesc('');
      setNotes('');
      setImages(['', '', '', '']);
      setImageCaptions(['', '', '', '']);
      setStudents([{ id: 'stud-temp-1', name: '', currentTp: 2, targetTp: 3, notes: '' }]);
      
      // Default activity based on subject
      if (subject === 'BM') {
        setActivityName(COMMON_ACTIVITIES_BM[0]);
      } else {
        setActivityName(COMMON_ACTIVITIES_BI[0]);
      }
    }
  }, [initialActivity]);

  // Reset default activity selection when subject changes
  const handleSubjectChange = (newSubject: 'BM' | 'BI') => {
    setSubject(newSubject);
    setIsCustomActivity(false);
    if (newSubject === 'BM') {
      setActivityName(COMMON_ACTIVITIES_BM[0]);
    } else {
      setActivityName(COMMON_ACTIVITIES_BI[0]);
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

  // Handle image upload for a specific slot and conversion to base64
  const handleImageSlotChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        const newImages = [...images];
        newImages[index] = reader.result;
        setImages(newImages);
        
        const newCaptions = [...imageCaptions];
        if (!newCaptions[index]) {
          const defaultCaptions = [
            'Sesi penerangan awal tajuk dan objektif pembelajaran oleh guru bertugas.',
            'Murid-murid berbincang dan bekerjasama dalam kumpulan kecil.',
            'Bimbingan rapat secara bersemuka (intervensi) diberikan kepada murid sasaran.',
            'Murid membuat simulasi pembentangan hasil tugasan di hadapan kelas.'
          ];
          newCaptions[index] = defaultCaptions[index];
        }
        setImageCaptions(newCaptions);
      }
    };
    reader.readAsDataURL(file);
  };

  // Load beautiful pre-set mock images for all 4 slots
  const loadMockImages = () => {
    setImages([
      PLACEHOLDER_IMAGES.classroom1,
      PLACEHOLDER_IMAGES.groupLearning,
      PLACEHOLDER_IMAGES.classroom3,
      PLACEHOLDER_IMAGES.classroom2
    ]);
    setImageCaptions([
      'Sesi penerangan awal tajuk dan objektif pembelajaran oleh guru bertugas.',
      'Murid-murid bekerjasama melakonkan dialog dan watak.',
      'Bimbingan rapat secara bersemuka (intervensi) diberikan kepada murid sasaran.',
      'Murid membuat simulasi pembentangan hasil tugasan di hadapan kelas.'
    ]);
  };

  const removeImageSlot = (index: number) => {
    const newImages = [...images];
    newImages[index] = '';
    setImages(newImages);
    
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

  const activeCommonActivities = subject === 'BM' ? COMMON_ACTIVITIES_BM : COMMON_ACTIVITIES_BI;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-12">
      {/* Header Form */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-5">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {initialActivity ? 'Kemaskini Laporan Aktiviti' : 'Daftar & Rekod Aktiviti Sokongan PBD'}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Isikan borang maklumat di bawah untuk menjana laporan bergambar dan statistik interaktif.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
          >
            Batal
          </button>
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 text-sm font-medium text-white transition hover:bg-blue-700 shadow-sm"
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
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-2 border-b border-gray-50 pb-2">
              <span className="h-4 w-1 rounded-full bg-blue-600"></span>
              1. Maklumat Pentadbiran & Bertugas
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Group Name Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Kumpulan Guru</label>
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
                      className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
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
                      className="w-full rounded-xl border border-blue-200 bg-blue-50/10 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomGroup(false)}
                      className="px-2.5 text-xs text-blue-600 hover:underline"
                    >
                      Senarai
                    </button>
                  </div>
                )}
              </div>

              {/* Teacher on duty */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Guru Bertugas Utama</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <User className="h-4 w-4" />
                  </span>
                  <input
                    type="text"
                    required
                    placeholder="Siti Noraidah / Ahmad"
                    value={teacherOnDuty}
                    onChange={(e) => setTeacherOnDuty(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Date selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Tarikh Aktiviti</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-400">
                    <Calendar className="h-4 w-4" />
                  </span>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Day selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Hari (Auto-Kira)</label>
                <input
                  type="text"
                  readOnly
                  value={day}
                  className="w-full rounded-xl border border-gray-150 bg-gray-100 py-2.5 px-3.5 text-sm text-gray-500 font-medium cursor-not-allowed focus:outline-none"
                />
              </div>

              {/* Class Selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Kelas</label>
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                  >
                    {AVAILABLE_CLASSES.map(cls => (
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
                      className="w-full rounded-xl border border-blue-200 bg-blue-50/10 px-3.5 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomClass(false)}
                      className="px-2.5 text-xs text-blue-600 hover:underline"
                    >
                      Senarai
                    </button>
                  </div>
                )}
              </div>

              {/* Subject teacher involved */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Guru BM/BI yang terlibat</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsiah Sundu"
                  value={subjectTeacher}
                  onChange={(e) => setSubjectTeacher(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Maklumat Subjek & Aktiviti */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-2 border-b border-gray-50 pb-2">
              <span className="h-4 w-1 rounded-full bg-blue-600"></span>
              2. Butiran Aktiviti Akademik PBD
            </h3>

            {/* Subject Selector Buttons */}
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-2">Pilih Subjek Sokongan</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleSubjectChange('BM')}
                  className={`flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold border text-sm transition-all ${
                    subject === 'BM'
                      ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-sm shadow-blue-100'
                      : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
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
                      ? 'bg-pink-50 border-pink-500 text-pink-700 shadow-sm shadow-pink-100'
                      : 'bg-gray-50 border-gray-100 text-gray-600 hover:bg-gray-100'
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
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Nama Aktiviti</label>
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
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
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
                      className="w-full rounded-xl border border-blue-200 bg-blue-50/10 px-3.5 py-2.5 text-sm focus:border-blue-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setIsCustomActivity(false)}
                      className="px-2.5 text-xs text-blue-600 hover:underline"
                    >
                      Cadangan
                    </button>
                  </div>
                )}
              </div>

              {/* Activity description */}
              <div>
                <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">Deskripsi Aktiviti & Langkah Pelaksanaan</label>
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
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Senarai Murid Terlibat & Pencapaian TP */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-3">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-blue-600"></span>
                3. Murid Terlibat & Rekod TP PBD (Tahap Penguasaan)
              </h3>
              <button
                type="button"
                onClick={addStudent}
                className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl hover:bg-blue-100 transition"
              >
                <Plus className="h-3.5 w-3.5" />
                Tambah Murid
              </button>
            </div>

            <p className="text-xs text-gray-500">
              Sila masukkan nama murid, Tahap Penguasaan (TP) semasa aktiviti bermula, sasaran TP baharu, serta impak perkembangan individu.
            </p>

            <div className="space-y-3">
              {students.map((student, index) => (
                <div
                  key={student.id}
                  className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-3 md:space-y-0 md:flex md:items-center md:gap-4 relative"
                >
                  <span className="absolute top-2 left-2 md:static text-xs font-bold text-gray-400 bg-gray-200/60 rounded-full h-5 w-5 flex items-center justify-center">
                    {index + 1}
                  </span>
                  
                  {/* Name field */}
                  <div className="flex-1">
                    <input
                      type="text"
                      required
                      placeholder="Nama Murid (e.g. Akram)"
                      value={student.name}
                      onChange={(e) => updateStudent(student.id, 'name', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Current TP */}
                  <div className="w-full md:w-28">
                    <label className="block md:hidden text-[10px] text-gray-500 font-semibold mb-1">TP Semasa</label>
                    <select
                      value={student.currentTp}
                      onChange={(e) => updateStudent(student.id, 'currentTp', parseInt(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>TP {num}</option>
                      ))}
                    </select>
                  </div>

                  {/* Icon separator arrow */}
                  <div className="hidden md:block text-gray-400">
                    <Check className="h-4 w-4" />
                  </div>

                  {/* Target TP */}
                  <div className="w-full md:w-32">
                    <label className="block md:hidden text-[10px] text-gray-500 font-semibold mb-1">TP Sasaran/Selepas</label>
                    <select
                      value={student.targetTp}
                      onChange={(e) => updateStudent(student.id, 'targetTp', parseInt(e.target.value))}
                      className="w-full rounded-lg border border-gray-200 bg-white px-2 py-1.5 text-xs text-gray-800 focus:outline-none"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>TP {num} (Sasaran)</option>
                      ))}
                    </select>
                  </div>

                  {/* Student Remarks */}
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Catatan kemajuan murid..."
                      value={student.notes || ''}
                      onChange={(e) => updateStudent(student.id, 'notes', e.target.value)}
                      className="w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs text-gray-800 focus:border-blue-500 focus:outline-none"
                    />
                  </div>

                  {/* Delete button */}
                  <button
                    type="button"
                    onClick={() => removeStudent(student.id)}
                    className="absolute top-2 right-2 md:static p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                    title="Hapus Murid"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: Catatan Keseluruhan */}
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 mb-2 border-b border-gray-50 pb-2">
              <span className="h-4 w-1 rounded-full bg-blue-600"></span>
              4. Catatan Impak / Catatan Refleksi Keseluruhan
            </h3>
            <textarea
              rows={3}
              placeholder="e.g. Semua murid yang terlibat berjaya melakonkan watak berdasarkan dialog masing-masing dengan penuh seronok. Tiga murid menunjukkan kebolehan bertutur dengan sebutan yang jelas."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-2.5 text-sm text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition resize-none"
            />
          </div>

        </div>

        {/* Right Column - Images Upload & Pictorial Section */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2.5">
              <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <span className="h-4 w-1 rounded-full bg-blue-600"></span>
                5. Foto Laporan Bergambar (4 Panel)
              </h3>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch gap-2">
              <button
                type="button"
                onClick={loadMockImages}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700 transition"
              >
                <Sparkles className="h-4 w-4" />
                Guna Contoh Foto Lengkap (4 Fasa)
              </button>
              {images.some(img => img !== '') && (
                <button
                  type="button"
                  onClick={() => {
                    setImages(['', '', '', '']);
                    setImageCaptions(['', '', '', '']);
                  }}
                  className="rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 px-3 py-2 text-xs font-bold text-red-700 transition"
                >
                  Kosongkan
                </button>
              )}
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
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
                const img = images[idx];
                const caption = imageCaptions[idx];
                
                return (
                  <div key={idx} className="rounded-xl border border-gray-100 p-3 bg-gray-50/30 space-y-2.5 transition hover:border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-900 flex items-center gap-1.5">
                        <span className="h-4 w-4 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        {panel.label}
                      </span>
                    </div>
                    
                    {img ? (
                      <div className="space-y-2">
                        {/* Image Preview */}
                        <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 border border-gray-100 shadow-sm">
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
                          <label className="text-[9px] font-bold text-gray-400 uppercase">Kapsyen Foto {idx + 1}</label>
                          <input
                            type="text"
                            required
                            value={caption || ''}
                            onChange={(e) => handleCaptionSlotChange(idx, e.target.value)}
                            placeholder={panel.desc}
                            className="w-full rounded-lg border border-gray-200 bg-white px-2.5 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-blue-500 transition"
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
                          className="flex flex-col items-center justify-center gap-1.5 aspect-video rounded-lg border border-dashed border-gray-200 bg-white hover:bg-gray-50/50 hover:border-blue-300 cursor-pointer transition p-3 text-center"
                        >
                          <Upload className="h-5 w-5 text-gray-400" />
                          <div>
                            <span className="text-[11px] font-bold text-gray-700 block">Muat Naik Foto {idx + 1}</span>
                            <span className="text-[10px] text-gray-400 block max-w-[180px] mx-auto leading-tight mt-0.5">
                              {panel.desc}
                            </span>
                          </div>
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
      <div className="border-t border-gray-100 pt-6 flex items-center justify-end gap-3 bg-white/80 backdrop-blur-md py-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2.5 text-sm font-medium text-gray-500 hover:text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl transition"
        >
          Kembali Ke Senarai
        </button>
        <button
          type="submit"
          className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white transition hover:bg-blue-700 shadow-md shadow-blue-200"
        >
          <Check className="h-4.5 w-4.5" />
          Simpan Laporan Aktiviti
        </button>
      </div>
    </form>
  );
}
