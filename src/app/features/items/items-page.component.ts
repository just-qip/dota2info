import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemIconComponent } from './item-icon/item-icon.component';
import { DotaDataService, DotaItemEntry, LetterGroup } from '../../core/services/dota-data.service';

@Component({
  selector: 'app-items-page',
  standalone: true,
  imports: [CommonModule, ItemIconComponent],
  templateUrl: './items-page.component.html',
  styleUrl: './items-page.component.css',
})
export class ItemsPageComponent implements OnInit {
  private data = inject(DotaDataService);

  items = signal<DotaItemEntry[]>([]);
  loading = signal(true);

  groups = computed<LetterGroup<DotaItemEntry>[]>(() =>
    this.data.groupByLetter(this.items(), (e) => e.item.dname ?? e.id),
  );

  ngOnInit(): void {
    this.data.getAllItems$().subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[ItemsPage] load failed', err);
        this.loading.set(false);
      },
    });
  }

  trackByLetter(_: number, group: LetterGroup<DotaItemEntry>): string {
    return group.letter;
  }

  trackById(_: number, entry: DotaItemEntry): string {
    return entry.id;
  }
}
