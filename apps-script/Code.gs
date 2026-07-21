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

/** Kosongkan untuk mencipta folder di My Drive, atau isi ID folder induk. */
var PARENT_DRIVE_FOLDER_ID = '';

/** Nama folder induk yang akan dicipta/digunakan untuk semua gambar laporan. */
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
    return DriveApp.getFolderById(PARENT_DRIVE_FOLDER_ID);
  }
  var it = DriveApp.getFoldersByName(PARENT_FOLDER_NAME);
  return it.hasNext() ? it.next() : DriveApp.createFolder(PARENT_FOLDER_NAME);
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
      var folder = _folderInduk().createFolder(
        'PBD_' + (data.className || 'Kelas') + '_' + (data.date || '') + '_' +
          String(data.activityName || '').substring(0, 20)
      );
      folder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
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
