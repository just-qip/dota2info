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
  { path: '**', redirectTo: 'items' },
];
