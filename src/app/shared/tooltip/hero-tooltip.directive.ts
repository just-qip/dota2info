import { Directive, HostListener, Input, inject } from '@angular/core';
import { combineLatest } from 'rxjs';
import { DotaDataService } from '../../core/services/dota-data.service';
import { OverlayTooltipBase } from './overlay-tooltip.base';
import { mapHeroToViewModel } from './tooltip-mappers';

@Directive({
  selector: '[appHeroTooltip]',
  standalone: true,
})
export class HeroTooltipDirective extends OverlayTooltipBase {
  @Input('appHeroTooltip') heroId!: string;

  private dataService = inject(DotaDataService);

  @HostListener('mouseenter')
  show(): void {
    if (!this.heroId || this.overlayRef) return;

    combineLatest([
      this.dataService.getHero$(this.heroId),
      this.dataService.getHeroAbilities$(this.heroId),
      this.dataService.getHeroLore$(this.heroId),
    ]).subscribe(([hero, abilities, lore]) => {
      if (!hero) return;
      this.openTooltip(
        mapHeroToViewModel(
          hero,
          abilities.map((e) => e.ability),
          lore,
        ),
      );
    });
  }

  @HostListener('mouseleave')
  hideOnLeave(): void {
    this.hide();
  }
}
