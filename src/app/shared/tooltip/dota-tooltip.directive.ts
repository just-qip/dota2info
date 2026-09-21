import { Directive, ElementRef, HostListener, Input, ComponentRef, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DotaDataService, DotaItem } from '../../core/services/dota-data.service';
import { DotaTooltipComponent } from './dota-tooltip.component';
import { TooltipViewModel } from './dota-tooltip.types';

const CDN = 'https://cdn.cloudflare.steamstatic.com';

const ATTR_LABELS: Record<string, string> = {
  bonus_all_stats: 'All Attributes',
  bonus_health: 'Health',
  bonus_mana: 'Mana',
  bonus_armor: 'Armor',
  bonus_damage: 'Damage',
  bonus_strength: 'Strength',
  bonus_agility: 'Agility',
  bonus_intellect: 'Intelligence',
  bonus_movement_speed: 'Movement Speed',
};

@Directive({
  selector: '[appDotaTooltip]',
  standalone: true,
})
export class DotaTooltipDirective {
  @Input('appDotaTooltip') itemId!: string;

  private overlay = inject(Overlay);
  private host = inject(ElementRef<HTMLElement>);
  private dataService = inject(DotaDataService);

  private overlayRef: OverlayRef | null = null;
  private componentRef: ComponentRef<DotaTooltipComponent> | null = null;

  @HostListener('mouseenter')
  show(): void {
    if (!this.itemId || this.overlayRef) return;

    this.dataService.getItem$(this.itemId).subscribe((item) => {
      if (!item) return;

      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(this.host)
        .withPositions([
          { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
          { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 },
        ])
        .withFlexibleDimensions(false)
        .withViewportMargin(12)
        .withPush(true);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });

      const portal = new ComponentPortal(DotaTooltipComponent);
      this.componentRef = this.overlayRef.attach(portal);
      this.componentRef.setInput('vm', this.mapItemToViewModel(item));
    });
  }

  @HostListener('mouseleave')
  hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.componentRef = null;
  }

  private mapItemToViewModel(item: DotaItem): TooltipViewModel {
    const attributes = (item.attrib ?? [])
      .filter((a) => ATTR_LABELS[a.key])
      .map((a) => ({
        label: ATTR_LABELS[a.key],
        value: a.value,
      }));

    const passiveAbility = item.abilities?.find((a) => a.type === 'passive');

    return {
      name: item.dname ?? 'Unknown Item',
      icon: this.toCdnUrl(item.img),
      cost: item.cost,
      attributes,
      passive: passiveAbility
        ? { title: passiveAbility.title, description: passiveAbility.description }
        : undefined,
      lore: item.lore,
      kind: 'item',
    };
  }

  private toCdnUrl(path?: string): string {
    if (!path) return '';
    const clean = path.replace(/\?+$/, '');
    return clean.startsWith('http') ? clean : `${CDN}${clean}`;
  }
}
