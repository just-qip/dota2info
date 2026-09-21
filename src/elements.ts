// src/elements.ts (рядом с main.ts)
import { createCustomElement } from '@angular/elements';
import { createApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { ItemIconComponent } from './app/features/items/item-icon/item-icon.component';

(async () => {
  // Создаём приложение, но без бутстрапа корневого компонента
  const appRef = await createApplication(appConfig);

  // Превращаем наш компонент в кастомный элемент
  const itemIconElement = createCustomElement(ItemIconComponent, {
    injector: appRef.injector,
  });

  // Регистрируем его в браузере под именем 'dota-item-icon'
  customElements.define('dota-item-icon', itemIconElement);
})();
