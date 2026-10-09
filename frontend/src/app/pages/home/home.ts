import { AsyncPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { map } from 'rxjs';
import { ApiService } from '../../core/api.service';
import { RevealDirective } from '../../core/reveal.directive';
import { SpotlightDirective } from '../../core/spotlight.directive';
import { NeuralBg } from '../../shared/neural-bg';
import { Typewriter } from '../../shared/typewriter';

@Component({
  selector: 'app-home',
  imports: [AsyncPipe, RouterLink, RevealDirective, SpotlightDirective, NeuralBg, Typewriter],
  templateUrl: './home.html',
  styleUrl: './home.scss',
})
export class Home {
  private api = inject(ApiService);
  profile$ = this.api.profile$;
  featured$ = this.api.projects().pipe(map(list => list.filter(p => p.featured)));
}
