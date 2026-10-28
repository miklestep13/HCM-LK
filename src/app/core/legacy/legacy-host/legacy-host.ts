import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { LegacyService } from '../legacy.service';

/** Контейнер старого прототипа: iframe на всю область под шапкой. Показывается только на маршрутах /legacy/:page */
@Component({
  selector: 'app-legacy-host',
  template: `@if (legacy.started()) {
    <iframe
      #frame
      class="lgframe"
      [class.hidden]="!legacy.active()"
      [src]="src"
      title="Прототип Q.HCM"
    ></iframe>
  }`,
  styles: [
    `
      .lgframe {
        position: fixed;
        left: 0;
        right: 0;
        top: 48px;
        bottom: 0;
        width: 100%;
        height: calc(100vh - 48px);
        border: 0;
        background: var(--page);
        z-index: 1;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegacyHost implements AfterViewChecked {
  protected readonly legacy = inject(LegacyService);
  private readonly frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');
  protected readonly src = inject(DomSanitizer).bypassSecurityTrustResourceUrl(this.legacy.src);

  ngAfterViewChecked(): void {
    const f = this.frame()?.nativeElement;
    if (f) this.legacy.attach(f);
  }
}
