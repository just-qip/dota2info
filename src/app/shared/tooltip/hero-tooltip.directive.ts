import { Directive, ElementRef, HostListener, Input, ComponentRef, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DotaDataService, DotaHero } from '../../core/services/dota-data.service';
import { DotaTooltipComponent } from './dota-tooltip.component';
import { TooltipStat, TooltipViewModel } from './dota-tooltip.types';

const CDN = 'https://cdn.cloudflare.steamstatic.com';

const ATTR_LABELS: Record<string, string> = {
  str: 'Strength',
  agi: 'Agility',
  int: 'Intelligence',
  all: 'Universal',
};

@Directive({
  selector: '[appHeroTooltip]',
  standalone: true,
})
export class HeroTooltipDirective {
  @Input('appHeroTooltip') heroId!: string;

  private overlay = inject(Overlay);
  private host = inject(ElementRef<HTMLElement>);
  private dataService = inject(DotaDataService);

  private overlayRef: OverlayRef | null = null;
  private componentRef: ComponentRef<DotaTooltipComponent> | null = null;

  @HostListener('mouseenter')
  show(): void {
    if (!this.heroId || this.overlayRef) return;

    this.dataService.getHero$(this.heroId).subscribe((hero) => {
      if (!hero) return;

      const positionStrategy = this.overlay
        .position()
        .flexibleConnectedTo(this.host)
        .withPositions([
          { originX: 'end', originY: 'top', overlayX: 'start', overlayY: 'top', offsetX: 8 },
          { originX: 'start', originY: 'top', overlayX: 'end', overlayY: 'top', offsetX: -8 },
        ])
        .withFlexibleDimensions(false)
        .withPush(true);

      this.overlayRef = this.overlay.create({
        positionStrategy,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
      });

      const portal = new ComponentPortal(DotaTooltipComponent);
      this.componentRef = this.overlayRef.attach(portal);
      this.componentRef.setInput('vm', this.mapHeroToViewModel(hero));
    });
  }

  @HostListener('mouseleave')
  hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.componentRef = null;
  }

  private mapHeroToViewModel(hero: DotaHero): TooltipViewModel {
    const attr = ATTR_LABELS[hero.primary_attr] ?? hero.primary_attr;

    // Основные статы в виде строк
    const stats: TooltipStat[] = [
      {
        icon: '❤',
        label: 'Health',
        value: hero.base_health ?? '—',
        suffix: hero.base_health_regen !== undefined ? ` (+${hero.base_health_regen})` : '',
      },
      {
        icon: '🔷',
        label: 'Mana',
        value: hero.base_mana ?? '—',
        suffix: hero.base_mana_regen !== undefined ? ` (+${hero.base_mana_regen})` : '',
      },
      {
        icon: '🛡',
        label: 'Armor',
        value: hero.base_armor ?? '—',
      },
      {
        icon: '✨',
        label: 'Magic Resist',
        value: hero.base_mr !== undefined ? `${hero.base_mr}%` : '—',
      },
      {
        icon: '⚔',
        label: 'Attack',
        value: `${hero.base_attack_min ?? '—'} – ${hero.base_attack_max ?? '—'}`,
      },
    ];

    return {
      name: hero.localized_name,
      subtitle: `${attr} · ${hero.attack_type}`,
      icon: this.toCdnUrl(hero.img),
      attributes: [],
      roles: hero.roles,
      kind: 'hero',

      stats,

      heroAttrs: {
        str: { base: hero.base_str ?? 0, gain: hero.str_gain ?? 0 },
        agi: { base: hero.base_agi ?? 0, gain: hero.agi_gain ?? 0 },
        int: { base: hero.base_int ?? 0, gain: hero.int_gain ?? 0 },
      },

      attackRange: hero.attack_range,
      attackType: hero.attack_type,
      moveSpeed: hero.move_speed,
      turnRate: hero.turn_rate ?? null,
      vision: {
        day: hero.day_vision ?? 0,
        night: hero.night_vision ?? 0,
      },
    };
  }

  private toCdnUrl(path?: string): string {
    if (!path) return '';
    const clean = path.replace(/\?+$/, '');
    return clean.startsWith('http') ? clean : `${CDN}${clean}`;
  }
}
