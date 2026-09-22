import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AbilityIconComponent } from './ability-icon/ability-icon.component';
import {
  DotaAbilityEntry,
  DotaDataService,
  LetterGroup,
} from '../../core/services/dota-data.service';

@Component({
  selector: 'app-abilities-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AbilityIconComponent],
  templateUrl: './abilities-page.component.html',
  styleUrl: './abilities-page.component.css',
})
export class AbilitiesPageComponent implements OnInit {
  private data = inject(DotaDataService);

  abilities = signal<DotaAbilityEntry[]>([]);
  loading = signal(true);
  activeLetter = signal<string | null>(null);

  groups = computed<LetterGroup<DotaAbilityEntry>[]>(() =>
    this.data.groupByLetter(this.abilities(), (e) => e.ability.dname ?? e.id),
  );

  ngOnInit(): void {
    this.data.getAllAbilities$().subscribe({
      next: (abilities) => {
        this.abilities.set(abilities);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[AbilitiesPage] load failed', err);
        this.loading.set(false);
      },
    });
  }

  trackByLetter(_: number, group: LetterGroup<DotaAbilityEntry>): string {
    return group.letter;
  }

  trackById(_: number, entry: DotaAbilityEntry): string {
    return entry.id;
  }

  scrollToLetter(letter: string): void {
    const el = document.getElementById(`ability-letter-${letter}`);
    if (!el) return;

    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    this.activeLetter.set(letter);

    window.setTimeout(() => this.activeLetter.set(null), 1200);
  }
}
