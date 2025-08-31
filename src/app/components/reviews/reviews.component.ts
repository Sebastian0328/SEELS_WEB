import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import intlTelInput from 'intl-tel-input';
import { EnviodataService } from './../../enviodata.service';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})

export class ReviewsComponent implements AfterViewInit {
  @ViewChild('phoneInput') phoneInput!: ElementRef<HTMLInputElement>;
  private iti: ReturnType<typeof intlTelInput> | null = null;

  loading = false;

  formData = {
    UserName: '',
    PhoneUser: '',   // aquí guardas el número "sin" prefijo (lo que escribe el user)
    EmailUser: '',
    ReviewUser: ''
  };

  constructor(private envioService: EnviodataService) {
    console.log('[ReviewsComponent] montado');
  }

  ngAfterViewInit(): void {
    const input = this.phoneInput?.nativeElement;
    if (!input) return;

    // Inicializa intl-tel-input
    this.iti = intlTelInput(input, {
      initialCountry: 'co',
      preferredCountries: ['co', 'es', 'us', 'mx'],
      separateDialCode: true,
      // sirve utils.js desde assets (lo copiamos en angular.json)
      utilsScript: '/assets/intl-tel-input/utils.js',
    }as any);

    // (Opcional) Evita que el navegador cambie de tipo el teclado en desktop
    input.setAttribute('inputmode', 'numeric');
  }

  clickBtn() {
    console.log('[ReviewsComponent] click en botón');
  }

  private getTelefonoCompleto(): string {
    if (!this.iti) return this.formData.PhoneUser.trim();

    try {
      // Intenta número en E.164 (requiere utils.js; si no cargó, cae al catch)
      const e164 = this.iti.getNumber(); // p.ej. +573001112233
      if (e164) return e164;
    } catch (_) {
      // fall back más abajo
    }

    // Fallback: unir dialCode visual + input crudo
    const data = this.iti.getSelectedCountryData();
    const dial = data?.dialCode ? `+${data.dialCode}` : '';
    const raw = this.formData.PhoneUser?.trim() ?? '';
    return [dial, raw].filter(Boolean).join(' ');
  }

  async enviarFormulario(ev?: Event) {
    ev?.preventDefault();
    console.log('[ReviewsComponent] ngSubmit', this.formData);

    const telefonoCompleto = this.getTelefonoCompleto();
    this.loading = true;

    try {
      await this.envioService.guardarDatos({
        nombre: this.formData.UserName.trim(),
        telefono: telefonoCompleto,
        email: this.formData.EmailUser.trim(),
        notas: this.formData.ReviewUser.trim(),
        fecha: new Date(),
      });

      console.log('[ReviewsComponent] guardado OK');
      alert('Datos enviados correctamente ✅');
      this.formData = { UserName: '', PhoneUser: '', EmailUser: '', ReviewUser: '' };

      // Limpia el input visual de intl-tel-input también
      this.phoneInput.nativeElement.value = '';
      this.iti?.setNumber('');
    } catch (e: any) {
      console.error('[ReviewsComponent] error guardando', e, e?.code, e?.message);
      alert('No se pudo guardar ❌ (mira la consola)');
    } finally {
      this.loading = false;
    }
  }
  onlyLetters(event: KeyboardEvent) {
  const char = event.key;
  if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/.test(char)) {
    event.preventDefault(); // bloquea la tecla
  }
}

onlyNumbers(event: KeyboardEvent) {
  const char = event.key;
  if (!/[0-9]/.test(char)) {
    event.preventDefault(); // bloquea la tecla
  }
}

}
