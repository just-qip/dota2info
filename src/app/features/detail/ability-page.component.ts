import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DotaAbility, DotaDataService } from '../../core/services/dota-data.service';
import {
  RenderedAttribute,
  behaviorLabel,
  parseLevels,
  renderAttribute,
  targetLabel,
  toCdnUrl,
} from '../../shared/dota-format';
import { PageTitleService } from '../../core/services/page-title.service';

@Component({
  selector: 'app-ability-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ability-page.component.html',
  styleUrl: './ability-page.component.css',
})
export class AbilityPageComponent implements OnInit {
  private data = inject(DotaDataService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private pageTitle = inject(PageTitleService);

  ability = signal<DotaAbility | null>(null);
  attributes = signal<RenderedAttribute[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly toCdnUrl = toCdnUrl;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
        tap(() => {
          this.pageTitle.set('Ability');
          this.loading.set(true);
          this.error.set(null);
          this.ability.set(null);
          this.attributes.set([]);
        }),
        switchMap((id) => {
          if (!id) {
            this.error.set('Missing "id" query parameter.');
            this.loading.set(false);
            return of(null);
          }
          return this.data.getAbility$(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (ability) => {
          if (!ability) {
            if (!this.error()) {
              this.error.set('Ability not found.');
            }
            this.loading.set(false);
            return;
          }
          this.ability.set(ability);
          this.attributes.set((ability.attrib ?? []).map(renderAttribute));
          this.pageTitle.set(ability.dname ?? 'Ability');
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[AbilityPage] load failed', err);
          this.error.set('Failed to load ability.');
          this.loading.set(false);
        },
      });
  }

  get behavior(): string {
    return behaviorLabel(this.ability()?.behavior);
  }

  get target(): string {
    const a = this.ability();
    return a ? targetLabel(a.target_team, a.target_type) : '';
  }

  get manaCostLevels(): string[] | undefined {
    const a = this.ability();
    if (!a || a.mc === undefined || a.mc === false) return undefined;
    return parseLevels(String(a.mc));
  }

  get cooldownLevels(): string[] | undefined {
    const a = this.ability();
    if (!a || a.cd === undefined || a.cd === false) return undefined;
    return parseLevels(String(a.cd));
  }

  get hasManaCost(): boolean {
    const mc = this.ability()?.mc;
    return mc !== undefined && mc !== false && mc !== 0 && mc !== '';
  }

  get hasCooldown(): boolean {
    const cd = this.ability()?.cd;
    return cd !== undefined && cd !== false && cd !== 0 && cd !== '';
  }

  trackByAttribute(_: number, attr: RenderedAttribute): string {
    return attr.label;
  }
}
