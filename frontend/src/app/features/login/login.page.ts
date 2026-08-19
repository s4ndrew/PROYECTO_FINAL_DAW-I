import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { FgField } from '../../shared/ui/field';

/** RF-01 / RF-02: unica pantalla publica; el resto exige Bearer token. */
@Component({
  selector: 'fg-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, FgField],
  template: `
    <div class="login">
      <section class="login__marca">
        <img src="brand/logo.png" alt="Fantasmas Gestion" />
        <p>Administramos mientras tu vendes.</p>
      </section>

      <section class="login__form">
        <div class="login__caja">
          <h1>Iniciar sesion</h1>
          <p class="fg-text-secondary">
            Sistema de gestion administrativa y de caja de la galeria comercial.
          </p>

          <form [formGroup]="form" (ngSubmit)="enviar()" class="fg-col" novalidate>
            <fg-field label="Usuario" [control]="form.controls.usuario" [requerido]="true">
              <input
                class="fg-input"
                formControlName="usuario"
                autocomplete="username"
                [class.is-invalid]="form.controls.usuario.touched && form.controls.usuario.invalid"
              />
            </fg-field>

            <fg-field label="Contrasena" [control]="form.controls.password" [requerido]="true">
              <input
                class="fg-input"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                [class.is-invalid]="
                  form.controls.password.touched && form.controls.password.invalid
                "
              />
            </fg-field>

            <button
              type="submit"
              class="fg-btn fg-btn--primary fg-btn--lg fg-btn--block"
              [disabled]="enviando()"
            >
              @if (enviando()) {
                <span class="fg-spinner"></span>
              }
              Iniciar sesion
            </button>
          </form>
        </div>
      </section>
    </div>
  `,
  styles: [
    `
      .login {
        min-height: 100dvh;
        display: grid;
        grid-template-columns: 1fr 1fr;
      }
      .login__marca {
        background: var(--fg-brand-900);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: var(--fg-space-4);
        padding: var(--fg-space-8);
        text-align: center;
      }
      .login__marca img {
        width: min(420px, 80%);
        height: auto;
        border-radius: var(--fg-radius-lg);
      }
      .login__marca p {
        color: rgba(255, 255, 255, 0.75);
        font-size: 15px;
      }
      .login__form {
        display: grid;
        place-items: center;
        padding: var(--fg-space-8);
        background: var(--fg-bg-app);
      }
      .login__caja {
        width: min(400px, 100%);
        background: var(--fg-white);
        border: 1px solid var(--fg-border-soft);
        border-radius: var(--fg-radius-md);
        box-shadow: var(--fg-shadow-sm);
        padding: var(--fg-space-8);
        display: flex;
        flex-direction: column;
        gap: var(--fg-space-4);
      }
      @media (max-width: 900px) {
        .login {
          grid-template-columns: 1fr;
        }
        .login__marca {
          padding: var(--fg-space-6);
        }
        .login__marca img {
          width: min(260px, 70%);
        }
      }
    `
  ]
})
export class LoginPage {
  private readonly fb = inject(FormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly enviando = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    usuario: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  protected enviar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.enviando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.enviando.set(false);
        void this.router.navigate(['/inicio']);
      },
      error: () => this.enviando.set(false)
    });
  }
}
