import React, { useState } from 'react';
import {
  Database,
  Download,
  Copy,
  Check,
  Code,
  FileSpreadsheet,
  Link2,
  FolderKanban,
  HelpCircle,
  Play,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function GoogleSheetsIntegration() {
  const [copiedScript, setCopiedScript] = useState(false);
  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [webAppUrl, setWebAppUrl] = useState(() => {
    return localStorage.getItem('pbd_appscript_url') || '';
  });
  const [syncStatus, setSyncStatus] = useState<'IDLE' | 'SYNCING' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [syncMessage, setSyncMessage] = useState('');

  // 1. Google Sheets Column Blueprint
  const excelColumns = [
    { no: 1, name: 'ID_Aktiviti', type: 'Teks (Unik)', example: 'act-001', desc: 'ID unik bagi setiap rekod laporan.' },
    { no: 2, name: 'Tarikh', type: 'Tarikh (YYYY-MM-DD)', example: '2026-07-20', desc: 'Tarikh aktiviti sokongan dijalankan.' },
    { no: 3, name: 'Hari', type: 'Teks', example: 'Isnin', desc: 'Hari bertugas.' },
    { no: 4, name: 'Kumpulan', type: 'Teks', example: 'Ancala', desc: 'Kumpulan guru bertugas.' },
    { no: 5, name: 'Guru_Bertugas', type: 'Teks', example: 'Siti Noraidah', desc: 'Nama guru bertugas utama.' },
    { no: 6, name: 'Kelas', type: 'Teks', example: '3 Kritis', desc: 'Kelas yang disasarkan.' },
    { no: 7, name: 'Subjek', type: 'Teks (BM/BI)', example: 'BM', desc: 'Subjek akademik terpilih.' },
    { no: 8, name: 'Aktiviti', type: 'Teks', example: 'Main peranan', desc: 'Nama modul / aktiviti sokongan.' },
    { no: 9, name: 'Deskripsi', type: 'Teks (Perenggan)', example: 'Murid melakonkan dialog...', desc: 'Langkah pelaksanaan bimbingan.' },
    { no: 10, name: 'Guru_Subjek', type: 'Teks', example: 'Samsiah Sundu', desc: 'Guru subjek yang terlibat.' },
    { no: 11, name: 'Murid_Terlibat', type: 'Teks (Senarai)', example: 'Akram (TP2->TP3), M. Yusuf (TP2->TP3)...', desc: 'Senarai penuh murid terlibat, TP asal, TP sasaran dan nota.' },
    { no: 12, name: 'Catatan_Refleksi', type: 'Teks (Perenggan)', example: 'Semua murid berjaya...', desc: 'Rumusan impak keseluruhan.' },
    { no: 13, name: 'Pautan_Gambar_Drive', type: 'Teks (Pautan URL)', example: 'https://drive.google.com/open?id=...', desc: 'Pautan folder gambar yang dimuat naik ke Google Drive secara automatik.' }
  ];

  // 2. Google Apps Script Code
  const appsScriptCode = `/**
 * Google Apps Script: Integrasi Laporan Aktiviti PBD & Folder Bergambar Google Drive
 * 
 * Skenario:
 * 1. Menerima data JSON dari Web App LaporPBD (termasuk butiran aktiviti, murid & fail imej base64).
 * 2. Menyimpan maklumat bertulis ke baris baharu di Google Sheets.
 * 3. Mencipta Folder Laporan bergambar di Google Drive (GD) di bawah Folder Induk.
 * 4. Menukarkan Base64 imej kepada fail imej dan menyimpannya di dalam folder GD tersebut.
 * 5. Memulangkan pautan folder Drive tersebut semula ke Google Sheets.
 */

// Sila masukkan ID Folder Induk Google Drive anda di sini (Tinggalkan kosong untuk cipta di My Drive)
const PARENT_DRIVE_FOLDER_ID = ""; 

function doPost(e) {
  try {
    // Membaca parameter data POST
    const rawData = e.postData.contents;
    const data = JSON.parse(rawData);
    
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Cipta baris tajuk (headers) sekiranya helaian (sheet) masih kosong
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "ID_Aktiviti", 
        "Tarikh", 
        "Hari", 
        "Kumpulan", 
        "Guru_Bertugas", 
        "Kelas", 
        "Subjek", 
        "Aktiviti", 
        "Deskripsi", 
        "Guru_Subjek", 
        "Murid_Terlibat", 
        "Catatan_Refleksi", 
        "Pautan_Gambar_Drive"
      ]);
      // Cantikkan tajuk
      sheet.getRange(1, 1, 1, 13).setFontWeight("bold").setBackground("#e2e8f0");
    }
    
    // 1. Menguruskan Folder Bergambar di Google Drive (GD)
    let folderUrl = "Tiada gambar dimuat naik";
    
    if (data.images && data.images.length > 0) {
      let parentFolder;
      if (PARENT_DRIVE_FOLDER_ID && PARENT_DRIVE_FOLDER_ID.trim() !== "") {
        parentFolder = DriveApp.getFolderById(PARENT_DRIVE_FOLDER_ID);
      } else {
        parentFolder = DriveApp.getRootFolder();
      }
      
      // Cipta folder khusus untuk laporan aktiviti ini
      const folderName = "PBD_" + data.className + "_" + data.date + "_" + data.activityName.substring(0, 20);
      const activityFolder = parentFolder.createFolder(folderName);
      activityFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      folderUrl = activityFolder.getUrl();
      
      // Simpan setiap imej base64 ke dalam folder
      data.images.forEach((base64String, index) => {
        try {
          // Bersihkan header base64 (e.g. data:image/png;base64,)
          const contentType = base64String.substring(5, base64String.indexOf(";"));
          const base64Data = base64String.substring(base64String.indexOf(",") + 1);
          
          const decodedBlob = Utilities.newBlob(
            Utilities.base64Decode(base64Data), 
            contentType, 
            "Foto_" + (index + 1) + "_" + data.className + ".png"
          );
          
          activityFolder.createFile(decodedBlob);
        } catch (imgError) {
          // Log ralat imej tetapi teruskan pemprosesan
          Logger.log("Ralat simpan imej: " + imgError.toString());
        }
      });
    }
    
    // 2. Formatkan data senarai murid ke dalam satu sel teks yang kemas
    const formattedStudents = data.students.map((stud, idx) => {
      return (idx + 1) + ". " + stud.name + " (TP" + stud.currentTp + " -> TP" + stud.targetTp + ") - " + (stud.notes || "");
    }).join("\\n");
    
    // 3. Masukkan rekod ke helaian Excel/Sheets
    sheet.appendRow([
      data.id,
      data.date,
      data.day,
      data.groupName,
      data.teacherOnDuty,
      data.className,
      data.subject,
      data.activityName,
      data.activityDesc,
      data.subjectTeacher,
      formattedStudents,
      data.notes,
      folderUrl
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "SUCCESS",
      message: "Data berjaya disegerakkan ke Google Sheets!",
      folderUrl: folderUrl
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "ERROR",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  // Copy code utility
  const copyScriptToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  // CSV Generator for downloading template
  const downloadCsvTemplate = () => {
    const headers = excelColumns.map(col => col.name).join(',');
    const sampleRow = [
      'act-001',
      '2026-07-20',
      'Isnin',
      'Ancala',
      'Siti Noraidah',
      '3 Kritis',
      'BM',
      'Main Peranan (Kemahiran Bertutur)',
      'Murid melakonkan watak dan berdialog berdasarkan skrip bertema Kerjasama di Kampung.',
      'Samsiah Sundu',
      '1. Akram (TP2 -> TP3) - Lancar, 2. Adam (TP1 -> TP2) - Dengan bimbingan',
      'Semua murid terlibat berjaya melakonkan watak masing-masing dengan penuh keyakinan.',
      'https://drive.google.com/drive/folders/sample-url'
    ].map(val => `"${val.replace(/"/g, '""')}"`).join(',');

    const csvContent = 'data:text/csv;charset=utf-8,' + headers + '\n' + sampleRow;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'Tapak_Excel_Aktiviti_Sokongan_PBD.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2000);
  };

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('pbd_appscript_url', webAppUrl.trim());
    alert('Pautan Google Apps Script berjaya disimpan secara lokal!');
  };

  // Simulated Sync Test
  const triggerTestSync = async () => {
    if (!webAppUrl.trim()) {
      alert('Sila masukkan pautan Apps Script Web App yang sah terlebih dahulu.');
      return;
    }

    setSyncStatus('SYNCING');
    setSyncMessage('Sedang menghantar isyarat ujian segerak ke Google Sheets...');

    const testPayload = {
      id: 'act-test-999',
      groupName: 'Ujian Integrasi',
      teacherOnDuty: 'Samsiah Sundu',
      date: new Date().toISOString().split('T')[0],
      day: 'Isnin',
      className: 'Tahap 1 Test',
      subject: 'BM',
      activityName: 'Ujian Sambungan Web App',
      activityDesc: 'Sesi ping ujian integrasi penuh dari Sistem LaporPBD ke Google Sheets.',
      subjectTeacher: 'Samsiah Sundu',
      students: [
        { id: 'stud-t1', name: 'Murid Simulasi 1', currentTp: 2, targetTp: 3, notes: 'Berjaya menyambung API.' }
      ],
      notes: 'Sambungan Web App & Google Drive API berjalan lancar!',
      images: [] // empty for speed
    };

    try {
      const response = await fetch(webAppUrl.trim(), {
        method: 'POST',
        mode: 'no-cors', // Apps Script requires no-cors sometimes if not returning proper headers
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });

      setSyncStatus('SUCCESS');
      setSyncMessage('Isyarat ujian berjaya dihantar ke Google Sheets! Sila buka Google Sheet anda untuk melihat kemasukan baris baharu.');
    } catch (err: any) {
      setSyncStatus('ERROR');
      setSyncMessage(`Ralat sambungan: ${err.message || err}. Sila pastikan tetapan Apps Script deployed sebagai Web App (Anyone can access).`);
    }
  };

  return (
    <div className="space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Integrasi Google Sheets & Google Drive (GD)</h1>
        <p className="text-xs text-gray-500 mt-1">
          PBD diuruskan menggunakan simpanan awan Google. Ketahui cara menghubungkan web app ini terus ke helaian Excel Google Sheets dan folder gambar Google Drive anda.
        </p>
      </div>

      {/* Steps Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step 1: Excel Tapak Blueprint */}
        <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-emerald-600" />
              1. Tapak Blueprint Excel / Google Sheets
            </h3>
            
            <button
              onClick={downloadCsvTemplate}
              className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition"
            >
              {copiedTemplate ? <Check className="h-3.5 w-3.5" /> : <Download className="h-3.5 w-3.5" />}
              Muat Turun Template CSV
            </button>
          </div>

          <p className="text-xs text-gray-500">
            Pastikan helaian Google Sheets anda mengandungi susunan kolum berikut (Apps Script akan membina kolum ini secara automatik sekiranya ia kosong):
          </p>

          <div className="overflow-x-auto border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-550 border-b border-gray-150 text-gray-700 font-bold">
                  <th className="p-3 text-center w-12">No.</th>
                  <th className="p-3">Nama Kolum (Header)</th>
                  <th className="p-3">Jenis Data</th>
                  <th className="p-3">Contoh Nilai</th>
                  <th className="p-3">Keterangan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-600">
                {excelColumns.map((col) => (
                  <tr key={col.no} className="hover:bg-gray-50/40">
                    <td className="p-2.5 text-center font-bold text-gray-400">{col.no}</td>
                    <td className="p-2.5 font-semibold text-gray-900 font-mono text-[11px]">{col.name}</td>
                    <td className="p-2.5 text-gray-500">{col.type}</td>
                    <td className="p-2.5 italic text-gray-400 text-[11px] truncate max-w-[150px]">{col.example}</td>
                    <td className="p-2.5 text-gray-500 leading-relaxed">{col.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Step 2: Live Sync Configuration Card */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
            <Link2 className="h-5 w-5 text-blue-600" />
            2. Konfigurasi Segerak Langsung (API Sync)
          </h3>
          
          <p className="text-xs text-gray-500 leading-relaxed">
            Apabila anda sudah selesai melancarkan Google Apps Script sebagai <span className="font-bold">Web App</span>, tampalkan pautan Web App URL tersebut di bawah untuk mengaktifkan fungsi segerak satu-klik dari sistem ini.
          </p>

          <form onSubmit={handleSaveUrl} className="space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Apps Script Web App URL</label>
              <input
                type="url"
                required
                placeholder="https://script.google.com/macros/s/.../exec"
                value={webAppUrl}
                onChange={(e) => setWebAppUrl(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-xs text-gray-800 focus:border-blue-500 focus:bg-white focus:outline-none transition"
              />
            </div>
            
            <button
              type="submit"
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 py-2.5 text-xs font-bold text-white shadow-sm transition"
            >
              Simpan Pautan API
            </button>
          </form>

          {/* Test connection row */}
          {webAppUrl && (
            <div className="pt-4 border-t border-gray-100 space-y-2.5">
              <h4 className="text-xs font-bold text-gray-800">Uji Sambungan Google Sheets</h4>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                Hantar satu baris data ujian simulasi ke Sheets anda untuk memastikan Apps Script berfungsi.
              </p>
              
              <button
                type="button"
                onClick={triggerTestSync}
                className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/50 hover:bg-blue-50 py-2 text-xs font-bold text-blue-700 transition"
              >
                <Play className="h-3.5 w-3.5" />
                Jalankan Ujian Sambungan
              </button>

              {syncStatus !== 'IDLE' && (
                <div className={`p-3 rounded-lg text-xs leading-relaxed ${
                  syncStatus === 'SYNCING' ? 'bg-amber-50 border border-amber-200 text-amber-800' :
                  syncStatus === 'SUCCESS' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' :
                  'bg-red-50 border border-red-200 text-red-800'
                }`}>
                  <span className="font-bold uppercase block mb-1">
                    {syncStatus === 'SYNCING' ? 'MENGHANTAR...' : syncStatus === 'SUCCESS' ? 'BERJAYA!' : 'RALAT'}
                  </span>
                  {syncMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Code Area & Apps Script copy */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-50 pb-3">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Code className="h-5 w-5 text-blue-600" />
            3. Kod Google Apps Script Lengkap (Salin & Tampal)
          </h3>
          
          <button
            onClick={copyScriptToClipboard}
            className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 border border-blue-200 px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-100 transition"
          >
            {copiedScript ? (
              <>
                <Check className="h-4 w-4" />
                Kod Berjaya Disalin!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Salin Kod Apps Script
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-gray-500 leading-relaxed">
          Kod berikut mengandungi fungsi menerima data rekod PBD dari web app ini, mendaftar data tersebut ke Google Sheets, dan mencipta sub-folder gambar di Google Drive bagi folder bergambar laporan (GD) secara automatik.
        </p>

        {/* Code view panel */}
        <div className="relative rounded-xl overflow-hidden border border-gray-150 bg-gray-900 p-4">
          <pre className="text-[10px] md:text-xs text-gray-300 overflow-x-auto max-h-96 font-mono leading-relaxed">
            {appsScriptCode}
          </pre>
        </div>
      </div>

      {/* step-by-step user guide */}
      <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2 border-b border-gray-50 pb-3">
          <FolderKanban className="h-5 w-5 text-indigo-600" />
          Panduan Langkah Demi Langkah (Untuk Cikgu)
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs text-gray-600 leading-relaxed">
          {/* Step 1 */}
          <div className="space-y-2 border-l-2 border-gray-100 pl-4 relative">
            <span className="absolute top-0 -left-2.5 h-5 w-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">1</span>
            <h4 className="font-bold text-gray-900">Buka Helaian Google Sheets</h4>
            <p>Bina Google Sheets baru di Google Drive anda. Berikan tajuk yang sesuai (contoh: <code>Laporan PBD Tahap 1</code>).</p>
          </div>

          {/* Step 2 */}
          <div className="space-y-2 border-l-2 border-gray-100 pl-4 relative">
            <span className="absolute top-0 -left-2.5 h-5 w-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">2</span>
            <h4 className="font-bold text-gray-900">Buka Editor Apps Script</h4>
            <p>Di bahagian menu bar Google Sheets, klik <span className="font-semibold">Extensions (Pelanjutan) &gt; Apps Script</span>.</p>
          </div>

          {/* Step 3 */}
          <div className="space-y-2 border-l-2 border-gray-100 pl-4 relative">
            <span className="absolute top-0 -left-2.5 h-5 w-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">3</span>
            <h4 className="font-bold text-gray-900">Tampal Kod & Lancar Web App</h4>
            <p>Padam kod sedia ada dalam editor, tampal kod yang anda salin di atas. Klik <span className="font-semibold">Deploy (Laksana) &gt; New Deployment (Pelaksanaan Baru)</span>.</p>
          </div>

          {/* Step 4 */}
          <div className="space-y-2 border-l-2 border-gray-100 pl-4 relative">
            <span className="absolute top-0 -left-2.5 h-5 w-5 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-[10px]">4</span>
            <h4 className="font-bold text-gray-900">Tetapkan Kebenaran (Permission)</h4>
            <p>Pilih <span className="font-semibold">Web App</span>. Tetapkan "Execute as: <span className="font-semibold">Me</span>" dan "Who has access: <span className="font-semibold">Anyone</span>". Klik Deploy dan berikan kebenaran Google Drive.</p>
          </div>
        </div>
      </div>

    </div>
  );
}
