import { Component, OnInit, inject, signal, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { distinctUntilChanged, map, switchMap, tap } from 'rxjs/operators';
import { of } from 'rxjs';
import { DotaDataService, DotaItem, DotaItemAbility } from '../../core/services/dota-data.service';
import { ItemIconComponent } from '../items/item-icon/item-icon.component';
import { RenderedAttribute, renderAttribute, toCdnUrl } from '../../shared/dota-format';
import { PageTitleService } from '../../core/services/page-title.service';

@Component({
  selector: 'app-item-page',
  standalone: true,
  imports: [CommonModule, RouterLink, ItemIconComponent],
  templateUrl: './item-page.component.html',
  styleUrl: './item-page.component.css',
})
export class ItemPageComponent implements OnInit {
  private data = inject(DotaDataService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);
  private pageTitle = inject(PageTitleService);

  item = signal<DotaItem | null>(null);
  attributes = signal<RenderedAttribute[]>([]);
  components = signal<string[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  readonly toCdnUrl = toCdnUrl;

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(
        map((params) => params.get('id')),
        distinctUntilChanged(),
        tap(() => {
          this.pageTitle.set('Item');
          this.loading.set(true);
          this.error.set(null);
          this.item.set(null);
          this.attributes.set([]);
          this.components.set([]);
        }),
        switchMap((id) => {
          if (!id) {
            this.error.set('Missing "id" query parameter.');
            this.loading.set(false);
            return of(null);
          }
          return this.data.getItem$(id);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (item) => {
          if (!item) {
            if (!this.error()) {
              this.error.set('Item not found.');
            }
            this.loading.set(false);
            return;
          }
          this.item.set(item);
          this.attributes.set((item.attrib ?? []).map(renderAttribute));
          this.components.set((item.components ?? []).filter((c) => !!c));
          this.pageTitle.set(item.dname ?? 'Item');
          this.loading.set(false);
        },
        error: (err) => {
          console.error('[ItemPage] load failed', err);
          this.error.set('Failed to load item.');
          this.loading.set(false);
        },
      });
  }

  trackByAbility(_: number, ability: DotaItemAbility): string {
    return `${ability.type}:${ability.title}`;
  }

  trackByComponent(_: number, id: string): string {
    return id;
  }

  trackByAttribute(_: number, attr: RenderedAttribute): string {
    return attr.label;
  }

  hasAbilityByType(type: DotaItemAbility['type']): boolean {
    return (this.item()?.abilities ?? []).some((a) => a.type === type);
  }
}
