// src/firebase.ts
import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, getFirestore } from 'firebase/firestore';
// import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check'; // comentado temporalmente

const firebaseConfig = {
  apiKey: "AIzaSyB4CfjsBle6BgSkwDSe0HEDyAeImqMJuYE",
  authDomain: "seel-fa0e3.firebaseapp.com",
  projectId: "seel-fa0e3",
  storageBucket: "seel-fa0e3.firebasestorage.app",
  messagingSenderId: "180457092842",
  appId: "1:180457092842:web:49d20c716644480f3d4993",
  measurementId: "G-Q5F9YECPX9"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const firebaseApp = app;
export const auth = getAuth(app);
export const firestoreDB = getFirestore(app);

// --- App Check (DESACTIVADO temporalmente) ---------------------------------
// Si quieres desactivar App Check durante el deploy rápido, comenta la inicialización.
// Cuando puedas, vuelve a configurar reCAPTCHA en Firebase Console y descomenta.
// const RECAPTCHA_SITE_KEY = '6Lfr-NgrAAAAAM5L0vryZQQSBURqNkI4Y9krLBMJ';
// initializeAppCheck(app, {
//   provider: new ReCaptchaV3Provider(RECAPTCHA_SITE_KEY),
//   isTokenAutoRefreshEnabled: true
// });
// ---------------------------------------------------------------------------

// DEBUG: exponer referencias en window solo para depuración local
;(window as any).firebaseApp = firebaseApp;
;(window as any).auth = auth;
;(window as any).firestoreDB = firestoreDB;

console.log('[firebase.ts] inicializado. projectId=', firebaseApp?.options?.projectId);

// Test rápido de lectura
async function testFirestore() {
  try {
    console.log('👉 testFirestore: iniciando getDocs...');
    const col = collection(firestoreDB, 'test_connection');
    const snap = await getDocs(col);
    console.log('✅ testFirestore: ok, docs count =', snap.size);
    const d = await getDoc(doc(firestoreDB, 'test_connection', 'ping'));
    console.log('✅ doc ping exists:', d.exists(), d.data());
  } catch (err) {
    console.error('❌ testFirestore ERROR RAW:', err);
  }
}
testFirestore();
