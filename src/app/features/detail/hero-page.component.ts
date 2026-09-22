import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { combineLatest, of } from 'rxjs';
import { DotaAbilityEntry, DotaDataService, DotaHero } from '../../core/services/dota-data.service';
import { AbilityIconComponent } from '../abilities/ability-icon/ability-icon.component';
import { toCdnUrl } from '../../shared/dota-format';

const ATTR_LABELS: Record<string, string> = {
  str: 'Strength',
  agi: 'Agility',
  int: 'Intelligence',
  all: 'Universal',
};

interface StatRow {
  icon: string;
  label: string;
  value: string;
  suffix?: string;
}

@Component({
  selector: 'app-hero-page',
  standalone: true,
  imports: [CommonModule, RouterLink, AbilityIconComponent],
  templateUrl: './hero-page.component.html',
  styleUrl: './hero-page.component.css',
})
export class HeroPageComponent implements OnInit {
  private data = inject(DotaDataService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  hero = signal<DotaHero | null>(null);
  abilities = signal<DotaAbilityEntry[]>([]);
  lore = signal<string | null>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly toCdnUrl = toCdnUrl;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.hero.set(null);
          this.abilities.set([]);
          this.lore.set(null);
        }),
        switchMap((id) => {
          if (!id) {
            this.error.set('Missing "id" query parameter.');
            this.loading.set(false);
            return of(null);
          }
          return combineLatest([
            this.data.getHero$(id),
            this.data.getHeroAbilities$(id),
            this.data.getHeroLore$(id),
          ]).pipe(
            map(([hero, abilities, lore]) => (hero ? ({ hero, abilities, lore } as const) : null)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (result) => {
          if (!result) {
            if (!this.error()) {
              this.error.set('Hero not found.');
            }
            this.loading.set(false);
            return;
          }
          this.hero.set(result.hero);
          this.abilities.set(result.abilities);
          this.lore.set(result.lore);
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[HeroPage] load failed', err);
          this.error.set('Failed to load hero.');
          this.loading.set(false);
        },
      });
  }

  get subtitle(): string {
    const h = this.hero();
    if (!h) return '';
    const attr = ATTR_LABELS[h.primary_attr] ?? h.primary_attr;
    return `${attr} · ${h.attack_type}`;
  }

  get stats(): StatRow[] {
    const h = this.hero();
    if (!h) return [];
    return [
      {
        icon: '❤',
        label: 'Health',
        value: `${h.base_health ?? '—'}`,
        suffix: h.base_health_regen !== undefined ? `(+${h.base_health_regen})` : undefined,
      },
      {
        icon: '🔷',
        label: 'Mana',
        value: `${h.base_mana ?? '—'}`,
        suffix: h.base_mana_regen !== undefined ? `(+${h.base_mana_regen})` : undefined,
      },
      { icon: '🛡', label: 'Armor', value: `${h.base_armor ?? '—'}` },
      {
        icon: '✨',
        label: 'Magic Resist',
        value: h.base_mr !== undefined ? `${h.base_mr}%` : '—',
      },
      {
        icon: '⚔',
        label: 'Attack',
        value: `${h.base_attack_min ?? '—'} – ${h.base_attack_max ?? '—'}`,
      },
      {
        icon: '🎯',
        label: 'Attack Range',
        value: `${h.attack_range ?? '—'} (${h.attack_type})`,
      },
      { icon: '👟', label: 'Move Speed', value: `${h.move_speed ?? '—'}` },
      {
        icon: '👁',
        label: 'Vision',
        value: `${h.day_vision ?? '—'} / ${h.night_vision ?? '—'}`,
      },
    ];
  }

  get heroAttrs(): Array<{
    key: 'str' | 'agi' | 'int';
    icon: string;
    label: string;
    base: number;
    gain: number;
  }> {
    const h = this.hero();
    if (!h) return [];
    return [
      {
        key: 'str',
        icon: '💪',
        label: 'Strength',
        base: h.base_str ?? 0,
        gain: h.str_gain ?? 0,
      },
      {
        key: 'agi',
        icon: '🏹',
        label: 'Agility',
        base: h.base_agi ?? 0,
        gain: h.agi_gain ?? 0,
      },
      {
        key: 'int',
        icon: '📖',
        label: 'Intelligence',
        base: h.base_int ?? 0,
        gain: h.int_gain ?? 0,
      },
    ];
  }

  trackByAbility(_: number, entry: DotaAbilityEntry): string {
    return entry.id;
  }

  trackByRole(_: number, role: string): string {
    return role;
  }

  trackByStat(_: number, s: StatRow): string {
    return s.label;
  }

  trackByAttr(_: number, a: { key: string }): string {
    return a.key;
  }
}
