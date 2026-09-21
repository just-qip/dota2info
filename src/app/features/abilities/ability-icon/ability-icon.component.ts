import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { AbilityTooltipDirective } from '../../../shared/tooltip';

const CDN = 'https://cdn.cloudflare.steamstatic.com';

@Component({
  selector: 'app-ability-icon',
  standalone: true,
  imports: [AbilityTooltipDirective],
  template: `
    <div class="ability-cell" [appAbilityTooltip]="abilityId">
      <div class="ability-icon-wrap">
        @if (showImage) {
          <img
            [src]="iconUrl"
            [alt]="displayName || abilityId"
            class="ability-icon"
            width="56"
            height="56"
            decoding="async"
            (error)="onImgError()"
          />
        } @else {
          <div class="ability-icon-placeholder">
            {{ placeholderLetter }}
          </div>
        }
      </div>
      <span class="ability-name">{{ displayName }}</span>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ability-cell {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        cursor: pointer;
      }
      .ability-icon-wrap {
        width: 100%;
        aspect-ratio: 1 / 1;
        border-radius: 4px;
        background: #2a2a2a;
        overflow: hidden;
        transition: transform 0.1s ease;
      }
      .ability-cell:hover .ability-icon-wrap {
        transform: scale(1.05);
      }
      .ability-icon {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .ability-icon-placeholder {
        width: 100%;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(135deg, #2f3a4a, #1e2530);
        color: #5a6a80;
        font-size: 22px;
        font-weight: 700;
        user-select: none;
      }
      .ability-name {
        font-size: 11px;
        color: #bbb;
        text-align: center;
        line-height: 1.2;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        max-width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbilityIconComponent {
  @Input({ required: true }) abilityId!: string;
  @Input() displayName = '';
  @Input() imgPath = '';

  showImage = true;

  get iconUrl(): string {
    const source = this.imgPath
      ? this.imgPath.replace(/\?+$/, '')
      : `/apps/dota2/images/dota_react/abilities/${this.abilityId}.png`;
    return source.startsWith('http') ? source : `${CDN}${source}`;
  }

  get placeholderLetter(): string {
    const name = this.displayName || this.abilityId;
    return name.charAt(0).toUpperCase();
  }

  onImgError(): void {
    this.showImage = false;
  }
}
