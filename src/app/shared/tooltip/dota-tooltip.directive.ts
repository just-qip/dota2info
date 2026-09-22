import { Directive, HostListener, Input, inject } from '@angular/core';
import { DotaDataService } from '../../core/services/dota-data.service';
import { OverlayTooltipBase } from './overlay-tooltip.base';
import { mapItemToViewModel } from './tooltip-mappers';

@Directive({
  selector: '[appDotaTooltip]',
  standalone: true,
})
export class DotaTooltipDirective extends OverlayTooltipBase {
  @Input('appDotaTooltip') itemId!: string;

  private dataService = inject(DotaDataService);

  @HostListener('mouseenter')
  show(): void {
    if (!this.itemId || this.overlayRef) return;

    this.dataService.getItem$(this.itemId).subscribe((item) => {
      if (!item) return;
      this.openTooltip(mapItemToViewModel(item));
    });
  }

  @HostListener('mouseleave')
  hideOnLeave(): void {
    this.hide();
  }
}
