# LaporPBD — Sistem Laporan Aktiviti Sokongan PBD Tahap 1

**SK Bandar Tawau · Sidang Petang · Sesi 2026**

Aplikasi web untuk merekod, melaporkan secara bergambar dan memantau pelaksanaan
aktiviti sokongan PBD yang membantu murid meningkatkan Tahap Penguasaan (TP)
dalam Bahasa Melayu dan Bahasa Inggeris.

React 19 · TypeScript · Tailwind CSS v4 · Recharts · Gemini AI

---

## Menjalankan aplikasi

```bash
npm install
npm run dev      # pembangunan
npm run build    # binaan produksi
npm run lint     # semakan taip
```

---

## Storan data

| Data | Lokasi | Sebab |
|---|---|---|
| Rekod aktiviti & tetapan | `localStorage` | Ringan, teks sahaja |
| Gambar laporan | **IndexedDB** | Kuota ratusan MB |
| Salinan awan (pilihan) | Google Sheets + Drive | Sandaran & perkongsian |

Gambar **tidak** disimpan dalam `localStorage`. Kuota `localStorage` hanya ~5 MB
manakala satu gambar telefon boleh mencecah 4–8 MB selepas pengekodan base64 —
satu rekod bergambar sudah cukup untuk menyebabkan penyimpanan gagal.

Sebaliknya:

1. Gambar dimampatkan ke lebar maksimum 1280px, JPEG kualiti 0.72.
2. Disimpan dalam IndexedDB melalui `src/lib/photoStore.ts`.
3. Rekod aktiviti hanya memegang rujukan ringkas `idb:<id>`.

Rekod lama yang mengandungi base64 tertanam dipindahkan secara **automatik** ke
IndexedDB pada muat pertama (`migrateInlineImages`). Tiada tindakan diperlukan
daripada pengguna, dan proses ini selamat dijalankan berulang kali.

---

## Tahap Penguasaan: tiga medan berbeza

Setiap murid mempunyai tiga nilai TP yang **tidak** boleh dicampur adukkan:

| Medan | Maksud | Bila diisi |
|---|---|---|
| `currentTp` | **TP Sebelum** — tahap ketika aktiviti bermula | Semasa merancang |
| `targetTp` | **TP Sasaran** — tahap yang dihasratkan guru | Semasa merancang |
| `tpAfter` | **TP Selepas** — tahap yang **benar-benar dicapai** | Selepas sesi tamat |

Papan pemuka, laporan bergambar dan penyegerakan Sheets mengukur impak
menggunakan `tpAfter` sahaja. Sasaran ialah hasrat, bukan bukti — jika `tpAfter`
belum diisi, murid dilaporkan sebagai **"Belum dinilai"** dan tidak dikira dalam
peratusan peningkatan.

Pembantu dalam `src/types.ts`:

```ts
tpGain(student)     // kenaikan sebenar, atau null jika belum dinilai
tpOutcome(student)  // tpAfter jika ada, jika tidak targetTp
isAssessed(student) // adakah murid sudah dinilai?
```

---

## Integrasi Google Sheets & Drive

Kod backend berada dalam [`apps-script/Code.gs`](apps-script/Code.gs). Tab
**Integrasi Excel & GD** memaparkan fail itu terus melalui import `?raw`, jadi
kod yang disalin pengguna sentiasa sepadan dengan repo — tiada salinan kedua
yang boleh tersasar.

### Folder gambar

`PARENT_DRIVE_FOLDER_ID` di bahagian atas `Code.gs` menentukan folder induk
tempat semua gambar laporan disimpan. Ambil ID daripada URL folder:

```
https://drive.google.com/drive/folders/<ID-DI-SINI>
```

Folder induk kekal persendirian — ID sahaja tidak memberi akses. Hanya
subfolder setiap rekod ditetapkan *sesiapa dengan pautan boleh lihat*, kerana
pautan itulah yang disimpan dalam Sheet supaya boleh dibuka daripada laporan.

Kosongkan nilai tersebut untuk kembali mencipta folder di My Drive. Jalankan
`ujiFolderInduk()` dalam editor Apps Script untuk mengesahkan akses tanpa
menulis sebarang rekod.

Setiap rekod mendapat satu subfolder `PBD_<id>_<kelas>_<tarikh>` yang
**diguna semula** apabila rekod disegerakkan semula, jadi penyegerakan
berulang tidak menghasilkan folder atau gambar pendua.

### Pemasangan

1. Google Sheet baharu → **Extensions → Apps Script**.
2. Tampal keseluruhan `apps-script/Code.gs`.
3. Tetapkan `PARENT_DRIVE_FOLDER_ID` (lihat di atas).
4. Jalankan `setupSheet()` sekali, beri kebenaran akses.
5. **Deploy → New deployment → Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
6. Salin URL `/exec` → tampal dalam tab Integrasi → **Simpan Pautan API**.
7. **Jalankan Ujian Sambungan** untuk mengesahkan.

> Setiap kali `Code.gs` diubah, ulang
> **Deploy → Manage deployments → Edit → Version: New version → Deploy.**
> Menyimpan sahaja tidak mencukupi.

### Menyegerakkan rekod

Butang **Segerakkan Rekod Sekarang** menghantar rekod sebenar yang tersimpan,
bukan data ujian. Gambar diselesaikan daripada IndexedDB kepada base64 dan
dimuat naik ke Google Drive. Rekod dengan ID yang sama **dikemas kini**, bukan
diduplikasi, jadi penyegerakan berulang adalah selamat.

Penyegerakan berjalan secara berjujukan kerana Apps Script mempunyai had kuota
pelaksanaan yang mudah dilanggar oleh permintaan serentak.

---

## Struktur

```
apps-script/Code.gs              Backend Sheets + Drive (sumber rasmi)
src/
  lib/photoStore.ts              IndexedDB, mampatan, migrasi
  lib/useResolvedImages.ts       Hook menyelesaikan rujukan gambar
  lib/sheetsSync.ts              Penyegerakan sebenar ke Sheets
  components/
    Dashboard.tsx                Statistik, carta, jadual guru bertugas
    ActivityForm.tsx             Borang rekod aktiviti
    ActivityList.tsx             Senarai rekod
    PictorialReport.tsx          Laporan bergambar A4
    GoogleSheetsIntegration.tsx  Tetapan & segerak awan
    GeminiAssistant.tsx          Cadangan strategi PBD (AI)
    AdminSettings.tsx            Tetapan dinamik sekolah
  types.ts                       Model data + pembantu TP
  data.ts                        Kumpulan bertugas, kelas, senarai aktiviti
```

---

## Kumpulan guru bertugas (sesi 2026)

ANCALA · BUANA · CANDRA · KENCANA · MEGA · PAWANA

Senarai penuh ahli dan minggu bertugas ada dalam `src/data.ts` dan boleh
disunting melalui **Tetapan & Menu Admin**.
