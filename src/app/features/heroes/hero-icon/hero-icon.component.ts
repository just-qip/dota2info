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
        width: var(--dota-icon-size, 88px);
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
        aspect-ratio: 1 / 1;
        border-radius: 4px;
        background: #2a2a2a;
        object-fit: cover;
        display: block;
        transition: transform 0.1s ease;
      }
      .hero-cell:hover .hero-icon {
        transform: scale(1.05);
      }
      .hero-name {
        font-size: 12px;
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
    // 1. Если есть готовый путь из dotaconstants — используем его
    if (this.imgPath) {
      const clean = this.imgPath.replace(/\?+$/, '');
      return clean.startsWith('http') ? clean : `${CDN}${clean}`;
    }

    // 2. Иначе строим портрет героя по heroId — точно такой же,
    //    какой приходит в heroes.json → hero.img.
    //    Это тот же файл, что использует главная страница.
    return `${CDN}/apps/dota2/images/dota_react/heroes/${this.heroId}.png`;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.visibility = 'hidden';
  }
}
