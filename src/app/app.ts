import { Component, OnInit, inject } from '@angular/core';
import { ItemIconComponent } from './features/items/item-icon/item-icon.component';
import { DotaDataService } from './core/services/dota-data.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ItemIconComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private data = inject(DotaDataService);

  ngOnInit(): void {
    this.data.preload().subscribe({
      next: () => console.log('[DotaData] items loaded'),
      error: (err) => console.error('[DotaData] load failed', err),
    });
  }
}
