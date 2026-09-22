import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  DotaDataService,
  DotaPatchChange,
  DotaPatchEntry,
} from '../../core/services/dota-data.service';

@Component({
  selector: 'app-patch-notes-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './patchnotes-page.component.html',
  styleUrl: './patchnotes-page.component.css',
})
export class PatchNotesPageComponent implements OnInit {
  private data = inject(DotaDataService);

  patches = signal<DotaPatchEntry[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  /** Версии, которые раскрыты. По умолчанию — только самый свежий патч. */
  private expanded = signal<Set<string>>(new Set());

  ngOnInit(): void {
    this.data.getAllPatchNotes$().subscribe({
      next: (patches) => {
        this.patches.set(patches);
        if (patches.length > 0) {
          this.expanded.set(new Set([patches[0].version]));
        }
        this.loading.set(false);
      },
      error: (err) => {
        console.error('[PatchNotes] load failed', err);
        this.error.set('Failed to load patch notes.');
        this.loading.set(false);
      },
    });
  }

  isExpanded(version: string): boolean {
    return this.expanded().has(version);
  }

  toggle(version: string): void {
    const next = new Set(this.expanded());
    if (next.has(version)) next.delete(version);
    else next.add(version);
    this.expanded.set(next);
  }

  trackByVersion(_: number, p: DotaPatchEntry): string {
    return p.version;
  }

  trackByChange(_: number, c: DotaPatchChange): string {
    return c.key;
  }
}
