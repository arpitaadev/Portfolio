import { Directive, ElementRef, OnDestroy, OnInit, inject, input } from '@angular/core';

/** Fades elements in when they scroll into view. Usage: <div appReveal [delay]="100"> */
@Directive({ selector: '[appReveal]', host: { class: 'reveal', '[style.--d.ms]': 'delay()' } })
export class RevealDirective implements OnInit, OnDestroy {
  delay = input(0);
  private el = inject<ElementRef<HTMLElement>>(ElementRef);
  private io?: IntersectionObserver;

  ngOnInit() {
    if (typeof IntersectionObserver === 'undefined') { this.el.nativeElement.classList.add('in'); return; }
    this.io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) { this.el.nativeElement.classList.add('in'); this.io?.disconnect(); }
      },
      { threshold: 0.12 },
    );
    this.io.observe(this.el.nativeElement);
  }

  ngOnDestroy() { this.io?.disconnect(); }
}
