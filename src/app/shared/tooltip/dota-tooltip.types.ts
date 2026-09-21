export interface TooltipAttribute {
  label: string;
  value: string | number;
  color?: string;
}

export interface TooltipAbility {
  title: string;
  description: string;
}

export interface TooltipViewModel {
  name: string;
  icon: string;
  cost?: number;
  attributes: TooltipAttribute[];
  passive?: TooltipAbility;
  lore?: string;
}
