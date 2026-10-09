import { Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/api.service';
import { RevealDirective } from '../../core/reveal.directive';
import { SpotlightDirective } from '../../core/spotlight.directive';

@Component({
  selector: 'app-projects',
  imports: [RouterLink, RevealDirective, SpotlightDirective],
  template: `
    <section class="page container">
      <p class="eyebrow">Projects</p>
      <h1 class="section-title">Things I've <span class="grad-text">built</span></h1>

      <div class="filters" role="group" aria-label="Filter by tag">
        <button [class.on]="!active()" (click)="active.set('')">All</button>
        @for (t of tags(); track t) { <button [class.on]="active() === t" (click)="active.set(t)">{{ t }}</button> }
      </div>

      <div class="grid">
        @for (p of shown(); track p.slug; let i = $index) {
          <a [routerLink]="['/projects', p.slug]" class="card" appSpotlight appReveal [delay]="i * 80">
            <span class="status">{{ p.status }}</span>
            <h3>{{ p.title }}</h3>
            <p class="muted">{{ p.summary }}</p>
            <div class="chips">@for (t of p.tags; track t) { <span class="tag">{{ t }}</span> }</div>
          </a>
        } @empty { <p class="muted">No projects match this filter.</p> }
      </div>
    </section>
  `,
  styles: [`
    .page { padding: 130px 0 80px; }
    .filters { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 34px; button { padding: 6px 16px; border-radius: 999px; border: 1px solid var(--border); background: var(--surface); font-size: 0.85rem; &:hover { border-color: var(--cyan); } &.on { background: var(--grad); color: #0a0a14; border-color: transparent; font-weight: 600; } } }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 24px; }
    .card { display: flex; flex-direction: column; gap: 14px; h3 { font-size: 1.4rem; } }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-top: auto; }
    .status { align-self: flex-start; font-family: var(--font-mono); font-size: 0.72rem; color: var(--pink); border: 1px solid currentColor; padding: 2px 10px; border-radius: 999px; }
  `],
})
export class Projects {
  private all = toSignal(inject(ApiService).projects(), { initialValue: [] });
  active = signal('');
  tags = computed(() => [...new Set(this.all().flatMap(p => p.tags))].sort());
  shown = computed(() => this.all().filter(p => !this.active() || p.tags.includes(this.active())));
}
