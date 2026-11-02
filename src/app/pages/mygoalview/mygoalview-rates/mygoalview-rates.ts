import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { goalNum, goalPeople, goalUnit } from '../../../core/demo/goals-store.service';
import { GOAL_EVM } from '../../../data/goals.data';
import { avCls } from '../../../data/people.data';
import { AttachFile } from '../../../interface/attach';
import { GoalMark, GoalPerson } from '../../../interface/goal';
import { AttachPreviewService } from '../../../shared/ui/attach/attach-preview.service';
import { attachKind, attachSize } from '../../../shared/ui/attach/attach.utils';
import { Icon } from '../../../shared/ui/icon/icon';
import { MygoalviewState } from '../mygoalview.state';

/** Строка таблицы оценок */
interface Rate {
  /** self — самооценка исполнителя, ev — оценка участника, fin — итоговая */
  k: string;
  kind: 'self' | 'ev' | 'fin';
  p: GoalPerson | null;
  meth: string;
  A: GoalMark | null;
  /** оценка проставлена автоматически (количественная и бинарная — по результату) */
  auto: boolean;
}

/**
 * Блок «Оценка» качественной цели — таблица, как «Требуемые оценки» в бланке аттестации (только просмотр):
 * способ оценки, оценивающий, вес, дата, значение, статус; проставленная с комментарием или документами раскрывается.
 * Своя оценка ставится ниже, в блоке «Ваша оценка».
 */
@Component({
  selector: '[mygoalview-rates]',
  imports: [Icon],
  template: `
    <div class="ch">
      <h3>Оценка</h3>
      <span class="chip">{{ rows().length }}</span>
    </div>
    <div class="cb">
      <div class="tw">
        <table class="tbl gvrtbl">
          <thead>
            <tr>
              <th style="width: 220px">Способ оценки</th>
              <th>Оценивающий</th>
              <th style="width: 72px">Вес</th>
              <th style="width: 110px">Дата оценки</th>
              <th style="width: 120px">Значение</th>
              <th style="width: 132px">Статус</th>
            </tr>
          </thead>
          <tbody>
            @for (r of rows(); track r.k) {
              @let d = !!r.A?.o;
              @let docs = d ? okDocs(r.A!) : [];
              @let x = d && (!!r.A!.cm || !!docs.length);
              <tr class="afrow" [class.afexp]="x" [class.open]="x && opened().has(r.k)" (click)="x ? flip(r.k) : null">
                <td>
                  <span class="afcell"
                    ><span class="afchev">
                      @if (x) {
                        <app-icon name="chevDown" />
                      } </span
                    ><b>{{ r.meth }}</b></span
                  >
                </td>
                <td>
                  @if (r.p) {
                    <span class="gvper"
                      ><span class="av" [class]="av(r.p.n, r.p.av)"></span><span class="cnm"><b>{{ r.p.n }}</b><small>{{ r.p.role || r.p.pos }}</small></span></span
                    >
                  } @else {
                    <span class="gr">{{ txt() ? 'Средняя по участникам с учетом весов' : 'По фактическому результату' }}</span>
                  }
                </td>
                <td>{{ (r.p?.w || 0) + '%' }}</td>
                <td>
                  @if (d && r.A!.d) {
                    {{ r.A!.d }}
                  } @else {
                    <span class="gr">—</span>
                  }
                </td>
                <td>
                  @if (d) {
                    <span class="gvval"
                      ><span class="clbg" [class]="'g' + r.A!.o" [title]="r.A!.n">{{ r.A!.o }}</span>
                      @if (num() && r.A!.fact != null) {
                        <small>{{ fmt(r.A!.fact!) }}{{ us() }}</small>
                      } @else if (bin() && r.kind !== 'fin') {
                        <small>{{ r.A!.o === 'A' ? 'Выполнено' : 'Не выполнено' }}</small>
                      }
                    </span>
                  } @else {
                    <span class="gr">—</span>
                  }
                </td>
                <td>
                  @if (d) {
                    <span class="bdg ok">{{ r.auto ? 'Автоматически' : 'Проставлена' }}</span>
                  } @else {
                    <span class="bdg">Ждет оценки</span>
                  }
                </td>
              </tr>
              @if (x) {
                <tr class="afacc" [class.hidden]="!opened().has(r.k)">
                  <td colspan="6">
                    <div class="afaccb">
                      @if (r.A!.cm) {
                        <small>Комментарий</small>
                        <p>{{ r.A!.cm }}</p>
                      }
                      @if (docs.length) {
                        <small class="afaccd">Документы</small>
                        <div class="afdcs">
                          @for (f of docs; track f.id) {
                            <button class="afdch" title="Открыть предпросмотр" (click)="$event.stopPropagation(); pv.open(f)">
                              <span [class]="'atti k-' + kind(f.name)"><app-icon [name]="kind(f.name) === 'img' ? 'fileImg' : 'fileDoc'" /></span>
                              <span class="afdcn"><b>{{ f.name }}</b><small>{{ size(f.size) }}</small></span>
                              <span class="afdcd" title="Скачать" (click)="$event.stopPropagation(); pv.download(f)"><app-icon name="download" /></span>
                            </button>
                          }
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              }
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c mb gvrates' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalviewRates {
  protected readonly s = inject(MygoalviewState);
  protected readonly pv = inject(AttachPreviewService);
  protected readonly av = avCls;
  protected readonly kind = attachKind;
  protected readonly size = attachSize;
  protected readonly fmt = goalNum;
  protected readonly opened = signal(new Set<string>());

  protected readonly txt = computed(() => this.s.F().kind === 'txt');
  protected readonly num = computed(() => this.s.F().kind === 'num');
  protected readonly bin = computed(() => this.s.F().kind === 'str');
  protected readonly unit = computed(() => goalUnit(this.s.F().u));
  protected readonly us = computed(() => (this.unit() === '%' ? '%' : this.unit() ? ' ' + this.unit() : ''));

  private readonly evs = computed(() => goalPeople(this.s.goal()!).filter((p) => p.role !== 'Исполнитель'));

  /** строки: самооценка, оценки участников, итоговая (когда есть) */
  protected readonly rows = computed<Rate[]>(() => {
    const g = this.s.goal()!, auto = !this.txt(), E = g.evs || {};
    const exe = goalPeople(g)[0];
    const R: Rate[] = [{ k: 'self', kind: 'self', p: { ...exe, role: 'Исполнитель', w: null }, meth: 'Самооценка', A: g.self?.o ? g.self : null, auto: false }];
    this.evs().forEach((p) => {
      // у количественной и бинарной оценка участника — автоматически по результату (итоговой)
      const A = E[p.n]?.o ? E[p.n] : auto && g.fin?.o ? { ...g.fin, cm: E[p.n]?.cm, docs: E[p.n]?.docs, d: E[p.n]?.d } : null;
      R.push({ k: p.n, kind: 'ev', p, meth: GOAL_EVM[p.role || ''] || 'Оценка участника', A, auto: auto && !!A });
    });
    if (g.fin?.o) R.push({ k: 'fin', kind: 'fin', p: null, meth: 'Итоговая оценка', A: g.fin, auto: auto });
    return R;
  });

  protected okDocs(A: GoalMark): AttachFile[] {
    return (A.docs || []).filter((f) => f.st !== 'load') as AttachFile[];
  }
  protected flip(k: string): void {
    this.opened.update((s) => {
      const n = new Set(s);
      n.has(k) ? n.delete(k) : n.add(k);
      return n;
    });
  }
}
