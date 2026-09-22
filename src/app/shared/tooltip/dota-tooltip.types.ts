export interface TooltipAttribute {
  label: string;
  value: string | number;
  color?: string;
  /** Если есть — рендерим значения по уровням со стрелочками */
  levels?: string[];
}

export interface TooltipAbility {
  title: string;
  description: string;
}

export interface TooltipStat {
  icon: string;
  label: string;
  value: string | number;
  suffix?: string;
}

export interface HeroTooltipAbility {
  name: string;
  icon: string;
  cooldown?: number | false | string;
  manaCost?: number | false | string;
  description?: string;
  behavior?: string;
  isUltimate?: boolean;
}

export interface TooltipViewModel {
  name: string;
  icon: string;
  cost?: number | null;
  attributes: TooltipAttribute[];
  passive?: TooltipAbility;
  lore?: string;

  subtitle?: string;
  roles?: string[];
  kind?: 'item' | 'hero' | 'ability';

  stats?: TooltipStat[];
  heroAttrs?: {
    str: { base: number; gain: number };
    agi: { base: number; gain: number };
    int: { base: number; gain: number };
  };

  attackRange?: number;
  attackType?: 'Melee' | 'Ranged';
  vision?: { day: number; night: number };
  moveSpeed?: number;
  turnRate?: number | null;

  heroAbilities?: HeroTooltipAbility[];

  /** Биография / история героя */
  heroLore?: string;

  abilityDescription?: string;
  abilityBehavior?: string;
  abilityDamageType?: string;
  abilityManaCost?: number | false | string;
  abilityCooldown?: number | false | string;
  abilityTarget?: string;
  abilityNotes?: string;

  abilityManaCostLevels?: string[];
  abilityCooldownLevels?: string[];
}
