import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CareerRoleStore } from '../../../core/demo/career-role.service';
import { CP_CRITERIA, CP_WAYS, ctWayFacts } from '../../../data/career-path.data';
import { CT_LEVELS, ctCriteria } from '../../../data/career-track.data';
import { CpWay } from '../../../interface/career-path';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { CtLevel } from '../../ctrack/ct-level';
import { CareerHrCompPick } from './career-hr-comp-pick';

/** Компетенции: уровень по грейду в строке, под строкой критерии и способы развития из справочника */
@Component({
  selector: '[career-hr-comps]',
  imports: [FilterBar, Icon, CtLevel, Float, CareerHrCompPick],
  template: `
    <div class="ch">
      <h3>Требуемые компетенции и уровни владения</h3>
      <span class="chip">{{ s.comps().length }}</span>
    </div>
    <app-filter-bar placeholder="Поиск по компетенциям" [(query)]="q">
      @if (s.form()) {
        <button ftAction class="btn pri" type="button" (click)="pick.set(true)">Добавить</button>
      }
    </app-filter-bar>
    @if (!s.comps().length) {
      <div class="cb">
        <div class="empty">
          <div class="wipi"><app-icon name="emptyTarget" /></div>
          <b>Компетенций пока нет</b>
          <small>{{ s.form() ? 'Добавьте компетенции из справочника и проставьте уровни' : 'Компетенции появятся после редактирования карточки.' }}</small>
        </div>
      </div>
    } @else {
      <div class="tw">
        <table class="tbl ctt">
          <thead>
            <tr>
              <th>Компетенция</th>
              <th>Группа</th>
              @for (g of s.grades(); track g.name) {
                <th>{{ g.name }}</th>
              }
              @if (s.form()) {
                <th class="tact"></th>
              }
            </tr>
          </thead>
          <tbody>
            @for (c of rows(); track c.name) {
              <tr class="clk" [attr.aria-expanded]="isOpen(c.name)" (click)="toggle(c.name)">
                <td>
                  <span class="cpcomp" [class.open]="isOpen(c.name)">
                    <app-icon name="chevSm" />
                    <b>{{ c.name }}</b>
                  </span>
                </td>
                <td>{{ c.group }}</td>
                @for (g of s.grades(); track g.name) {
                  <td (click)="$event.stopPropagation()">
                    @if (s.form()) {
                      <button
                        type="button"
                        class="hrlv"
                        #btn
                        [class.on]="cell()?.comp === c.name && cell()?.grade === g.name"
                        [attr.aria-label]="(c.levels[g.name] || 'Выбрать') + ', изменить уровень'"
                        (click)="openLevel(c.name, g.name, btn)"
                      >
                        @if (c.levels[g.name]; as lv) {
                          <ct-level [level]="lv" [comp]="c.name" [grade]="g.name" />
                        } @else {
                          <span class="ctna">Выбрать</span>
                        }
                        <app-icon name="chevDown" />
                      </button>
                    } @else {
                      <ct-level [level]="c.levels[g.name] || ''" [comp]="c.name" [grade]="g.name" />
                    }
                  </td>
                }
                @if (s.form()) {
                  <td class="tact" (click)="$event.stopPropagation()">
                    <button type="button" class="ib" title="Удалить" (click)="remove(c.name)"><app-icon name="close" /></button>
                  </td>
                }
              </tr>
              @if (isOpen(c.name)) {
                <tr class="cpxrow">
                  <td [attr.colspan]="(s.form() ? 3 : 2) + s.grades().length">
                    <div class="cpx">
                      @if (s.grades().length) {
                        @for (g of s.grades(); track g.name) {
                          <div class="cpxk">
                            <b>Критерии · {{ g.name }}</b>
                            <ul>
                              @for (line of criteria(g.name); track line) {
                                <li>{{ line }}</li>
                              }
                            </ul>
                          </div>
                        }
                      } @else {
                        <div class="cpxk">
                          <b>Критерии</b>
                          <ul>
                            @for (line of about(c.name); track line) {
                              <li>{{ line }}</li>
                            }
                          </ul>
                        </div>
                      }
                      @if (ways(c.name).length) {
                        <div class="cpxw">
                          <b>Способы развития</b>
                          <div class="cpxcard">
                            @for (w of ways(c.name); track w.title) {
                              <div class="prow">
                                <span class="cico"><app-icon [name]="w.icon" /></span>
                                <div>
                                  <b>{{ w.title }}</b>
                                  @if (facts(w).length) {
                                    <div class="prm">
                                      @for (m of facts(w); track m.icon + m.text) {
                                        <span>@if (m.icon) { <app-icon [name]="m.icon" /> }{{ m.text }}</span>
                                      }
                                    </div>
                                  }
                                </div>
                              </div>
                            }
                          </div>
                        </div>
                      }
                    </div>
                  </td>
                </tr>
              }
            } @empty {
              <tr><td [attr.colspan]="(s.form() ? 3 : 2) + s.grades().length" class="gr">Ничего не найдено</td></tr>
            }
          </tbody>
        </table>
      </div>
    }
    @if (cell(); as cur) {
      <div class="fpop selpop hrlvp" [appFloat]="anchor()!" (click)="$event.stopPropagation()">
        @for (lv of levels; track lv) {
          <div class="foi" (click)="set(lv)">{{ lv }}</div>
        }
        <div class="foi" (click)="set('')">Не требуется</div>
      </div>
    }
    @if (pick()) {
      <app-career-hr-comp-pick (closed)="pick.set(false)" />
    }
  `,
  host: { class: 'c career-hr-comps', '(document:click)': 'cell.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerHrComps {
  protected readonly s = inject(CareerRoleStore);
  private readonly confirm = inject(ConfirmService);
  protected readonly levels = CT_LEVELS;
  protected readonly q = signal('');
  protected readonly pick = signal(false);
  /** раскрытые компетенции: несколько сразу */
  protected readonly open = signal<string[]>([]);
  protected readonly cell = signal<{ comp: string; grade: string } | null>(null);
  protected readonly anchor = signal<HTMLElement | null>(null);
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.s.comps().filter((c) => !q || c.name.toLowerCase().includes(q) || c.group.toLowerCase().includes(q));
  });

  protected criteria(grade: string): string[] {
    return CP_CRITERIA[grade] || [];
  }
  protected about(name: string): string[] {
    return ctCriteria(name);
  }
  /** тип материала, длительность и грейд. Даты назначения — данные сотрудника, в карточке HR их нет */
  protected facts(w: CpWay): { icon: string; text: string }[] {
    return ctWayFacts(w, this.s.gradeNames());
  }
  protected ways(name: string): CpWay[] {
    const all = CP_WAYS[name] || [];
    const grades = new Set(this.s.gradeNames());
    if (!grades.size) return all;
    return all.filter((w) => w.grades.some((g) => grades.has(g)));
  }
  protected isOpen(name: string): boolean {
    return this.open().includes(name);
  }
  protected toggle(name: string): void {
    this.open.update((list) => (list.includes(name) ? list.filter((n) => n !== name) : [...list, name]));
  }
  protected openLevel(comp: string, grade: string, el: HTMLElement): void {
    const cur = this.cell();
    if (cur?.comp === comp && cur.grade === grade) {
      this.cell.set(null);
      return;
    }
    this.anchor.set(el);
    this.cell.set({ comp, grade });
  }
  protected set(level: string): void {
    const cur = this.cell();
    if (cur) this.s.setLevel(cur.comp, cur.grade, level);
    this.cell.set(null);
  }
  protected async remove(name: string): Promise<void> {
    if (await this.confirm.ask({ title: 'Удалить компетенцию?', text: 'Компетенция **' + name + '** будет убрана из карточки.', ok: 'Удалить', danger: true })) {
      this.s.removeComp(name);
      this.open.update((list) => list.filter((n) => n !== name));
    }
  }
}
