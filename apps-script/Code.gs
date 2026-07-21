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
var PARENT_DRIVE_FOLDER_ID = '1JFWs-3tTEeep3wY66r3vPGQIr6fhFBGs';

/** Digunakan hanya apabila PARENT_DRIVE_FOLDER_ID dikosongkan. */
var PARENT_FOLDER_NAME = 'LAPORAN BERGAMBAR SOKONGAN PBD';

/**
 * Token rahsia yang melindungi operasi PADAM.
 *
 * ⚠️  NILAI INI TURUT DIBENAMKAN DALAM BUNDLE AWAM APLIKASI
 *     (src/config.ts), atas keputusan sekolah supaya guru tidak perlu
 *     menampal apa-apa. Ia BUKAN lagi rahsia: sesiapa yang membuka tapak
 *     boleh membacanya melalui DevTools.
 *
 * Ini bermakna perlindungan yang asalnya dibina di sini kini berfungsi
 * sebagai halangan tidak sengaja sahaja, bukan kawalan keselamatan sebenar.
 * Ia menghalang permintaan rawak yang tidak membawa token, tetapi tidak
 * menghalang sesiapa yang benar-benar berniat menyalahgunakannya.
 *
 * Sekolah menerima risiko ini kerana ramai guru bukan pengguna ICT mahir.
 * Jika berlaku penyalahgunaan: jalankan janaAdminToken(), kemas kini token
 * di SINI dan dalam src/config.ts, kemudian deploy versi baharu.
 *
 * Dibiarkan kosong = fungsi padam DIMATIKAN sepenuhnya (gagal-tertutup).
 */
var ADMIN_TOKEN = 'c9d0168cdb671969e8323cf5edc500f4e0987600';

/**
 * Lajur helaian.
 *
 * Data_JSON diletakkan PALING AKHIR dan mengandungi rekod penuh dalam bentuk
 * JSON. Lajur lain wujud untuk dibaca manusia; lajur ini wujud supaya rekod
 * boleh dipulangkan kepada aplikasi tanpa kehilangan maklumat.
 *
 * Tanpa lajur ini, rekod tidak boleh dibina semula dengan tepat: senarai murid
 * disimpan sebagai teks berformat ("1. Nama (sebelum TP2 → selepas TP3)"),
 * dan menghuraikannya semula adalah rapuh — satu nama murid yang mengandungi
 * kurungan sudah cukup untuk merosakkannya.
 */
var HEADERS = [
  'ID_Aktiviti', 'Cap_Masa_Segerak', 'Tarikh', 'Hari', 'Kumpulan', 'Guru_Bertugas',
  'Kelas', 'Subjek', 'Aktiviti', 'Deskripsi', 'Guru_Subjek',
  'Bil_Murid', 'Murid_Terlibat',
  'Purata_TP_Sebelum', 'Purata_TP_Selepas', 'Purata_Peningkatan', 'Bil_Belum_Dinilai',
  'Catatan_Refleksi', 'Bil_Gambar', 'Pautan_Gambar_Drive', 'Data_JSON'
];

/** Indeks lajur Data_JSON (1-berasaskan) — dikira supaya tidak tersasar. */
var LAJUR_JSON = HEADERS.indexOf('Data_JSON') + 1;

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
  // Helaian kosong — tulis tajuk penuh.
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    _gayaTajuk(sheet);
    sheet.setFrozenRows(1);
    return;
  }

  /*
   * Helaian sedia ada mungkin dicipta sebelum lajur baharu diperkenalkan.
   * Menulis baris yang lebih panjang daripada bilangan lajur akan gagal,
   * jadi lajur yang hilang ditambah di hujung tanpa menyentuh data sedia ada.
   */
  var lebarSemasa = sheet.getLastColumn();
  if (lebarSemasa < HEADERS.length) {
    var tambahan = HEADERS.slice(lebarSemasa);
    sheet.getRange(1, lebarSemasa + 1, 1, tambahan.length).setValues([tambahan]);
    _gayaTajuk(sheet);
  }
}

function _gayaTajuk(sheet) {
  sheet
    .getRange(1, 1, 1, HEADERS.length)
    .setFontWeight('bold')
    .setBackground('#1E3A8A')
    .setFontColor('#FFFFFF')
    .setWrap(true);
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
    return _json({
      status: 'SUCCESS',
      message: 'LaporPBD backend aktif.',
      version: '4.0',
      // Membolehkan antara muka menunjukkan sama ada padam jauh tersedia,
      // tanpa mendedahkan token itu sendiri.
      deleteEnabled: _padamDiaktifkan()
    });
  }

  if (aksi === 'senarai') {
    return _senaraiRekod();
  }

  return _json({ status: 'ERROR', message: 'Tindakan tidak dikenali: ' + aksi });
}

/**
 * Pulangkan semua rekod supaya mana-mana peranti boleh memuatkannya.
 *
 * Sebelum ini penyegerakan hanya sehala. Rekod naik ke Sheet tetapi tiada
 * laluan untuk memuat turunnya, jadi guru yang membuka sistem pada telefon
 * melihat senarai kosong walaupun Sheet sudah penuh dengan rekod.
 */
function _senaraiRekod() {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    if (sheet.getLastRow() < 2) {
      return _json({ status: 'SUCCESS', records: [], count: 0 });
    }

    // Baca lajur Data_JSON sahaja — jauh lebih ringan daripada membaca
    // keseluruhan helaian, dan lajur lain hanya untuk bacaan manusia.
    var nilai = sheet.getRange(2, LAJUR_JSON, sheet.getLastRow() - 1, 1).getValues();
    var rekod = [];
    var dilangkau = 0;

    for (var i = 0; i < nilai.length; i++) {
      var mentah = nilai[i][0];
      if (!mentah) {
        // Baris yang disegerakkan sebelum lajur Data_JSON wujud. Ia tidak
        // boleh dibina semula dengan selamat, jadi dilangkau dan dikira
        // supaya pengguna tahu ada rekod lama yang perlu dihantar semula.
        dilangkau++;
        continue;
      }
      try {
        rekod.push(JSON.parse(mentah));
      } catch (err) {
        dilangkau++;
      }
    }

    return _json({
      status: 'SUCCESS',
      records: rekod,
      count: rekod.length,
      skipped: dilangkau
    });
  } catch (err) {
    return _json({ status: 'ERROR', message: String(err) });
  }
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

    // Muatan lama tidak mempunyai medan "action" langsung, jadi ketiadaannya
    // bermakna simpan — klien sedia ada terus berfungsi tanpa perubahan.
    if (data.action === 'padam') {
      return _padamRekod(data);
    }

    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    _pastikanTajuk(sheet);

    var students = data.students || [];
    var ringkasan = _ringkasanTp(students);

    // ---- Gambar → Google Drive -------------------------------------------
    var folderUrl = 'Tiada gambar dimuat naik';
    var bilGambar = 0;
    var images = data.images || [];

    // ID fail Drive dikumpul supaya peranti LAIN boleh memaparkan gambar.
    // Gambar asal berada dalam IndexedDB peranti yang memuat naiknya sahaja;
    // tanpa ID ini, telefon guru lain hanya akan melihat rekod tanpa gambar.
    var driveImages = [];

    if (images.length > 0) {
      var folder = _folderRekod(data);
      folderUrl = folder.getUrl();

      for (var i = 0; i < images.length; i++) {
        var fail = _simpanImej(folder, images[i], data, i);
        if (fail) {
          bilGambar++;
          driveImages.push(fail.getId());
        }
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
      folderUrl,
      JSON.stringify({
        id: data.id,
        groupName: data.groupName,
        teacherOnDuty: data.teacherOnDuty,
        date: data.date,
        day: data.day,
        className: data.className,
        subject: data.subject,
        activityName: data.activityName,
        activityDesc: data.activityDesc,
        subjectTeacher: data.subjectTeacher,
        students: students,
        notes: data.notes,
        imageCaptions: data.imageCaptions || [],
        // ID fail Drive, bukan rujukan IndexedDB — hanya ini yang bermakna
        // kepada peranti selain yang memuat naik gambar berkenaan.
        driveImages: driveImages,
        syncedAt: new Date().toISOString()
      })
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
/*  Padam rekod                                                                */
/* ========================================================================== */

function _padamDiaktifkan() {
  return typeof ADMIN_TOKEN === 'string' && ADMIN_TOKEN.trim().length >= 16;
}

/**
 * Perbandingan token yang tidak membocorkan panjang padanan melalui masa.
 *
 * Perbandingan rentetan biasa (===) terhenti pada aksara pertama yang berbeza,
 * jadi masa tindak balas boleh membocorkan berapa banyak awalan yang tepat.
 * Kesan itu kecil melalui rangkaian, tetapi menyamakan masa hampir tidak
 * memerlukan kos, jadi tiada sebab untuk tidak melakukannya.
 */
function _tokenSah(diberi) {
  if (!_padamDiaktifkan()) return false;
  if (typeof diberi !== 'string') return false;

  var jangkaan = ADMIN_TOKEN.trim();
  var diuji = diberi.trim();
  if (diuji.length !== jangkaan.length) return false;

  var beza = 0;
  for (var i = 0; i < jangkaan.length; i++) {
    beza |= jangkaan.charCodeAt(i) ^ diuji.charCodeAt(i);
  }
  return beza === 0;
}

/**
 * Padam satu rekod daripada Sheet, berserta folder gambarnya dalam Drive.
 *
 * Memerlukan token pentadbir. Tanpa perlindungan ini, sesiapa yang menjumpai
 * URL /exec boleh memadam laporan sebenar sekolah.
 */
function _padamRekod(data) {
  if (!_padamDiaktifkan()) {
    return _json({
      status: 'ERROR',
      code: 'DELETE_DISABLED',
      message:
        'Fungsi padam dimatikan. Tetapkan ADMIN_TOKEN (sekurang-kurangnya 16 aksara) ' +
        'dalam Code.gs, kemudian deploy versi baharu.'
    });
  }

  if (!_tokenSah(data.token)) {
    return _json({
      status: 'ERROR',
      code: 'BAD_TOKEN',
      message: 'Token pentadbir tidak sah. Rekod tidak dipadam.'
    });
  }

  var id = data.id;
  if (!id) {
    return _json({ status: 'ERROR', message: 'ID rekod diperlukan untuk memadam.' });
  }

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  var baris = _cariBaris(sheet, id);

  if (baris < 0) {
    // Bukan ralat: rekod mungkin sudah dipadam, atau tidak pernah disegerakkan.
    // Melaporkannya sebagai kegagalan hanya akan mengelirukan pengguna.
    return _json({
      status: 'SUCCESS',
      message: 'Rekod ' + id + ' tiada dalam Sheet — tiada apa yang perlu dipadam.',
      removed: false
    });
  }

  sheet.deleteRow(baris);

  // Buang juga folder gambarnya supaya Drive tidak dipenuhi fail yatim.
  var folderDibuang = false;
  try {
    var nama = 'PBD_' + id + '_' + (data.className || '') + '_' + (data.date || '');
    var it = _folderInduk().getFoldersByName(nama);
    if (it.hasNext()) {
      it.next().setTrashed(true);
      folderDibuang = true;
    }
  } catch (err) {
    // Baris sudah dipadam; kegagalan membuang folder tidak boleh
    // menjadikan keseluruhan operasi gagal.
    Logger.log('Gagal membuang folder untuk ' + id + ': ' + err);
  }

  return _json({
    status: 'SUCCESS',
    message: 'Rekod ' + id + ' dipadam daripada Sheet.',
    removed: true,
    folderTrashed: folderDibuang
  });
}

/**
 * Jana token rahsia untuk ditampal ke dalam ADMIN_TOKEN.
 * Jalankan dari editor Apps Script.
 */
function janaAdminToken() {
  var token = Utilities.getUuid().replace(/-/g, '') + Utilities.getUuid().slice(0, 8);
  var mesej =
    'Token pentadbir baharu:\n\n' + token +
    '\n\nSalin ke pemboleh ubah ADMIN_TOKEN di bahagian atas Code.gs, ' +
    'kemudian Deploy versi baharu.\n\nJANGAN commit token ini ke GitHub.';
  Logger.log(mesej);
  SpreadsheetApp.getUi().alert(mesej);
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
