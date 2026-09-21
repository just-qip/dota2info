import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideHttpClient } from '@angular/common/http';

import { ItemIconComponent } from './app/features/items/item-icon/item-icon.component';
import { HeroIconComponent } from './app/features/heroes/hero-icon/hero-icon.component';
import { AbilityIconComponent } from './app/features/abilities/ability-icon/ability-icon.component';

/**
 * Точка входа для сборки виджетов.
 * Регистрирует кастомные элементы <dota-item-icon>, <dota-hero-icon>, <dota-ability-icon>.
 *
 * При подключении на стороннем сайте Angular-приложение поднимается неявно,
 * а данные подтягиваются с абсолютного URL (см. environment.ts).
 */
(async () => {
  const app = await createApplication({
    providers: [provideHttpClient()],
  });

  const widgets: Array<[string, any]> = [
    ['dota-item-icon', ItemIconComponent],
    ['dota-hero-icon', HeroIconComponent],
    ['dota-ability-icon', AbilityIconComponent],
  ];

  for (const [tag, component] of widgets) {
    if (!customElements.get(tag)) {
      const el = createCustomElement(component, { injector: app.injector });
      customElements.define(tag, el);
    }
  }

  console.log('[DotaWidgets] registered:', widgets.map(([t]) => `<${t}>`).join(', '));
})().catch((err) => console.error('[DotaWidgets] init failed', err));
