import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Project } from '../../core/models';

@Component({
  selector: 'app-project-detail',
  imports: [AsyncPipe, RouterLink],
  template: `
    <section class="page container">
      <a routerLink="/projects" class="back">← All projects</a>
      @if (project$ | async; as p) {
        @if (p === 'missing') {
          <h1 class="section-title">Project not found</h1>
        } @else {
          <span class="status">{{ p.status }}</span>
          <h1 class="section-title">{{ p.title }}</h1>
          <div class="chips">@for (t of p.tags; track t) { <span class="tag">{{ t }}</span> }</div>
          <p class="desc">{{ p.description }}</p>
          @if (p.highlights.length) {
            <h2>Highlights</h2>
            <ul>@for (h of p.highlights; track h) { <li>{{ h }}</li> }</ul>
          }
          <div class="links">
            @if (p.github) { <a class="btn" [href]="p.github" target="_blank" rel="noopener">Source code ↗</a> }
            @if (p.demo) { <a class="btn primary" [href]="p.demo" target="_blank" rel="noopener">Live demo ↗</a> }
          </div>
        }
      }
    </section>
  `,
  styles: [`
    .page { padding: 130px 0 80px; max-width: 820px; }
    .back { color: var(--cyan); display: inline-block; margin-bottom: 26px; }
    .status { font-family: var(--font-mono); font-size: 0.75rem; color: var(--pink); border: 1px solid currentColor; padding: 2px 10px; border-radius: 999px; }
    h1 { margin: 16px 0 14px; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 26px; }
    .desc { color: var(--muted); font-size: 1.1rem; margin-bottom: 34px; }
    h2 { font-size: 1.3rem; margin-bottom: 12px; }
    ul { padding-left: 20px; display: grid; gap: 8px; margin-bottom: 34px; color: var(--muted); }
    .links { display: flex; gap: 12px; flex-wrap: wrap; }
  `],
})
export class ProjectDetail {
  private api = inject(ApiService);
  project$: Observable<Project | 'missing'> = inject(ActivatedRoute).paramMap.pipe(
    switchMap(m => this.api.project(m.get('slug')!).pipe(catchError(() => of('missing' as const)))),
  );
}
