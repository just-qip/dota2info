import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeroIconComponent } from './hero-icon/hero-icon.component';
import { DotaDataService, DotaHeroEntry, LetterGroup } from '../../core/services/dota-data.service';

@Component({
  selector: 'app-heroes-page',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './heroes-page.component.html',
  styleUrl: './heroes-page.component.css',
})
export class HeroesPageComponent implements OnInit {
  private data = inject(DotaDataService);

  heroes = signal<DotaHeroEntry[]>([]);
  loading = signal(true);

  groups = computed<LetterGroup<DotaHeroEntry>[]>(() =>
    this.data.groupByLetter(this.heroes(), (e) => e.hero.localized_name),
  );

  ngOnInit(): void {
    this.data.getAllHeroes$().subscribe({
      next: (heroes) => {
        this.heroes.set(heroes);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[HeroesPage] load failed', err);
        this.loading.set(false);
      },
    });
  }

  trackByLetter(_: number, group: LetterGroup<DotaHeroEntry>): string {
    return group.letter;
  }

  trackById(_: number, entry: DotaHeroEntry): string {
    return entry.id;
  }
}
