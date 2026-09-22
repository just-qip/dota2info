import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

const BASE = 'Dota2DB';

/**
 * Обёртка над Angular Title: добавляет единый суффикс и не даёт страницам
 * верстать его вручную.
 */
@Injectable({ providedIn: 'root' })
export class PageTitleService {
  private title = inject(Title);

  /** "Items — Dota2DB" */
  set(page?: string | null): void {
    if (!page) {
      this.title.setTitle(BASE);
      return;
    }
    const trimmed = page.trim();
    this.title.setTitle(trimmed ? `${trimmed} — ${BASE}` : BASE);
  }
}
