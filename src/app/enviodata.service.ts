import { Injectable } from '@angular/core';

// SDK puro de Firebase (alias para evitar colisiones)
import {
  getFirestore as sdkGetFirestore,
  collection as sdkCollection,
  addDoc as sdkAddDoc,
  Firestore as SDKFirestore
} from 'firebase/firestore';
import { getApp, getApps, initializeApp } from 'firebase/app';

// ✅ Copia aquí tu config (igual a la de main.ts)
const firebaseConfig = {
  apiKey: "AIzaSyB4CfjsBle6BgSkwDSe0HEDyAeImqMJuYE",
  authDomain: "seel-fa0e3.firebaseapp.com",
  projectId: "seel-fa0e3",
  storageBucket: "seel-fa0e3.appspot.com",
  messagingSenderId: "180457092842",
  appId: "1:180457092842:web:49d20c716644480f3d4993",
  measurementId: "G-Q5F9YECPX9"
};

@Injectable({ providedIn: 'root' })
export class EnviodataService {
  private db!: SDKFirestore;

  constructor() {
    // 👇 Si no hay app, la inicializamos aquí mismo.
    const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
    this.db = sdkGetFirestore(app);
  }

  guardarDatos(data: any) {
    const ref = sdkCollection(this.db, 'formularios'); // todo del mismo paquete
    return sdkAddDoc(ref, { ...data, createdAt: new Date() });
  }
}
