import { DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { RevealDirective } from '../../core/reveal.directive';
import { SpotlightDirective } from '../../core/spotlight.directive';

@Component({
  selector: 'app-blog',
  imports: [RouterLink, DatePipe, RevealDirective, SpotlightDirective],
  template: `
    <section class="page container">
      <p class="eyebrow">Blog</p>
      <h1 class="section-title">Notes on <span class="grad-text">AI &amp; engineering</span></h1>
      <div class="list">
        @for (p of posts(); track p.slug; let i = $index) {
          <a [routerLink]="['/blog', p.slug]" class="card" appSpotlight appReveal [delay]="i * 80">
            <time class="muted">{{ p.date | date: 'mediumDate' }}</time>
            <h3>{{ p.title }}</h3>
            <p class="muted">{{ p.excerpt }}</p>
            <div class="chips">@for (t of p.tags; track t) { <span class="tag">{{ t }}</span> }</div>
          </a>
        } @empty { <p class="muted">No posts yet. Check back soon.</p> }
      </div>
    </section>
  `,
  styles: [`
    .page { padding: 130px 0 80px; max-width: 820px; }
    .list { display: grid; gap: 20px; }
    .card { display: grid; gap: 10px; h3 { font-size: 1.4rem; } time { font-family: var(--font-mono); font-size: 0.8rem; } }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; }
  `],
})
export class Blog {
  posts = toSignal(inject(ApiService).posts(), { initialValue: [] });
}
