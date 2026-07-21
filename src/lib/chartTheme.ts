/**
 * Palet dan gaya carta untuk tema gelap.
 *
 * Warna asal direka untuk latar putih: grid #f3f4f6 (hampir putih), label paksi
 * #6b7280 (kelabu gelap) dan tooltip berlatar putih. Di atas latar gelap, grid
 * hilang, label hampir tidak terbaca, dan tooltip menyilaukan.
 *
 * Palet di bawah menggunakan warna tepu pada kecerahan sederhana-tinggi (aras
 * 300–400 Tailwind). Warna aras 500+ menjadi lumpur di atas latar gelap,
 * manakala aras 200 ke bawah bertukar pucat dan kehilangan identiti.
 *
 * Setiap warna bersebelahan dipilih supaya berbeza dari segi rona DAN
 * kecerahan, jadi carta masih boleh dibaca oleh pengguna buta warna dan apabila
 * dicetak hitam-putih.
 */

/* -------------------------------------------------------------------------- */
/*  Warna teras                                                                */
/* -------------------------------------------------------------------------- */

export const CHART = {
  lime: '#a3e635',
  cyan: '#22d3ee',
  fuchsia: '#e879f9',
  amber: '#fbbf24',
  sky: '#38bdf8',
  violet: '#a78bfa',
  rose: '#fb7185',
  emerald: '#34d399',
  orange: '#fb923c',
  teal: '#2dd4bf'
} as const;

/** Palet berkitar untuk siri kategori (kelas, kumpulan, guru). */
export const CHART_SERIES = [
  CHART.lime,
  CHART.cyan,
  CHART.fuchsia,
  CHART.amber,
  CHART.violet,
  CHART.emerald,
  CHART.orange,
  CHART.sky,
  CHART.rose,
  CHART.teal
];

export const warnaSiri = (i: number) => CHART_SERIES[i % CHART_SERIES.length];

/**
 * Subjek.
 * Lime ialah warna identiti aplikasi, jadi BM mewarisinya; fuchsia dipilih
 * untuk BI kerana ia bertentangan pada roda warna dan kekal dapat dibezakan
 * bagi kebanyakan jenis buta warna.
 */
export const WARNA_SUBJEK = {
  BM: CHART.lime,
  BI: CHART.fuchsia
} as const;

/**
 * Anjakan TP.
 * "Sebelum" menggunakan sky supaya ia jelas kelihatan tetapi tidak bersaing
 * dengan lime; lime dikhaskan untuk "Selepas" kerana ia isyarat pencapaian.
 */
export const WARNA_TP = {
  sebelum: CHART.sky,
  selepas: CHART.lime
} as const;

/* -------------------------------------------------------------------------- */
/*  Gaya paksi, grid dan tooltip                                               */
/* -------------------------------------------------------------------------- */

export const GRID_STROKE = 'rgba(255,255,255,0.08)';

/** Label paksi — cukup cerah untuk dibaca, tidak sampai menarik perhatian. */
export const TICK = { fill: '#b8c4b4', fontSize: 11 } as const;

export const TOOLTIP_STYLE = {
  backgroundColor: '#18221a',
  border: 'none',
  borderRadius: '10px',
  boxShadow: '0 0 0 1px rgba(163,230,53,0.25), 0 16px 40px -12px rgba(0,0,0,0.8)',
  color: '#f2f7ef',
  fontSize: '12px',
  padding: '8px 12px'
} as const;

export const TOOLTIP_LABEL_STYLE = {
  color: '#a3e635',
  fontWeight: 700,
  marginBottom: '2px'
} as const;

/** Menghilangkan sorotan kelabu lalai Recharts semasa tuding. */
export const TOOLTIP_CURSOR = { fill: 'rgba(163,230,53,0.07)' } as const;

export const LEGEND_STYLE = {
  fontSize: '11px',
  paddingTop: '12px',
  color: '#b8c4b4'
} as const;
