import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, combineLatest } from 'rxjs';
import { map, shareReplay, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

// ── Items ────────────────────────────────────────────────
export interface DotaItemAttrib {
  key: string;
  header?: string;
  value: string | number;
  display?: string;
}

export interface DotaItemAbility {
  type: 'passive' | 'active' | 'aura' | 'use' | 'toggle' | 'upgrade';
  title: string;
  description: string;
}

export interface DotaItem {
  id: number;
  dname?: string;
  img: string;
  qual?: string;
  cost?: number | null;
  behavior?: string | string[] | false;
  notes?: string;
  attrib?: DotaItemAttrib[];
  abilities?: DotaItemAbility[];
  lore?: string;
  components?: string[] | null;
  created?: boolean;
  charges?: boolean | number;
  mc?: number | false;
  hc?: number | false;
  cd?: number | false;
  tier?: number;
}

export interface DotaItemEntry {
  id: string;
  item: DotaItem;
}

// ── Heroes ───────────────────────────────────────────────
export type PrimaryAttr = 'str' | 'agi' | 'int' | 'all';

export interface DotaHero {
  id: number;
  name: string;
  localized_name: string;
  primary_attr: PrimaryAttr;
  attack_type: 'Melee' | 'Ranged';
  roles: string[];
  img: string;
  icon: string;

  base_health?: number;
  base_health_regen?: number;
  base_mana?: number;
  base_mana_regen?: number;
  base_armor?: number;
  base_mr?: number;

  base_attack_min?: number;
  base_attack_max?: number;
  base_str?: number;
  base_agi?: number;
  base_int?: number;
  str_gain?: number;
  agi_gain?: number;
  int_gain?: number;

  attack_range?: number;
  projectile_speed?: number;
  attack_rate?: number;
  base_attack_time?: number;
  attack_point?: number;

  move_speed?: number;
  turn_rate?: number | null;

  day_vision?: number;
  night_vision?: number;

  legs?: number;
  cm_enabled?: boolean;
}

export interface DotaHeroEntry {
  id: string;
  hero: DotaHero;
}

// ── Abilities ────────────────────────────────────────────
export interface DotaAbilityAttrib {
  key: string;
  header?: string;
  value: string | number | boolean | string[];
  display?: string;
}

export interface DotaAbility {
  dname?: string;
  desc?: string;
  behavior?: string | string[];
  dmg_type?: string;
  bkbpierce?: string;
  target_team?: string | string[];
  target_type?: string | string[];
  mc?: number | false | string;
  cd?: number | false | string;
  attrib?: DotaAbilityAttrib[];
  img?: string;
  is_innate?: boolean;
  is_granted_by_shard?: boolean;
  is_granted_by_scepter?: boolean;
}

export interface DotaAbilityEntry {
  id: string;
  ability: DotaAbility;
}

export interface HeroAbilitySet {
  abilities: string[];
  talents?: { name: string; level: number }[];
}

// ── Общие ────────────────────────────────────────────────
export interface LetterGroup<T> {
  letter: string;
  items: T[];
}

const HIDDEN_ITEM_PREFIXES = [
  'recipe_',
  'river_painter',
  'tier1_token',
  'tier2_token',
  'tier3_token',
  'tier4_token',
  'tier5_token',
  'ofrenda',
  'mutation_tombstone',
  'pocket_tower',
  'pocket_roshan',
  'super_blink',
  'enhancement_',
  'furion_gold_bag',
  'tidehunter_fish',
];

@Injectable({ providedIn: 'root' })
export class DotaDataService {
  private http = inject(HttpClient);
  private readonly base = environment.dataBase;

  private items$?: Observable<Record<string, DotaItem>>;
  private heroes$?: Observable<Record<string, DotaHero>>;
  private abilities$?: Observable<Record<string, DotaAbility>>;
  private heroAbilities$?: Observable<Record<string, HeroAbilitySet>>;
  private heroLore$?: Observable<Record<string, string>>;

  private itemCache = new Map<string, DotaItem>();
  private heroCache = new Map<string, DotaHero>();
  private abilityCache = new Map<string, DotaAbility>();

  // ── Items ──────────────────────────────────────────────
  private loadItems(): Observable<Record<string, DotaItem>> {
    if (!this.items$) {
      this.items$ = this.http
        .get<Record<string, DotaItem>>(`${this.base}/items.json`)
        .pipe(shareReplay(1));
    }
    return this.items$;
  }

  getItem(itemId: string): DotaItem | null {
    return this.itemCache.get(itemId) ?? null;
  }

  getItem$(itemId: string): Observable<DotaItem | null> {
    return this.loadItems().pipe(map((items) => items[itemId] ?? null));
  }

  getAllItems$(): Observable<DotaItemEntry[]> {
    return this.loadItems().pipe(
      map((items) =>
        Object.entries(items)
          .filter(([key, item]) => this.isItemDisplayable(key, item))
          .map(([id, item]) => ({ id, item }))
          .sort((a, b) =>
            (a.item.dname ?? a.id)
              .toLowerCase()
              .localeCompare((b.item.dname ?? b.id).toLowerCase()),
          ),
      ),
    );
  }

  // ── Heroes ─────────────────────────────────────────────
  private loadHeroes(): Observable<Record<string, DotaHero>> {
    if (!this.heroes$) {
      this.heroes$ = this.http
        .get<Record<string, DotaHero>>(`${this.base}/heroes.json`)
        .pipe(shareReplay(1));
    }
    return this.heroes$;
  }

  private loadHeroLore(): Observable<Record<string, string>> {
    if (!this.heroLore$) {
      this.heroLore$ = this.http
        .get<Record<string, string>>(`${this.base}/hero_lore.json`)
        .pipe(shareReplay(1));
    }
    return this.heroLore$;
  }

  getHero(heroId: string): DotaHero | null {
    return this.heroCache.get(heroId) ?? null;
  }

  getHero$(heroId: string): Observable<DotaHero | null> {
    return this.loadHeroes().pipe(map((heroes) => this.findHeroByAnyId(heroes, heroId) ?? null));
  }

  /**
   * Лор героя.
   *
   * В dotaconstants `hero_lore.json` использует слаги (antimage, axe, ...),
   * а `heroes.json` — числовые ключи ("1", "2"). Мостим через внутреннее имя:
   * npc_dota_hero_antimage -> antimage -> лор.
   *
   * На случай, если структура поменяется, пробуем несколько вариантов.
   */
  getHeroLore$(heroId: string): Observable<string | null> {
    return combineLatest([this.loadHeroes(), this.loadHeroLore()]).pipe(
      map(([heroes, lore]) => {
        const hero = this.findHeroByAnyId(heroes, heroId);
        if (!hero?.name) return null;

        const slug = hero.name.replace(/^npc_dota_hero_/, '');
        const lowerId = heroId.toLowerCase();
        const lnameUnderscored = hero.localized_name?.toLowerCase().replace(/[\s-]+/g, '_');

        // Пробуем несколько вариантов ключа
        return (
          lore[slug] ??
          lore[lowerId] ??
          lore[hero.name] ??
          (lnameUnderscored ? lore[lnameUnderscored] : undefined) ??
          null
        );
      }),
    );
  }

  getAllHeroes$(): Observable<DotaHeroEntry[]> {
    return this.loadHeroes().pipe(
      map((heroes) =>
        Object.entries(heroes)
          .filter(([, h]) => !!h.localized_name)
          .map(([id, hero]) => ({ id, hero }))
          .sort((a, b) =>
            a.hero.localized_name.toLowerCase().localeCompare(b.hero.localized_name.toLowerCase()),
          ),
      ),
    );
  }

  // ── Abilities ──────────────────────────────────────────
  private loadAbilities(): Observable<Record<string, DotaAbility>> {
    if (!this.abilities$) {
      this.abilities$ = this.http
        .get<Record<string, DotaAbility>>(`${this.base}/abilities.json`)
        .pipe(shareReplay(1));
    }
    return this.abilities$;
  }

  private loadHeroAbilities(): Observable<Record<string, HeroAbilitySet>> {
    if (!this.heroAbilities$) {
      this.heroAbilities$ = this.http
        .get<Record<string, HeroAbilitySet>>(`${this.base}/hero_abilities.json`)
        .pipe(shareReplay(1));
    }
    return this.heroAbilities$;
  }

  getAbility$(abilityId: string): Observable<DotaAbility | null> {
    return this.loadAbilities().pipe(map((a) => a[abilityId] ?? null));
  }

  getAllAbilities$(): Observable<DotaAbilityEntry[]> {
    return this.loadAbilities().pipe(
      map((abilities) =>
        Object.entries(abilities)
          .filter(([key, a]) => this.isAbilityDisplayable(key, a))
          .map(([id, ability]) => ({ id, ability }))
          .sort((a, b) =>
            (a.ability.dname ?? a.id)
              .toLowerCase()
              .localeCompare((b.ability.dname ?? b.id).toLowerCase()),
          ),
      ),
    );
  }

  getHeroAbilities$(heroId: string): Observable<DotaAbilityEntry[]> {
    return combineLatest([this.loadHeroes(), this.loadHeroAbilities(), this.loadAbilities()]).pipe(
      map(([heroes, heroAbilities, abilities]) => {
        const hero = this.findHeroByAnyId(heroes, heroId);
        if (!hero) return [];

        const keys = heroAbilities[hero.name]?.abilities ?? [];

        return keys.map((id) => ({ id, ability: abilities[id] })).filter((e) => !!e.ability?.dname);
      }),
    );
  }

  // ── Общее ──────────────────────────────────────────────
  preload(): Observable<void> {
    return this.loadItems().pipe(
      tap((items) => {
        for (const [id, item] of Object.entries(items)) {
          this.itemCache.set(id, item);
        }
      }),
      map(() => void 0),
    );
  }

  preloadHeroes(): Observable<void> {
    return this.loadHeroes().pipe(
      tap((heroes) => {
        for (const [id, hero] of Object.entries(heroes)) {
          this.heroCache.set(id, hero);
          const slug = hero.name?.replace(/^npc_dota_hero_/, '');
          if (slug) this.heroCache.set(slug, hero);
        }
      }),
      map(() => void 0),
    );
  }

  preloadAbilities(): Observable<void> {
    return this.loadAbilities().pipe(
      tap((abilities) => {
        for (const [id, ability] of Object.entries(abilities)) {
          this.abilityCache.set(id, ability);
        }
      }),
      map(() => void 0),
    );
  }

  groupByLetter<T>(entries: T[], getLabel: (e: T) => string): LetterGroup<T>[] {
    const map = new Map<string, T[]>();

    for (const entry of entries) {
      const label = getLabel(entry);
      const first = label.charAt(0).toUpperCase();
      const key = /[A-Z]/.test(first) ? first : '#';

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(entry);
    }

    return Array.from(map.entries())
      .sort(([a], [b]) => {
        if (a === '#') return 1;
        if (b === '#') return -1;
        return a.localeCompare(b);
      })
      .map(([letter, items]) => ({ letter, items }));
  }

  // ── Внутренние ─────────────────────────────────────────
  private isItemDisplayable(key: string, item: DotaItem): boolean {
    if (!item.dname) return false;
    if (HIDDEN_ITEM_PREFIXES.some((p) => key.startsWith(p))) return false;
    if (item.qual === 'component' && item.cost === null) return false;
    return true;
  }

  private isAbilityDisplayable(key: string, ability: DotaAbility): boolean {
    if (!ability.dname) return false;
    if (key.startsWith('special_bonus_')) return false;
    if (key.startsWith('_')) return false;
    return true;
  }

  private findHeroByAnyId(heroes: Record<string, DotaHero>, id: string): DotaHero | undefined {
    if (heroes[id]) return heroes[id];

    const lower = id.toLowerCase();

    for (const h of Object.values(heroes)) {
      const slug = h.name?.replace(/^npc_dota_hero_/, '');
      if (slug === lower) return h;

      const lname = h.localized_name?.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (lname === lower) return h;

      const lnameU = h.localized_name?.toLowerCase().replace(/[\s-]+/g, '_');
      if (lnameU === lower) return h;
    }

    return undefined;
  }
}
