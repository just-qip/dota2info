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
}
