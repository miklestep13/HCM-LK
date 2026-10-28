import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ICONS } from './icons';

/** Иконка из реестра: <app-icon name="calendar" /> */
@Component({
  selector: 'app-icon',
  template: '',
  host: { '[innerHTML]': 'svg()', class: 'app-icon' },
  styles: [
    ':host{display:inline-flex;line-height:0} :host ::ng-deep :where(svg){width:inherit;height:inherit}',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Icon {
  readonly name = input.required<string>();
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly svg = computed(() =>
    this.sanitizer.bypassSecurityTrustHtml(ICONS[this.name()] ?? ''),
  );
}
