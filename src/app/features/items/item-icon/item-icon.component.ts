import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { DotaTooltipDirective } from '../../../shared/tooltip';

const CDN = 'https://cdn.cloudflare.steamstatic.com';

@Component({
  selector: 'app-item-icon',
  standalone: true,
  imports: [DotaTooltipDirective],
  template: `
    <img
      [src]="iconUrl"
      [alt]="itemId"
      [appDotaTooltip]="itemId"
      class="item-icon"
      decoding="async"
      (error)="onImgError($event)"
    />
  `,
  styles: [
    `
      :host {
        display: block;
        width: var(--dota-icon-size, 72px);
        height: var(--dota-icon-size, 72px);
      }
      .item-icon {
        width: 100%;
        height: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 4px;
        background: #2a2a2a;
        object-fit: cover;
        display: block;
        cursor: pointer;
        transition: transform 0.1s ease;
      }
      .item-icon:hover {
        transform: scale(1.05);
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ItemIconComponent {
  @Input({ required: true }) itemId!: string;
  @Input() displayName = '';
  @Input() imgPath = '';

  get iconUrl(): string {
    if (this.imgPath) {
      const clean = this.imgPath.replace(/\?+$/, '');
      return clean.startsWith('http') ? clean : `${CDN}${clean}`;
    }
    return `${CDN}/apps/dota2/images/dota_react/items/${this.itemId}.png`;
  }

  onImgError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.visibility = 'hidden';
  }
}
