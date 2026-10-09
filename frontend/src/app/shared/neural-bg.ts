import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild, inject } from '@angular/core';

interface Node { x: number; y: number; vx: number; vy: number; }

/** Animated neural-network canvas: drifting nodes that link up and react to the cursor. */
@Component({
  selector: 'app-neural-bg',
  template: '<canvas #cv aria-hidden="true"></canvas>',
  styles: [':host{position:absolute;inset:0;display:block;overflow:hidden} canvas{width:100%;height:100%;display:block}'],
})
export class NeuralBg implements AfterViewInit, OnDestroy {
  @ViewChild('cv', { static: true }) cv!: ElementRef<HTMLCanvasElement>;
  private zone = inject(NgZone);
  private host = inject<ElementRef<HTMLElement>>(ElementRef);
  private raf = 0;
  private nodes: Node[] = [];
  private mouse = { x: -999, y: -999 };
  private w = 0;
  private h = 0;
  private visible = true;
  private io?: IntersectionObserver;
  private ro?: ResizeObserver;
  private reduced = false;

  ngAfterViewInit() {
    const canvas = this.cv.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const r = this.host.nativeElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.w = r.width; this.h = r.height;
      canvas.width = r.width * dpr; canvas.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.max(24, Math.min(90, Math.floor((r.width * r.height) / 16000)));
      this.nodes = Array.from({ length: count }, () => ({
        x: Math.random() * this.w, y: Math.random() * this.h,
        vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35,
      }));
      if (this.reduced) draw();
    };

    const draw = () => {
      ctx.clearRect(0, 0, this.w, this.h);
      const link = 130;
      for (const n of this.nodes) {
        if (!this.reduced) {
          n.x += n.vx; n.y += n.vy;
          if (n.x < 0 || n.x > this.w) n.vx *= -1;
          if (n.y < 0 || n.y > this.h) n.vy *= -1;
          const dx = n.x - this.mouse.x, dy = n.y - this.mouse.y, d = Math.hypot(dx, dy);
          if (d < 110 && d > 0) { n.x += (dx / d) * 1.2; n.y += (dy / d) * 1.2; }
        }
      }
      for (let i = 0; i < this.nodes.length; i++) {
        const a = this.nodes[i];
        for (let j = i + 1; j < this.nodes.length; j++) {
          const b = this.nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < link) {
            ctx.strokeStyle = `rgba(139,92,246,${(1 - d / link) * 0.45})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        ctx.fillStyle = i % 5 === 0 ? 'rgba(34,211,238,0.9)' : 'rgba(200,190,255,0.7)';
        ctx.beginPath(); ctx.arc(a.x, a.y, i % 5 === 0 ? 2.4 : 1.6, 0, Math.PI * 2); ctx.fill();
      }
    };

    const loop = () => {
      if (this.visible) draw();
      this.raf = requestAnimationFrame(loop);
    };

    this.zone.runOutsideAngular(() => {
      resize();
      this.ro = new ResizeObserver(resize);
      this.ro.observe(this.host.nativeElement);
      this.io = new IntersectionObserver(([e]) => (this.visible = e.isIntersecting));
      this.io.observe(this.host.nativeElement);
      window.addEventListener('mousemove', this.onMove, { passive: true });
      if (!this.reduced) loop();
    });
  }

  private onMove = (e: MouseEvent) => {
    const r = this.host.nativeElement.getBoundingClientRect();
    this.mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  ngOnDestroy() {
    cancelAnimationFrame(this.raf);
    this.io?.disconnect();
    this.ro?.disconnect();
    window.removeEventListener('mousemove', this.onMove);
  }
}
