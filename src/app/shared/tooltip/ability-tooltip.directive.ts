import { Directive, HostListener, Input, inject } from '@angular/core';
import { DotaDataService } from '../../core/services/dota-data.service';
import { OverlayTooltipBase } from './overlay-tooltip.base';
import { mapAbilityToViewModel } from './tooltip-mappers';

@Directive({
  selector: '[appAbilityTooltip]',
  standalone: true,
})
export class AbilityTooltipDirective extends OverlayTooltipBase {
  @Input('appAbilityTooltip') abilityId!: string;

  private dataService = inject(DotaDataService);

  @HostListener('mouseenter')
  show(): void {
    if (!this.abilityId || this.overlayRef) return;

    this.dataService.getAbility$(this.abilityId).subscribe((ability) => {
      if (!ability) return;
      this.openTooltip(mapAbilityToViewModel(ability));
    });
  }

  @HostListener('mouseleave')
  hideOnLeave(): void {
    this.hide();
  }
}
