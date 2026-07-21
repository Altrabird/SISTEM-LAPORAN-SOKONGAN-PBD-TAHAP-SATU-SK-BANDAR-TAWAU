/// <reference types="vite/client" />

/**
 * Import teks mentah (Vite `?raw`).
 *
 * Digunakan untuk memuatkan apps-script/Code.gs sebagai string supaya kod yang
 * dipaparkan dalam tab Integrasi sentiasa sama dengan fail sebenar dalam repo.
 */
declare module '*?raw' {
  const content: string;
  export default content;
}
