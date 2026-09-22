/**
 * Единый файл окружения. Разные URL для SPA и для виджетов определяются
 * в рантайме по текущему хосту страницы:
 *   - на своём домене (localhost, dota2info.com) → относительный путь
 *   - на чужом сайте (виджет встроен) → абсолютный URL на наш продовый домен
 */
const OWN_HOSTS = ['localhost', '127.0.0.1', 'dota2info.com'];
const REMOTE_BASE = 'http://localhost:4200/assets/data';

function resolveDataBase(): string {
  if (typeof window === 'undefined') {
    return '/assets/data';
  }
  const host = window.location.hostname;
  return OWN_HOSTS.includes(host) ? '/assets/data' : REMOTE_BASE;
}

export const environment = {
  production: true,
  dataBase: resolveDataBase(),
};
