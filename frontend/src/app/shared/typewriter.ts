import { Component, OnDestroy, OnInit, input, signal } from '@angular/core';

/** Types out each word in `words`, deletes it, then moves on. */
@Component({
  selector: 'app-typewriter',
  template: `<span class="t">{{ text() }}</span><span class="caret" aria-hidden="true"></span>`,
  styles: [`
    .t { background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
    .caret { display: inline-block; width: 3px; height: 1em; margin-left: 4px; vertical-align: -0.12em; background: var(--cyan); animation: blink 1s steps(1) infinite; }
    @keyframes blink { 50% { opacity: 0; } }
  `],
})
export class Typewriter implements OnInit, OnDestroy {
  words = input<string[]>([]);
  text = signal('');
  private timer?: ReturnType<typeof setTimeout>;
  private w = 0;
  private i = 0;
  private deleting = false;

  ngOnInit() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.text.set(this.words()[0] ?? '');
      return;
    }
    this.tick();
  }

  private tick() {
    const list = this.words();
    if (!list.length) return;
    const word = list[this.w % list.length];
    this.i += this.deleting ? -1 : 1;
    this.text.set(word.slice(0, this.i));
    let delay = this.deleting ? 35 : 80;
    if (!this.deleting && this.i === word.length) { this.deleting = true; delay = 1600; }
    else if (this.deleting && this.i === 0) { this.deleting = false; this.w++; delay = 350; }
    this.timer = setTimeout(() => this.tick(), delay);
  }

  ngOnDestroy() { clearTimeout(this.timer); }
}
