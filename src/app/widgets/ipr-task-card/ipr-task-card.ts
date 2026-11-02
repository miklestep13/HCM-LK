import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, input, output } from '@angular/core';
import { iprPl, iprTaskSt } from '../../core/demo/ipr-store.service';
import { IPR_RATES } from '../../data/ipr.data';
import { LEARN_COURSES } from '../../data/learn.data';
import { IprRate, IprStatus, IprTask } from '../../interface/ipr';
import { Icon } from '../../shared/ui/icon/icon';

/** Действие с карточки задачи ИПР */
export interface IprTaskAct {
  a: 'open' | 'crs' | 'link' | 'art' | 'comp' | 'edit' | 'del' | 'run' | 'rate' | 'chat';
  i: number;
  /** оценка (rate), компетенция (comp), ссылка (link) */
  v?: string;
}

/**
 * Карточка задачи ИПР (страница «ИПР», ИПР по итогам аттестации): стрелка раскрытия, название и статус,
 * бейджи «Выполнено» / «Не выполнено» и «Просрочено» (только если срок прошел), ожидаемый результат; в раскрытой — материалы и компетенции; мета-строка; действия справа по статусу плана.
 */
@Component({
  selector: '[ipr-task-card]',
  imports: [Icon],
  template: `
    @let t = task();
    <button class="actb ipxb" title="Развернуть"><app-icon name="chevSm" /></button>
    <div class="iprb">
      <div class="iprn">
        {{ t.t }}
        @if (showStatus()) {
          <span class="bdg" [class.ok]="t.done">{{ t.done ? 'Выполнено' : 'Не выполнено' }}</span>
          @if (over()) {
            <span class="bdg dg">Просрочено</span>
          }
        }
      </div>
      <div class="iprd ipkres"><span class="l">Ожидаемый результат</span>{{ t.res }}</div>
      <div class="iptx">
        @if (mats().length) {
          <div class="iprd">
            <span class="l">Материалы</span>
            <div class="ipml">
              @for (m of mats(); track m.kind) {
                <button class="ipmi ipmib" (click)="act.emit({ a: m.a, i: index(), v: m.v })">
                  <span class="ipmic"><app-icon [name]="m.icon" /></span><span class="ipmt"><small>{{ m.kind }}</small><b>{{ m.name }}</b></span>
                </button>
              }
            </div>
          </div>
        }
        @if (t.note) {
          <div class="iprd"><span class="l">Комментарий</span>{{ t.note }}</div>
        }
        @if (t.comps.length) {
          <div class="iprd">
            <span class="l">Развиваемые компетенции</span>
            @for (c of t.comps; track c; let last = $last) {
              <button class="ipcn" title="Показать в списке компетенций" (click)="act.emit({ a: 'comp', i: index(), v: c })">{{ c }}</button>{{ last ? '' : ', ' }}
            }
          </div>
        }
      </div>
      <div class="iprm">
        <span [class.dgt]="over()"><app-icon name="calendar" />до {{ t.due }}{{ t.done && t.doneAt ? ' · выполнена ' + t.doneAt : '' }}</span>
        @if (run() && t.crs && !t.done) {
          <span>Обучение · закроется после прохождения курса</span>
        }
        @if (mats().length) {
          <span class="ipmc"><app-icon name="clip" />{{ mats().length }} {{ pl(mats().length, 'материал', 'материала', 'материалов') }}</span>
        }
        @if (t.comps.length) {
          <span class="ipmc"><app-icon name="docLines" />{{ t.comps.length }} {{ pl(t.comps.length, 'компетенция', 'компетенции', 'компетенций') }}</span>
        }
        <span class="ipmx"><app-icon name="userXs" />{{ t.by }}</span>
      </div>
    </div>
    <span class="iprr">
      @if (status() === 'Аттестация') {
        @if (mgr()) {
          <span class="seg ipats">
            @for (r of rates; track r.k) {
              <span [class]="r.cls" [class.on]="rate() === r.k" (click)="act.emit({ a: 'rate', i: index(), v: r.k })">{{ r.label }}</span>
            }
          </span>
        } @else {
          <span class="bdg" [class]="rateInfo()?.tone ?? ''">{{ rateInfo()?.label ?? 'Не оценено' }}</span>
        }
        <button class="actb ipcmb" [class.has]="cm()" title="Комментарии к задаче" (click)="act.emit({ a: 'chat', i: index() })">
          <app-icon name="bubble" />{{ cm() || '' }}
        </button>
      }
      @if (run()) {
        <button class="actb" title="Выполнение задачи" (click)="act.emit({ a: 'run', i: index() })"><app-icon name="edit" /></button>
      }
      @if (editable()) {
        <button class="actb" [title]="status() === 'Утверждено' ? 'Редактировать задание' : 'Редактировать'" (click)="act.emit({ a: 'edit', i: index() })">
          <app-icon name="edit" />
        </button>
        @if (status() === 'Черновик') {
          <button class="actb dg" title="Удалить задачу" (click)="act.emit({ a: 'del', i: index() })"><app-icon name="trashSm" /></button>
        }
      }
    </span>
  `,
  host: {
    class: 'iprt',
    '[class.done]': 'task().done',
    '[class.over]': 'over()',
    '[class.open]': 'open()',
    '(click)': 'toggle($event)',
  },
  styleUrl: './ipr-task-card.scss',
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprTaskCard {
  readonly task = input.required<IprTask>();
  readonly index = input.required<number>();
  /** статус плана */
  readonly status = input.required<IprStatus>();
  /** можно редактировать (черновик / утвержденный план) */
  readonly editable = input(false, { transform: booleanAttribute });
  readonly open = input(false);
  /** на аттестации: смотрит руководитель (оценивает) */
  readonly mgr = input(true);
  readonly rate = input<IprRate | undefined>();
  /** число комментариев */
  readonly cm = input(0);
  readonly act = output<IprTaskAct>();

  protected readonly rates = IPR_RATES;
  protected readonly pl = iprPl;
  protected readonly st = computed(() => iprTaskSt(this.task()));
  protected readonly over = computed(() => !this.task().done && this.st() !== 'В работе');
  protected readonly showStatus = computed(() => !['Черновик', 'Предложено'].includes(this.status()));
  protected readonly run = computed(() => this.status() === 'Утверждено');
  protected readonly rateInfo = computed(() => IPR_RATES.find((r) => r.k === this.rate()));
  protected readonly mats = computed(() => {
    const t = this.task();
    const L: { a: IprTaskAct['a']; kind: string; name: string; icon: string; v?: string }[] = [];
    if (t.crs && LEARN_COURSES[t.crs]) L.push({ a: 'crs', kind: 'Курс из каталога', name: LEARN_COURSES[t.crs].t, icon: 'course', v: t.crs });
    if (t.link) L.push({ a: 'link', kind: 'Ссылка на внешний курс или ресурс', name: t.link.replace(/^https?:\/\//, ''), icon: 'video', v: t.link });
    if (t.art) L.push({ a: 'art', kind: 'Статья из базы знаний', name: t.art.replace(/^«|»$/g, ''), icon: 'book' });
    return L;
  });

  protected toggle(e: Event): void {
    const el = e.target as HTMLElement;
    if (el.closest('button:not(.ipxb),a,input,.ipats')) return;
    this.act.emit({ a: 'open', i: this.index() });
  }
}
