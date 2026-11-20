import { ChangeDetectionStrategy, Component, inject, output, signal } from '@angular/core';
import { CareerRoleStore } from '../../../core/demo/career-role.service';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { EmpPick } from '../../../shared/ui/emp-pick/emp-pick';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Сайдбар «Редактирование должности»: название, описание, лидер и эксперты */
@Component({
  selector: 'app-career-hr-params',
  imports: [Drawer, Field, Select, EmpPick],
  template: `
    <app-drawer title="Редактирование должности" [open]="true" (openChange)="closed.emit()" (ok)="save()">
      <div class="frm">
        <app-field label="Название" required full [filled]="!!name()">
          <input class="fin" [value]="name()" (input)="name.set($any($event.target).value)" />
        </app-field>
        <app-field label="Описание" full [filled]="!!desc()">
          <textarea class="fta" rows="4" [value]="desc()" (input)="desc.set($any($event.target).value)"></textarea>
        </app-field>
        <app-field label="Лидер должности" required full [filled]="!!leader()">
          <app-select [options]="s.personNames" [value]="leader()" placeholder="Выберите лидера" (valueChange)="leader.set($event)" />
        </app-field>
        <app-field label="Эксперты" full [filled]="!!experts().length">
          <app-emp-pick [people]="s.people" [value]="experts()" (valueChange)="experts.set($event)" />
        </app-field>
      </div>
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerHrParams {
  private readonly toast = inject(ToastService);
  protected readonly s = inject(CareerRoleStore);
  readonly closed = output<void>();

  protected readonly name = signal(this.s.name());
  protected readonly desc = signal(this.s.desc());
  protected readonly leader = signal(this.s.leader());
  protected readonly experts = signal<string[]>([...this.s.experts()]);

  protected save(): void {
    const name = this.name().trim();
    if (!name || !this.leader()) {
      this.toast.show('Карточка должности', 'Укажите название и лидера.');
      return;
    }
    this.s.name.set(name);
    this.s.desc.set(this.desc().trim());
    this.s.leader.set(this.leader());
    this.s.experts.set(this.experts());
    this.toast.show('Изменения сохранены', 'Название, описание, лидер и эксперты обновлены.');
    this.closed.emit();
  }
}
