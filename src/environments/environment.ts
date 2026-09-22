/**
 * Единый файл окружения.
 *
 * dataBase — откуда тянуть JSON (items.json, heroes.json, abilities.json, ...).
 *
 * Логика:
 *   - В SPA-сборке Angular CLI вырезает `import.meta.url`, поэтому сработает
 *     fallback — относительный путь `/assets/data`. SPA и данные на одном
 *     origin, этого достаточно.
 *
 *   - В виджет-сборке `import.meta.url` сохраняется и содержит полный URL
 *     файла `elements.js`. Строим абсолютный путь к /assets/data от его
 *     origin. Так виджет работает на любом стороннем сайте — неважно,
 *     где он встроен, данные всё равно уедут на наш домен.
 */
function resolveDataBase(): string {
  if (typeof window === 'undefined') {
    return '/assets/data';
  }

  try {
    const here = (import.meta as any)?.url as string | undefined;
    if (here && here.startsWith('http')) {
      return new URL('/assets/data', here).href;
    }
  } catch {
    /* import.meta.url недоступен — это норма для SPA-сборки */
  }

  // Fallback: SPA, тот же origin, что и данные
  return '/assets/data';
}

export const environment = {
  production: true,
  dataBase: resolveDataBase(),
};
