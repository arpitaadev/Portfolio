import { AsyncPipe } from '@angular/common';
import { Component, HostListener, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { ApiService } from './core/api.service';
import { ChatWidget } from './shared/chat-widget';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, AsyncPipe, ChatWidget],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  api = inject(ApiService);
  menu = signal(false);
  scrolled = signal(false);
  theme = signal<'dark' | 'light'>(this.initialTheme());
  year = new Date().getFullYear();

  constructor() {
    inject(Router).events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => this.menu.set(false));
    this.applyTheme();
  }

  @HostListener('window:scroll')
  onScroll() { this.scrolled.set(window.scrollY > 24); }

  toggleTheme() {
    this.theme.update(t => (t === 'dark' ? 'light' : 'dark'));
    this.applyTheme();
    try { localStorage.setItem('theme', this.theme()); } catch { /* storage unavailable */ }
  }

  private applyTheme() { document.documentElement.setAttribute('data-theme', this.theme()); }

  private initialTheme(): 'dark' | 'light' {
    try {
      const saved = localStorage.getItem('theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch { /* storage unavailable */ }
    return 'dark';
  }
}
