import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { iprPl } from '../../../core/demo/ipr-store.service';
import { GOAL_COLORS, GOAL_PEOPLE, GOAL_PROLES, MAP_PERIOD } from '../../../data/goals.data';
import { avCls } from '../../../data/people.data';
import { GoalPerson } from '../../../interface/goal';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MygoalnewState } from '../mygoalnew.state';

/**
 * «Участники»: исполнитель и заказчики (сотрудник, роль, вес), полоса весов и «Распределить поровну» (кнопка рядом с «Добавить»).
 * Вид — таблица или компактный (плитки), переключается в dev-панели.
 */
@Component({
  selector: '[mygoalnew-ppl]',
  imports: [Icon, Select, Float, NgTemplateOutlet],
  template: `
    @let F = s.exe();
    <div class="ch">
      <h3>Участники</h3>
      <span class="chip">{{ 1 + s.ppl().length }}</span>
      <span class="glpbtns">
        @if (s.ppl().length && s.pview() !== 'cmp') {
          <button class="btn raised glpeq" (click)="spread()">Распределить поровну</button>
        }
        <button class="btn raised glpadd" [class.hidden]="s.pview() === 'cmp'" (click)="add($event)"><app-icon name="plusThin" />Добавить</button></span
      >
    </div>
    <div class="cb">
      @if (s.pview() === 'cmp') {
        <div class="glpkg">
          <div class="glpki exe">
            <div class="glpkt2"><span class="glpkl">Исполнитель</span><span class="glpkn">не оценивает</span></div>
            <div class="glpkr">
              <span class="glpwho"
                ><span class="av" [class]="av(F.n, F.av)"></span><span class="cnm"><b [title]="F.n">{{ F.n }}</b><small>{{ sub(F) }}</small></span></span
              >
            </div>
          </div>
          @for (p of s.ppl(); track $index; let i = $index) {
            <div class="glpki">
              <div class="glpkt2">
                <i class="glpkdot" [style.background]="col(i)"></i><span class="glpkl">{{ p.role || 'Заказчик' }}{{ p.team ? ' · команда' : '' }}</span>
              </div>
              <div class="glpkr">
                <ng-container *ngTemplateOutlet="who; context: { p, i }" />
                <ng-container *ngTemplateOutlet="wt; context: { p, i }" />
                <ng-container *ngTemplateOutlet="del; context: { i }" />
              </div>
            </div>
          }
          <button class="glpki glpkadd" (click)="add($event)"><app-icon name="plusThin" />Добавить заказчика</button>
        </div>
      } @else {
        <div class="glpt glpt-tp">
          <div class="glpth"><span>Участник</span><span>Роль</span><span>Вес</span><span></span></div>
          <div class="glpr exe">
            <span class="glpwho"
              ><span class="av" [class]="av(F.n, F.av)"></span><span class="cnm"><b [title]="F.n">{{ F.n }}</b><small>{{ sub(F) }}</small></span></span
            >
            <span class="glptp glprl"><i class="glpkdot glpkdot0"></i>Исполнитель</span>
            <span class="gr glpnw">—</span>
            <div class="glpact"></div>
          </div>
          @for (p of s.ppl(); track $index; let i = $index) {
            <div class="glpr">
              <ng-container *ngTemplateOutlet="who; context: { p, i }" />
              <span class="glprl"
                ><i class="glpkdot" [style.background]="col(i)"></i
                ><app-select class="glprs" [options]="roles" [value]="p.role || 'Заказчик'" (valueChange)="patch(i, { role: $event })"
              /></span>
              <ng-container *ngTemplateOutlet="wt; context: { p, i }" />
              <div class="glpact"><ng-container *ngTemplateOutlet="del; context: { i }" /></div>
            </div>
          } @empty {
            <div class="glpe">Добавьте хотя бы одного заказчика: руководителя, эксперта или команду.</div>
          }
        </div>
      }
      <div class="glptot glptot2">
        @if (sum() <= 100) {
          <div class="glptb glptbs">
            @for (p of s.ppl(); track $index; let i = $index) {
              @if (+(p.w ?? 0)) {
                <i [style.width.%]="+(p.w ?? 0)" [style.background]="col(i)" [title]="(p.n || 'Заказчик не выбран') + ' — ' + p.w + '%'"></i>
              }
            }
          </div>
        } @else {
          <div class="glptb"><i class="dg" [style.width.%]="100"></i></div>
        }
        <span class="glptn" [class.ok]="sum() === 100" [class.dg]="sum() > 100">{{ totalText() }}</span>
      </div>
    </div>

    <ng-template #who let-p="p" let-i="i">
      <button class="glpwsel" aria-label="Заказчик" [class.act]="pick()?.i === i" (click)="openPick($event, i)">
        @if (p.n) {
          <span class="fsv glpv"
            ><span class="av" [class]="av(p.n, p.av)"></span><span class="cnm"><b [title]="p.n">{{ p.n }}</b><small>{{ sub(p) }}</small></span></span
          >
        } @else {
          <span class="fsv ph">Выберите сотрудника или команду</span>
        }
        <svg viewBox="0 0 16 16" fill="none"><path d="M4 6.4 8 10.4l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </ng-template>
    <ng-template #wt let-p="p" let-i="i">
      <div class="glpwt"><input class="fin glpwi" inputmode="numeric" aria-label="Вес, %" [value]="p.w ?? ''" (input)="setW(i, $event)" /><span>%</span></div>
    </ng-template>
    <ng-template #del let-i="i">
      <button class="actb dg" title="Убрать заказчика" aria-label="Убрать заказчика" (click)="remove(i)"><app-icon name="trashSm" /></button>
    </ng-template>

    @if (pick(); as k) {
      <div class="fpop selpop cupop glpkp" [appFloat]="k.el" [style.width.px]="k.w" (click)="$event.stopPropagation()">
        <input class="fin fsq" placeholder="Поиск по ФИО или должности" [value]="q()" (input)="q.set($any($event.target).value)" />
        <div class="folist cul">
          @for (x of found(); track x.n) {
            <button class="glpko" [class.on]="x.n === s.ppl()[k.i]?.n" (click)="choose(x)">
              <span class="av" [class]="av(x.n, x.av)"></span><span class="cnm"><b>{{ x.n }}</b><small>{{ x.pos }}</small></span>
              @if (x.n === s.ppl()[k.i]?.n) {
                <app-icon name="checkSm" />
              }
            </button>
          } @empty {
            <div class="foe">Никого не нашли. Проверьте написание.</div>
          }
        </div>
      </div>
    }
  `,
  host: { class: 'c mb glpw', '(document:click)': 'pick.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalnewPpl {
  protected readonly s = inject(MygoalnewState);
  private readonly toast = inject(ToastService);
  protected readonly roles = GOAL_PROLES;
  protected readonly av = avCls;
  protected readonly pick = signal<{ el: HTMLElement; i: number; w: number } | null>(null);
  protected readonly q = signal('');
  protected readonly sum = this.s.pplSum;
  protected readonly totalText = computed(() => {
    const s = this.sum();
    return s === 100 ? 'Веса распределены: 100%' : s > 100 ? 'Сумма весов ' + s + '% — больше 100% на ' + (s - 100) + '%' : 'Распределено ' + s + ' из 100% · осталось ' + (100 - s) + '%';
  });
  protected readonly found = computed(() => {
    const k = this.pick(), s = this.q().trim().toLowerCase();
    if (!k) return [];
    const skip = [this.s.exe().n, ...this.s.ppl().filter((_, j) => j !== k.i).map((p) => p.n)];
    return GOAL_PEOPLE.filter((x) => !skip.includes(x.n) && (!s || (x.n + ' ' + x.pos).toLowerCase().includes(s)));
  });

  protected col(i: number): string {
    return GOAL_COLORS[i % GOAL_COLORS.length];
  }
  protected sub(p: GoalPerson): string {
    return p.team ? p.team.cnt + ' ' + iprPl(p.team.cnt, 'сотрудник', 'сотрудника', 'сотрудников') + ' · оценка — среднее по команде' : p.pos;
  }
  protected patch(i: number, x: Partial<GoalPerson>): void {
    this.s.ppl.update((l) => l.map((p, k) => (k === i ? { ...p, ...x } : p)));
    this.s.err.set('');
  }
  protected setW(i: number, e: Event): void {
    const el = e.target as HTMLInputElement;
    el.value = el.value.replace(/[^\d]/g, '').slice(0, 3);
    this.patch(i, { w: el.value });
  }
  protected add(e: Event): void {
    e.stopPropagation();
    const ex = this.s.exe();
    this.s.ppl.update((l) => [...l, { n: '', pos: '', av: 0, role: 'Заказчик', w: Math.max(0, 100 - this.sum()) || '', from: ex.from || MAP_PERIOD.from, to: ex.to || MAP_PERIOD.to }]);
  }
  protected remove(i: number): void {
    const p = this.s.ppl()[i];
    this.s.ppl.update((l) => l.filter((_, k) => k !== i));
    if (p.n) this.toast.show('Оценивающий убран', p.n + (p.w ? '. Освободилось ' + p.w + '% веса.' : '.'));
  }
  protected spread(): void {
    const n = this.s.ppl().length, base = Math.floor(100 / n);
    this.s.ppl.update((l) => l.map((p, i) => ({ ...p, w: base + (i < 100 - base * n ? 1 : 0) })));
  }
  protected openPick(e: Event, i: number): void {
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    if (this.pick()?.i === i) return this.pick.set(null);
    this.q.set('');
    this.pick.set({ el, i, w: Math.max(360, el.offsetWidth) });
  }
  protected choose(x: GoalPerson): void {
    const k = this.pick()!, old = this.s.ppl()[k.i];
    this.patch(k.i, { ...x, w: old.w, role: old.role || 'Заказчик', from: old.from, to: old.to });
    this.pick.set(null);
  }
}
