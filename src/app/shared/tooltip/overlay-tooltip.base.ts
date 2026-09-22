import { ComponentRef, Directive, ElementRef, OnDestroy, inject } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { DotaTooltipComponent } from './dota-tooltip.component';
import { TooltipViewModel } from './dota-tooltip.types';

/**
 * Общая логика для трёх tooltip-директив:
 *  - создание CDK-overlay по позиции хоста,
 *  - переиспользование одного оверлея на hover-цикл,
 *  - корректное закрытие при уничтожении директивы (важно при навигации,
 *    когда иконка удаляется из DOM, но оверлей остаётся на <body>).
 */
@Directive()
export abstract class OverlayTooltipBase implements OnDestroy {
  protected readonly overlay = inject(Overlay);
  protected readonly host = inject(ElementRef<HTMLElement>);

  protected overlayRef: OverlayRef | null = null;
  protected componentRef: ComponentRef<DotaTooltipComponent> | null = null;

  protected openTooltip(vm: TooltipViewModel): void {
    // Если оверлей уже открыт — переиспользуем (не пересоздаём при повторном hover).
    if (this.overlayRef) {
      this.componentRef?.setInput('vm', vm);
      return;
    }

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
    this.componentRef.setInput('vm', vm);
  }

  protected hide(): void {
    this.overlayRef?.dispose();
    this.overlayRef = null;
    this.componentRef = null;
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
