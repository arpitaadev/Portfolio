import { Directive } from '@angular/core';

/** Makes the soft glow on .card follow the cursor. */
@Directive({ selector: '[appSpotlight]', host: { '(mousemove)': 'move($event)' } })
export class SpotlightDirective {
  move(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  }
}
