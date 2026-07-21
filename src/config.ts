/**
 * Konfigurasi terbina.
 *
 * ┌──────────────────────────────────────────────────────────────────────────┐
 * │  SEMUA NILAI DI SINI ADALAH AWAM.                                        │
 * │  Aplikasi ini ialah tapak statik; apa sahaja di dalam fail ini berakhir   │
 * │  dalam bundle JavaScript yang dimuat turun oleh setiap pelawat. Menjadikan│
 * │  repositori peribadi TIDAK mengubah hakikat ini — bundle yang disiarkan   │
 * │  tetap boleh dibaca melalui DevTools oleh sesiapa yang membuka tapak.     │
 * └──────────────────────────────────────────────────────────────────────────┘
 */

/**
 * Pautan Web App Apps Script lalai.
 *
 * Dibenamkan atas permintaan sekolah supaya guru tidak perlu menampal apa-apa
 * tetapan. Ramai guru bukan pengguna ICT mahir, dan meminta setiap seorang
 * menampal URL panjang pada setiap peranti menyebabkan laporan tidak
 * disegerakkan — kegagalan yang lebih kerap berlaku berbanding penyalahgunaan.
 *
 * KESAN KESELAMATAN YANG DITERIMA: sesiapa yang membuka tapak boleh membaca
 * pautan ini dan menghantar data ke Google Sheet sekolah. Paling teruk, ia
 * menghasilkan baris sampah yang boleh dipadam. Ia TIDAK membenarkan sesiapa
 * memadam rekod sedia ada — operasi itu dilindungi token pentadbir yang
 * SENGAJA tidak dibenamkan di sini.
 *
 * Untuk menutup pendedahan ini sepenuhnya, tukar deployment Apps Script
 * daripada "Anyone" kepada "Anyone within <organisasi anda>". Guru yang sudah
 * log masuk akaun @moe-dl.edu.my akan terus berfungsi tanpa sebarang tetapan,
 * manakala orang luar tidak boleh menulis langsung.
 */
export const DEFAULT_WEBAPP_URL =
  'https://script.google.com/macros/s/AKfycbzXl5W25HDCT9jiZmlSdsvurjGvDd0rj7cbIdoQBlPvAvmutTnZYYM6p1WzAEeNewxg/exec';

/**
 * Token pentadbir SENGAJA dibiarkan kosong.
 *
 * Token ini membenarkan pemadaman kekal baris Google Sheet dan penghantaran
 * folder gambar ke tong sampah Drive. Membenamkannya di sini bermakna sesiapa
 * yang membuka tapak boleh memusnahkan keseluruhan rekod laporan sekolah —
 * dan lebih buruk lagi, ia menghasilkan rasa selamat yang palsu kerana
 * perlindungan itu kelihatan wujud sedangkan ia sudah tidak bermakna.
 *
 * Guru tidak memerlukan keupayaan ini. Hanya pentadbir yang memadam rekod,
 * dan beliau boleh menampal token sekali pada perantinya sendiri melalui
 * Tetapan & Admin.
 */
export const DEFAULT_ADMIN_TOKEN = '';
