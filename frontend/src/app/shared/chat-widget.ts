import { Component, ElementRef, ViewChild, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../core/api.service';

interface Msg { from: 'bot' | 'me'; text: string; sources?: string[]; }

@Component({
  selector: 'app-chat-widget',
  imports: [FormsModule],
  templateUrl: './chat-widget.html',
  styleUrl: './chat-widget.scss',
})
export class ChatWidget {
  private api = inject(ApiService);
  @ViewChild('scroller') scroller?: ElementRef<HTMLElement>;

  open = signal(false);
  busy = signal(false);
  draft = '';
  suggestions = ['What projects has she built?', 'Tell me about her research', 'What are her skills?', 'How can I contact her?'];
  messages = signal<Msg[]>([
    { from: 'bot', text: "Hi! I'm the portfolio assistant. Ask me anything about Arpita's work." },
  ]);

  send(text = this.draft) {
    const q = text.trim();
    if (!q || this.busy()) return;
    this.draft = '';
    this.messages.update(m => [...m, { from: 'me', text: q }]);
    this.busy.set(true);
    this.scrollDown();
    this.api.chat(q).subscribe({
      next: r => { this.messages.update(m => [...m, { from: 'bot', text: r.answer, sources: r.sources }]); this.done(); },
      error: () => { this.messages.update(m => [...m, { from: 'bot', text: "Sorry, I can't reach the server right now. Please try again in a moment." }]); this.done(); },
    });
  }

  private done() { this.busy.set(false); this.scrollDown(); }

  private scrollDown() {
    setTimeout(() => { const el = this.scroller?.nativeElement; if (el) el.scrollTop = el.scrollHeight; });
  }
}
