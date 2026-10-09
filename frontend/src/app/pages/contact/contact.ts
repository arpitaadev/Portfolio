import { AsyncPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ApiService } from '../../core/api.service';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, AsyncPipe],
  templateUrl: './contact.html',
  styleUrl: './contact.scss',
})
export class Contact {
  private api = inject(ApiService);
  profile$ = this.api.profile$;
  status = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');
  error = signal('');

  form = inject(FormBuilder).nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    email: ['', [Validators.required, Validators.email]],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(2000)]],
    website: [''], // honeypot, hidden from real users
  });

  invalid(name: 'name' | 'email' | 'message') {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.status.set('sending');
    this.api.sendContact(this.form.getRawValue()).subscribe({
      next: () => { this.status.set('sent'); this.form.reset(); },
      error: (e: HttpErrorResponse) => {
        this.error.set(e.status === 429 ? 'Too many messages sent. Please try again later.' : 'Could not send your message. Please email me directly.');
        this.status.set('error');
      },
    });
  }
}
