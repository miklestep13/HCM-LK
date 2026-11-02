import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewEncapsulation, effect, inject, input, signal, untracked } from '@angular/core';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { GoalTemplate } from '../../interface/goal';
import { Float } from '../../shared/ui/float/float';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { MygoalnewMain } from './mygoalnew-main/mygoalnew-main';
import { MygoalnewMeas } from './mygoalnew-meas/mygoalnew-meas';
import { MygoalnewPpl } from './mygoalnew-ppl/mygoalnew-ppl';
import { MygoalnewTpl } from './mygoalnew-tpl/mygoalnew-tpl';
import { MygoalnewState } from './mygoalnew.state';

/**
 * «Цели → Добавление / Редактирование цели»: основные поля, измерение и шкала, участники; сохранение — с проверкой,
 * сплит-кнопка — «Сохранить и добавить цель в шаблон». Параметры адреса: edit — цель, lvl — уровень новой цели.
 * Вид участников и источник цели (из карты / без карты) — в dev-панели.
 */
@Component({
  selector: 'app-mygoalnew',
  imports: [PageHead, Icon, Float, MygoalnewMain, MygoalnewMeas, MygoalnewPpl, MygoalnewTpl],
  template: `
    <app-page-head [title]="s.editId() ? 'Редактирование цели' : 'Добавление цели'" backTo="mygoals" backLabel="К карте целей" />
    <div mygoalnew-main (pickTpl)="tpl.set(true)"></div>
    <div mygoalnew-meas></div>
    <div mygoalnew-ppl></div>
    <div class="pqerr" [class.hidden]="!s.err()" #err>{{ s.err() }}</div>
    <div class="c ipisl">
      <div class="ipff">
        <span class="kbsplit"
          ><button class="btn pri" (click)="save(false)">Сохранить</button
          ><button class="btn pri kbsplm" title="Другие действия" aria-label="Другие действия" (click)="toggle($event)"><app-icon name="chev16" /></button
        ></span>
      </div>
    </div>
    @if (menu(); as m) {
      <div class="fpop amenu" [appFloat]="m" (click)="$event.stopPropagation()">
        <button class="ami" (click)="menu.set(null); save(true)"><app-icon name="tplDoc" />Сохранить и добавить цель в шаблон</button>
      </div>
    }
    @if (tpl()) {
      <app-mygoalnew-tpl (picked)="applyTpl($event)" (closed)="tpl.set(false)" />
    }
  `,
  styleUrl: './mygoalnew.scss',
  encapsulation: ViewEncapsulation.None,
  providers: [MygoalnewState],
  host: { class: 'pg pg-mygoalnew', '(document:click)': 'menu.set(null)', '(input)': 's.err.set("")' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Mygoalnew implements OnDestroy {
  protected readonly s = inject(MygoalnewState);
  protected readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  /** редактируемая цель (параметр адреса) */
  readonly edit = input('');
  /** уровень новой цели — по блоку, где нажали «Добавить» */
  readonly lvl = input('');
  protected readonly tpl = signal(false);
  protected readonly menu = signal<HTMLElement | null>(null);

  private readonly unregister = inject(DevPanelService).register(
    {
      id: 'goalPview',
      label: 'Вид участников',
      options: [
        { value: 'cmp', label: 'Карточки' },
        { value: 'rows', label: 'Таблица' },
      ],
      value: this.s.pview,
    },
    {
      id: 'goalSrc',
      label: 'Источник цели',
      options: [
        { value: true, label: 'Из карты целей' },
        { value: false, label: 'Без карты' },
      ],
      value: devValue<boolean>(() => this.s.fromMap(), (v) => this.s.setFromMap(v)),
    },
  );

  constructor() {
    effect(() => {
      const id = this.edit() || null, lvl = this.lvl();
      untracked(() => this.s.init(id, lvl));
    });
  }

  protected toggle(e: Event): void {
    e.stopPropagation();
    const b = e.currentTarget as HTMLElement;
    this.menu.set(this.menu() === b ? null : b);
  }
  protected applyTpl(t: GoalTemplate): void {
    this.s.applyTemplate(t);
    this.toast.show('Шаблон применен', 'Проверьте поля и укажите вес цели.');
  }
  protected save(asTpl: boolean): void {
    const r = this.s.save(asTpl);
    if ('error' in r) {
      this.s.err.set(r.error);
      setTimeout(() => this.el.querySelector('.pqerr')?.scrollIntoView({ block: 'center' }));
      return;
    }
    this.nav.go('mygoals');
    this.toast.show(
      r.isNew ? 'Цель добавлена' : 'Цель сохранена',
      '«' + r.goal.t + '» — вес ' + r.goal.w + '%.' + (asTpl ? (r.tplNew ? ' Цель добавлена в шаблоны.' : ' Шаблон с таким названием обновлен.') : ''),
    );
  }

  ngOnDestroy(): void {
    this.unregister();
  }
}
