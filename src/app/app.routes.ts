import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'items' },

  {
    path: 'items',
    loadComponent: () =>
      import('./features/items/items-page.component').then((m) => m.ItemsPageComponent),
  },
  {
    path: 'item',
    loadComponent: () =>
      import('./features/detail/item-page.component').then((m) => m.ItemPageComponent),
  },

  {
    path: 'heroes',
    loadComponent: () =>
      import('./features/heroes/heroes-page.component').then((m) => m.HeroesPageComponent),
  },
  {
    path: 'hero',
    loadComponent: () =>
      import('./features/detail/hero-page.component').then((m) => m.HeroPageComponent),
  },

  {
    path: 'abilities',
    loadComponent: () =>
      import('./features/abilities/abilities-page.component').then((m) => m.AbilitiesPageComponent),
  },
  {
    path: 'ability',
    loadComponent: () =>
      import('./features/detail/ability-page.component').then((m) => m.AbilityPageComponent),
  },

  {
    path: 'patchnotes',
    loadComponent: () =>
      import('./features/patchnotes/patchnotes-page.component').then(
        (m) => m.PatchNotesPageComponent,
      ),
  },
  {
    path: 'integration',
    loadComponent: () =>
      import('./features/integration-guide/integration-guide-page.component').then(
        (m) => m.IntegrationGuidePageComponent,
      ),
  },
  { path: '**', redirectTo: 'items' },
];
