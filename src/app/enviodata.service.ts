// src/app/enviodata.service.ts
import { Injectable, } from '@angular/core';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { firestoreDB, auth, firebaseApp } from '../firebase'; // ajusta ruta si hace falta

@Injectable({ providedIn: 'root' })
export class EnviodataService {

  private sanitize(payload: any) {
    const out: any = {};
    if (!payload || typeof payload !== 'object') return out;
    for (const k of Object.keys(payload)) {
      const v = payload[k];
      if (v === undefined) continue;
      if (typeof v === 'function') continue;
      if (v instanceof Element) continue;
      out[k] = v;
    }
    return out;
  }

  async guardarDatos(data: any): Promise<any> {
    const sanitized = this.sanitize(data);

    // Asegúrate de que el payload tiene los campos que tus reglas esperan
    console.log('[EnviodataService] payload keys ->', Object.keys(sanitized));

    try {
      // DEBUG: muestra usuario auth actual y token
      const user = auth?.currentUser ?? null;
      console.log('[EnviodataService] auth.currentUser ->', user ? user.uid : null);
      if (user) {
        try {
          const idToken = await user.getIdToken(true);
          console.log('[EnviodataService] idToken slice ->', idToken?.slice(0, 80) + '...');
        } catch (tokErr) {
          console.warn('[EnviodataService] no pude obtener idToken', tokErr);
        }
      } else {
        console.warn('[EnviodataService] NO hay auth.currentUser (esto causará permission-denied si tus reglas requieren auth)');
      }

      // deja que Firestore asigne createdAt
      sanitized.createdAt = serverTimestamp();

      // REFERENCIA: usa la instancia exportada desde src/firebase.ts
      const colRef = collection(firestoreDB, 'formularios');
      return await addDoc(colRef, sanitized);
    } catch (e: any) {
      console.error('[EnviodataService] addDoc error:', e);
      throw e; // deja que el componente maneje el error
    }
  }
}
