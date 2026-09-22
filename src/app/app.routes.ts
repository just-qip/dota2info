import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'items' },
  {
    path: 'items',
    loadComponent: () =>
      import('./features/items/items-page.component').then((m) => m.ItemsPageComponent),
  },
  {
    path: 'heroes',
    loadComponent: () =>
      import('./features/heroes/heroes-page.component').then((m) => m.HeroesPageComponent),
  },
  {
    path: 'abilities',
    loadComponent: () =>
      import('./features/abilities/abilities-page.component').then((m) => m.AbilitiesPageComponent),
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
