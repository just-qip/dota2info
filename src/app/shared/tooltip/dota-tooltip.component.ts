import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipViewModel } from './dota-tooltip.types';

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

  showMana(v?: number | false | string | null): boolean {
    return v !== undefined && v !== null && v !== false && v !== 0 && v !== '';
  }

  showCooldown(v?: number | false | string | null): boolean {
    return v !== undefined && v !== null && v !== false && v !== 0 && v !== '';
  }

  hideBrokenImage(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.style.visibility = 'hidden';
  }
}
