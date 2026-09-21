import { Directive, ElementRef, HostListener, Input, ComponentRef, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import {
  DotaAbility,
  DotaAbilityAttrib,
  DotaDataService,
} from '../../core/services/dota-data.service';
import { DotaTooltipComponent } from './dota-tooltip.component';
import { TooltipAttribute, TooltipViewModel } from './dota-tooltip.types';

const CDN = 'https://cdn.cloudflare.steamstatic.com';

const LEVEL_REGEX = /^-?\d+(\.\d+)?%?$/;

@Directive({
  selector: '[appAbilityTooltip]',
  standalone: true,
})
export class AbilityTooltipDirective {
  @Input('appAbilityTooltip') abilityId!: string;

  private overlay = inject(Overlay);
  private host = inject(ElementRef<HTMLElement>);
  private dataService = inject(DotaDataService);

  private overlayRef: OverlayRef | null = null;
  private componentRef: ComponentRef<DotaTooltipComponent> | null = null;

  @HostListener('mouseenter')
  show(): void {
    if (!this.abilityId || this.overlayRef) return;

    this.dataService.getAbility$(this.abilityId).subscribe((ability) => {
      if (!ability) return;

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
      this.componentRef.setInput('vm', this.mapAbilityToViewModel(ability));
    });
  }

  @HostListener('mouseleave')
  hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.componentRef = null;
  }

  private mapAbilityToViewModel(ability: DotaAbility): TooltipViewModel {
    const attributes: TooltipAttribute[] = (ability.attrib ?? [])
      .filter((a) => a.key && a.value !== undefined && a.value !== '')
      .map((a) => this.buildAttribute(a));

    const manaCostStr = ability.mc !== undefined && ability.mc !== false ? String(ability.mc) : '';
    const cooldownStr = ability.cd !== undefined && ability.cd !== false ? String(ability.cd) : '';

    return {
      name: ability.dname ?? 'Unknown Ability',
      icon: this.abilityIconUrl(ability),
      attributes,
      kind: 'ability',

      abilityDescription: ability.desc ?? '',
      abilityBehavior: this.behaviorLabel(ability.behavior),
      abilityDamageType: ability.dmg_type ?? '',
      abilityManaCost: ability.mc,
      abilityCooldown: ability.cd,
      abilityTarget: this.targetLabel(ability.target_team, ability.target_type),

      abilityManaCostLevels: this.parseLevels(manaCostStr),
      abilityCooldownLevels: this.parseLevels(cooldownStr),
    };
  }

  private buildAttribute(a: DotaAbilityAttrib): TooltipAttribute {
    let label = this.prettifyKey(a.key);
    let value = String(a.value);

    if (a.display) {
      const rendered = a.display.replace(/\{value\}/g, String(a.value));
      const idx = rendered.indexOf(':');
      if (idx > 0) {
        label = rendered.substring(0, idx).trim();
        value = rendered.substring(idx + 1).trim();
      } else {
        value = rendered;
      }
    }

    const levels = this.parseLevels(value);

    return {
      label,
      value: levels ? '' : value,
      levels,
    };
  }

  private parseLevels(value: string): string[] | undefined {
    if (!value) return undefined;

    const hasComma = value.includes(',');
    const hasSlash = value.includes('/');
    if (!hasComma && !hasSlash) return undefined;

    const parts = value
      .split(/[,\/]/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);

    if (parts.length < 2) return undefined;
    if (!parts.every((p) => LEVEL_REGEX.test(p))) return undefined;

    return parts;
  }

  private abilityIconUrl(ability: DotaAbility): string {
    if (ability.img) {
      const clean = ability.img.replace(/\?+$/, '');
      return clean.startsWith('http') ? clean : `${CDN}${clean}`;
    }
    return '';
  }

  private behaviorLabel(behavior: DotaAbility['behavior']): string {
    if (!behavior) return '';
    if (Array.isArray(behavior)) return behavior.join(', ');
    return behavior;
  }

  private targetLabel(team: DotaAbility['target_team'], type: DotaAbility['target_type']): string {
    const parts: string[] = [];
    if (team) parts.push(Array.isArray(team) ? team.join('/') : team);
    if (type) parts.push(Array.isArray(type) ? type.join('/') : type);
    return parts.join(' · ');
  }

  private prettifyKey(key: string): string {
    return key
      .split('_')
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
}
