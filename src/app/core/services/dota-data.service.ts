import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';

export interface DotaItem {
  id: number;
  dname: string;
  img: string;
  cost?: number;
  attrib?: Array<{
    key: string;
    header?: string;
    value: string | number;
    display?: string;
  }>;
  abilities?: Array<{
    type: 'passive' | 'active' | 'aura';
    title: string;
    description: string;
  }>;
  lore?: string;
  notes?: string;
}

@Injectable({ providedIn: 'root' })
export class DotaDataService {
  private http = inject(HttpClient);
  private items$?: Observable<Record<string, DotaItem>>;
  private cache = new Map<string, DotaItem>();

  private loadItems(): Observable<Record<string, DotaItem>> {
    if (!this.items$) {
      this.items$ = this.http
        .get<Record<string, DotaItem>>('/assets/data/items.json')
        .pipe(shareReplay(1));
    }
    return this.items$;
  }

  /** Синхронный доступ из кэша (после preload) */
  getItem(itemId: string): DotaItem | null {
    return this.cache.get(itemId) ?? null;
  }

  /** Асинхронный доступ к одному предмету */
  getItem$(itemId: string): Observable<DotaItem | null> {
    return this.loadItems().pipe(map((items) => items[itemId] ?? null));
  }

  /** Загружает все предметы в кэш — вызвать один раз при старте */
  preload(): Observable<void> {
    return this.loadItems().pipe(
      tap((items) => {
        for (const [id, item] of Object.entries(items)) {
          this.cache.set(id, { ...item });
        }
      }),
      map(() => void 0),
    );
  }
}
