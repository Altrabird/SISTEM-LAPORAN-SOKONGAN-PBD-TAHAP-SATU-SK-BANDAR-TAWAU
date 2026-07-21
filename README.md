# LaporPBD — Sistem Laporan Aktiviti Sokongan PBD Tahap 1

**SK Bandar Tawau · Sidang Petang · Sesi 2026**

Aplikasi web untuk merekod, melaporkan secara bergambar dan memantau pelaksanaan
aktiviti sokongan PBD yang membantu murid meningkatkan Tahap Penguasaan (TP)
dalam Bahasa Melayu dan Bahasa Inggeris.

**Tapak langsung:** https://altrabird.github.io/SISTEM-LAPORAN-SOKONGAN-PBD-TAHAP-SATU-SK-BANDAR-TAWAU/

React 19 · TypeScript · Tailwind CSS v4 · Recharts · Gemini AI

---

## Menjalankan aplikasi

```bash
npm install
npm run dev      # pembangunan (termasuk pelayan API untuk Gemini)
npm run build    # binaan produksi
npm run lint     # semakan taip
```

---

## Penerbitan

Setiap push ke `main` mencetuskan [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
yang menjalankan semakan taip, membina projek, dan menerbitkan `dist/` ke
GitHub Pages. Folder `dist/` kekal dalam `.gitignore` — binaan berlaku di CI,
bukan di-commit.

> Sumber Pages mesti ditetapkan kepada **GitHub Actions**, bukan
> "Deploy from a branch". Menghidangkan `main` dari root akan menyajikan
> `index.html` sumber yang merujuk `/src/main.tsx` — TypeScript mentah yang
> tidak boleh dilaksanakan pelayar, menghasilkan halaman kosong.

### Apa yang berfungsi pada tapak statik

| Ciri | Pages | Tempatan |
|---|---|---|
| Rekod aktiviti, gambar, papan pemuka | Ya | Ya |
| Laporan bergambar A4 | Ya | Ya |
| Segerak Google Sheets + Drive | Ya | Ya |
| **Penasihat AI Gemini** | **Tidak** | Ya |

Penasihat AI memanggil `/api/gemini/generate-strategies`, yang dilayan oleh
`server.ts` menggunakan `GEMINI_API_KEY` di pihak pelayan. GitHub Pages hanya
menghidangkan fail statik, jadi tiada pelayan untuk melayan laluan itu.

Kunci tersebut **sengaja** tidak dihantar ke pelayar. Memindahkan panggilan
Gemini ke sisi-pelanggan memang akan menjadikannya berfungsi di Pages, tetapi
kunci itu akan terbenam dalam bundle JavaScript awam dan boleh disalah guna
sesiapa sahaja. Untuk menggunakan ciri AI, jalankan `npm run dev` secara
tempatan, atau hoskan aplikasi pada perkhidmatan yang menjalankan Node
(Render, Railway, Cloud Run).

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

### Memadam rekod daripada Sheets

Secara lalai, memadam aktiviti dalam aplikasi hanya membuangnya daripada
peranti itu — barisnya kekal dalam Google Sheets selama-lamanya. Untuk
membolehkan padam jauh:

1. Dalam editor Apps Script, jalankan `janaAdminToken()`.
2. Tampal token yang dijana ke `ADMIN_TOKEN` di bahagian atas `Code.gs`.
3. Deploy versi baharu.
4. Dalam aplikasi: **Integrasi Excel & GD → Token Pentadbir → Simpan**.

Selepas itu, memadam aktiviti turut membuang barisnya daripada Sheet dan
menghantar folder gambarnya ke tong sampah Drive.

> **Mengapa perlu token.** Deployment dikongsi sebagai `Anyone`, jadi sesiapa
> yang menjumpai URL `/exec` boleh menghantar permintaan. Menulis rekod paling
> teruk menghasilkan baris sampah yang mudah dibuang; memadam pula memusnahkan
> laporan sebenar. Sebab itu operasi padam dilindungi secara berasingan.
>
> `ADMIN_TOKEN` kekal **kosong** dalam repo ini, dan nilai kosong mematikan
> fungsi padam sepenuhnya. Sesiapa yang menyalin repo ini tidak mewarisi
> endpoint pemusnah data yang terdedah. Token sebenar hidup hanya dalam
> salinan Apps Script anda dan `localStorage` pelayar guru — jangan sekali-kali
> commit ke GitHub.

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
