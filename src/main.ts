import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

import { provideFirebaseApp } from '@angular/fire/app';
import { provideFirestore } from '@angular/fire/firestore';

import { initializeApp, getApp } from 'firebase/app';
import { initializeFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB4CfjsBle6BgSkwDSe0HEDyAeImqMJuYE",
  authDomain: "seel-fa0e3.firebaseapp.com",
  projectId: "seel-fa0e3",
  storageBucket: "seel-fa0e3.appspot.com",
  messagingSenderId: "180457092842",
  appId: "1:180457092842:web:49d20c716644480f3d4993",
  measurementId: "G-Q5F9YECPX9"
};

bootstrapApplication(AppComponent, {
  providers: [
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideFirestore(() => {
      const app = getApp();
      return initializeFirestore(app, {
        experimentalForceLongPolling: true, // opcional (útil con Brave/proxy)
      });
    }),
  ],
});
