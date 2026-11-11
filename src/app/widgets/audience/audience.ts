import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input, model } from '@angular/core';
import { AUD_FIELDS, AUD_OPS, audAny, audCond, audGroup, audMatch, audReady } from '../../data/audience.data';
import { AudCond, AudGroup } from '../../interface/audience';
import { Member } from '../../interface/member';
import { ChipSelect } from '../../shared/ui/chip-select/chip-select';
import { Field } from '../../shared/ui/field/field';
import { Icon } from '../../shared/ui/icon/icon';
import { Select } from '../../shared/ui/select/select';

/**
 * Условия отбора участников — опрос, курс, мероприятие, новость, любая рассылка:
 *   <div app-audience [(groups)]="rules" [pool]="employees"></div>
 * Условие: поле → «Включает / Исключает» → несколько значений чипами (подходит любое из них: два подразделения — сотрудники обоих).
 * Условия в группе — через «и», группы — через «или» («+ Добавить группу условий»). Внизу — сколько сотрудников подходит.
 * Подбор — audMatch(pool, groups) из data/audience.data.ts.
 */
@Component({
  selector: '[app-audience]',
  imports: [Field, Select, ChipSelect, Icon],
  template: `
    @for (g of groups(); track $index; let gi = $index) {
      @if (gi) {
        <div class="audor"><span>или</span></div>
      }
      <div class="audg" [class.many]="groups().length > 1">
        @if (groups().length > 1) {
          <div class="audgh">
            <b>Группа {{ gi + 1 }}</b>
            <span class="audgn">{{ countText(g) }}</span>
            <button class="actb dg" title="Удалить группу" (click)="delGroup(gi)"><app-icon name="trashSm" /></button>
          </div>
        }
        @for (c of g.c; track $index; let ci = $index) {
          @if (ci) {
            <div class="audand">и</div>
          }
          <div class="audrow">
            <app-field label="Поле" [filled]="!!c.f">
              <app-select [options]="fields" placeholder="" [value]="c.f" (valueChange)="setField(c, $event)" />
            </app-field>
            <app-field label="Условие" filled>
              <app-select [options]="opLabels" [value]="opLabel(c)" (valueChange)="setOp(c, $event)" />
            </app-field>
            <app-field label="Значения" [filled]="c.v.length > 0" [class.dis]="!c.f">
              <app-chip-select [options]="vals(c.f)" [placeholder]="c.f ? 'Выберите одно или несколько' : 'Сначала выберите поле'" [value]="c.v" (valueChange)="setVals(c, $event)" />
            </app-field>
            <button class="actb dg auddel" title="Удалить условие" (click)="delCond(gi, ci)"><app-icon name="trashSm" /></button>
          </div>
        }
        <button class="lnk lnkadd" (click)="addCond(g)"><app-icon name="plus" />Добавить условие</button>
      </div>
    }
    <div class="audfoot">
      <button class="lnk lnkadd" (click)="addGroup()"><app-icon name="plus" />Добавить группу условий (или)</button>
      <span class="audsum" [class.on]="any()"><app-icon name="group" />{{ summary() }}</span>
    </div>
  `,
  styleUrl: './audience.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'aud' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Audience {
  readonly groups = model<AudGroup[]>([audGroup()]);
  /** все сотрудники, из которых подбираем */
  readonly pool = input<Member[]>([]);
  protected readonly fields = Object.keys(AUD_FIELDS);
  protected readonly opLabels = AUD_OPS.map((o) => o.label);
  protected readonly any = computed(() => audAny(this.groups()));
  protected readonly summary = computed(() => {
    if (!this.any()) return 'Условия не заданы — выберите поле и значения';
    const n = audMatch(this.pool(), this.groups()).length;
    return 'Подходит ' + this.ppl(n) + ' из ' + this.pool().length;
  });

  protected vals(f: string): string[] {
    return AUD_FIELDS[f] ?? [];
  }
  protected opLabel(c: AudCond): string {
    return AUD_OPS.find((o) => o.value === c.op)!.label;
  }
  protected countText(g: AudGroup): string {
    return g.c.some(audReady) ? this.ppl(audMatch(this.pool(), [g]).length) : 'условия не заданы';
  }
  private ppl(n: number): string {
    const w = n % 10 === 1 && n % 100 !== 11 ? 'сотрудник' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'сотрудника' : 'сотрудников';
    return n + ' ' + w;
  }
  /** правки — новым массивом, чтобы страница пересчитала подобранных */
  private emit(): void {
    this.groups.set([...this.groups()]);
  }
  protected setField(c: AudCond, f: string): void {
    if (c.f !== f) c.v = [];
    c.f = f;
    this.emit();
  }
  protected setOp(c: AudCond, label: string): void {
    c.op = AUD_OPS.find((o) => o.label === label)!.value;
    this.emit();
  }
  protected setVals(c: AudCond, v: string[]): void {
    c.v = v;
    this.emit();
  }
  protected addCond(g: AudGroup): void {
    g.c.push(audCond());
    this.emit();
  }
  protected delCond(gi: number, ci: number): void {
    const l = this.groups();
    l[gi].c.splice(ci, 1);
    // пустая группа уходит; последняя остается с пустым условием
    if (!l[gi].c.length) l.length > 1 ? l.splice(gi, 1) : (l[gi].c = [audCond()]);
    this.emit();
  }
  protected addGroup(): void {
    this.groups.set([...this.groups(), audGroup()]);
  }
  protected delGroup(gi: number): void {
    this.groups.set(this.groups().filter((_, i) => i !== gi));
  }
}
