import { ChangeDetectionStrategy, Component, ElementRef, afterNextRender, booleanAttribute, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { goalAncestors, goalGroup, goalLevel, goalPeriodOf, goalState, goalType } from '../../../core/demo/goals-store.service';
import { GOAL_LEVEL_BADGE, MAP_ME } from '../../../data/goals.data';
import { roleWithGrade } from '../../../data/org.data';
import { ME, ME_PHOTO } from '../../../data/people.data';
import { MygoalviewState } from '../mygoalview.state';

/** Шапка цели (как основные поля формы, только просмотр): название и статус, родительские цели крошками; описание без подписи (как Object Header — абзацы и «Читать все»); тип, уровень, группа; период, даты, вес. У руководителя (HR) — карточка сотрудника. */
@Component({
  selector: '[mygoalview-head]',
  template: `
    @let g = s.goal()!;
    <div class="cb">
      <div class="glvtit">
        <h2 class="glvt">{{ g.t }}</h2>
        <span class="gltags"><span class="bdg" [class]="state()[0]">{{ state()[1] }}</span></span>
      </div>
      @if (showEmp()) {
        <div class="glemp">
          <img [src]="photo" alt="" />
          <span class="cnm"><b>{{ empName }}</b><small>{{ empRole }}</small><small>Подразделение: {{ me.unit }}</small></span>
        </div>
      }
      @if (crumbs().length) {
        <nav class="glbc" aria-label="Родительские цели">
          @for (c of crumbs(); track c.id; let last = $last) {
            <button class="glbcl" (click)="open.emit(c.id)">{{ c.t }}</button>
            @if (!last) {
              <span class="glbcs">/</span>
            }
          }
        </nav>
      }
      <div class="glvw">
        @if (descPars().length) {
          <div class="gldesc" #dsc [class.clamp]="descMore()" [class.open]="descOpen()">
            @for (p of descPars(); track $index) {
              <p>{{ p }}</p>
            }
          </div>
          @if (descMore()) {
            <button type="button" class="lnk gldmore" [attr.aria-expanded]="descOpen()" (click)="toggleDesc()">{{ descOpen() ? 'Свернуть' : 'Читать все' }}</button>
          }
        }
        <!-- та же сетка в 4 колонки, что у строки периода: тип над периодом, уровень над датой начала, группа над датой окончания -->
        <div class="glvrow glvr4">
          <div class="glvkv"><span class="l">Тип</span>{{ type() }}</div>
          <div class="glvkv"><span class="l">Уровень</span>{{ lvlName() }}</div>
          <div class="glvkv"><span class="l">Группа</span>{{ group() || '—' }}</div>
        </div>
        <div class="glvrow glvr4">
          <div class="glvkv"><span class="l">Период</span>{{ per().n }}</div>
          <div class="glvkv"><span class="l">Дата начала</span>{{ $any(g)['beg'] || per().from }}</div>
          <div class="glvkv"><span class="l">Дата окончания</span>{{ g.due || per().to }}</div>
          <div class="glvkv"><span class="l">Вес</span>{{ (g.w || 0) + '%' }}</div>
        </div>
      </div>
    </div>
  `,
  host: { class: 'c mb glvhd' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MygoalviewHead {
  protected readonly s = inject(MygoalviewState);
  /** карточка сотрудника в шапке (вид руководителя / HR) */
  readonly showEmp = input(false, { transform: booleanAttribute });
  readonly open = output<string>();
  protected readonly me = MAP_ME;
  protected readonly empName = ME[0];
  protected readonly empRole = roleWithGrade(MAP_ME.role, MAP_ME.grade);
  protected readonly photo = ME_PHOTO;
  private readonly lvl = computed(() => goalLevel(this.s.goal()!));
  protected readonly lvlName = computed(() => GOAL_LEVEL_BADGE[this.lvl()]);
  protected readonly type = computed(() => goalType(this.s.goal()!));
  protected readonly state = computed(() => goalState(this.s.goal()!, this.s.stage()));
  protected readonly crumbs = computed(() => goalAncestors(this.s.goal()!, this.s.store.goals()));
  protected readonly group = computed(() => goalGroup(this.s.goal()!));
  protected readonly per = computed(() => goalPeriodOf(this.s.goal()));
  /** абзацы описания — без подписи «Описание», отступы между абзацами */
  protected readonly descPars = computed(() => {
    const g = this.s.goal()!;
    const raw = (g.d || g.krs[0]?.t || '').trim();
    return raw ? raw.split(/\n+/).map((p) => p.trim()).filter(Boolean) : [];
  });
  protected readonly descMore = signal(false);
  protected readonly descOpen = signal(false);
  private readonly dsc = viewChild<ElementRef<HTMLElement>>('dsc');
  private descMax = '';

  constructor() {
    afterNextRender(() => this.measureDesc());
    effect(() => {
      this.descPars();
      untracked(() => {
        this.descOpen.set(false);
        requestAnimationFrame(() => this.measureDesc());
      });
    });
  }

  protected toggleDesc(): void {
    const el = this.dsc()?.nativeElement;
    if (!el) return;
    const open = !this.descOpen();
    this.descOpen.set(open);
    el.style.maxHeight = open ? '' : this.descMax;
  }

  private measureDesc(): void {
    const el = this.dsc()?.nativeElement;
    if (!el) return this.descMore.set(false);
    el.style.maxHeight = '';
    const lh = parseFloat(getComputedStyle(el.querySelector('p') || el).lineHeight) || 22;
    const max = lh * 4;
    if (el.scrollHeight > max + 4) {
      this.descMax = max + 'px';
      el.style.maxHeight = this.descMax;
      this.descMore.set(true);
    } else {
      this.descMax = '';
      this.descMore.set(false);
    }
  }
}
