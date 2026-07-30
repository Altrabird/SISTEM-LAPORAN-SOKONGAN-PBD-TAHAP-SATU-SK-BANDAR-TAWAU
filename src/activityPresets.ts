/**
 * activityPresets — kandungan siap sedia bagi setiap aktiviti sokongan.
 *
 * Guru bertugas mengisi laporan ini sebaik sahaja sesi tamat, biasanya sambil
 * berdiri di dalam kelas. Menaip semula deskripsi dan langkah pelaksanaan
 * setiap kali ialah kerja berulang yang sama bagi aktiviti yang sama — dan
 * itulah punca medan tersebut kerap diisi seringkas "main peranan" sahaja,
 * yang tidak mencukupi untuk sebuah laporan rasmi yang ditandatangani GPK.
 *
 * Jadi memilih nama aktiviti terus mengisi deskripsi, langkah pelaksanaan, dan
 * catatan impak. Guru hanya menentukan maklumat asas, nama murid, dan gambar.
 * Kesemua teks tetap boleh disunting — preset ialah titik permulaan, bukan
 * jawapan akhir.
 *
 * NOTA BAHASA: teks ditulis dalam Bahasa Melayu bagi kedua-dua subjek kerana
 * laporan ini dokumen rasmi berbahasa Melayu, tetapi istilah pengajaran
 * Inggeris (sight words, phonics, CVC) dikekalkan asli supaya guru BI
 * mengenalinya. Semuanya dalam satu fail ini jika sekolah mahu menukarnya.
 *
 * Catatan impak boleh mengandungi ruang ganti {aktiviti} {kelas} {bil}
 * {bilNaik} {subjek} — diisi oleh isiCatatan() dalam data.ts.
 */

export interface AktivitiPreset {
  /** Deskripsi ringkas diikuti langkah pelaksanaan bernombor. */
  deskripsi: string;
  /** Catatan impak lalai — dirangka positif, boleh diubah oleh guru. */
  impak: string;
}

/* ==========================================================================
   BAHASA MELAYU
   ========================================================================== */

const BM: Record<string, AktivitiPreset> = {
  'Main Peranan (Roleplay)': {
    deskripsi:
      'Murid dibahagikan kepada kumpulan kecil 3-4 orang dan diberikan kad situasi perbualan harian yang mudah.\n' +
      '1. Guru memperkenalkan situasi serta membaca dialog sebagai model sebutan dan intonasi.\n' +
      '2. Murid berlatih membaca dialog dalam kumpulan; guru memantau dan membetulkan sebutan.\n' +
      '3. Setiap kumpulan melakonkan dialog di hadapan kelas dengan bahan bantu ringkas.\n' +
      '4. Bimbingan individu diberikan kepada murid yang teragak-agak atau tersalah sebutan.\n' +
      '5. Sesi refleksi: murid menyebut semula perkataan baharu yang dipelajari.',
    impak:
      'Aktiviti {aktiviti} bersama {bil} murid {kelas} berjalan lancar. Murid menunjukkan keyakinan yang lebih baik untuk bertutur di hadapan rakan, dan sebutan mereka lebih jelas selepas bimbingan berulang. Pendekatan lakonan sesuai diteruskan pada sesi berikutnya.'
  },

  'Bercerita (Storytelling)': {
    deskripsi:
      'Guru bercerita menggunakan buku bergambar bersaiz besar bagi menarik tumpuan murid.\n' +
      '1. Guru bercerita dengan mimik muka dan suara pelbagai watak.\n' +
      '2. Cerita dihentikan pada titik penting; murid meneka kesudahannya.\n' +
      '3. Murid menceritakan semula jalan cerita menggunakan kad gambar berurutan.\n' +
      '4. Guru membimbing kosa kata baharu dengan menunjukkan gambar berkaitan.\n' +
      '5. Murid melengkapkan tiga ayat mudah tentang watak kegemaran mereka.',
    impak:
      'Melalui {aktiviti}, murid {kelas} lebih fokus dan berani memberi respons secara spontan. Kemahiran mendengar dan menceritakan semula bertambah baik, dan {bil} murid berjaya membina ayat mudah tentang cerita yang didengar.'
  },

  'Mari Membaca Suku Kata': {
    deskripsi:
      'Sesi latih tubu bacaan suku kata secara berperingkat bermula daripada suku kata terbuka.\n' +
      '1. Guru menunjukkan kad suku kata KV (ba, bi, bu) dan murid menyebut secara koir.\n' +
      '2. Murid menyebut satu demi satu untuk guru mengenal pasti bunyi yang sukar.\n' +
      '3. Dua kad digabungkan menjadi perkataan KVKV (buku, bola) dan dibaca bersama.\n' +
      '4. Murid membaca senarai 10 perkataan secara berpasangan sambil saling menyemak.\n' +
      '5. Guru merekodkan bunyi yang masih belum dikuasai untuk sesi susulan.',
    impak:
      'Sesi {aktiviti} membantu murid {kelas} menyebut suku kata dengan lebih tepat dan yakin. {bilNaik} daripada {bil} murid mula membaca perkataan KVKV tanpa bantuan, manakala murid yang masih lemah dikenal pasti untuk bimbingan individu.'
  },

  'Kuiz Interaktif / Kahoot': {
    deskripsi:
      'Kuiz interaktif dijalankan menggunakan telefon guru yang dipaparkan pada skrin kelas.\n' +
      '1. Guru menerangkan cara menjawab dan mengadakan satu soalan percubaan.\n' +
      '2. Murid menjawab secara berkumpulan supaya murid lemah tidak tertinggal.\n' +
      '3. Selepas setiap soalan, guru membincangkan jawapan betul bersama kelas.\n' +
      '4. Soalan yang paling banyak salah diulang pada pusingan kedua.\n' +
      '5. Kumpulan terbaik diberi pengiktirafan ringkas sebagai motivasi.',
    impak:
      'Aktiviti {aktiviti} meningkatkan penglibatan seluruh kelas kerana murid berlumba menjawab dalam suasana yang menyeronokkan. Guru dapat mengenal pasti kelemahan kelas secara serta-merta melalui keputusan kuiz, dan {bil} murid sasaran menunjukkan minat yang jelas terhadap sesi pemulihan.'
  },

  'Nyanyian dan Muzik Suku Kata': {
    deskripsi:
      'Suku kata diperkenalkan melalui lagu berirama mudah yang diulang bersama gerakan tangan.\n' +
      '1. Guru menyanyikan lagu suku kata sekali sambil menunjuk kad bunyi.\n' +
      '2. Murid mengikut secara koir dengan tepukan mengikut setiap suku kata.\n' +
      '3. Murid berdiri dalam bulatan dan menyanyi sambil membuat gerakan.\n' +
      '4. Guru memilih murid secara rawak menyebut suku kata tanpa lagu.\n' +
      '5. Sesi ditutup dengan bacaan perkataan yang terbentuk daripada lagu tersebut.',
    impak:
      'Melalui {aktiviti}, murid {kelas} mengingati bunyi suku kata dengan lebih mudah kerana ia dikaitkan dengan irama dan gerakan. Murid yang biasanya pasif turut menyertai nyanyian, dan tumpuan kelas kekal baik sepanjang sesi.'
  },

  'Permainan Kad Perkataan': {
    deskripsi:
      'Murid bermain kad perkataan dalam kumpulan kecil untuk mengukuhkan pengecaman perkataan.\n' +
      '1. Setiap kumpulan menerima satu set kad perkataan dan satu set kad gambar.\n' +
      '2. Murid memadankan kad perkataan dengan gambar yang betul dalam masa tertentu.\n' +
      '3. Setiap padanan disebut dengan kuat oleh murid sebelum diterima.\n' +
      '4. Guru bergerak antara kumpulan untuk membetulkan sebutan dan padanan salah.\n' +
      '5. Pusingan akhir dijalankan tanpa kad gambar bagi menguji ingatan murid.',
    impak:
      'Permainan {aktiviti} membolehkan murid {kelas} berlatih mengecam perkataan berulang kali tanpa rasa bosan. Kerjasama dalam kumpulan bertambah baik apabila murid yang lebih cepat membantu rakan yang lemah, dan {bil} murid sasaran berjaya memadankan majoriti kad dengan betul.'
  },

  'Kerja Kumpulan (Bento PBD)': {
    deskripsi:
      'Tugasan disusun dalam bentuk kotak bento — beberapa tugasan kecil pelbagai aras dalam satu set.\n' +
      '1. Setiap kumpulan menerima kotak berisi empat tugasan kecil: baca, padan, tulis, lakon.\n' +
      '2. Ahli kumpulan memilih tugasan mengikut tahap kesediaan masing-masing.\n' +
      '3. Murid menyiapkan tugasan secara bergilir dalam masa 10 minit setiap satu.\n' +
      '4. Guru membimbing kumpulan yang tersekat dan menyemak hasil secara berterusan.\n' +
      '5. Setiap kumpulan membentangkan satu hasil tugasan pilihan mereka.',
    impak:
      'Pendekatan {aktiviti} membenarkan setiap murid bekerja pada aras yang sesuai dengannya, jadi murid lemah tidak tertinggal dan murid cepat tidak menunggu. Semua {bil} murid {kelas} menyiapkan sekurang-kurangnya satu tugasan dengan lengkap.'
  },

  'Kuiz Menulis Ayat Mudah': {
    deskripsi:
      'Murid membina ayat mudah berdasarkan gambar rangsangan yang diberikan.\n' +
      '1. Guru menunjukkan satu gambar dan membina ayat contoh bersama kelas.\n' +
      '2. Murid diberikan kad gambar dan senarai perkataan bantuan.\n' +
      '3. Murid menulis dua hingga tiga ayat mudah berdasarkan gambar tersebut.\n' +
      '4. Guru menyemak serta-merta dan membetulkan struktur ayat bersama murid.\n' +
      '5. Beberapa murid membaca ayat mereka di hadapan kelas.',
    impak:
      'Aktiviti {aktiviti} membantu murid {kelas} menyusun ayat dengan struktur yang lebih betul. Semakan serta-merta membolehkan kesilapan dibetulkan sebelum menjadi kebiasaan, dan {bilNaik} daripada {bil} murid berjaya menulis ayat lengkap tanpa bantuan.'
  },

  'Dekod Suku Kata KV + KVKV': {
    deskripsi:
      'Sesi dekod berfokus untuk murid yang belum boleh menggabungkan suku kata menjadi perkataan.\n' +
      '1. Guru mengasingkan murid sasaran dalam kumpulan kecil tidak melebihi lima orang.\n' +
      '2. Kad suku kata KV disebut satu demi satu sehingga lancar.\n' +
      '3. Dua kad dicantumkan secara perlahan-lahan, kemudian dipercepatkan.\n' +
      '4. Murid membaca senarai perkataan KVKV dan menandakan yang sukar.\n' +
      '5. Perkataan yang sukar diulang tiga kali sebelum sesi ditamatkan.',
    impak:
      'Sesi dekod {aktiviti} memberi tumpuan penuh kepada {bil} murid {kelas} yang belum menguasai gabungan suku kata. Bimbingan rapat dalam kumpulan kecil membolehkan guru mengenal pasti bunyi khusus yang menjadi halangan setiap murid.'
  },

  'Bacaan Berpasangan (Rakan Pembaca)': {
    deskripsi:
      'Murid yang lebih lancar dipasangkan dengan murid yang memerlukan bimbingan bacaan.\n' +
      '1. Guru memasangkan murid dan menerangkan peranan rakan pembaca.\n' +
      '2. Rakan pembaca membaca satu ayat, kemudian murid sasaran mengulanginya.\n' +
      '3. Selepas satu perenggan, kedua-duanya bertukar peranan.\n' +
      '4. Guru bergerak antara pasangan untuk memantau dan memberi pujian.\n' +
      '5. Setiap pasangan melaporkan satu perkataan baharu yang dipelajari.',
    impak:
      'Melalui {aktiviti}, murid {kelas} membaca dengan lebih banyak ulangan berbanding sesi kelas biasa. Murid sasaran kelihatan lebih selesa membaca bersama rakan berbanding di hadapan kelas, dan hubungan rakan sebaya turut bertambah baik.'
  },

  'Dikte Perkataan Bergambar': {
    deskripsi:
      'Dikte dijalankan dengan bantuan gambar supaya murid lemah tidak hilang arah.\n' +
      '1. Guru menunjukkan gambar dan menyebut perkataan dengan jelas dua kali.\n' +
      '2. Murid menulis perkataan tersebut dalam buku latihan masing-masing.\n' +
      '3. Selepas lima perkataan, jawapan disemak bersama di papan tulis.\n' +
      '4. Murid membetulkan sendiri ejaan yang salah dengan warna berbeza.\n' +
      '5. Perkataan yang paling banyak salah diulang pada penghujung sesi.',
    impak:
      'Aktiviti {aktiviti} membantu murid {kelas} mengaitkan bunyi dengan ejaan secara lebih tepat. Semakan sendiri memupuk kesedaran murid terhadap kesilapan mereka, dan bilangan kesalahan ejaan berkurangan pada pusingan kedua.'
  },

  'Teka Silang Kata Mudah': {
    deskripsi:
      'Teka silang kata ringkas digunakan untuk mengukuhkan perbendaharaan kata asas.\n' +
      '1. Guru menerangkan cara mengisi petak menggunakan satu contoh bersama kelas.\n' +
      '2. Murid bekerja berpasangan bagi mengisi petak berdasarkan gambar petunjuk.\n' +
      '3. Guru memberi petunjuk tambahan kepada pasangan yang tersekat.\n' +
      '4. Jawapan disemak bersama dan disebut dengan kuat oleh murid.\n' +
      '5. Murid menulis tiga perkataan baharu dalam buku kosa kata mereka.',
    impak:
      'Melalui {aktiviti}, murid {kelas} mengulang kaji perbendaharaan kata dalam bentuk permainan, jadi tumpuan mereka kekal sepanjang sesi. Kerja berpasangan menggalakkan perbincangan tentang ejaan dan makna perkataan.'
  },

  'Papan Cerita Bergambar (Bina Ayat)': {
    deskripsi:
      'Murid menyusun gambar menjadi satu jalan cerita, kemudian membina ayat bagi setiap gambar.\n' +
      '1. Setiap kumpulan menerima empat kad gambar yang bercampur susunannya.\n' +
      '2. Murid berbincang dan menyusun gambar mengikut urutan yang logik.\n' +
      '3. Murid membina satu ayat mudah bagi setiap gambar.\n' +
      '4. Guru membimbing penggunaan kata hubung supaya ayat lebih lancar.\n' +
      '5. Setiap kumpulan membaca cerita lengkap mereka di hadapan kelas.',
    impak:
      'Aktiviti {aktiviti} melatih murid {kelas} berfikir secara berurutan sebelum menulis. Perbincangan kumpulan membantu murid lemah menyumbang idea secara lisan walaupun kemahiran menulis mereka masih terhad.'
  },

  'Sudut Bacaan 10 Minit': {
    deskripsi:
      'Sesi bacaan pendek yang konsisten di sudut bacaan kelas sebelum PdPc bermula.\n' +
      '1. Murid memilih bahan bacaan sendiri daripada rak sudut bacaan.\n' +
      '2. Murid membaca secara senyap selama lapan minit.\n' +
      '3. Guru duduk bersama murid sasaran dan mendengar bacaan mereka.\n' +
      '4. Dua orang murid berkongsi satu perkara menarik yang dibaca.\n' +
      '5. Murid merekodkan tajuk bacaan dalam kad rekod bacaan masing-masing.',
    impak:
      'Sesi {aktiviti} membina tabiat membaca secara konsisten dalam kalangan murid {kelas}. Guru dapat mendengar bacaan {bil} murid sasaran secara individu, sesuatu yang sukar dilakukan dalam kelas penuh.'
  },

  'Bengkel Tulisan Cantik & Ejaan': {
    deskripsi:
      'Bengkel berfokus untuk memperbaiki bentuk tulisan dan ejaan asas murid.\n' +
      '1. Guru menunjukkan cara membentuk huruf yang kerap ditulis songsang.\n' +
      '2. Murid berlatih menulis huruf tersebut pada lembaran bergaris.\n' +
      '3. Guru menyemak pegangan pensel dan kedudukan buku setiap murid.\n' +
      '4. Murid menulis lima perkataan pilihan dengan tulisan terbaik mereka.\n' +
      '5. Hasil terbaik dipamerkan di sudut kelas sebagai galakan.',
    impak:
      'Bengkel {aktiviti} memperbaiki kekemasan tulisan {bil} murid {kelas} secara ketara dalam satu sesi. Pembetulan pegangan pensel membantu murid menulis dengan lebih selesa dan kurang cepat letih.'
  },

  'Gallery Walk (Labelkan Gambar)': {
    deskripsi:
      'Gambar besar dilekatkan di beberapa stesen sekeliling kelas untuk dilabelkan murid.\n' +
      '1. Guru menyediakan empat stesen gambar bertema berbeza.\n' +
      '2. Murid bergerak dalam kumpulan kecil dari satu stesen ke stesen lain.\n' +
      '3. Setiap kumpulan melekatkan kad label pada bahagian gambar yang betul.\n' +
      '4. Guru menyemak label bersama kelas selepas semua stesen dilawati.\n' +
      '5. Murid menyebut semula kesemua label yang dipelajari.',
    impak:
      'Aktiviti {aktiviti} menggabungkan pergerakan dengan pembelajaran, jadi murid {kelas} kekal aktif dan tidak cepat hilang tumpuan. Murid yang pendiam turut menyumbang kerana bekerja dalam kumpulan kecil.'
  },

  'Pantun & Sajak Beraksi': {
    deskripsi:
      'Murid mendeklamasikan pantun atau sajak pendek disertai gerakan yang sesuai.\n' +
      '1. Guru mendeklamasikan pantun sebagai model sebutan dan intonasi.\n' +
      '2. Murid mengikut secara koir sambil membuat gerakan tangan.\n' +
      '3. Murid berlatih dalam kumpulan dan mencipta gerakan sendiri.\n' +
      '4. Setiap kumpulan mendeklamasikan pantun di hadapan kelas.\n' +
      '5. Guru membincangkan maksud pantun dalam bahasa yang mudah.',
    impak:
      'Melalui {aktiviti}, murid {kelas} berlatih sebutan dan intonasi dengan cara yang menyeronokkan. Keyakinan murid untuk bersuara di hadapan kelas meningkat kerana mereka mendeklamasi secara berkumpulan.'
  },

  'Cerita Rakyat Boneka Tangan': {
    deskripsi:
      'Cerita rakyat tempatan disampaikan menggunakan boneka tangan buatan sendiri.\n' +
      '1. Guru bercerita menggunakan boneka sebagai model penyampaian.\n' +
      '2. Murid memilih watak dan berlatih dialog ringkas dalam kumpulan.\n' +
      '3. Setiap kumpulan mementaskan satu bahagian cerita menggunakan boneka.\n' +
      '4. Guru membimbing sebutan dan kelantangan suara semasa persembahan.\n' +
      '5. Murid menyatakan satu nilai murni yang dipelajari daripada cerita.',
    impak:
      'Aktiviti {aktiviti} mengurangkan rasa malu murid {kelas} untuk bersuara kerana perhatian tertumpu pada boneka dan bukan pada diri mereka. Penyampaian {bil} murid sasaran lebih lantang dan jelas berbanding sesi lisan biasa.'
  },

  'Roda Perbendaharaan Kata': {
    deskripsi:
      'Roda berputar digunakan untuk memilih perkataan secara rawak bagi latihan lisan.\n' +
      '1. Guru menerangkan cara bermain dan memberi satu contoh jawapan.\n' +
      '2. Murid memutar roda dan membaca perkataan yang terpilih.\n' +
      '3. Murid membina satu ayat mudah menggunakan perkataan tersebut.\n' +
      '4. Rakan sekumpulan membantu jika murid tersekat.\n' +
      '5. Guru merekodkan perkataan yang sukar untuk diulang pada sesi akan datang.',
    impak:
      'Unsur rawak dalam {aktiviti} memastikan semua {bil} murid {kelas} bersedia dan memberi tumpuan. Murid berlatih membina ayat secara spontan, dan bantuan rakan sekumpulan mengurangkan tekanan pada murid lemah.'
  },

  'Lakonan Situasi Harian (Kantin / Beli-Belah)': {
    deskripsi:
      'Situasi harian sebenar dilakonkan supaya bahasa yang dipelajari terus boleh digunakan.\n' +
      '1. Guru menyediakan sudut kelas sebagai kantin atau kedai dengan bahan ringkas.\n' +
      '2. Guru dan seorang murid melakonkan contoh perbualan pembeli dan penjual.\n' +
      '3. Murid berlatih secara berpasangan menggunakan ayat pilihan mereka.\n' +
      '4. Setiap pasangan melakonkan situasi di hadapan kelas secara bergilir.\n' +
      '5. Guru membetulkan kesilapan bahasa selepas setiap persembahan.',
    impak:
      'Aktiviti {aktiviti} mengaitkan pembelajaran bahasa dengan situasi yang murid {kelas} hadapi setiap hari, jadi mereka nampak kegunaannya. {bil} murid sasaran berjaya menggunakan ayat pertuturan yang betul dalam konteks yang sesuai.'
  }
};

/* ==========================================================================
   BAHASA INGGERIS
   ========================================================================== */

const BI: Record<string, AktivitiPreset> = {
  'Roleplay / Dialogues': {
    deskripsi:
      'Murid melakonkan dialog Bahasa Inggeris pendek berdasarkan situasi harian yang mudah.\n' +
      '1. Guru membaca dialog sebagai model pronunciation dan intonation.\n' +
      '2. Murid mengikut secara koir sebelum berlatih dalam pasangan.\n' +
      '3. Setiap pasangan melakonkan dialog di hadapan kelas.\n' +
      '4. Guru membetulkan sebutan perkataan yang sukar secara serta-merta.\n' +
      '5. Murid menyebut semula lima ayat utama dialog tersebut.',
    impak:
      'Aktiviti {aktiviti} bersama {bil} murid {kelas} berjalan lancar. Murid lebih berani bertutur dalam Bahasa Inggeris walaupun masih terhad, dan sebutan mereka bertambah baik selepas model serta pembetulan guru.'
  },

  'Spelling Bee': {
    deskripsi:
      'Pertandingan ejaan peringkat kelas dijalankan dalam suasana santai tanpa tekanan.\n' +
      '1. Guru menyebut perkataan dengan jelas dan memberikan satu ayat contoh.\n' +
      '2. Murid mengeja secara lisan mengikut giliran dalam kumpulan.\n' +
      '3. Perkataan yang salah dieja dibetulkan bersama seluruh kelas.\n' +
      '4. Pusingan kedua menggunakan perkataan yang sama untuk mengukuhkan ingatan.\n' +
      '5. Murid menulis sepuluh perkataan tersebut dalam buku kosa kata.',
    impak:
      'Melalui {aktiviti}, murid {kelas} mengulang kaji ejaan berulang kali dalam bentuk permainan. Format berkumpulan mengurangkan rasa takut salah, dan {bilNaik} daripada {bil} murid mengeja majoriti perkataan dengan betul pada pusingan kedua.'
  },

  'Phonics Wheel & Blending': {
    deskripsi:
      'Phonics wheel digunakan untuk melatih murid menggabungkan bunyi menjadi perkataan.\n' +
      '1. Guru memperkenalkan bunyi asas pada roda dan menyebutnya bersama murid.\n' +
      '2. Murid memutar roda dan menyebut gabungan bunyi yang terbentuk.\n' +
      '3. Guru membimbing blending secara perlahan sebelum dipercepatkan.\n' +
      '4. Murid membaca senarai perkataan CVC yang menggunakan bunyi tersebut.\n' +
      '5. Bunyi yang belum dikuasai direkodkan untuk sesi susulan.',
    impak:
      'Sesi {aktiviti} membantu murid {kelas} menggabungkan bunyi dengan lebih lancar. {bil} murid sasaran mula membaca perkataan CVC secara sendiri, dan bunyi yang masih sukar telah dikenal pasti untuk bimbingan seterusnya.'
  },

  'Show and Tell': {
    deskripsi:
      'Murid membawa satu objek kegemaran dan menceritakannya dalam Bahasa Inggeris ringkas.\n' +
      '1. Guru menunjukkan contoh dengan objek sendiri menggunakan tiga ayat mudah.\n' +
      '2. Murid diberikan struktur ayat bantuan (This is my..., I like it because...).\n' +
      '3. Murid berlatih dengan rakan sebelah sebelum membentangkan.\n' +
      '4. Setiap murid membentangkan objeknya di hadapan kelas.\n' +
      '5. Rakan-rakan mengajukan satu soalan mudah kepada pembentang.',
    impak:
      'Aktiviti {aktiviti} memberi setiap murid {kelas} peluang bertutur secara individu dengan sokongan struktur ayat. Keyakinan {bil} murid sasaran meningkat kerana mereka bercerita tentang perkara yang mereka kenali dan sukai.'
  },

  'Vocabulary Matching Games': {
    deskripsi:
      'Permainan memadankan perkataan dengan gambar bagi mengukuhkan perbendaharaan kata.\n' +
      '1. Setiap kumpulan menerima satu set word cards dan picture cards.\n' +
      '2. Murid memadankan pasangan yang betul dalam masa yang ditetapkan.\n' +
      '3. Setiap padanan disebut dengan kuat sebelum diterima.\n' +
      '4. Guru menyemak dan membetulkan padanan yang salah bersama kumpulan.\n' +
      '5. Pusingan akhir dijalankan tanpa gambar untuk menguji ingatan.',
    impak:
      'Permainan {aktiviti} membolehkan murid {kelas} mengulang perbendaharaan kata berulang kali tanpa rasa jemu. Kerjasama kumpulan membantu murid lemah belajar daripada rakan yang lebih cepat.'
  },

  'Interactive Storytelling': {
    deskripsi:
      'Cerita Bahasa Inggeris disampaikan dengan penglibatan aktif murid sepanjang sesi.\n' +
      '1. Guru bercerita menggunakan big book dengan gaya dan suara yang menarik.\n' +
      '2. Murid melakukan gerakan atau bunyi tertentu apabila watak disebut.\n' +
      '3. Cerita dihentikan dan murid meneka apa yang berlaku seterusnya.\n' +
      '4. Guru membimbing kosa kata baharu dengan menunjukkan gambar.\n' +
      '5. Murid menceritakan semula cerita menggunakan kad gambar berurutan.',
    impak:
      'Melalui {aktiviti}, murid {kelas} mendengar Bahasa Inggeris dalam konteks yang bermakna dan menyeronokkan. Penglibatan melalui gerakan mengekalkan tumpuan murid sepanjang sesi bercerita.'
  },

  'Sight Words Bingo': {
    deskripsi:
      'Permainan bingo digunakan untuk melatih pengecaman sight words secara pantas.\n' +
      '1. Setiap murid menerima kad bingo berisi sight words yang berbeza.\n' +
      '2. Guru menyebut satu perkataan dan murid menandakannya jika ada.\n' +
      '3. Murid menyebut perkataan tersebut sebelum menandakannya.\n' +
      '4. Pemenang setiap pusingan membaca semula semua perkataan pada barisnya.\n' +
      '5. Perkataan yang kerap tertinggal diulang pada pusingan berikutnya.',
    impak:
      'Aktiviti {aktiviti} melatih murid {kelas} mengecam sight words dengan pantas tanpa perlu mengeja. Suasana permainan mendorong murid memberi tumpuan penuh kepada setiap perkataan yang disebut.'
  },

  'Choral Speaking / Action Song': {
    deskripsi:
      'Murid bertutur secara koir atau menyanyi lagu beraksi dalam Bahasa Inggeris.\n' +
      '1. Guru memperkenalkan lirik dan menyebutnya baris demi baris.\n' +
      '2. Murid mengikut secara koir sambil membuat gerakan yang ditetapkan.\n' +
      '3. Kelas dibahagikan kepada kumpulan untuk bahagian yang berbeza.\n' +
      '4. Persembahan penuh dijalankan dengan gerakan lengkap.\n' +
      '5. Guru membincangkan makna perkataan utama dalam lirik tersebut.',
    impak:
      'Melalui {aktiviti}, murid {kelas} berlatih sebutan Bahasa Inggeris secara berulang dalam suasana yang riang. Murid yang malu bertutur seorang diri turut menyertai sepenuhnya kerana persembahan dibuat secara berkumpulan.'
  },

  'Flashcard Blending Drill (CVC Words)': {
    deskripsi:
      'Latih tubi flashcard secara pantas untuk mengukuhkan blending perkataan CVC.\n' +
      '1. Guru menunjukkan flashcard huruf dan murid menyebut bunyinya.\n' +
      '2. Tiga huruf disusun menjadi perkataan CVC dan dibunyikan perlahan-lahan.\n' +
      '3. Murid menyebut perkataan penuh selepas blending.\n' +
      '4. Kelajuan ditingkatkan secara berperingkat mengikut kesediaan murid.\n' +
      '5. Guru merekodkan perkataan yang masih sukar bagi setiap murid.',
    impak:
      'Sesi {aktiviti} memberi tumpuan penuh kepada {bil} murid {kelas} yang belum menguasai blending. Latih tubi pantas dalam kumpulan kecil membolehkan setiap murid mendapat banyak pusingan latihan.'
  },

  'Buddy Reading (Paired Reading)': {
    deskripsi:
      'Murid yang lebih lancar dipasangkan dengan murid yang memerlukan bimbingan bacaan.\n' +
      '1. Guru memasangkan murid dan menerangkan peranan reading buddy.\n' +
      '2. Buddy membaca satu ayat dan murid sasaran mengulanginya.\n' +
      '3. Selepas satu halaman, kedua-duanya bertukar peranan.\n' +
      '4. Guru bergerak antara pasangan untuk memantau dan memberi pujian.\n' +
      '5. Setiap pasangan melaporkan satu perkataan baharu yang dipelajari.',
    impak:
      'Melalui {aktiviti}, murid {kelas} mendapat lebih banyak masa membaca secara lisan berbanding sesi kelas biasa. Murid sasaran lebih selesa membaca bersama rakan dan kurang rasa tertekan.'
  },

  'Picture Dictation': {
    deskripsi:
      'Guru memberi arahan lisan dan murid melukis atau menulis berdasarkan arahan tersebut.\n' +
      '1. Guru memberi arahan mudah dalam Bahasa Inggeris (Draw a big red ball).\n' +
      '2. Murid melukis mengikut arahan tanpa melihat contoh.\n' +
      '3. Hasil lukisan dibandingkan bersama-sama untuk menyemak kefahaman.\n' +
      '4. Murid menulis label bagi setiap objek yang dilukis.\n' +
      '5. Arahan yang kurang difahami diulang dengan bantuan gerakan.',
    impak:
      'Aktiviti {aktiviti} menguji kefahaman mendengar murid {kelas} secara langsung tanpa bergantung pada kemahiran membaca. Guru dapat melihat dengan jelas arahan mana yang belum difahami murid.'
  },

  'Simple Crossword & Word Search': {
    deskripsi:
      'Teka silang kata dan word search ringkas digunakan untuk mengukuhkan ejaan.\n' +
      '1. Guru menerangkan cara mengisi menggunakan satu contoh bersama kelas.\n' +
      '2. Murid bekerja berpasangan untuk mencari dan mengisi perkataan.\n' +
      '3. Guru memberi petunjuk tambahan kepada pasangan yang tersekat.\n' +
      '4. Jawapan disemak bersama dan disebut dengan kuat.\n' +
      '5. Murid menulis lima perkataan baharu dalam buku kosa kata.',
    impak:
      'Melalui {aktiviti}, murid {kelas} mengulang kaji ejaan dan perbendaharaan kata dalam bentuk permainan. Kerja berpasangan menggalakkan perbincangan tentang bunyi dan ejaan perkataan.'
  },

  'Story Sequencing Cards': {
    deskripsi:
      'Murid menyusun kad gambar mengikut urutan cerita dan menerangkannya.\n' +
      '1. Setiap kumpulan menerima empat kad gambar yang bercampur.\n' +
      '2. Murid berbincang dan menyusun kad mengikut urutan yang logik.\n' +
      '3. Murid membina satu ayat Bahasa Inggeris bagi setiap kad.\n' +
      '4. Guru membimbing penggunaan first, then, next, finally.\n' +
      '5. Setiap kumpulan menceritakan urutan lengkap di hadapan kelas.',
    impak:
      'Aktiviti {aktiviti} melatih murid {kelas} berfikir secara berurutan dan menggunakan penanda wacana asas. Perbincangan kumpulan membolehkan murid lemah menyumbang secara lisan.'
  },

  'Reading Corner 10 Minutes': {
    deskripsi:
      'Sesi bacaan pendek yang konsisten di sudut bacaan Bahasa Inggeris kelas.\n' +
      '1. Murid memilih bahan bacaan Bahasa Inggeris sendiri dari rak.\n' +
      '2. Murid membaca secara senyap selama lapan minit.\n' +
      '3. Guru duduk bersama murid sasaran dan mendengar bacaan mereka.\n' +
      '4. Dua orang murid berkongsi satu perkara menarik yang dibaca.\n' +
      '5. Murid merekodkan tajuk bacaan dalam kad rekod masing-masing.',
    impak:
      'Sesi {aktiviti} membina tabiat membaca Bahasa Inggeris dalam kalangan murid {kelas}. Guru berpeluang mendengar bacaan {bil} murid sasaran secara individu.'
  },

  'Handwriting & Spelling Clinic': {
    deskripsi:
      'Bengkel berfokus memperbaiki bentuk tulisan dan ejaan Bahasa Inggeris asas.\n' +
      '1. Guru menunjukkan cara membentuk huruf yang kerap ditulis songsang (b, d, p, q).\n' +
      '2. Murid berlatih menulis huruf tersebut pada lembaran bergaris.\n' +
      '3. Guru menyemak pegangan pensel dan kedudukan buku setiap murid.\n' +
      '4. Murid menulis lima sight words dengan tulisan terbaik mereka.\n' +
      '5. Hasil terbaik dipamerkan di sudut kelas sebagai galakan.',
    impak:
      'Bengkel {aktiviti} memperbaiki kekemasan tulisan {bil} murid {kelas} dan mengurangkan kekeliruan huruf yang serupa bentuk. Pembetulan pegangan pensel membantu murid menulis dengan lebih selesa.'
  },

  'Gallery Walk (Label the Picture)': {
    deskripsi:
      'Gambar besar diletakkan di beberapa stesen untuk dilabelkan dalam Bahasa Inggeris.\n' +
      '1. Guru menyediakan empat stesen gambar bertema berbeza.\n' +
      '2. Murid bergerak dalam kumpulan kecil dari satu stesen ke stesen lain.\n' +
      '3. Setiap kumpulan melekatkan word label pada bahagian gambar yang betul.\n' +
      '4. Guru menyemak label bersama kelas selepas semua stesen dilawati.\n' +
      '5. Murid menyebut semula kesemua label yang dipelajari.',
    impak:
      'Aktiviti {aktiviti} menggabungkan pergerakan dengan pembelajaran kosa kata, jadi murid {kelas} kekal aktif sepanjang sesi. Murid pendiam turut menyumbang kerana bekerja dalam kumpulan kecil.'
  },

  'Nursery Rhymes & Jazz Chants': {
    deskripsi:
      'Rima dan jazz chant digunakan untuk melatih rhythm dan sebutan Bahasa Inggeris.\n' +
      '1. Guru menyebut chant sebagai model dengan rentak yang jelas.\n' +
      '2. Murid mengikut secara koir sambil menepuk mengikut rentak.\n' +
      '3. Kelas dibahagikan kepada dua kumpulan untuk bahagian bersahutan.\n' +
      '4. Murid membuat gerakan sendiri mengikut maksud lirik.\n' +
      '5. Guru membincangkan makna perkataan utama dalam chant.',
    impak:
      'Melalui {aktiviti}, murid {kelas} berlatih rentak dan sebutan Bahasa Inggeris secara berulang tanpa rasa bosan. Murid mengingati struktur ayat dengan lebih mudah kerana ia dikaitkan dengan rentak.'
  },

  'Puppet Show Storytelling': {
    deskripsi:
      'Cerita Bahasa Inggeris dipentaskan menggunakan boneka tangan buatan sendiri.\n' +
      '1. Guru bercerita menggunakan boneka sebagai model penyampaian.\n' +
      '2. Murid memilih watak dan berlatih dialog ringkas dalam kumpulan.\n' +
      '3. Setiap kumpulan mementaskan satu bahagian cerita.\n' +
      '4. Guru membimbing sebutan dan kelantangan suara semasa persembahan.\n' +
      '5. Murid menyatakan satu nilai murni yang dipelajari.',
    impak:
      'Aktiviti {aktiviti} mengurangkan rasa malu murid {kelas} untuk bertutur dalam Bahasa Inggeris kerana perhatian tertumpu pada boneka. Penyampaian {bil} murid sasaran lebih lantang berbanding sesi lisan biasa.'
  },

  'Wheel of Vocabulary': {
    deskripsi:
      'Roda berputar digunakan untuk memilih perkataan Bahasa Inggeris secara rawak.\n' +
      '1. Guru menerangkan cara bermain dan memberi satu contoh jawapan.\n' +
      '2. Murid memutar roda dan membaca perkataan yang terpilih.\n' +
      '3. Murid membina satu ayat mudah menggunakan perkataan tersebut.\n' +
      '4. Rakan sekumpulan membantu jika murid tersekat.\n' +
      '5. Guru merekodkan perkataan yang sukar untuk sesi akan datang.',
    impak:
      'Unsur rawak dalam {aktiviti} memastikan semua {bil} murid {kelas} bersedia dan memberi tumpuan. Murid berlatih membina ayat Bahasa Inggeris secara spontan dengan sokongan rakan.'
  },

  'Daily Situation Roleplay (Canteen / Shopping)': {
    deskripsi:
      'Situasi harian dilakonkan supaya Bahasa Inggeris yang dipelajari terus boleh digunakan.\n' +
      '1. Guru menyediakan sudut kelas sebagai canteen atau shop dengan bahan ringkas.\n' +
      '2. Guru dan seorang murid melakonkan contoh perbualan pembeli dan penjual.\n' +
      '3. Murid berlatih secara berpasangan menggunakan ayat pilihan mereka.\n' +
      '4. Setiap pasangan melakonkan situasi di hadapan kelas secara bergilir.\n' +
      '5. Guru membetulkan kesilapan bahasa selepas setiap persembahan.',
    impak:
      'Aktiviti {aktiviti} mengaitkan Bahasa Inggeris dengan situasi yang murid {kelas} hadapi setiap hari. {bil} murid sasaran berjaya menggunakan ayat pertuturan yang betul dalam konteks yang sesuai.'
  }
};

/** Kesemua preset, BM dan BI dalam satu peta. */
export const PRESET_AKTIVITI: Record<string, AktivitiPreset> = { ...BM, ...BI };

/** Kunci carian yang tahan terhadap perbezaan huruf besar/kecil dan ruang. */
const kunci = (nama: string) => nama.trim().replace(/\s+/g, ' ').toUpperCase();

const INDEKS = new Map<string, AktivitiPreset>(
  Object.entries(PRESET_AKTIVITI).map(([nama, preset]) => [kunci(nama), preset])
);

/**
 * Cari preset bagi satu nama aktiviti.
 *
 * Padanan tidak sensitif kepada huruf besar/kecil kerana senarai aktiviti
 * boleh disunting dalam Tetapan & Admin — satu perbezaan huruf tidak
 * sepatutnya menyebabkan auto-isi berhenti berfungsi sepenuhnya.
 *
 * @returns undefined bagi aktiviti khas yang ditambah sendiri oleh sekolah.
 */
export function cariPresetAktiviti(nama: string): AktivitiPreset | undefined {
  if (!nama) return undefined;
  return INDEKS.get(kunci(nama));
}

/** Adakah aktiviti ini mempunyai kandungan siap sedia? */
export function adaPreset(nama: string): boolean {
  return cariPresetAktiviti(nama) !== undefined;
}
