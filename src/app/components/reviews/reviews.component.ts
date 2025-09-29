// src/app/components/reviews/reviews.component.ts
import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, NgZone, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import intlTelInput from 'intl-tel-input';
import { EnviodataService } from './../../enviodata.service';

// AUTH: ajusta la ruta si tu firebase.ts está en otra carpeta (p. ej. 'src/firebase')
import { auth } from '../../../firebase';
import { signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements AfterViewInit, OnDestroy, OnInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;
  private iti: ReturnType<typeof intlTelInput> | null = null;

  loading = false;
  submitted = false;

  // auth user
  currentUser: User | null = null;
  authChecking = true; // true mientras comprobamos/autenticamos

  formData = {
    UserName: '',
    PhoneUser: '',
    EmailUser: '',
    ReviewUser: '',
    acceptedTerms: false
  };

  constructor(private envioService: EnviodataService, private ngZone: NgZone) {
    console.log('[ReviewsComponent] montado');
  }

  ngOnInit(): void {
    // Iniciamos comprobación de auth
    this.authChecking = true;

    // Observa el estado de autenticación
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
      this.authChecking = false;
      console.log('[Auth] onAuthStateChanged, user:', user ? user.uid : 'no user');
    });

    // Si no hay usuario, intenta signInAnonymously (modular SDK)
    if (!auth.currentUser) {
      signInAnonymously(auth)
        .then((cred) => {
          this.currentUser = cred.user;
          this.authChecking = false;
          console.log('[Auth] signed in anonymously:', cred.user.uid);
        })
        .catch((err) => {
          console.error('[Auth] anonymous sign-in failed', err);
          // No bloqueamos la app completamente; dejamos authChecking en false para que UI pueda reaccionar
          this.authChecking = false;
        });
    } else {
      this.currentUser = auth.currentUser;
      this.authChecking = false;
    }
  }

  ngAfterViewInit(): void {
    const input = this.phoneInput?.nativeElement;
    if (!input) return;
    if (this.iti) return;

    try {
      this.iti = intlTelInput(input, {
        initialCountry: 'co',
        preferredCountries: ['co', 'es', 'us', 'mx'],
        separateDialCode: true,
        utilsScript: '/assets/intl-tel-input/utils.js',
      } as any);

      input.setAttribute('inputmode', 'numeric');
    } catch (err) {
      console.warn('[ReviewsComponent] intl-tel-input no pudo inicializarse', err);
      this.iti = null;
    }
  }

  ngOnDestroy(): void {
    try {
      if (this.iti && (this.iti as any).destroy) {
        (this.iti as any).destroy();
      }
    } catch (_) {}
    this.iti = null;
  }

  private isControlKey(event: KeyboardEvent) {
    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    return allowed.includes(event.key) || event.ctrlKey || event.metaKey;
  }

  onlyLetters(event: KeyboardEvent) {
    if (this.isControlKey(event)) return;
    const char = event.key;
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]$/.test(char)) {
      event.preventDefault();
    }
  }

  onlyNumbers(event: KeyboardEvent) {
    if (this.isControlKey(event)) return;
    const char = event.key;
    if (!/^[0-9]$/.test(char)) {
      event.preventDefault();
    }
  }

  private getTelefonoCompleto(): string {
    if (this.iti) {
      try {
        const e164 = this.iti.getNumber();
        if (e164) return e164.replace(/\s+/g, '');
      } catch (_) {}
      const data = (this.iti as any).getSelectedCountryData?.() ?? null;
      const dial = data?.dialCode ? `+${data.dialCode}` : '';
      const raw = (this.formData.PhoneUser || '').replace(/\s+/g, '');
      return [dial, raw].filter(Boolean).join('');
    }
    return (this.formData.PhoneUser || '').replace(/\s+/g, '');
  }

  // asegura que haya auth antes de escribir
  private async ensureAuth(): Promise<void> {
    if (auth.currentUser) {
      this.currentUser = auth.currentUser;
      return;
    }
    try {
      const cred = await signInAnonymously(auth);
      this.currentUser = cred.user;
      console.log('[Auth] ensureAuth signed in:', cred.user.uid);
    } catch (err) {
      console.error('[Auth] ensureAuth failed', err);
      throw err;
    }
  }

  // recibe NgForm (no Event)
  async enviarFormulario(form?: NgForm) {
    this.submitted = true;

    // si todavía estamos verificando auth no permitimos enviar
    if (this.authChecking) {
      alert('Aún se verifica el estado de autenticación. Espera un momento y vuelve a intentarlo.');
      return;
    }

    // valida template-driven
    if (form && form.invalid) {
      console.warn('[ReviewsComponent] formulario inválido (template-driven)');
      return;
    }

    // validaciones extra (redundantes pero útiles)
    if (!this.formData.UserName?.trim() || !this.formData.EmailUser?.trim()) {
      console.warn('Faltan campos requeridos');
      alert('Completa los campos requeridos.');
      return;
    }
    if (!this.formData.acceptedTerms) {
      alert('Debes aceptar los términos y condiciones.');
      return;
    }

    // Asegura auth (evita race conditions)
    try {
      await this.ensureAuth();
    } catch (err) {
      alert('No se pudo autenticar. Intenta recargar la página.');
      return;
    }

    const telefonoCompleto = this.getTelefonoCompleto();
    this.loading = true;

    try {
      // IMPORTANTE: enviar SOLO las claves que exige la regla: nombre, email, telefono, notas
      const payload = {
        nombre: this.formData.UserName.trim(),
        telefono: telefonoCompleto,
        email: this.formData.EmailUser.trim().toLowerCase(),
        notas: this.formData.ReviewUser.trim()
      };

      console.log('[ReviewsComponent] payload a enviar ->', payload);

      // soporte para Promise o Observable (EnviodataService puede devolver Observable)
      const result = this.envioService.guardarDatos(payload);
      if (result && typeof (result as any).subscribe === 'function') {
        await firstValueFrom(result as any);
      } else {
        await result;
      }

      this.ngZone.run(() => {
        console.log('[ReviewsComponent] guardado OK');
        alert('Datos enviados correctamente ✅');
        if (form) {
          form.resetForm();
        } else {
          this.formData = { UserName: '', PhoneUser: '', EmailUser: '', ReviewUser: '', acceptedTerms: false };
        }
        if (this.phoneInput?.nativeElement) this.phoneInput.nativeElement.value = '';
        try { this.iti?.setNumber(''); } catch (_) {}
        this.submitted = false;
      });

    } catch (e: any) {
      console.error('[ReviewsComponent] error guardando', e, e?.code, e?.message);
      const code = e?.code ?? '';
      if (code.includes('permission-denied')) {
        alert('No tienes permiso para enviar datos. Revisa las reglas de Firestore o el estado de autenticación.');
      } else {
        alert('No se pudo guardar ❌ (mira la consola)');
      }
    } finally {
      this.ngZone.run(() => this.loading = false);
    }
  }

  loadingTest = false; // propiedad nueva

  async testWrite() {
    if (this.loadingTest) return;
    this.loadingTest = true;
    console.log('DEBUG: prueba mínima con payload que cumple las reglas');

    try {
      // asegúrate de tener auth antes de la prueba
      await this.ensureAuth();

      const payload = {
        nombre: 'Debug User',
        email: 'debug@example.com',
        telefono: '+571234567890',
        notas: 'Prueba desde DEBUG'
      };
      console.log('DEBUG payload ->', payload);

      const result = this.envioService.guardarDatos(payload);
      if (result && typeof (result as any).subscribe === 'function') {
        await firstValueFrom(result as any);
      } else {
        await result;
      }

      console.log('WRITE OK - prueba mínima (payload válido)');
      alert('WRITE OK (prueba mínima).');
    } catch (e: any) {
      console.error('WRITE ERROR RAW:', e);
      console.error('code:', e?.code);
      console.error('message:', e?.message);
      alert('ERROR en prueba mínima. Mira la consola.');
    } finally {
      this.loadingTest = false;
    }
  }

  // === método de depuración opcional para verificar token en consola ===
  async debugLogIdToken() {
    try {
      if (!auth || !auth.currentUser) return console.warn('No hay currentUser');
      const token = await auth.currentUser.getIdToken(true);
      console.log('idToken (slice):', token.slice(0, 80) + '...');
    } catch (err) {
      console.error('No pude obtener idToken', err);
    }
  }
}
