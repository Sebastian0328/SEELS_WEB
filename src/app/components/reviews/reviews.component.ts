import { Component, AfterViewInit, ViewChild, ElementRef, OnDestroy, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import intlTelInput from 'intl-tel-input';
import { EnviodataService } from '../../services/enviodata.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;
  private iti: ReturnType<typeof intlTelInput> | null = null;

  loading = false;
  loadingTest = false;
  submitted = false;

  // Honeypot anti-spam (tiene su input oculto en el HTML)
  honeypot = '';

  formData = {
    UserName: '',
    PhoneUser: '',
    EmailUser: '',
    ReviewUser: '',
    acceptedTerms: false
  };

  constructor(private envioService: EnviodataService, private ngZone: NgZone) {}

  // Inicializa intl-tel-input cuando el input existe en el DOM
  ngAfterViewInit(): void {
    const input = this.phoneInput?.nativeElement;
    if (!input || this.iti) return;

    try {
      this.iti = intlTelInput(input, {
        initialCountry: 'es',
        preferredCountries: ['es', 'co', 'us', 'mx'],
        separateDialCode: true,
        utilsScript: '/assets/intl-tel-input/utils.js'
      } as any);

      input.setAttribute('inputmode', 'numeric');
    } catch (err) {
      console.warn('[ReviewsComponent] intl-tel-input no pudo inicializarse', err);
      this.iti = null;
    }
  }

  ngOnDestroy(): void {
    try { (this.iti as any)?.destroy?.(); } catch {}
    this.iti = null;
  }

  // ---- Helpers de validación de teclado (opcionales) ----
  private isControlKey(event: KeyboardEvent) {
    const allowed = ['Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'];
    return allowed.includes(event.key) || event.ctrlKey || event.metaKey;
  }
  onlyLetters(event: KeyboardEvent) {
    if (this.isControlKey(event)) return;
    const char = event.key;
    if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]$/.test(char)) event.preventDefault();
  }
  onlyNumbers(event: KeyboardEvent) {
    if (this.isControlKey(event)) return;
    const char = event.key;
    if (!/^[0-9]$/.test(char)) event.preventDefault();
  }

  // Convierte el teléfono a E.164 con intl-tel-input (si está disponible)
  private getTelefonoCompleto(): string {
    if (this.iti) {
      try {
        const e164 = this.iti.getNumber();
        if (e164) return e164.replace(/\s+/g, '');
      } catch {}
      const data = (this.iti as any).getSelectedCountryData?.() ?? null;
      const dial = data?.dialCode ? `+${data.dialCode}` : '';
      const raw = (this.formData.PhoneUser || '').replace(/\s+/g, '');
      return [dial, raw].filter(Boolean).join('');
    }
    return (this.formData.PhoneUser || '').replace(/\s+/g, '');
  }

  // ---- Envío principal ----
  async enviarFormulario(form?: NgForm) {
    this.submitted = true;

    // Honeypot: si está relleno, cancelamos silenciosamente (probable bot)
    if (this.honeypot?.trim()) return;

    // Validaciones básicas de plantilla
    if (form && form.invalid) return;

    // Validaciones extra por si acaso
    if (!this.formData.UserName?.trim() || !this.formData.EmailUser?.trim()) {
      alert('Completa los campos requeridos.');
      return;
    }
    if (!this.formData.acceptedTerms) {
      alert('Debes aceptar los términos y condiciones.');
      return;
    }

    const payload = {
      nombre: this.formData.UserName.trim(),
      telefono: this.getTelefonoCompleto(),
      email: this.formData.EmailUser.trim().toLowerCase(),
      notas: (this.formData.ReviewUser || '').trim(),
      accepted_terms: !!this.formData.acceptedTerms
    };

    this.loading = true;
    try {
      const maybeObs = this.envioService.guardarDatos(payload);
      if (maybeObs && typeof (maybeObs as any).subscribe === 'function') {
        await firstValueFrom(maybeObs as any);
      } else {
        await maybeObs;
      }

      this.ngZone.run(() => {
        alert('Datos enviados correctamente ✅');
        if (form) form.resetForm();
        this.formData = { UserName: '', PhoneUser: '', EmailUser: '', ReviewUser: '', acceptedTerms: false };
        if (this.phoneInput?.nativeElement) this.phoneInput.nativeElement.value = '';
        try { this.iti?.setNumber(''); } catch {}
        this.submitted = false;
      });
    } catch (e) {
      console.error('[ReviewsComponent] error guardando', e);
      alert('No se pudo guardar ❌. Revisa la consola.');
    } finally {
      this.ngZone.run(() => this.loading = false);
    }
  }

  // ---- Botón de prueba (opcional) ----
  async testWrite() {
    if (this.loadingTest) return;
    this.loadingTest = true;
    try {
      await this.envioService.guardarDatos({
        nombre: 'Debug User',
        email: 'debug@example.com',
        telefono: '+34999000111',
        notas: 'Prueba desde DEBUG',
        accepted_terms: true
      });
      alert('WRITE OK (prueba mínima).');
    } catch (e) {
      console.error('WRITE ERROR:', e);
      alert('ERROR en prueba mínima. Mira la consola.');
    } finally {
      this.loadingTest = false;
    }
  }
}
