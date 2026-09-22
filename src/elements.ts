import { createApplication } from '@angular/platform-browser';
import { createCustomElement } from '@angular/elements';
import { provideHttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { ItemIconComponent } from './app/features/items/item-icon/item-icon.component';
import { HeroIconComponent } from './app/features/heroes/hero-icon/hero-icon.component';
import { AbilityIconComponent } from './app/features/abilities/ability-icon/ability-icon.component';
import { DotaDataService } from './app/core/services/dota-data.service';

/**
 * Точка входа для сборки виджетов.
 * Регистрирует кастомные элементы <dota-item-icon>, <dota-hero-icon>, <dota-ability-icon>
 * и автоматически заменяет ссылки вида
 *   https://dota2db.com/item?id=blink
 *   https://dota2db.com/hero?id=4
 *   https://dota2db.com/ability?id=antimage_mana_break
 * на соответствующий web-component.
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

  try {
    const data = app.injector.get(DotaDataService);
    setupPageLinkEmbeds(data);
  } catch (err) {
    console.warn('[DotaWidgets] page-link embeds disabled:', err);
  }
})().catch((err) => console.error('[DotaWidgets] init failed', err));

// ─────────────────────────────────────────────────────────────
//  Auto-embed: превращаем ссылки на наши страницы в виджеты
// ─────────────────────────────────────────────────────────────

/**
 * Хосты, ссылки на которые считаются «нашими» и подлежат автозамене.
 *  - скрипт, откуда бы он ни грузился (localhost, CDN, прод);
 *  - каноничные публичные хосты проекта (чтобы пример-ссылка на dota2db.com
 *    работала и при локальном тестировании виджета).
 */
const CANONICAL_HOSTS = ['dota2db.com', 'www.dota2db.com'];

type EmbedKind = 'item' | 'hero' | 'ability';

interface EmbedInfo {
  kind: EmbedKind;
  tag: string;
  idAttr: string;
  id: string;
}

function getScriptHost(): string | null {
  try {
    const url = (import.meta as any)?.url as string | undefined;
    if (!url || !url.startsWith('http')) return null;
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

function getRecognizedHosts(): string[] {
  const hosts = new Set<string>(CANONICAL_HOSTS);
  const scriptHost = getScriptHost();
  if (scriptHost) hosts.add(scriptHost);
  return Array.from(hosts);
}

function parsePageLink(href: string, hosts: string[]): EmbedInfo | null {
  let url: URL;
  try {
    url = new URL(href, location.href);
  } catch {
    return null;
  }
  if (!hosts.includes(url.hostname)) return null;

  // нормализуем путь: "/item/" → "/item"
  const path = url.pathname.replace(/\/+$/, '') || '/';
  const id = url.searchParams.get('id');
  if (!id) return null;

  switch (path) {
    case '/item':
      return { kind: 'item', tag: 'dota-item-icon', idAttr: 'item-id', id };
    case '/hero':
      return { kind: 'hero', tag: 'dota-hero-icon', idAttr: 'hero-id', id };
    case '/ability':
      return { kind: 'ability', tag: 'dota-ability-icon', idAttr: 'ability-id', id };
    default:
      return null;
  }
}

async function resolveDisplayName(info: EmbedInfo, data: DotaDataService): Promise<string> {
  try {
    if (info.kind === 'item') {
      const item = await firstValueFrom(data.getItem$(info.id));
      return item?.dname ?? '';
    }
    if (info.kind === 'hero') {
      const hero = await firstValueFrom(data.getHero$(info.id));
      return hero?.localized_name ?? '';
    }
    const ability = await firstValueFrom(data.getAbility$(info.id));
    return ability?.dname ?? '';
  } catch {
    return '';
  }
}

async function embedWidget(
  anchor: HTMLAnchorElement,
  info: EmbedInfo,
  data: DotaDataService,
): Promise<void> {
  const displayName = await resolveDisplayName(info, data);

  // Пока мы ждали данные, DOM мог перестроиться.
  if (!anchor.isConnected) return;

  const widget = document.createElement(info.tag);
  widget.setAttribute(info.idAttr, info.id);
  if (displayName) widget.setAttribute('display-name', displayName);

  // Сохраняем title, если он был задан автором ссылки.
  if (anchor.title) widget.setAttribute('title', anchor.title);

  anchor.replaceWith(widget);

  // Уведомляем страницу-хост — удобно для тестовых логов.
  try {
    window.dispatchEvent(
      new CustomEvent('dota-widget-embedded', {
        detail: { kind: info.kind, id: info.id, displayName },
      }),
    );
  } catch {
    /* ignore */
  }
}

function setupPageLinkEmbeds(data: DotaDataService): void {
  const hosts = getRecognizedHosts();
  if (hosts.length === 0) {
    console.warn('[DotaWidgets] нет распознанных хостов — auto-embed отключён');
    return;
  }

  const processed = new WeakSet<HTMLAnchorElement>();

  const scan = (root: ParentNode): void => {
    const anchors = root.querySelectorAll<HTMLAnchorElement>('a[href]');
    anchors.forEach((anchor) => {
      if (processed.has(anchor)) return;
      const info = parsePageLink(anchor.href, hosts);
      if (!info) return;
      processed.add(anchor);
      void embedWidget(anchor, info, data);
    });
  };

  scan(document);

  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType !== 1) return;
          const el = node as HTMLElement;
          if (el.tagName === 'A') {
            const anchor = el as HTMLAnchorElement;
            if (!processed.has(anchor)) {
              const info = parsePageLink(anchor.href, hosts);
              if (info) {
                processed.add(anchor);
                void embedWidget(anchor, info, data);
              }
            }
          }
          scan(el);
        });
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });
  }
}
