import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { HeroTooltipDirective } from '../../../shared/tooltip';

const CDN = 'https://cdn.cloudflare.steamstatic.com';

@Component({
  selector: 'app-hero-icon',
  standalone: true,
  imports: [HeroTooltipDirective],
  template: `
    <div class="hero-cell" [appHeroTooltip]="heroId">
      <img
        [src]="iconUrl"
        [alt]="displayName || heroId"
        class="hero-icon"
        width="64"
        height="64"
        loading="lazy"
        decoding="async"
        (error)="onImgError($event)"
      />
      <span class="hero-name">{{ displayName }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .hero-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      .hero-icon {
        width: 100%;
        height: auto;
        aspect-ratio: 1 / 1;
        border-radius: 4px;
        background: #2a2a2a;
        object-fit: cover;
        transition: transform 0.1s ease;
      }
      .hero-cell:hover .hero-icon {
        transform: scale(1.05);
      }
      .hero-name {
        font-size: 11px;
        color: #bbb;
        text-align: center;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        max-width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroIconComponent {
  @Input({ required: true }) heroId!: string;
  @Input() displayName = '';
  @Input() imgPath = '';

  get iconUrl(): string {
    const raw = this.imgPath || `/apps/dota2/images/dota_react/heroes/${this.heroId}.png`;
    const clean = this.stripTrailingQuery(raw);
    return clean.startsWith('http') ? clean : `${CDN}${clean}`;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    console.warn('[HeroIcon] failed to load', img.src);

    // fallback: пробуем маленькую квадратную иконку
    if (!img.dataset['retried']) {
      img.dataset['retried'] = '1';
      img.src = `${CDN}/apps/dota2/images/dota_react/heroes/icons/${this.heroId}.png`;
    } else {
      img.style.visibility = 'hidden';
    }
  }

  /** Убирает висящий "?" из пути, который приходит из dotaconstants */
  private stripTrailingQuery(path: string): string {
    return path.replace(/\?+$/, '');
  }
}
