import { Component, Input, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipViewModel } from './dota-tooltip.types';
import { BrokenIconsService } from '../../core/services/broken-icons.service';

@Component({
  selector: 'app-dota-tooltip',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dota-tooltip.component.html',
  styleUrls: ['./dota-tooltip.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DotaTooltipComponent {
  @Input({ required: true }) vm!: TooltipViewModel;

  private broken = inject(BrokenIconsService);

  showMana(v?: number | false | string | null): boolean {
    return v !== undefined && v !== null && v !== false && v !== 0 && v !== '';
  }

  showCooldown(v?: number | false | string | null): boolean {
    return v !== undefined && v !== null && v !== false && v !== 0 && v !== '';
  }

  hideBrokenImage(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.visibility = 'hidden';
    if (img.src) this.broken.markBroken(img.src);
  }

  /** Не рендерить картинку, если URL уже был битым */
  canShowIcon(url: string | undefined): boolean {
    if (!url) return false;
    return !this.broken.isBroken(url);
  }

  /** При ошибке загрузки — запомнить и показать плейсхолдер */
  onIconError(url: string): void {
    this.broken.markBroken(url);
  }
}
