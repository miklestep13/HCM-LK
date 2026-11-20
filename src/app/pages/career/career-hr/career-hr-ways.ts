import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CareerRoleStore, HrWay } from '../../../core/demo/career-role.service';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../../shared/ui/icon/icon';
import { CareerHrWayForm } from './career-hr-way-form';

/** Блок «Возможности развития»: список способов и сайдбар добавления, как задача в ИПР */
@Component({
  selector: '[career-hr-ways]',
  imports: [FilterBar, Icon, CareerHrWayForm],
  template: `
    <div class="ch">
      <h3>Возможности развития</h3>
      <span class="chip">{{ s.ways().length }}</span>
    </div>
    <app-filter-bar placeholder="Поиск по названию" [(query)]="q">
      @if (s.form()) {
        <button ftAction class="btn pri" type="button" [disabled]="!s.comps().length" (click)="form.set('new')">Добавить</button>
      }
    </app-filter-bar>
    @if (!s.ways().length) {
      <div class="cb">
        <div class="empty">
          <div class="wipi"><app-icon name="emptyTasks" /></div>
          <b>Способов развития пока нет</b>
          <small>{{ s.form() ? (s.comps().length ? 'Добавьте курс, статью, книгу или задачу и укажите, для каких грейдов она нужна.' : 'Сначала добавьте компетенции — способ развития привязан к компетенции.') : 'Способы развития появятся после редактирования карточки.' }}</small>
        </div>
      </div>
    } @else {
      <div class="tw">
        <table class="tbl ctt">
          <thead>
            <tr>
              <th>Название</th>
              <th>Компетенции</th>
              <th>Вид</th>
              <th>Грейды</th>
              @if (s.form()) {
                <th class="tact"></th>
              }
            </tr>
          </thead>
          <tbody>
            @for (w of rows(); track w.id) {
              <tr [class.clk]="s.form()" (click)="s.form() ? form.set(w) : null">
                <td><b>{{ w.title }}</b></td>
                <td>{{ w.comps.join(', ') }}</td>
                <td>{{ w.kind }}</td>
                <td>{{ w.grades.join(', ') }}</td>
                @if (s.form()) {
                  <td class="tact" (click)="$event.stopPropagation()">
                    <button type="button" class="ib" title="Удалить" (click)="remove(w)"><app-icon name="close" /></button>
                  </td>
                }
              </tr>
            } @empty {
              <tr><td [attr.colspan]="s.form() ? 5 : 4" class="gr">Ничего не найдено</td></tr>
            }
          </tbody>
        </table>
      </div>
    }
    @if (form(); as f) {
      <app-career-hr-way-form [way]="f === 'new' ? null : f" (closed)="form.set(null)" />
    }
  `,
  host: { class: 'c' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerHrWays {
  protected readonly s = inject(CareerRoleStore);
  private readonly confirm = inject(ConfirmService);
  protected readonly q = signal('');
  protected readonly form = signal<HrWay | 'new' | null>(null);
  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    return this.s.ways().filter((w) => !q || w.title.toLowerCase().includes(q) || w.comps.some((c) => c.toLowerCase().includes(q)));
  });

  protected async remove(w: HrWay): Promise<void> {
    if (await this.confirm.ask({ title: 'Удалить способ развития?', text: '**' + w.title + '** будет убран из карточки.', ok: 'Удалить', danger: true })) {
      this.s.removeWay(w.id);
    }
  }
}
