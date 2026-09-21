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
      width="64"
      height="64"
      loading="lazy"
    />
  `,
  styles: [
    `
      .item-icon {
        cursor: pointer;
        border-radius: 4px;
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

  get iconUrl(): string {
    return `${CDN}/apps/dota2/images/dota_react/items/${this.itemId}.png`;
  }
}
