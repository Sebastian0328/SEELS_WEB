// src/app/services/enviodata.service.ts
import { Injectable } from '@angular/core';
import { getSupabase } from '../core/supabase.client';

@Injectable({ providedIn: 'root' })
export class EnviodataService {
  private sb = getSupabase();

  async guardarDatos(payload: {
    nombre: string; email: string; telefono?: string | null;
    notas?: string | null; accepted_terms: boolean;
  }) {
    const { error } = await this.sb.from('usuarios').insert([{
      nombre: payload.nombre,
      email: payload.email,
      telefono: payload.telefono ?? null,
      notas: payload.notas ?? null,
      accepted_terms: payload.accepted_terms,
    }]); // 👈 sin .select() para no chocar con RLS
    if (error) throw error;
    return true;
  }
}
