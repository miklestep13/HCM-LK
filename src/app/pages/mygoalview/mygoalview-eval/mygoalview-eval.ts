import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { goalLetterCap, goalMyEvaluator, goalNum, goalPeople, goalScaleRows, goalToday, goalUnit } from '../../../core/demo/goals-store.service';
import { GOAL_EVM, GOAL_SCALES } from '../../../data/goals.data';
import { avCls } from '../../../data/people.data';
import { AttachFile } from '../../../interface/attach';
import { GoalMark, GoalPerson } from '../../../interface/goal';
import { Attach, attachBusy } from '../../../shared/ui/attach/attach';
import { AttachPreviewService } from '../../../shared/ui/attach/attach-preview.service';
import { attachKind, attachSize } from '../../../shared/ui/attach/attach.utils';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MygoalviewState } from '../mygoalview.state';

interface Row {
  k: string;
  p: GoalPerson | null;
  A: GoalMark | null;
  meth: string;
}

/**
 * Блок «Оценка»: аккордеон «оценка + участник», внутри — комментарий и документы.
 * На оценке заказчиков у качественной цели, открытой на редактирование, ниже — своя оценка участника (A–E, комментарий, документы).
 */
@Component({
  selector: '[mygoalview-eval]',
  imports: [Icon, Field, Attach],
  template: `
    <div class="ch"><h3>Оценка</h3></div>
    <div class="cb">
      <div class="glacl">
        @for (r of rows(); track r.k) {
          @let d = !!r.A?.o;
          @let docs = d ? okDocs(r.A!) : [];
          @let x = d && (!!r.A!.cm || !!docs.length);
          <div class="glacr" [class.wait]="!d" [class.open]="opened().has(r.k)">
            <button class="glach2" [disabled]="!x" [attr.aria-expanded]="opened().has(r.k)" (click)="flip(r.k)">
              <span class="afchev">
                @if (x) {
                  <app-icon name="chevDown" />
                }
              </span>
              <span class="glacgr"
                >@if (d) {
                  <span class="clbg" [class]="'g' + r.A!.o">{{ r.A!.o }}</span>
                } @else {
                  <span class="clbg glrc0">—</span>
                }<span class="glacn"
                  ><b>{{ d ? r.A!.n : 'Ждет оценки' }}</b><small
                    >{{ r.meth }}{{ d && num() && r.A!.fact != null ? ' · ' + fmt(r.A!.fact!) + us() : '' }}{{ d && r.A!.d ? ' · ' + r.A!.d : '' }}</small
                  ></span
                ></span
              >
              <span class="glacpp">
                @if (r.p) {
                  <span class="av" [class]="av(r.p.n, r.p.av)"></span><span class="cnm"><b>{{ r.p.n }}</b><small>{{ r.p.pos }}</small></span>
                }
              </span>
              <span class="glacwt">
                @if (r.p?.w) {
                  <small>Вес</small>{{ r.p!.w }}%
                }
              </span>
            </button>
            @if (x) {
              <div class="glacb" [class.hidden]="!opened().has(r.k)">
                @if (r.A!.cm) {
                  <small>Комментарий</small>
                  <p>{{ r.A!.cm }}</p>
                }
                @if (docs.length) {
                  <small>Документы</small>
                  <div class="afdcs">
                    @for (f of docs; track f.id) {
                      <button class="afdch" title="Открыть предпросмотр" (click)="pv.open(f)">
                        <span [class]="'atti k-' + kind(f.name)"><app-icon [name]="kind(f.name) === 'img' ? 'fileImg' : 'fileDoc'" /></span>
                        <span class="afdcn"><b>{{ f.name }}</b><small>{{ size(f.size) }}</small></span>
                        <span class="afdcd" title="Скачать" (click)="$event.stopPropagation(); pv.download(f)"><app-icon name="download" /></span>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        }
      </div>
      @if (form()) {
        <div class="glmyf">
          <div class="glvev">
            <div class="glrmh"><span class="afrs">Ваша оценка</span></div>
            <p class="glrhint">Оценку ставит каждый участник, итоговая — средняя по всем участникам с учетом весов.</p>
            <div class="glsrf glsrb">
              <div class="fld">
                <div class="seg clbseg">
                  @for (r of scale(); track r[1]) {
                    <span [class.on]="my().o === r[1]" (click)="my.set({ ...my(), o: r[1], n: cap(r[1]) }); err.set('')">{{ r[1] }}</span>
                  }
                </div>
              </div>
              <div class="glsrg">
                @if (my().o) {
                  <span class="clbg" [class]="'g' + my().o">{{ my().o }}</span>{{ cap(my().o) }}
                } @else {
                  <span class="gr">Оценка появится после выбора</span>
                }
              </div>
            </div>
            <div class="frm glf glvcm">
              <app-field label="Комментарий" full [filled]="!!my().cm">
                <textarea class="fta" rows="3" [value]="my().cm || ''" (input)="my.set({ ...my(), cm: $any($event.target).value })"></textarea>
              </app-field>
            </div>
            <div class="glvsch">Документы</div>
            <app-attach edit [(files)]="docs" />
            @if (err()) {
              <div class="pqerr">{{ err() }}</div>
            }
          </div>
        </div>
      }
    </div>
  `,
  host: { class: 'c mb glvres glevb' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalviewEval {
  protected readonly s = inject(MygoalviewState);
  protected readonly pv = inject(AttachPreviewService);
  private readonly toast = inject(ToastService);
  /** своя оценка — форма под списком */
  readonly form = input(false);
  protected readonly av = avCls;
  protected readonly kind = attachKind;
  protected readonly size = attachSize;
  protected readonly cap = goalLetterCap;
  protected readonly fmt = goalNum;
  protected readonly opened = signal(new Set<string>());
  protected readonly my = signal<GoalMark>({ o: '', n: '', cm: '' });
  protected readonly docs = signal<AttachFile[]>([]);
  protected readonly err = signal('');

  protected readonly num = computed(() => this.s.F().kind === 'num');
  protected readonly us = computed(() => {
    const u = this.s.F().u;
    return u === '%' ? '%' : u ? ' ' + goalUnit(u) : '';
  });
  protected readonly scale = computed(() => (goalScaleRows(this.s.F()).length ? goalScaleRows(this.s.F()) : GOAL_SCALES['Пятиуровневая (A–E)']));
  private readonly L = computed(() => (this.s.stage() === 'wait' ? [] : goalPeople(this.s.goal()!).filter((p) => p.role !== 'Исполнитель')));
  private readonly me = computed(() => (this.s.stage() === 'cust' ? goalMyEvaluator(this.L()) : undefined));

  protected readonly rows = computed<Row[]>(() => {
    const g = this.s.goal()!, st = this.s.stage(), F = this.s.F(), txt = F.kind === 'txt', form = this.form();
    const S = g.self || null, exe = goalPeople(g)[0], evs = g.evs || {}, me = this.me();
    const R: Row[] = [
      {
        k: 'exe',
        p: { ...exe, w: null },
        A: S ? { ...S, d: S.d } : null,
        meth: txt ? 'Самооценка' : (g.fin as GoalMark & { by?: string })?.by === 'mgr' ? 'Самооценка · по шкале' : 'Итоговая оценка · по результату самооценки',
      },
    ];
    if (txt)
      this.L().forEach((p) => {
        const A = evs[p.n], mine = p === me && st === 'cust';
        if (mine && form) return;
        R.push({ k: p.n, p, A: mine && !A?.saved ? null : A || null, meth: GOAL_EVM[p.role || ''] || 'Оценка участника' });
      });
    const mm = me || (st === 'fin' ? goalMyEvaluator(this.L()) : undefined);
    if (!txt && mm && !form) {
      const A = evs[mm.n];
      if (A?.saved && (g.fin as GoalMark & { by?: string })?.by === 'mgr') R.push({ k: 'mgr', p: { ...mm, w: null }, A, meth: 'Оценка руководителя · итоговая' });
    }
    if (st === 'fin' && g.fin && txt) R.push({ k: 'fin', p: null, A: g.fin, meth: 'Итоговая оценка · средняя по участникам с учетом весов' });
    return R;
  });

  ngOnInit(): void {
    const me = this.me(), A = me ? this.s.goal()!.evs?.[me.n] : undefined;
    this.my.set({ o: A?.o || '', n: A?.n || '', cm: A?.cm || '' });
    this.docs.set((A?.docs || []).map((f) => ({ ...f }) as AttachFile));
  }

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

  /** сохранить свою оценку; false — ошибка */
  save(): boolean {
    const me = this.me(), g = this.s.goal()!, A = this.my();
    if (!me) return false;
    if (!A.o) {
      this.err.set('Выберите оценку от A до E.');
      return false;
    }
    if (attachBusy(this.docs())) {
      this.toast.show('Документы загружаются', 'Дождитесь окончания загрузки файлов.');
      return false;
    }
    this.s.store.saveEval(g.id, me.n, { o: A.o, n: this.cap(A.o), fact: null, cm: (A.cm || '').trim(), d: goalToday(), saved: true, docs: this.docs().filter((f) => f.st !== 'load') as never });
    const fin = this.s.store.goals().find((x) => x.id === g.id)?.fin;
    this.toast.show(
      'Оценка сохранена',
      '«' + g.t + '» — ' + A.o + ', ' + this.cap(A.o).toLowerCase() + '.' + (fin ? ' Итоговая оценка — ' + fin.o + '.' : ' Итоговая появится, когда оценят все участники.'),
    );
    return true;
  }
}
