import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, signal } from '@angular/core';
import { ABSENCES } from '../../../data/home.data';
import { Card } from '../../../shared/ui/card/card';
import { Icon } from '../../../shared/ui/icon/icon';
import { StatCell } from '../../../shared/ui/stat-cell/stat-cell';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/**
 * Блок «Мои отсутствия»: сверху — две плитки: доступный отпуск и доступные отгулы; в середине — слайдер ближайших отпусков и отгулов
 * (вид, даты, длительность, статус, «Редактировать»; стрелки и точки); внизу — «Запросить».
 */
@Component({
  selector: 'app-home-absences',
  imports: [Card, Icon, StatCell],
  template: ` <app-card title="Мои отсутствия" open="absences">
    <div class="cb">
      <div class="st2">
        @for (a of d.available; track a.label) {
          <app-stat-cell [label]="a.label">{{ a.value }} <small>{{ a.unit }}</small></app-stat-cell>
        }
      </div>
      @if (cur(); as x) {
        <div class="abh">
          <span class="l">Ближайшие</span>
          <span class="abnav">
            <button class="actb" title="Предыдущее" aria-label="Предыдущее" [disabled]="i() === 0" (click)="go(-1)"><app-icon name="pgPrev" /></button>
            <button class="actb" title="Следующее" aria-label="Следующее" [disabled]="i() === d.items.length - 1" (click)="go(1)"><app-icon name="pgNext" /></button>
          </span>
        </div>
        <div class="abs" [class]="x.kind">
          <span class="abi"><app-icon [name]="x.kind === 'vac' ? 'calendar' : 'clock'" /></span>
          <span class="abt">
            <b>{{ x.type }}</b>
            <small>{{ x.dates }}</small>
            <small>{{ x.days }}</small>
            <span class="bdg" [class]="x.tone">{{ x.status }}</span>
          </span>
          <button class="actb abed" title="Редактировать" aria-label="Редактировать" (click)="toast.show(x.type, 'Изменение дат: ' + x.dates + '.')"><app-icon name="edit" /></button>
        </div>
        <div class="abdots">
          @for (y of d.items; track $index) {
            <button [class.on]="$index === i()" [attr.aria-label]="'Отсутствие ' + ($index + 1)" (click)="i.set($index)"></button>
          }
        </div>
      }
      <button class="btn raised blk" (click)="toast.show('Отсутствие', 'Форма заявки на отпуск или отгул.')">Запросить</button>
    </div>
  </app-card>`,
  styleUrl: './home-absences.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-absences' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeAbsences {
  protected readonly toast = inject(ToastService);
  protected readonly d = ABSENCES;
  protected readonly i = signal(0);
  protected readonly cur = computed(() => this.d.items[this.i()]);
  protected go(n: number): void {
    this.i.set(Math.max(0, Math.min(this.d.items.length - 1, this.i() + n)));
  }
}
