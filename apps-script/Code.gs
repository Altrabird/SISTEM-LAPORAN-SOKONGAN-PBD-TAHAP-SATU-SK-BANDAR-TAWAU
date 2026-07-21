/**
 * ============================================================================
 *  LaporPBD — Backend Google Apps Script
 *  Sistem Laporan Aktiviti Sokongan PBD Tahap 1 · SK Bandar Tawau
 * ============================================================================
 *
 *  Fail ini ialah SUMBER RASMI kod Apps Script. Tab "Integrasi Excel & GD"
 *  dalam web app memaparkan fail ini terus (diimport melalui `?raw`), jadi
 *  kod yang disalin pengguna sentiasa sama dengan yang ada di repo ini.
 *
 *  CARA PASANG
 *    1. Buka Google Sheet baharu → Extensions → Apps Script.
 *    2. Padam kod contoh, tampal keseluruhan fail ini.
 *    3. Jalankan setupSheet() sekali (beri kebenaran akses).
 *    4. Deploy → New deployment → Web app
 *         Execute as     : Me
 *         Who has access : Anyone
 *    5. Salin URL /exec → tampal dalam web app.
 *
 *  PENTING: setiap kali kod ini diubah, ulang
 *  Deploy → Manage deployments → Edit → Version: New version → Deploy.
 *  Tanpa versi baharu, perubahan tidak berkuat kuasa.
 * ============================================================================
 */

/**
 * ID folder induk Google Drive untuk semua gambar laporan.
 *
 * Diambil daripada URL folder:
 *   https://drive.google.com/drive/folders/<ID-DI-SINI>
 *
 * Folder ini kekal PERSENDIRIAN — ID sahaja tidak memberi akses kepada sesiapa.
 * Hanya subfolder setiap rekod ditetapkan "sesiapa dengan pautan boleh lihat",
 * kerana pautan itulah yang disimpan dalam Sheet supaya boleh dibuka.
 *
 * Kosongkan untuk kembali mencipta folder bernama PARENT_FOLDER_NAME di My Drive.
 */
var PARENT_DRIVE_FOLDER_ID = '1A_JV5GFxvv78huTGa_VYcoaszV1H4K76';

/** Digunakan hanya apabila PARENT_DRIVE_FOLDER_ID dikosongkan. */
var PARENT_FOLDER_NAME = 'LAPORAN BERGAMBAR SOKONGAN PBD';

var HEADERS = [
  'ID_Aktiviti', 'Cap_Masa_Segerak', 'Tarikh', 'Hari', 'Kumpulan', 'Guru_Bertugas',
  'Kelas', 'Subjek', 'Aktiviti', 'Deskripsi', 'Guru_Subjek',
  'Bil_Murid', 'Murid_Terlibat',
  'Purata_TP_Sebelum', 'Purata_TP_Selepas', 'Purata_Peningkatan', 'Bil_Belum_Dinilai',
  'Catatan_Refleksi', 'Bil_Gambar', 'Pautan_Gambar_Drive'
];

/* ========================================================================== */
/*  Pemasangan                                                                 */
/* ========================================================================== */

function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  _pastikanTajuk(sheet);
  _folderInduk();
  SpreadsheetApp.getUi().alert(
    'Tapak berjaya disediakan.\n\n' +
      'Helaian: ' + sheet.getName() + '\n' +
      'Folder gambar: ' + PARENT_FOLDER_NAME + '\n\n' +
      'Langkah seterusnya: Deploy → New deployment → Web app.'
  );
}

function _pastikanTajuk(sheet) {
  if (sheet.getLastRow() !== 0) return;
  sheet.appendRow(HEADERS);
  sheet
    .getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#1E3A8A')
    .setFontColor('#FFFFFF')
    .setWrap(true);
  sheet.setFrozenRows(1);
}

function _folderInduk() {
  if (PARENT_DRIVE_FOLDER_ID && PARENT_DRIVE_FOLDER_ID.trim() !== '') {
    try {
      return DriveApp.getFolderById(PARENT_DRIVE_FOLDER_ID.trim());
    } catch (err) {
      // getFolderById membuang ralat mentah yang sukar difahami guru.
      // Berikan sebab sebenar dan cara membetulkannya.
      throw new Error(
        'Folder induk Drive tidak dapat dibuka (ID: ' + PARENT_DRIVE_FOLDER_ID + '). ' +
          'Pastikan ID betul dan akaun yang menjalankan skrip ini mempunyai akses ' +
          'kepada folder tersebut. Kosongkan PARENT_DRIVE_FOLDER_ID untuk kembali ' +
          'menggunakan folder "' + PARENT_FOLDER_NAME + '" di My Drive.'
      );
    }
  }
  var it = DriveApp.getFoldersByName(PARENT_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PARENT_FOLDER_NAME);
}

/**
 * Sahkan tetapan folder tanpa menulis apa-apa rekod.
 * Jalankan fungsi ini dalam editor Apps Script untuk menguji akses folder.
 */
function ujiFolderInduk() {
  var folder = _folderInduk();
  var mesej =
    'Folder induk berjaya diakses.\n\n' +
    'Nama  : ' + folder.getName() + '\n' +
    'Pautan: ' + folder.getUrl();
  Logger.log(mesej);
  SpreadsheetApp.getUi().alert(mesej);
}

/* ========================================================================== */
/*  API                                                                        */
/* ========================================================================== */

/** Ujian sambungan: web app memanggil ?action=ping untuk mengesahkan deployment. */
function doGet(e) {
  var aksi = (e && e.parameter && e.parameter.action) || 'ping';
  if (aksi === 'ping') {
    return _json({ status: 'SUCCESS', message: 'LaporPBD backend aktif.', version: '2.0' });
  }
  return _json({ status: 'ERROR', message: 'Tindakan tidak dikenali: ' + aksi });
}

function doPost(e) {
  var kunci = LockService.getScriptLock();
  try {
    kunci.waitLock(30000);
  } catch (err) {
    return _json({ status: 'ERROR', message: 'Pelayan sibuk. Sila cuba sebentar lagi.' });
  }

  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    _pastikanTajuk(sheet);

    var students = data.students || [];
    var ringkasan = _ringkasanTp(students);

    // ---- Gambar → Google Drive -------------------------------------------
    var folderUrl = 'Tiada gambar dimuat naik';
    var bilGambar = 0;
    var images = data.images || [];

    if (images.length > 0) {
      var folder = _folderRekod(data);
      folderUrl = folder.getUrl();

      for (var i = 0; i < images.length; i++) {
        var hasil = _simpanImej(folder, images[i], data, i);
        if (hasil) bilGambar++;
      }
    }

    // ---- Baris rekod ------------------------------------------------------
    // Kemas kini rekod sedia ada jika ID sudah ada, supaya segerak berulang
    // tidak menghasilkan baris pendua.
    var baris = [
      data.id,
      new Date(),
      data.date,
      data.day,
      data.groupName,
      data.teacherOnDuty,
      data.className,
      data.subject,
      data.activityName,
      data.activityDesc,
      data.subjectTeacher,
      students.length,
      _senaraiMurid(students),
      ringkasan.purataSebelum,
      ringkasan.purataSelepas,
      ringkasan.purataNaik,
      ringkasan.belumDinilai,
      data.notes,
      bilGambar,
      folderUrl
    ];

    var barisSedia = _cariBaris(sheet, data.id);
    if (barisSedia > 0) {
      sheet.getRange(barisSedia, 1, 1, baris.length).setValues([baris]);
    } else {
      sheet.appendRow(baris);
    }

    return _json({
      status: 'SUCCESS',
      message: 'Rekod ' + data.id + ' berjaya disegerakkan.',
      folderUrl: folderUrl,
      photosSaved: bilGambar,
      updated: barisSedia > 0
    });
  } catch (error) {
    return _json({ status: 'ERROR', message: String(error) });
  } finally {
    kunci.releaseLock();
  }
}

/* ========================================================================== */
/*  Utiliti                                                                    */
/* ========================================================================== */

function _json(objek) {
  return ContentService.createTextOutput(JSON.stringify(objek)).setMimeType(
    ContentService.MimeType.JSON
  );
}

function _cariBaris(sheet, id) {
  if (!id || sheet.getLastRow() < 2) return -1;
  var nilai = sheet.getRange(2, 1, sheet.getLastRow() - 1, 1).getValues();
  for (var i = 0; i < nilai.length; i++) {
    if (nilai[i][0] === id) return i + 2;
  }
  return -1;
}

/**
 * Dapatkan folder Drive bagi satu rekod — guna semula jika sudah wujud.
 *
 * Nama folder bersifat deterministik (berdasarkan ID rekod), jadi menyegerakkan
 * rekod yang sama berulang kali tidak lagi menghasilkan folder baharu setiap
 * kali. Sebelum ini setiap penyegerakan mencipta folder baharu tanpa syarat:
 * Sheet hanya menyimpan pautan terkini manakala folder lama menjadi yatim dan
 * terus memakan kuota Drive. Menekan "Segerakkan Rekod" beberapa kali sudah
 * cukup untuk menggandakan ratusan fail.
 *
 * Fail sedia ada dalam folder dibuang dahulu supaya gambar tidak bertimbun
 * apabila rekod disunting dan disegerak semula.
 */
function _folderRekod(data) {
  var induk = _folderInduk();
  var nama =
    'PBD_' + (data.id || 'tanpa-id') +
    '_' + (data.className || 'Kelas') +
    '_' + (data.date || '');

  var it = induk.getFoldersByName(nama);
  var folder;

  if (it.hasNext()) {
    folder = it.next();
    // Kosongkan kandungan lama supaya tiada gambar pendua terkumpul.
    var fail = folder.getFiles();
    while (fail.hasNext()) {
      folder.removeFile(fail.next());
    }
  } else {
    folder = induk.createFolder(nama);
  }

  folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return folder;
}

/**
 * Ringkasan TP.
 *
 * Hanya murid yang mempunyai tpAfter dikira sebagai "dinilai". TP Sasaran
 * TIDAK digunakan sebagai pengganti keputusan sebenar — sasaran ialah hasrat,
 * bukan bukti pencapaian.
 */
function _ringkasanTp(students) {
  var jumSebelum = 0;
  var jumSelepas = 0;
  var dinilai = 0;

  for (var i = 0; i < students.length; i++) {
    var s = students[i];
    var selepas = s.tpAfter;
    if (typeof selepas === 'number') {
      jumSebelum += Number(s.currentTp) || 0;
      jumSelepas += selepas;
      dinilai++;
    }
  }

  if (dinilai === 0) {
    return { purataSebelum: '', purataSelepas: '', purataNaik: '', belumDinilai: students.length };
  }

  var bulat = function (n) {
    return Math.round((n / dinilai) * 100) / 100;
  };

  return {
    purataSebelum: bulat(jumSebelum),
    purataSelepas: bulat(jumSelepas),
    purataNaik: Math.round(((jumSelepas - jumSebelum) / dinilai) * 100) / 100,
    belumDinilai: students.length - dinilai
  };
}

function _senaraiMurid(students) {
  var baris = [];
  for (var i = 0; i < students.length; i++) {
    var s = students[i];
    var selepas = typeof s.tpAfter === 'number' ? 'TP' + s.tpAfter : 'belum dinilai';
    baris.push(
      i + 1 + '. ' + s.name +
        ' (sebelum TP' + s.currentTp +
        ' → selepas ' + selepas +
        '; sasaran TP' + s.targetTp + ')' +
        (s.notes ? ' — ' + s.notes : '')
    );
  }
  return baris.join('\n');
}

/**
 * Simpan satu imej base64 ke folder Drive.
 * Sambungan fail diambil daripada jenis MIME sebenar, bukan sentiasa .png.
 */
function _simpanImej(folder, dataUrl, data, index) {
  try {
    if (!dataUrl || dataUrl.indexOf('base64,') === -1) return null;

    var jenis = dataUrl.substring(5, dataUrl.indexOf(';'));
    var base64 = dataUrl.substring(dataUrl.indexOf(',') + 1);
    var sambungan = jenis.indexOf('png') !== -1 ? '.png' : '.jpg';

    var blob = Utilities.newBlob(
      Utilities.base64Decode(base64),
      jenis,
      'Foto_' + (index + 1) + '_' + (data.className || 'kelas') + sambungan
    );
    return folder.createFile(blob);
  } catch (imgError) {
    Logger.log('Ralat simpan imej: ' + imgError.toString());
    return null;
  }
}
