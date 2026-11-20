import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { KB_ARTICLES } from '../../../data/kb.data';
import { LEARN_COURSES } from '../../../data/learn.data';
import { CareerRoleStore, HrWay, HrWayKind } from '../../../core/demo/career-role.service';
import { ChipSelect } from '../../../shared/ui/chip-select/chip-select';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';

const KINDS: HrWayKind[] = ['Курс', 'Статья', 'Книга', 'Задача', 'Мероприятие', 'Тест'];

/** Сайдбар способа развития: компетенция, вид, название и грейды, для которых он нужен */
@Component({
  selector: 'app-career-hr-way-form',
  imports: [Drawer, Field, Select, ChipSelect],
  template: `
    <app-drawer [title]="way() ? 'Способ развития' : 'Добавление способа'" [open]="true" (openChange)="closed.emit()" (ok)="save()">
      <div class="frm">
        <app-field label="Компетенции" required full [filled]="!!comps().length">
          <app-chip-select [options]="compOptions()" [value]="comps()" placeholder="Выберите компетенции" (valueChange)="comps.set($event)" />
        </app-field>
        <app-field label="Вид" required full filled>
          <app-select [options]="kinds" [value]="kind()" (valueChange)="setKind($any($event))" />
        </app-field>
        @if (kind() === 'Курс') {
          <app-field label="Курс" required full [filled]="!!title()">
            <app-select [options]="courseOptions()" [value]="title()" placeholder="Выберите курс из каталога" [search]="true" (valueChange)="title.set($event)" />
          </app-field>
        } @else if (kind() === 'Статья') {
          <app-field label="Статья" required full [filled]="!!title()">
            <app-select [options]="articleOptions()" [value]="title()" placeholder="Выберите статью из базы знаний" [search]="true" (valueChange)="title.set($event)" />
          </app-field>
        } @else {
          <app-field label="Название" required full [filled]="!!title()">
            <input class="fin" placeholder="Например: Кредитный анализ: оценка заемщика" [value]="title()" (input)="title.set($any($event.target).value)" />
          </app-field>
        }
        <app-field label="Грейды" required full [filled]="!!grades().length">
          <app-chip-select [options]="s.gradeNames()" [value]="grades()" placeholder="Для каких грейдов" (valueChange)="grades.set($event)" />
        </app-field>
      </div>
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerHrWayForm implements OnInit {
  private readonly toast = inject(ToastService);
  protected readonly s = inject(CareerRoleStore);
  readonly way = input<HrWay | null>(null);
  readonly closed = output<void>();

  protected readonly kinds = KINDS;
  protected readonly compOptions = computed(() => this.s.comps().map((c) => c.name));
  private readonly catalog = Object.values(LEARN_COURSES)
    .map((c) => c.t)
    .sort((a, b) => a.localeCompare(b, 'ru'));
  private readonly articles = KB_ARTICLES.map((a) => a.title).sort((a, b) => a.localeCompare(b, 'ru'));
  protected readonly comps = signal<string[]>([]);
  protected readonly kind = signal<HrWayKind>('Курс');
  protected readonly title = signal('');
  protected readonly grades = signal<string[]>([]);
  protected readonly courseOptions = computed(() => this.withCurrent(this.catalog));
  protected readonly articleOptions = computed(() => this.withCurrent(this.articles));

  protected setKind(v: HrWayKind): void {
    const listed = (k: HrWayKind) => k === 'Курс' || k === 'Статья';
    if (v !== this.kind() && (listed(v) || listed(this.kind()))) this.title.set('');
    this.kind.set(v);
  }

  ngOnInit(): void {
    const w = this.way();
    if (!w) return;
    this.comps.set([...w.comps]);
    this.kind.set(w.kind);
    this.title.set(w.title);
    this.grades.set([...w.grades]);
  }

  protected save(): void {
    const title = this.title().trim();
    if (!this.comps().length || !title || !this.grades().length) {
      this.toast.show('Способ развития', 'Укажите компетенции, название и хотя бы один грейд.');
      return;
    }
    this.s.saveWay({ id: this.way()?.id, comps: this.comps(), kind: this.kind(), title, grades: this.grades() });
    this.toast.show(this.way() ? 'Способ сохранен' : 'Способ добавлен', title);
    this.closed.emit();
  }

  private withCurrent(list: string[]): string[] {
    const t = this.title();
    return t && !list.includes(t) ? [t, ...list] : list;
  }
}
