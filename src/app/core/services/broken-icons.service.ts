import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'dota2info.brokenIcons.v1';

@Injectable({ providedIn: 'root' })
export class BrokenIconsService {
  /** Реактивный набор битых URL */
  private readonly broken = signal<Set<string>>(new Set());

  constructor() {
    this.load();
  }

  /** Проверка, сломан ли URL */
  isBroken(url: string): boolean {
    return this.broken().has(url);
  }

  /** Отметить URL как сломанный */
  markBroken(url: string): void {
    if (!url || this.broken().has(url)) return;
    const next = new Set(this.broken());
    next.add(url);
    this.broken.set(next);
    this.save(next);
  }

  /** Сброс кэша (например, при смене патча) */
  reset(): void {
    this.broken.set(new Set());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* приватный режим */
    }
  }

  private load(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const arr = JSON.parse(raw) as string[];
      this.broken.set(new Set(arr));
    } catch {
      /* ignore */
    }
  }

  private save(set: Set<string>): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(set)));
    } catch {
      /* ignore */
    }
  }
}
