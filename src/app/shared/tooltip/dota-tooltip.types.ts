export interface TooltipAttribute {
  label: string;
  value: string | number;
  color?: string;
}

export interface TooltipAbility {
  title: string;
  description: string;
}

/** Строка статистики для героев: иконка-эмодзи + подпись + значение */
export interface TooltipStat {
  icon: string;
  label: string;
  value: string | number;
  /** Дополнительный текст, например " (25%)" */
  suffix?: string;
}

export interface TooltipViewModel {
  name: string;
  icon: string;
  cost?: number | null;
  attributes: TooltipAttribute[];
  passive?: TooltipAbility;
  lore?: string;

  // ── для героев ──
  subtitle?: string;
  roles?: string[];
  kind?: 'item' | 'hero';

  /** Основные статы героя (HP, мана, броня, урон, скорость) */
  stats?: TooltipStat[];

  /** Атрибуты героя: STR / AGI / INT с приростом */
  heroAttrs?: {
    str: { base: number; gain: number };
    agi: { base: number; gain: number };
    int: { base: number; gain: number };
  };

  /** Дальность атаки + тип */
  attackRange?: number;
  attackType?: 'Melee' | 'Ranged';

  /** Обзор: день / ночь */
  vision?: { day: number; night: number };

  /** Скорость передвижения и поворота */
  moveSpeed?: number;
  turnRate?: number | null;
}
