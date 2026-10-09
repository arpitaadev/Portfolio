import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  template: `
    <section class="nf container">
      <h1 class="grad-text">404</h1>
      <p class="muted">This page wandered off the training set.</p>
      <a routerLink="/" class="btn primary">Back home</a>
    </section>
  `,
  styles: [`
    .nf { min-height: 100vh; display: grid; place-content: center; justify-items: center; gap: 14px; text-align: center; }
    h1 { font-size: clamp(5rem, 20vw, 9rem); }
  `],
})
export class NotFound {}
