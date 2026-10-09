import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, catchError, of, switchMap } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { Post } from '../../core/models';

@Component({
  selector: 'app-post',
  imports: [AsyncPipe, DatePipe, RouterLink],
  template: `
    <article class="page container">
      <a routerLink="/blog" class="back">← All posts</a>
      @if (post$ | async; as p) {
        @if (p === 'missing') {
          <h1 class="section-title">Post not found</h1>
        } @else {
          <time class="muted">{{ p.date | date: 'longDate' }}</time>
          <h1 class="section-title">{{ p.title }}</h1>
          <div class="chips">@for (t of p.tags; track t) { <span class="tag">{{ t }}</span> }</div>
          <div class="body">
            @for (para of paragraphs(p.content); track $index) { <p>{{ para }}</p> }
          </div>
        }
      }
    </article>
  `,
  styles: [`
    .page { padding: 130px 0 80px; max-width: 720px; }
    .back { color: var(--cyan); display: inline-block; margin-bottom: 26px; }
    time { display: block; font-family: var(--font-mono); font-size: 0.82rem; margin-bottom: 8px; }
    .chips { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 30px; }
    .body p { font-size: 1.1rem; color: var(--muted); margin-bottom: 20px; line-height: 1.8; }
  `],
})
export class PostPage {
  private api = inject(ApiService);
  post$: Observable<Post | 'missing'> = inject(ActivatedRoute).paramMap.pipe(
    switchMap(m => this.api.post(m.get('slug')!).pipe(catchError(() => of('missing' as const)))),
  );
  paragraphs(text: string) { return text.split(/\n\s*\n/); }
}
