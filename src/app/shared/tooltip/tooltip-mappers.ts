import {
  DotaAbility,
  DotaAbilityAttrib,
  DotaHero,
  DotaItem,
} from '../../core/services/dota-data.service';
import {
  HeroTooltipAbility,
  TooltipAttribute,
  TooltipStat,
  TooltipViewModel,
} from './dota-tooltip.types';

const CDN = 'https://cdn.cloudflare.steamstatic.com';

const ITEM_ATTR_LABELS: Record<string, string> = {
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

const HERO_ATTR_LABELS: Record<string, string> = {
  str: 'Strength',
  agi: 'Agility',
  int: 'Intelligence',
  all: 'Universal',
};

const LEVEL_REGEX = /^-?\d+(\.\d+)?%?$/;

export function toCdnUrl(path?: string): string {
  if (!path) return '';
  const clean = path.replace(/\?+$/, '');
  return clean.startsWith('http') ? clean : `${CDN}${clean}`;
}

function stripHtml(html?: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function behaviorLabel(behavior: DotaAbility['behavior']): string {
  if (!behavior) return '';
  if (Array.isArray(behavior)) return behavior.join(', ');
  return behavior;
}

function targetLabel(team: DotaAbility['target_team'], type: DotaAbility['target_type']): string {
  const parts: string[] = [];
  if (team) parts.push(Array.isArray(team) ? team.join('/') : team);
  if (type) parts.push(Array.isArray(type) ? type.join('/') : type);
  return parts.join(' · ');
}

function prettifyKey(key: string): string {
  return key
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function parseLevels(value: string): string[] | undefined {
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

function buildAbilityAttribute(a: DotaAbilityAttrib): TooltipAttribute {
  let label = prettifyKey(a.key);
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

  const levels = parseLevels(value);
  return { label, value: levels ? '' : value, levels };
}

export function mapItemToViewModel(item: DotaItem): TooltipViewModel {
  const attributes = (item.attrib ?? [])
    .filter((a) => ITEM_ATTR_LABELS[a.key])
    .map((a) => ({ label: ITEM_ATTR_LABELS[a.key], value: a.value }));

  const passiveAbility = item.abilities?.find((a) => a.type === 'passive');

  return {
    name: item.dname ?? 'Unknown Item',
    icon: toCdnUrl(item.img),
    cost: item.cost,
    attributes,
    passive: passiveAbility
      ? { title: passiveAbility.title, description: passiveAbility.description }
      : undefined,
    lore: item.lore,
    kind: 'item',
  };
}

export function mapAbilityToViewModel(ability: DotaAbility): TooltipViewModel {
  const attributes = (ability.attrib ?? [])
    .filter((a) => a.key && a.value !== undefined && a.value !== '')
    .map((a) => buildAbilityAttribute(a));

  const manaCostStr = ability.mc !== undefined && ability.mc !== false ? String(ability.mc) : '';
  const cooldownStr = ability.cd !== undefined && ability.cd !== false ? String(ability.cd) : '';

  return {
    name: ability.dname ?? 'Unknown Ability',
    icon: toCdnUrl(ability.img),
    attributes,
    kind: 'ability',
    abilityDescription: ability.desc ?? '',
    abilityLore: ability.lore ?? '',
    abilityBehavior: behaviorLabel(ability.behavior),
    abilityDamageType: ability.dmg_type ?? '',
    abilityManaCost: ability.mc,
    abilityCooldown: ability.cd,
    abilityTarget: targetLabel(ability.target_team, ability.target_type),
    abilityManaCostLevels: parseLevels(manaCostStr),
    abilityCooldownLevels: parseLevels(cooldownStr),
  };
}

export function mapHeroToViewModel(
  hero: DotaHero,
  abilities: DotaAbility[],
  lore: string | null,
): TooltipViewModel {
  const attr = HERO_ATTR_LABELS[hero.primary_attr] ?? hero.primary_attr;

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
    { icon: '🛡', label: 'Armor', value: hero.base_armor ?? '—' },
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

  const heroAbilities: HeroTooltipAbility[] = abilities.map((ab, i) => ({
    name: ab.dname ?? 'Unknown',
    icon: toCdnUrl(ab.img),
    cooldown: ab.cd,
    manaCost: ab.mc,
    description: stripHtml(ab.desc),
    behavior: behaviorLabel(ab.behavior),
    isUltimate: i === abilities.length - 1 && abilities.length >= 4,
  }));

  return {
    name: hero.localized_name,
    subtitle: `${attr} · ${hero.attack_type}`,
    icon: toCdnUrl(hero.img),
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
    vision: { day: hero.day_vision ?? 0, night: hero.night_vision ?? 0 },
    heroAbilities,
    heroLore: lore ?? undefined,
  };
}
