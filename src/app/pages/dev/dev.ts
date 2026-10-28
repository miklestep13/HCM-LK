import { ChangeDetectionStrategy, Component, ViewEncapsulation, effect, inject, input, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { DevCard } from './dev-card/dev-card';
import { DevCatFilter } from './dev-cat-filter/dev-cat-filter';
import { DevCcard } from './dev-ccard/dev-ccard';
import { DevMyFilter } from './dev-my-filter/dev-my-filter';
import { DevState } from './dev.state';

/**
 * «Мой кабинет → Обучение»: «Мое обучение» (lt=my) и «Каталог обучения» (lt=cat) — пункты меню.
 * Страницы курса, программы и плеер пока в старом прототипе (статусы общие — LearnStore).
 */
@Component({
  selector: 'app-dev',
  imports: [PageHead, DevMyFilter, DevCatFilter, DevCard, DevCcard],
  template: `
    @if (s.lt() === 'cat') {
      <app-page-head title="Каталог обучения" backTo="dev" [backAttrs]="{ lt: 'my' }" backLabel="Назад: Обучение" />
      <div class="c mb" dev-cat-filter></div>
      <div class="cgrid">
        @for (c of s.catCards(); track c.id) {
          <div dev-ccard [card]="c" [kind]="s.ckind()"></div>
        }
      </div>
    } @else {
      <app-page-head title="Мое обучение" />
      <div class="c mb" dev-my-filter></div>
      <div class="vgrid">
        @for (c of s.myCards(); track c.id) {
          <div dev-card [card]="c" [kind]="s.kind()"></div>
        }
      </div>
    }
  `,
  styleUrl: './dev.scss',
  providers: [DevState],
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-dev' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Dev {
  protected readonly s = inject(DevState);
  private readonly router = inject(Router);
  /** раздел из адреса (?lt=cat); без него — последний открытый (возврат со страницы курса) */
  readonly lt = input<string>();

  constructor() {
    effect(() => {
      const lt = this.lt();
      untracked(() => {
        if (lt === 'my' || lt === 'cat') this.s.setLt(lt);
      else if (this.s.store.lt() === 'cat') this.router.navigate(['/dev'], { queryParams: { lt: 'cat' }, replaceUrl: true });
        else this.s.setLt('my');
      });
    });
  }
}
