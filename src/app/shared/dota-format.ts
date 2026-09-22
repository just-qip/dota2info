import { DotaAbility, DotaAbilityAttrib } from '../core/services/dota-data.service';

const CDN = 'https://cdn.cloudflare.steamstatic.com';
const LEVEL_REGEX = /^-?\d+(\.\d+)?%?$/;

export function toCdnUrl(path?: string): string {
  if (!path) return '';
  const clean = path.replace(/\?+$/, '');
  return clean.startsWith('http') ? clean : `${CDN}${clean}`;
}

export function stripHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function prettifyKey(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function behaviorLabel(
  behavior: DotaAbility['behavior'] | string | string[] | false | undefined,
): string {
  if (!behavior) return '';
  if (Array.isArray(behavior)) return behavior.join(', ');
  return String(behavior);
}

export function targetLabel(
  team: DotaAbility['target_team'],
  type: DotaAbility['target_type'],
): string {
  const parts: string[] = [];
  if (team) parts.push(Array.isArray(team) ? team.join('/') : team);
  if (type) parts.push(Array.isArray(type) ? type.join('/') : type);
  return parts.join(' · ');
}

export function parseLevels(value: string): string[] | undefined {
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

export interface RenderedAttribute {
  label: string;
  value: string;
  levels?: string[];
}

/**
 * Приводит запись атрибута к виду {label, value, levels}.
 * Учитывает `display` вида "+ {value} Damage" → label="Damage", value="15".
 */
export function renderAttribute(a: DotaAbilityAttrib): RenderedAttribute {
  let label = prettifyKey(a.key);
  let value = Array.isArray(a.value) ? a.value.join(' / ') : String(a.value);

  if (a.display) {
    const rendered = a.display
      .replace(/\{value\}/g, String(a.value))
      .replace(/\{s:bonus_[^}]+\}/g, String(a.value));
    const idx = rendered.indexOf(':');
    if (idx > 0) {
      label = rendered.substring(0, idx).trim();
      value = rendered.substring(idx + 1).trim();
    } else {
      value = rendered;
    }
  }

  const levels = parseLevels(value);
  return { label, value: levels ? '' : value, levels };
}
