import React, { useState, useEffect, useMemo } from 'react';
import {
  ActivityLog,
  Student,
  StudentRosterEntry,
  PILIHAN_TP_ASAL,
  PILIHAN_TP_PENUH
} from '../types';
import { compressImage, savePhoto, resolveImages } from '../lib/photoStore';
import { muridDalamKelas } from '../lib/roster';
import {
  AVAILABLE_GROUPS,
  MALAYSIAN_DAYS,
  AVAILABLE_CLASSES,
  COMMON_ACTIVITIES_BM,
  COMMON_ACTIVITIES_BI,
  PRESET_CATATAN_MURID,
  PRESET_CATATAN_IMPAK,
  isiCatatan
} from '../data';
import { cariPresetAktiviti } from '../activityPresets';
import {
  Trash2,
  Plus,
  Calendar,
  User,
  Check,
  Upload,
  X,
  ClipboardList,
  UtensilsCrossed,
  ChefHat,
  Camera,
  Users,
  Sparkles,
  BookMarked,
  Info,
  Settings,
  BookmarkPlus,
  Wand2,
  RotateCcw
} from 'lucide-react';

interface ActivityFormProps {
  onSave: (activity: ActivityLog) => void;
  initialActivity?: ActivityLog | null;
  onCancel: () => void;
  availableClasses?: string[];
  commonActivitiesBm?: string[];
  commonActivitiesBi?: string[];
  /** Senarai induk nama murid — sumber checklist murid. */
  studentRoster?: StudentRosterEntry[];
  catatanMuridPresets?: string[];
  catatanImpakPresets?: string[];
  /** Buka Tetapan & Admin — dipanggil apabila senarai murid masih kosong. */
  onOpenAdmin?: () => void;
  /** Simpan catatan impak yang ditaip guru sebagai preset baharu. */
  onAddImpakPreset?: (teks: string) => void;
}

/** Nama dinormalkan untuk perbandingan (ruang berganda, huruf besar/kecil). */
const kunciNama = (nama: string) => nama.trim().replace(/\s+/g, ' ').toUpperCase();

/**
 * Pilihan TP Asal bagi satu murid.
 *
 * Hanya TP 1 dan 2 ditawarkan. Rekod lama mungkin menyimpan nilai yang lebih
 * tinggi; nilai itu tetap dimasukkan ke dalam senarai supaya senarai juntai
 * tidak memaparkan pilihan kosong dan menukar data lama tanpa disedari.
 */
function pilihanTpAsal(nilai: number): number[] {
  return PILIHAN_TP_ASAL.includes(nilai)
    ? PILIHAN_TP_ASAL
    : [...PILIHAN_TP_ASAL, nilai].sort((a, b) => a - b);
}

/*
 * KepalaKad dan ButiranMurid ditakrif pada peringkat modul, BUKAN di dalam
 * ActivityForm.
 *
 * Komponen yang ditakrif di dalam komponen lain menjadi jenis (type) yang
 * baharu pada setiap render, jadi React melihatnya sebagai komponen berlainan
 * dan memasang semula seluruh subpokoknya. Akibatnya medan input kehilangan
 * fokus selepas setiap kekunci ditekan — menaip satu catatan murid menjadi
 * mustahil. Menakrifnya di luar mengekalkan identiti jenis antara render.
 */

/** Kepala kad bernombor dengan penanda siap. */
function KepalaKad({
  nombor,
  ikon: Ikon,
  tajuk,
  kapsyen,
  selesai,
  hujung
}: {
  nombor: number;
  ikon: React.ElementType;
  tajuk: string;
  kapsyen: string;
  selesai: boolean;
  hujung?: React.ReactNode;
}) {
  return (
    <div className="resto-head">
      {selesai ? (
        <span className="resto-num-done" aria-label="Seksyen ini sudah diisi">
          <Check className="h-4 w-4" strokeWidth={3} />
        </span>
      ) : (
        <span className="resto-num">{nombor}</span>
      )}
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-1.5 text-sm font-extrabold leading-tight text-[#33291f]">
          <Ikon className="h-4 w-4 shrink-0 text-[#e0503a]" />
          {tajuk}
        </h3>
        <p className="mt-0.5 text-[11px] leading-snug text-[#7b6553]">{kapsyen}</p>
      </div>
      {hujung}
    </div>
  );
}

/** Tiga senarai juntai TP + catatan kemajuan bagi seorang murid. */
function ButiranMurid({
  murid,
  presetCatatan,
  onUbah
}: {
  murid: Student;
  presetCatatan: string[];
  onUbah: (id: string, field: keyof Student, value: any) => void;
}) {
  return (
    <div className="space-y-2.5 rounded-xl bg-[#fffdf8] p-3">
      <div className="grid grid-cols-3 gap-2">
        <div>
          <label className="resto-label !mb-1 !text-[9.5px]">TP Asal</label>
          <select
            value={murid.currentTp}
            onChange={e => onUbah(murid.id, 'currentTp', parseInt(e.target.value))}
            className="resto-field !min-h-0 !px-2 !py-1.5"
          >
            {pilihanTpAsal(murid.currentTp).map(n => (
              <option key={n} value={n}>
                TP {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="resto-label !mb-1 !text-[9.5px]">TP Sasaran</label>
          <select
            value={murid.targetTp}
            onChange={e => onUbah(murid.id, 'targetTp', parseInt(e.target.value))}
            className="resto-field !min-h-0 !px-2 !py-1.5"
          >
            {PILIHAN_TP_PENUH.map(n => (
              <option key={n} value={n}>
                TP {n}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="resto-label !mb-1 !text-[9.5px]">TP Selepas</label>
          <select
            value={murid.tpAfter ?? ''}
            onChange={e =>
              onUbah(
                murid.id,
                'tpAfter',
                e.target.value === '' ? undefined : parseInt(e.target.value)
              )
            }
            className={`resto-field !min-h-0 !px-2 !py-1.5 font-bold ${
              typeof murid.tpAfter === 'number'
                ? murid.tpAfter > murid.currentTp
                  ? '!border-[#2f8f5b] !bg-[#e3f5ea] !text-[#1f6b41]'
                  : ''
                : '!text-[#8a5a12]'
            }`}
          >
            <option value="">Belum</option>
            {PILIHAN_TP_PENUH.map(n => (
              <option key={n} value={n}>
                TP {n}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="resto-label !mb-1 !text-[9.5px]">Catatan Kemajuan Murid</label>
        <input
          type="text"
          value={murid.notes || ''}
          onChange={e => onUbah(murid.id, 'notes', e.target.value)}
          placeholder="Pilih preset di bawah atau taip sendiri…"
          className="resto-field !min-h-0 !py-2"
        />
        <select
          value=""
          onChange={e => {
            if (e.target.value) onUbah(murid.id, 'notes', e.target.value);
          }}
          className="resto-field !mt-1.5 !min-h-0 !bg-[#fff2dc] !py-1.5 font-semibold !text-[#8a5a12]"
        >
          <option value="">＋ Pilih catatan pantas ({presetCatatan.length} preset)</option>
          {presetCatatan.map((p, i) => (
            <option key={i} value={p}>
              {i + 1}. {p}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

/**
 * Borang rekod aktiviti — susunan senarai pesanan restoran.
 *
 * Bentuk ini dipilih kerana ia sepadan dengan cara borang ini digunakan:
 * guru berdiri di dalam kelas dengan telefon, menanda apa yang sudah selesai
 * satu demi satu. Kad bernombor, tanda siap pada setiap seksyen, dan senarai
 * murid dalam bentuk checklist menjadikan "apa lagi yang belum diisi" jelas
 * tanpa perlu menatal ke bawah dan mengagak.
 *
 * Temanya cerah dan berasingan daripada tema gelap aplikasi — lihat blok
 * `.resto` dalam index.css untuk sebabnya.
 */
export default function ActivityForm({
  onSave,
  initialActivity,
  onCancel,
  availableClasses = AVAILABLE_CLASSES,
  commonActivitiesBm = COMMON_ACTIVITIES_BM,
  commonActivitiesBi = COMMON_ACTIVITIES_BI,
  studentRoster = [],
  catatanMuridPresets = PRESET_CATATAN_MURID,
  catatanImpakPresets = PRESET_CATATAN_IMPAK,
  onOpenAdmin,
  onAddImpakPreset
}: ActivityFormProps) {
  const [groupName, setGroupName] = useState('Ancala');
  const [customGroupName, setCustomGroupName] = useState('');
  const [isCustomGroup, setIsCustomGroup] = useState(false);

  const [teacherOnDuty, setTeacherOnDuty] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [day, setDay] = useState('Isnin');
  const [className, setClassName] = useState(availableClasses[0] ?? '');
  const [customClassName, setCustomClassName] = useState('');
  const [isCustomClass, setIsCustomClass] = useState(false);

  const [subject, setSubject] = useState<'BM' | 'BI'>('BM');
  const [activityName, setActivityName] = useState(commonActivitiesBm[0] ?? '');
  const [customActivityName, setCustomActivityName] = useState('');
  const [isCustomActivity, setIsCustomActivity] = useState(false);
  const [activityDesc, setActivityDesc] = useState(() =>
    initialActivity ? '' : cariPresetAktiviti(commonActivitiesBm[0] ?? '')?.deskripsi ?? ''
  );
  const [subjectTeacher, setSubjectTeacher] = useState('');

  const [notes, setNotes] = useState('');

  /*
   * Adakah medan ini masih memegang teks preset, atau sudah disunting guru?
   *
   * Auto-isi tidak boleh menimpa taipan guru. Sebaik sahaja guru menyunting
   * salah satu medan ini, bendera berkenaan dimatikan dan menukar aktiviti
   * tidak lagi menggantikan kandungannya — sebaliknya butang "Guna preset"
   * ditawarkan supaya keputusan itu kekal di tangan guru.
   *
   * Bendera bermula MATI apabila rekod tersimpan dibuka. Menetapkannya kepada
   * `true` di sini dan mematikannya kemudian di dalam efek tidak mencukupi:
   * efek auto-isi berjalan dengan nilai yang ditangkap pada render pertama,
   * jadi ia akan menulis ganti catatan rekod yang sudah ditandatangani sebelum
   * bendera itu sempat dimatikan.
   */
  const [deskripsiAuto, setDeskripsiAuto] = useState(!initialActivity);
  const [impakAuto, setImpakAuto] = useState(!initialActivity);
  /** Rujukan gambar yang akan disimpan bersama rekod ("idb:<id>"). */
  const [images, setImages] = useState<string[]>(['', '', '', '']);
  /** Data URL untuk paparan sahaja — tidak pernah disimpan ke localStorage. */
  const [imagePreviews, setImagePreviews] = useState<string[]>(['', '', '', '']);
  const [imageCaptions, setImageCaptions] = useState<string[]>(['', '', '', '']);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);

  /** Rekod baharu bermula tanpa murid — guru menanda nama daripada senarai. */
  const [students, setStudents] = useState<Student[]>([]);

  // Auto-kira hari daripada tarikh
  useEffect(() => {
    if (!date) return;
    const dayIndex = new Date(date).getDay();
    if (dayIndex >= 0 && dayIndex < MALAYSIAN_DAYS.length) {
      setDay(MALAYSIAN_DAYS[dayIndex]);
    }
  }, [date]);

  /*
   * Muatkan rekod yang sedang disunting.
   *
   * Kebergantungan sengaja HANYA `initialActivity`. Senarai tetapan (kelas,
   * aktiviti, preset) dahulunya turut disenaraikan di sini — jadi menyimpan
   * preset catatan baharu semasa mengisi borang akan mencipta tatasusunan
   * baharu, mencetuskan efek ini, dan mengosongkan borang yang sedang diisi.
   */
  useEffect(() => {
    if (!initialActivity) {
      /*
       * Kosongkan borang apabila bertukar daripada "sunting" kepada "baharu".
       *
       * Komponen ini kekal terpasang apabila guru menekan nav "Rekod Aktiviti
       * Baharu" semasa sedang menyunting rekod lain — tab sudah berada pada
       * 'form', jadi React mengekalkan keadaannya. Tanpa set semula di sini,
       * borang "baharu" itu muncul lengkap dengan data rekod terdahulu dan
       * disimpan sebagai rekod pendua di bawah ID baharu.
       */
      setGroupName('Ancala');
      setCustomGroupName('');
      setIsCustomGroup(false);
      setTeacherOnDuty('');
      setDate(new Date().toISOString().split('T')[0]);
      setClassName(availableClasses[0] ?? '');
      setCustomClassName('');
      setIsCustomClass(false);
      setSubject('BM');
      const aktivitiLalai = commonActivitiesBm[0] ?? '';
      setActivityName(aktivitiLalai);
      setCustomActivityName('');
      setIsCustomActivity(false);
      // Deskripsi dan langkah aktiviti lalai terus diisi — rekod baharu
      // sepatutnya sudah separuh lengkap sebelum guru menaip apa-apa.
      setActivityDesc(cariPresetAktiviti(aktivitiLalai)?.deskripsi ?? '');
      setSubjectTeacher('');
      setNotes('');
      setDeskripsiAuto(true);
      setImpakAuto(true);
      setStudents([]);
      setImages(['', '', '', '']);
      setImagePreviews(['', '', '', '']);
      setImageCaptions(['', '', '', '']);
      return;
    }

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

    const commonActs =
      initialActivity.subject === 'BM' ? commonActivitiesBm : commonActivitiesBi;
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

    /*
     * Rekod tersimpan ialah sumber kebenaran — auto-isi dimatikan.
     *
     * Teks dalam rekod yang sudah ditandatangani tidak boleh ditulis semula
     * oleh preset hanya kerana guru membuka semula rekod itu untuk mengisi
     * TP Selepas. Guru masih boleh menekan "Guna preset" jika mahu.
     */
    setDeskripsiAuto(false);
    setImpakAuto(false);

    const loadedImages = ['', '', '', ''];
    const loadedCaptions = ['', '', '', ''];
    initialActivity.images?.forEach((img, i) => {
      if (i < 4) loadedImages[i] = img;
    });
    initialActivity.imageCaptions?.forEach((cap, i) => {
      if (i < 4) loadedCaptions[i] = cap;
    });
    setImages(loadedImages);
    setImageCaptions(loadedCaptions);

    // Gambar disimpan sebagai rujukan IndexedDB — muatkan semula untuk pratonton.
    resolveImages(loadedImages)
      .then(setImagePreviews)
      .catch(() => setImagePreviews(loadedImages));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialActivity]);

  /**
   * Tukar aktiviti dan isikan deskripsi preset yang berkaitan.
   *
   * Deskripsi hanya ditulis semula jika ia masih teks preset. Jika guru sudah
   * menyuntingnya, kandungannya dibiarkan dan butang "Guna preset" muncul.
   */
  const handleActivityChange = (namaBaharu: string) => {
    setActivityName(namaBaharu);
    if (deskripsiAuto) {
      setActivityDesc(cariPresetAktiviti(namaBaharu)?.deskripsi ?? '');
    }
  };

  /**
   * Beralih kepada aktiviti khas yang ditaip sendiri.
   *
   * Deskripsi preset dikosongkan. Membiarkannya bermakna laporan aktiviti khas
   * akan membawa langkah pelaksanaan aktiviti yang LAIN sepenuhnya — teks yang
   * kelihatan sah tetapi memerihalkan sesi yang tidak pernah berlaku.
   */
  const handleGunaAktivitiKhas = () => {
    setIsCustomActivity(true);
    if (deskripsiAuto) setActivityDesc('');
  };

  /** Kembali kepada senarai aktiviti lazim, dan pulihkan preset jika perlu. */
  const handleKembaliSenaraiAktiviti = () => {
    setIsCustomActivity(false);
    if (deskripsiAuto) {
      setActivityDesc(cariPresetAktiviti(activityName)?.deskripsi ?? '');
    }
  };

  const handleSubjectChange = (newSubject: 'BM' | 'BI') => {
    setSubject(newSubject);
    setIsCustomActivity(false);
    const aktivitiLalai =
      (newSubject === 'BM' ? commonActivitiesBm[0] : commonActivitiesBi[0]) || '';
    setActivityName(aktivitiLalai);
    if (deskripsiAuto) {
      setActivityDesc(cariPresetAktiviti(aktivitiLalai)?.deskripsi ?? '');
    }
  };

  /* ----------------------------------------------------------------------
     Murid
     ---------------------------------------------------------------------- */

  const finalClassName = isCustomClass ? customClassName.trim() : className;
  const finalActivityName = isCustomActivity ? customActivityName.trim() : activityName;
  const finalGroupName = isCustomGroup ? customGroupName.trim() : groupName;

  const rosterKelas = useMemo(
    () => (finalClassName ? muridDalamKelas(studentRoster, finalClassName) : []),
    [studentRoster, finalClassName]
  );

  const namaDalamRoster = useMemo(
    () => new Set(rosterKelas.map(m => kunciNama(m.name))),
    [rosterKelas]
  );

  const petaDipilih = useMemo(() => {
    const peta = new Map<string, Student>();
    for (const s of students) peta.set(kunciNama(s.name), s);
    return peta;
  }, [students]);

  /**
   * Murid yang tiada dalam senarai induk kelas ini.
   *
   * Merangkumi nama yang ditaip sendiri dan — apabila guru menukar kelas
   * selepas menanda murid — murid daripada kelas terdahulu. Mereka dipaparkan
   * secara berasingan dan bukan dibuang senyap: kerja yang sudah dimasukkan
   * tidak sepatutnya hilang hanya kerana satu senarai juntai bertukar.
   */
  const muridLain = useMemo(
    () => students.filter(s => !namaDalamRoster.has(kunciNama(s.name))),
    [students, namaDalamRoster]
  );

  const buatMurid = (nama: string): Student => ({
    id: `stud-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
    name: nama,
    currentTp: 1,
    targetTp: 2,
    notes: ''
  });

  const toggleMuridRoster = (nama: string) => {
    const kunci = kunciNama(nama);
    setStudents(prev =>
      prev.some(s => kunciNama(s.name) === kunci)
        ? prev.filter(s => kunciNama(s.name) !== kunci)
        : [...prev, buatMurid(nama)]
    );
  };

  const tandaSemuaKelas = () => {
    setStudents(prev => {
      const ada = new Set(prev.map(s => kunciNama(s.name)));
      const tambahan = rosterKelas
        .filter(m => !ada.has(kunciNama(m.name)))
        .map(m => buatMurid(m.name));
      return [...prev, ...tambahan];
    });
  };

  const buangSemuaKelas = () => {
    setStudents(prev => prev.filter(s => !namaDalamRoster.has(kunciNama(s.name))));
  };

  const addStudentManual = () => {
    setStudents(prev => [...prev, buatMurid('')]);
  };

  const removeStudent = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const updateStudent = (id: string, field: keyof Student, value: any) => {
    setStudents(prev => prev.map(s => (s.id === id ? { ...s, [field]: value } : s)));
  };

  /* ----------------------------------------------------------------------
     Gambar
     ---------------------------------------------------------------------- */

  const handleImageSlotChange = async (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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
        const lalai = [
          'Sesi penerangan awal tajuk dan objektif pembelajaran oleh guru bertugas.',
          'Murid-murid berbincang dan bekerjasama dalam kumpulan kecil.',
          'Bimbingan rapat secara bersemuka (intervensi) diberikan kepada murid sasaran.',
          'Murid membuat simulasi pembentangan hasil tugasan di hadapan kelas.'
        ];
        const baharu = [...prev];
        baharu[index] = lalai[index] ?? '';
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
    // Gambar dalam IndexedDB tidak dipadam di sini — jika pengguna membatalkan
    // suntingan, rekod asal masih memerlukannya. App.handleSaveActivity yang
    // membuang gambar yatim selepas simpanan disahkan.
    setImages(prev => prev.map((v, i) => (i === index ? '' : v)));
    setImagePreviews(prev => prev.map((v, i) => (i === index ? '' : v)));
    setImageCaptions(prev => prev.map((v, i) => (i === index ? '' : v)));
  };

  const handleCaptionSlotChange = (index: number, text: string) => {
    setImageCaptions(prev => prev.map((v, i) => (i === index ? text : v)));
  };

  /* ----------------------------------------------------------------------
     Catatan impak — preset dengan ruang ganti diisi daripada rekod semasa
     ---------------------------------------------------------------------- */

  const muridBernama = students.filter(s => s.name.trim());

  const konteksCatatan = {
    aktiviti: finalActivityName,
    kelas: finalClassName,
    bil: muridBernama.length,
    bilNaik: muridBernama.filter(
      s => typeof s.tpAfter === 'number' && s.tpAfter > s.currentTp
    ).length,
    subjek: subject
  };

  /** Preset kandungan bagi aktiviti yang sedang dipilih, jika ada. */
  const presetAktivitiTerpilih = useMemo(
    () => cariPresetAktiviti(finalActivityName),
    [finalActivityName]
  );
  const adaDeskripsiPreset = Boolean(presetAktivitiTerpilih);

  /** Catatan impak lalai bagi aktiviti terpilih, ruang ganti sudah diisi. */
  const impakPreset = useMemo(() => {
    const preset = cariPresetAktiviti(finalActivityName);
    return preset ? isiCatatan(preset.impak, konteksCatatan) : '';
    // konteksCatatan dibina semula setiap render; kebergantungan disenaraikan
    // secara nilai supaya efek di bawah tidak berjalan tanpa henti.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    finalActivityName,
    finalClassName,
    subject,
    konteksCatatan.bil,
    konteksCatatan.bilNaik
  ]);

  /*
   * Kekalkan catatan impak selari dengan rekod, selagi guru belum menyuntingnya.
   *
   * Catatan menyebut bilangan murid dan nama kelas, jadi teks yang ditulis
   * ketika baru dua murid ditanda akan menjadi tidak benar sebaik sahaja guru
   * menanda murid ketiga. Selagi bendera auto masih hidup, teks dikira semula;
   * sebaik guru menaip sendiri, ia dibiarkan sepenuhnya.
   */
  useEffect(() => {
    if (impakAuto) setNotes(impakPreset);
  }, [impakAuto, impakPreset]);

  const handlePilihPresetImpak = (teks: string) => {
    if (!teks) return;
    const diisi = isiCatatan(teks, konteksCatatan);
    // Menambah ayat pilihan bermakna guru mengarang catatan sendiri — auto-isi
    // dimatikan supaya ayat yang baru ditambah tidak dihapuskan semula.
    setImpakAuto(false);
    setNotes(prev => (prev.trim() ? `${prev.trim()} ${diisi}` : diisi));
  };

  const handleSimpanPresetImpak = () => {
    const bersih = notes.trim();
    if (!bersih) return;
    if (catatanImpakPresets.some(p => p.trim() === bersih)) {
      alert('Ayat ini sudah ada dalam senarai preset.');
      return;
    }
    onAddImpakPreset?.(bersih);
    alert('Catatan disimpan sebagai preset. Ia kini boleh dipilih pada rekod lain.');
  };

  /* ----------------------------------------------------------------------
     Kemajuan seksyen — penanda siap pada setiap kad
     ---------------------------------------------------------------------- */

  const siap = {
    pentadbiran: Boolean(
      finalGroupName && teacherOnDuty.trim() && date && finalClassName && subjectTeacher.trim()
    ),
    aktiviti: Boolean(finalActivityName && activityDesc.trim()),
    murid: muridBernama.length > 0,
    catatan: notes.trim().length > 0,
    foto: images.some(img => img !== '')
  };
  const bilSiap = Object.values(siap).filter(Boolean).length;

  /* ----------------------------------------------------------------------
     Hantar
     ---------------------------------------------------------------------- */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!finalGroupName) return alert('Sila masukkan atau pilih Kumpulan.');
    if (!teacherOnDuty.trim()) return alert('Sila masukkan nama Guru Bertugas.');
    if (!finalClassName) return alert('Sila masukkan atau pilih Kelas.');
    if (!subjectTeacher.trim()) return alert('Sila masukkan nama Guru BM/BI yang terlibat.');
    if (!finalActivityName) return alert('Sila masukkan atau pilih Nama Aktiviti.');
    if (!activityDesc.trim()) return alert('Sila masukkan deskripsi ringkas aktiviti.');

    if (students.length === 0) {
      return alert(
        'Sila tanda sekurang-kurangnya seorang murid daripada senarai kelas, ' +
          'atau tambah nama murid secara manual.'
      );
    }
    if (students.some(s => !s.name.trim())) {
      return alert('Ada baris murid tanpa nama. Sila isi namanya atau buang baris tersebut.');
    }

    const gambarAkhir = images.filter(img => img !== '');

    /*
     * ID gambar Drive hanya dikekalkan jika senarai gambar TIDAK berubah.
     *
     * driveImages dipadankan dengan images mengikut kedudukan. Jika guru
     * menanggalkan atau menukar satu foto, ID lama akan menunjuk kepada fail
     * yang salah — jadi lebih baik ia dilupuskan dan dibina semula oleh
     * penyegerakan seterusnya. Jika gambar tidak disentuh, mengekalkannya
     * bermakna peranti lain tidak kehilangan foto hanya kerana teks disunting.
     */
    const gambarAsal = initialActivity?.images ?? [];
    const gambarTidakBerubah =
      gambarAsal.length === gambarAkhir.length &&
      gambarAsal.every((img, i) => img === gambarAkhir[i]);

    onSave({
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
      images: gambarAkhir,
      imageCaptions: imageCaptions.filter((_, idx) => images[idx] !== ''),
      createdAt: initialActivity?.createdAt || new Date().toISOString(),
      driveImages: gambarTidakBerubah ? initialActivity?.driveImages : undefined,
      syncedAt: initialActivity?.syncedAt
    });
  };

  const activeCommonActivities = subject === 'BM' ? commonActivitiesBm : commonActivitiesBi;


  return (
    <form onSubmit={handleSubmit} className="resto mx-auto max-w-3xl">
      <div className="resto-shell space-y-4 p-3.5 pb-28 sm:p-5 sm:pb-24">
        {/* ================================================================
            Kepala — bil pesanan
            ================================================================ */}
        <div className="resto-card overflow-hidden">
          <div className="bg-[#33291f] px-4 py-3.5 text-center text-[#fffaf2]">
            <div className="flex items-center justify-center gap-2">
              <UtensilsCrossed className="h-4 w-4 text-[#f2a33c]" />
              <span className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-[#f2a33c]">
                Bil Pesanan PBD
              </span>
              <UtensilsCrossed className="h-4 w-4 text-[#f2a33c]" />
            </div>
            <h1 className="mt-1.5 font-display text-lg font-extrabold leading-tight sm:text-xl">
              {initialActivity ? 'Kemaskini Rekod Aktiviti' : 'Rekod Aktiviti Baharu'}
            </h1>
            <p className="mt-1 text-[11px] leading-snug text-[#d9c9b4]">
              Pilih aktiviti — deskripsi, langkah dan catatan impak terisi sendiri.
              Anda hanya perlu isi maklumat asas, nama murid dan foto.
            </p>
          </div>

          {/* Jalur kemajuan */}
          <div className="space-y-2 px-4 py-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7b6553]">
                Kemajuan Pesanan
              </span>
              <span className="resto-chip">{bilSiap} / 5 siap</span>
            </div>
            <div className="flex gap-1.5">
              {[
                { k: siap.pentadbiran, l: 'Meja' },
                { k: siap.aktiviti, l: 'Menu' },
                { k: siap.murid, l: 'Tetamu' },
                { k: siap.catatan, l: 'Catatan' },
                { k: siap.foto, l: 'Foto' }
              ].map((s, i) => (
                <div key={i} className="flex-1 space-y-1 text-center">
                  <div
                    className={`h-1.5 rounded-full transition-colors ${
                      s.k ? 'bg-[#2f8f5b]' : 'bg-[#eadfc8]'
                    }`}
                  />
                  <span
                    className={`block text-[9px] font-bold uppercase ${
                      s.k ? 'text-[#2f8f5b]' : 'text-[#b0a08c]'
                    }`}
                  >
                    {s.l}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================================================================
            1. Meja & Waktu
            ================================================================ */}
        <div className="resto-card">
          <KepalaKad
            nombor={1}
            ikon={ClipboardList}
            tajuk="Meja & Waktu"
            kapsyen="Kumpulan bertugas, tarikh dan kelas yang dilayan."
            selesai={siap.pentadbiran}
          />

          <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
            {/* Kumpulan */}
            <div>
              <label className="resto-label">Kumpulan Guru</label>
              {!isCustomGroup ? (
                <select
                  value={groupName}
                  onChange={e => {
                    if (e.target.value === 'CUSTOM') setIsCustomGroup(true);
                    else setGroupName(e.target.value);
                  }}
                  className="resto-field"
                >
                  {AVAILABLE_GROUPS.map(grp => (
                    <option key={grp} value={grp}>
                      {grp}
                    </option>
                  ))}
                  <option value="CUSTOM">＋ Kumpulan lain…</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Nama kumpulan"
                    value={customGroupName}
                    onChange={e => setCustomGroupName(e.target.value)}
                    className="resto-field"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomGroup(false)}
                    className="shrink-0 px-2 text-xs font-bold text-[#e0503a] underline"
                  >
                    Senarai
                  </button>
                </div>
              )}
            </div>

            {/* Guru bertugas */}
            <div>
              <label className="resto-label">Guru Bertugas Utama</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#b0a08c]">
                  <User className="h-4 w-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Nama guru bertugas"
                  value={teacherOnDuty}
                  onChange={e => setTeacherOnDuty(e.target.value)}
                  className="resto-field !pl-10"
                />
              </div>
            </div>

            {/* Tarikh */}
            <div>
              <label className="resto-label">Tarikh Aktiviti</label>
              <div className="relative">
                <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-[#b0a08c]">
                  <Calendar className="h-4 w-4" />
                </span>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="resto-field !pl-10"
                />
              </div>
            </div>

            {/* Hari */}
            <div>
              <label className="resto-label">Hari (auto-kira)</label>
              <input type="text" readOnly value={day} className="resto-field font-bold" />
            </div>

            {/* Kelas */}
            <div>
              <label className="resto-label">Kelas</label>
              {!isCustomClass ? (
                <select
                  value={className}
                  onChange={e => {
                    if (e.target.value === 'CUSTOM') setIsCustomClass(true);
                    else setClassName(e.target.value);
                  }}
                  className="resto-field font-bold"
                >
                  {availableClasses.map(cls => (
                    <option key={cls} value={cls}>
                      {cls}
                    </option>
                  ))}
                  <option value="CUSTOM">＋ Kelas lain…</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: 3 PATRIOTIK"
                    value={customClassName}
                    onChange={e => setCustomClassName(e.target.value)}
                    className="resto-field"
                  />
                  <button
                    type="button"
                    onClick={() => setIsCustomClass(false)}
                    className="shrink-0 px-2 text-xs font-bold text-[#e0503a] underline"
                  >
                    Senarai
                  </button>
                </div>
              )}
            </div>

            {/* Guru subjek */}
            <div>
              <label className="resto-label">Guru BM / BI Terlibat</label>
              <input
                type="text"
                required
                placeholder="Nama guru subjek"
                value={subjectTeacher}
                onChange={e => setSubjectTeacher(e.target.value)}
                className="resto-field"
              />
            </div>
          </div>
        </div>

        {/* ================================================================
            2. Pilih Menu — subjek & aktiviti
            ================================================================ */}
        <div className="resto-card">
          <KepalaKad
            nombor={2}
            ikon={BookMarked}
            tajuk="Pilih Menu Aktiviti"
            kapsyen="Subjek sokongan dan aktiviti yang dihidangkan hari ini."
            selesai={siap.aktiviti}
          />

          <div className="space-y-3.5 p-4">
            {/* Subjek */}
            <div>
              <label className="resto-label">Subjek Sokongan</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => handleSubjectChange('BM')}
                  aria-pressed={subject === 'BM'}
                  className={`flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl border-2 font-extrabold transition ${
                    subject === 'BM'
                      ? 'border-[#e0503a] bg-[#fdeae5] text-[#b8331f] shadow-[0_2px_0_0_#f5c6bb]'
                      : 'border-[#eadfc8] bg-[#fffdf8] text-[#7b6553]'
                  }`}
                >
                  <span className="text-sm">Bahasa Melayu</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                    BM
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSubjectChange('BI')}
                  aria-pressed={subject === 'BI'}
                  className={`flex min-h-[3.25rem] flex-col items-center justify-center rounded-xl border-2 font-extrabold transition ${
                    subject === 'BI'
                      ? 'border-[#7c4fa1] bg-[#f3ecf9] text-[#5d3580] shadow-[0_2px_0_0_#d9c7e8]'
                      : 'border-[#eadfc8] bg-[#fffdf8] text-[#7b6553]'
                  }`}
                >
                  <span className="text-sm">Bahasa Inggeris</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">
                    BI
                  </span>
                </button>
              </div>
            </div>

            {/* Nama aktiviti */}
            <div>
              <label className="resto-label">
                Nama Aktiviti · {activeCommonActivities.length} pilihan lazim
              </label>
              {!isCustomActivity ? (
                <select
                  value={activityName}
                  onChange={e => {
                    if (e.target.value === 'CUSTOM') handleGunaAktivitiKhas();
                    else handleActivityChange(e.target.value);
                  }}
                  className="resto-field font-semibold"
                >
                  {activeCommonActivities.map(act => (
                    <option key={act} value={act}>
                      {act}
                    </option>
                  ))}
                  <option value="CUSTOM">＋ Aktiviti khas lain…</option>
                </select>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Contoh: Spelling Bee Khas Tahap 1"
                    value={customActivityName}
                    onChange={e => setCustomActivityName(e.target.value)}
                    className="resto-field"
                  />
                  <button
                    type="button"
                    onClick={handleKembaliSenaraiAktiviti}
                    className="shrink-0 px-2 text-xs font-bold text-[#e0503a] underline"
                  >
                    Senarai
                  </button>
                </div>
              )}
            </div>

            {/* Deskripsi & langkah — diisi automatik daripada aktiviti */}
            <div>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-1.5">
                <label className="resto-label !mb-0">Deskripsi &amp; Langkah Pelaksanaan</label>
                {deskripsiAuto && adaDeskripsiPreset ? (
                  <span className="resto-chip !bg-[#e3f5ea] !border-[#b9e2c9] !text-[#1f6b41]">
                    <Wand2 className="h-3 w-3" />
                    Diisi automatik
                  </span>
                ) : (
                  adaDeskripsiPreset && (
                    <button
                      type="button"
                      onClick={() => {
                        setActivityDesc(presetAktivitiTerpilih?.deskripsi ?? '');
                        setDeskripsiAuto(true);
                      }}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#fff2dc] px-2 py-1 text-[10.5px] font-extrabold text-[#8a5a12] transition hover:bg-[#ffe9c9]"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Guna teks preset
                    </button>
                  )
                )}
              </div>
              <textarea
                rows={9}
                required
                value={activityDesc}
                onChange={e => {
                  setActivityDesc(e.target.value);
                  // Suntingan pertama guru mematikan auto-isi bagi medan ini.
                  setDeskripsiAuto(false);
                }}
                placeholder={
                  subject === 'BM'
                    ? 'Contoh: Murid melakonkan dialog di hadapan kelas secara berkumpulan. Bimbingan diberikan kepada murid yang lemah sebutan.'
                    : 'Contoh: Murid memutar Phonics Wheel dan menyebut gabungan bunyi. Tumpuan diberikan kepada blending perkataan CVC.'
                }
                className="resto-field resize-y leading-relaxed"
              />
              <p className="mt-1 text-[10.5px] leading-relaxed text-[#7b6553]">
                {adaDeskripsiPreset
                  ? 'Deskripsi dan langkah pelaksanaan disediakan mengikut aktiviti yang dipilih. Sunting mana-mana bahagian jika pelaksanaan sebenar berbeza.'
                  : 'Aktiviti khas ini belum mempunyai teks preset — sila tulis deskripsi dan langkah pelaksanaannya.'}
              </p>
            </div>
          </div>
        </div>

        {/* ================================================================
            3. Senarai Tetamu — checklist murid
            ================================================================ */}
        <div className="resto-card">
          <KepalaKad
            nombor={3}
            ikon={Users}
            tajuk="Senarai Tetamu (Murid)"
            kapsyen="Tanda nama murid yang mengikuti sesi bimbingan ini."
            selesai={siap.murid}
            hujung={
              <span className="resto-chip shrink-0">{muridBernama.length} murid</span>
            }
          />

          <div className="space-y-3 p-4">
            {/* Panduan TP */}
            <div className="flex items-start gap-2 rounded-xl bg-[#fff2dc] p-3 text-[11px] leading-relaxed text-[#8a5a12]">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" />
              <p>
                <strong>TP Asal</strong> hanya TP 1 atau TP 2 — aktiviti sokongan
                disasarkan kepada murid yang belum menguasai. <strong>TP Sasaran</strong> boleh
                TP 1 hingga TP 6. Isi <strong>TP Selepas</strong> hanya setelah murid dinilai;
                itulah angka yang dikira sebagai bukti impak.
              </p>
            </div>

            {/* Checklist kelas */}
            {finalClassName && rosterKelas.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#7b6553]">
                    Senarai Kelas {finalClassName} ({rosterKelas.length} nama)
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      type="button"
                      onClick={tandaSemuaKelas}
                      className="rounded-lg bg-[#e3f5ea] px-2.5 py-1 text-[10.5px] font-extrabold text-[#1f6b41] transition hover:bg-[#cfeeda]"
                    >
                      Tanda Semua
                    </button>
                    <button
                      type="button"
                      onClick={buangSemuaKelas}
                      className="rounded-lg bg-[#fdeae5] px-2.5 py-1 text-[10.5px] font-extrabold text-[#b8331f] transition hover:bg-[#fad6cd]"
                    >
                      Kosongkan
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  {rosterKelas.map(murid => {
                    const dipilih = petaDipilih.get(kunciNama(murid.name));
                    return (
                      <div key={murid.id} className="space-y-2">
                        <button
                          type="button"
                          onClick={() => toggleMuridRoster(murid.name)}
                          className={dipilih ? 'resto-check-on' : 'resto-check'}
                          aria-pressed={Boolean(dipilih)}
                        >
                          <span
                            className={`grid h-5 w-5 shrink-0 place-items-center rounded-md border-2 transition ${
                              dipilih
                                ? 'border-[#2f8f5b] bg-[#2f8f5b] text-white'
                                : 'border-[#d8c8ab] bg-white'
                            }`}
                          >
                            {dipilih && <Check className="h-3.5 w-3.5" strokeWidth={3.5} />}
                          </span>
                          <span
                            className={`min-w-0 flex-1 text-[13.5px] font-bold leading-tight ${
                              dipilih ? 'text-[#1f6b41]' : 'text-[#4a3c2e]'
                            }`}
                          >
                            {murid.name}
                          </span>
                          {dipilih && (
                            <span className="shrink-0 rounded-md bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-[#2f8f5b]">
                              TP {dipilih.currentTp} → {dipilih.tpAfter ?? dipilih.targetTp}
                            </span>
                          )}
                        </button>

                        {dipilih && (
                          <ButiranMurid
                            murid={dipilih}
                            presetCatatan={catatanMuridPresets}
                            onUbah={updateStudent}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="space-y-2.5 rounded-xl bg-[#fff3e0] p-4 text-center">
                <Users className="mx-auto h-7 w-7 text-[#c9b393]" strokeWidth={1.5} />
                <p className="text-[12.5px] font-bold text-[#6b5a48]">
                  {finalClassName
                    ? `Tiada nama murid tersimpan untuk kelas ${finalClassName}.`
                    : 'Pilih kelas dahulu untuk memaparkan senarai nama murid.'}
                </p>
                <p className="mx-auto max-w-sm text-[11px] leading-relaxed text-[#7b6553]">
                  Masukkan senarai nama murid sekali sahaja dalam Tetapan &amp; Admin →
                  Senarai Murid (boleh tampal pukal), dan selepas itu ia akan muncul di sini
                  sebagai senarai tanda.
                </p>
                {onOpenAdmin && (
                  <button
                    type="button"
                    onClick={onOpenAdmin}
                    className="resto-btn-alt !min-h-0 !py-2 !text-[12.5px]"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    Buka Senarai Murid
                  </button>
                )}
              </div>
            )}

            {/* Murid ditaip sendiri / dari kelas lain */}
            {muridLain.length > 0 && (
              <div className="space-y-2 border-t border-dashed border-[#e3d5ba] pt-3">
                <span className="text-[11px] font-extrabold uppercase tracking-wide text-[#7b6553]">
                  Nama Ditaip Sendiri ({muridLain.length})
                </span>
                {muridLain.map(murid => (
                  <div key={murid.id} className="space-y-2 rounded-xl bg-[#fff3e0] p-2.5">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={murid.name}
                        onChange={e => updateStudent(murid.id, 'name', e.target.value)}
                        placeholder="Nama penuh murid"
                        className="resto-field !min-h-0 !py-2 font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => removeStudent(murid.id)}
                        className="shrink-0 rounded-lg p-2 text-[#b0a08c] transition hover:bg-[#fdeae5] hover:text-[#e0503a]"
                        title="Buang murid"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <ButiranMurid
                      murid={murid}
                      presetCatatan={catatanMuridPresets}
                      onUbah={updateStudent}
                    />
                  </div>
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addStudentManual}
              className="resto-btn-alt w-full !text-[13px]"
            >
              <Plus className="h-4 w-4" />
              Tambah Nama Murid Secara Manual
            </button>
          </div>
        </div>

        {/* ================================================================
            4. Catatan Chef — impak / refleksi
            ================================================================ */}
        <div className="resto-card">
          <KepalaKad
            nombor={4}
            ikon={ChefHat}
            tajuk="Catatan Impak / Refleksi"
            kapsyen="Rumusan sesi — sudah disediakan, ubah jika sesi berjalan lain."
            selesai={siap.catatan}
          />

          <div className="space-y-3 p-4">
            <div>
              <div className="mb-1 flex flex-wrap items-center justify-between gap-1.5">
                <label className="resto-label !mb-0">Catatan Impak Keseluruhan</label>
                {impakAuto && impakPreset ? (
                  <span className="resto-chip !bg-[#e3f5ea] !border-[#b9e2c9] !text-[#1f6b41]">
                    <Wand2 className="h-3 w-3" />
                    Diisi automatik
                  </span>
                ) : (
                  impakPreset && (
                    <button
                      type="button"
                      onClick={() => setImpakAuto(true)}
                      className="inline-flex items-center gap-1 rounded-lg bg-[#fff2dc] px-2 py-1 text-[10.5px] font-extrabold text-[#8a5a12] transition hover:bg-[#ffe9c9]"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Guna teks preset
                    </button>
                  )
                )}
              </div>
              <textarea
                rows={6}
                value={notes}
                onChange={e => {
                  setNotes(e.target.value);
                  setImpakAuto(false);
                }}
                placeholder="Contoh: Semua murid berjaya melakonkan watak masing-masing dengan penuh yakin. Tiga murid menunjukkan sebutan yang lebih jelas berbanding sesi lepas."
                className="resto-field resize-y leading-relaxed"
              />
              <p className="mt-1 text-[10.5px] leading-relaxed text-[#7b6553]">
                {impakAuto && impakPreset
                  ? 'Catatan ini dijana daripada aktiviti yang dipilih, dan nama kelas serta bilangan murid dikemas kini sendiri. Impak dirangka positif — jika sesi tidak berjalan seperti dirancang, terus taip pandangan anda di sini.'
                  : 'Catatan ini ditulis oleh anda dan tidak akan diubah oleh sistem.'}
              </p>
            </div>

            {/* Ayat tambahan daripada senarai preset umum */}
            <div>
              <label className="resto-label">
                Tambah Ayat Lain · {catatanImpakPresets.length} preset umum
              </label>
              <select
                value=""
                onChange={e => {
                  handlePilihPresetImpak(e.target.value);
                  e.target.value = '';
                }}
                className="resto-field !bg-[#fff2dc] font-semibold !text-[#8a5a12]"
              >
                <option value="">＋ Sambung satu ayat rumusan lagi…</option>
                {catatanImpakPresets.map((p, i) => (
                  <option key={i} value={p}>
                    {i + 1}. {isiCatatan(p, konteksCatatan)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {notes.trim() && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setNotes('');
                      setImpakAuto(false);
                    }}
                    className="rounded-lg bg-[#fdeae5] px-3 py-1.5 text-[11px] font-extrabold text-[#b8331f] transition hover:bg-[#fad6cd]"
                  >
                    Kosongkan Catatan
                  </button>
                  {onAddImpakPreset && (
                    <button
                      type="button"
                      onClick={handleSimpanPresetImpak}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#e3f5ea] px-3 py-1.5 text-[11px] font-extrabold text-[#1f6b41] transition hover:bg-[#cfeeda]"
                    >
                      <BookmarkPlus className="h-3.5 w-3.5" />
                      Simpan Sebagai Preset
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* ================================================================
            5. Album Hidangan — 4 foto
            ================================================================ */}
        <div className="resto-card">
          <KepalaKad
            nombor={5}
            ikon={Camera}
            tajuk="Album Foto Laporan (4 Panel)"
            kapsyen="Foto bagi setiap fasa bimbingan untuk laporan bergambar."
            selesai={siap.foto}
            hujung={
              <span className="resto-chip shrink-0">
                {images.filter(Boolean).length} / 4
              </span>
            }
          />

          <div className="space-y-3 p-4">
            {images.some(img => img !== '') && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setImages(['', '', '', '']);
                    setImagePreviews(['', '', '', '']);
                    setImageCaptions(['', '', '', '']);
                  }}
                  className="rounded-lg bg-[#fdeae5] px-3 py-1.5 text-[11px] font-extrabold text-[#b8331f] transition hover:bg-[#fad6cd]"
                >
                  Kosongkan Semua Foto
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {[
                {
                  label: 'Fasa 1: Set Induksi',
                  desc: 'Sesi penerangan awal tajuk dan modul.'
                },
                {
                  label: 'Fasa 2: Aktiviti Utama',
                  desc: 'Murid bekerjasama dalam kumpulan/tugasan.'
                },
                {
                  label: 'Fasa 3: Sesi Bimbingan',
                  desc: 'Bimbingan rapat bersemuka dengan murid.'
                },
                {
                  label: 'Fasa 4: Hasil Kerja',
                  desc: 'Murid mementaskan dialog atau hasil kerja.'
                }
              ].map((panel, idx) => {
                const img = imagePreviews[idx];
                const caption = imageCaptions[idx];
                const sedangMuatNaik = uploadingSlot === idx;

                return (
                  <div key={idx} className="space-y-2 rounded-xl bg-[#fffdf8] p-2.5">
                    <span className="flex items-center gap-1.5 text-[11px] font-extrabold text-[#4a3c2e]">
                      <span className="grid h-4 w-4 place-items-center rounded-full bg-[#f2a33c] text-[9px] font-extrabold text-white">
                        {idx + 1}
                      </span>
                      {panel.label}
                    </span>

                    {img ? (
                      <div className="space-y-2">
                        <div className="relative aspect-video overflow-hidden rounded-lg bg-[#f2ead9]">
                          <img
                            src={img}
                            alt={`Pratonton ${panel.label}`}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <button
                            type="button"
                            onClick={() => removeImageSlot(idx)}
                            className="absolute right-1.5 top-1.5 rounded-full bg-[#33291f]/80 p-1.5 text-white transition hover:bg-[#33291f]"
                            title="Padam foto"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={caption || ''}
                          onChange={e => handleCaptionSlotChange(idx, e.target.value)}
                          placeholder={panel.desc}
                          className="resto-field !min-h-0 !py-2"
                        />
                      </div>
                    ) : (
                      <>
                        <input
                          id={`image-slot-input-${idx}`}
                          type="file"
                          accept="image/*"
                          onChange={e => handleImageSlotChange(idx, e)}
                          className="hidden"
                        />
                        <label
                          htmlFor={`image-slot-input-${idx}`}
                          className={`flex aspect-video flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed p-3 text-center transition ${
                            sedangMuatNaik
                              ? 'cursor-wait border-[#f2a33c] bg-[#fff2dc]'
                              : 'cursor-pointer border-[#e0d2b6] bg-white hover:border-[#f2a33c] hover:bg-[#fffaf0]'
                          }`}
                        >
                          {sedangMuatNaik ? (
                            <>
                              <Upload className="h-5 w-5 animate-pulse text-[#f2a33c]" />
                              <span className="text-[11px] font-extrabold text-[#8a5a12]">
                                Memampat &amp; menyimpan…
                              </span>
                            </>
                          ) : (
                            <>
                              <Camera className="h-6 w-6 text-[#c9b393]" strokeWidth={1.5} />
                              <span className="text-[12px] font-extrabold text-[#6b5a48]">
                                Muat Naik Foto {idx + 1}
                              </span>
                              <span className="text-[10px] leading-tight text-[#82705c]">
                                {panel.desc}
                              </span>
                            </>
                          )}
                        </label>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Nota kaki resit */}
        <p className="flex items-center justify-center gap-1.5 px-2 text-center text-[10.5px] leading-relaxed text-[#7b6553]">
          <Sparkles className="h-3 w-3 shrink-0 text-[#f2a33c]" />
          Rekod disimpan dalam peranti ini dan disegerakkan ke Google Sheets jika sambungan
          awan telah ditetapkan.
        </p>
      </div>

      {/* ==================================================================
          Bar tindakan melekat — sentiasa dalam jangkauan ibu jari
          ================================================================== */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t-2 border-[#eadfc8] bg-[#fffaf2]/95 px-3 py-3 backdrop-blur-md md:left-64 print:hidden">
        <div className="mx-auto flex max-w-3xl items-center gap-2.5">
          <button type="button" onClick={onCancel} className="resto-btn-alt shrink-0">
            <X className="h-4 w-4" />
            <span className="hidden sm:inline">Batal</span>
          </button>
          <button type="submit" className="resto-btn flex-1">
            <Check className="h-4.5 w-4.5" strokeWidth={3} />
            {initialActivity ? 'Kemaskini Rekod' : 'Simpan Rekod'}
            <span className="text-[11px] font-bold text-[#f2a33c]">({bilSiap}/5)</span>
          </button>
        </div>
      </div>
    </form>
  );
}
