import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, booleanAttribute, computed, inject, input, output, signal } from '@angular/core';
import { absCount } from '../../../core/demo/absence-store.service';
import { ABS_KIND_GROUP, ABS_KIND_LABEL, ABS_STATUS_TONE } from '../../../data/absence.data';
import { plural } from '../../../data/org.data';
import { ME, ME_PHOTO, PEOPLE, avCls } from '../../../data/people.data';
import { AbsEntry, AbsPerson } from '../../../interface/absence';
import { Icon } from '../../../shared/ui/icon/icon';
import { AbsencesState } from '../absences.state';

/** строка сотрудника (администратор): заявки в текущем периоде и сумма дней */
interface Group {
  p: AbsPerson;
  added: boolean;
  items: AbsEntry[];
  days: number;
}

/**
 * Таблица заявок «Графика отсутствий» (вид «Таблица»): фильтр «Период» (по умолчанию текущий год) и остальные фильтры страницы.
 * Сотрудник — только свои заявки. Администратор — строки сотрудников (фото, ФИО, должность, число заявок и всего дней;
 * отдельной колонки «Сотрудник» нет — вид отсутствия заявки вровень с фото),
 * строка раскрывается (шеврон слева) — ниже заявки сотрудника; внизу «Добавить участника» новой строкой, как в календаре.
 * Клик по заявке — карточка отсутствия (там же — отмена своей заявки); отдельных действий в строках нет.
 */
@Component({
  selector: '[absences-table]',
  imports: [NgTemplateOutlet, Icon],
  template: `
    <div class="tw abtw">
      <table class="tbl abtbl" [class.adm]="admin()">
        <thead>
          <tr>
            @if (admin()) {
              <th class="abtch"></th>
            }
            <th>Вид отсутствия</th>
            <th>Период</th>
            <th>Дней</th>
            <th>Статус</th>
            <th>Заместитель</th>
            @if (admin()) {
              <th class="tact"></th>
            }
          </tr>
        </thead>
        <tbody>
          <ng-template #row let-x let-r="r">
            <tr class="abtr" (click)="open(r, x)">
              @if (admin()) {
                <td class="abtch"></td>
              }
              <td><span class="abtk" [class]="'ab-' + group(x.kind)"><i></i>{{ kindName(x) }}</span></td>
              <td class="nw">{{ period(x) }}</td>
              <td class="nw">{{ count(x) }}</td>
              <td><span class="bdg" [class]="toneOf(x)">{{ x.status }}</span></td>
              <td>
                @if (x.deputy) {
                  @let d = dep(x.deputy);
                  <span class="abtp">
                    <span class="av" [class]="d.av" [style.background-image]="d.me ? 'url(' + mePhoto + ')' : null"></span>
                    <span class="cnm"><b>{{ d.n }}</b><small>{{ d.pos }}</small></span>
                  </span>
                } @else {
                  —
                }
              </td>
              @if (admin()) {
                <td class="tact"></td>
              }
            </tr>
          </ng-template>

          @if (!admin()) {
            @for (x of mine(); track x.id) {
              <ng-container *ngTemplateOutlet="row; context: { $implicit: x, r: me() }" />
            } @empty {
              <tr><td colspan="5" class="empty sm">Заявок в этом периоде нет</td></tr>
            }
          } @else {
            @for (g of groups(); track g.p.n) {
              @let opened = !fold().has(g.p.n);
              <tr class="abtg">
                <td class="abtch">
                  <button class="abtchv" [class.on]="opened" [attr.aria-label]="opened ? 'Свернуть' : 'Развернуть'" (click)="toggle(g.p.n)"><app-icon name="chevDown" /></button>
                </td>
                <td colspan="2">
                  <span class="abtp">
                    <span class="av" [class]="av(g.p)"></span>
                    <span class="cnm"><b>{{ g.p.n }}</b><small>{{ g.p.pos }}</small></span>
                  </span>
                </td>
                <td class="nw"><b>{{ g.days }}</b> {{ word(g.days) }}</td>
                <td colspan="2" class="abtcnt">{{ g.items.length }} {{ reqWord(g.items.length) }}</td>
                <td class="tact">
                  @if (g.added) {
                    <button class="actb dg" title="Убрать из таблицы" aria-label="Убрать из таблицы" (click)="s.store.removeAdded(g.p.n)"><app-icon name="trashSm" /></button>
                  }
                </td>
              </tr>
              @if (opened) {
                @for (x of g.items; track x.id) {
                  <ng-container *ngTemplateOutlet="row; context: { $implicit: x, r: g }" />
                } @empty {
                  <tr><td></td><td colspan="6" class="abtno">Заявок в этом периоде нет</td></tr>
                }
              }
            }
            @if (draft()) {
              <!-- новая строка: выбор сотрудника, как в календаре -->
              <tr class="abtg">
                <td class="abtch"></td>
                <td colspan="5">
                  <button type="button" class="absel" (click)="pick.emit($event)"><span class="ph">Выберите сотрудника</span><app-icon name="chevDown" /></button>
                </td>
                <td class="tact">
                  <button class="actb dg" title="Убрать строку" aria-label="Убрать строку" (click)="dropDraft.emit()"><app-icon name="trashSm" /></button>
                </td>
              </tr>
            }
          }
        </tbody>
      </table>
    </div>
  `,
  styleUrl: './absences-table.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'ab-table' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AbsencesTable {
  /** цвет вида: за свой счет и учебный — цветом дополнительного отпуска */
  protected readonly group = ABS_KIND_GROUP;
  protected readonly s = inject(AbsencesState);
  /** новая строка «Добавить участника» (администратор) */
  readonly draft = input(false, { transform: booleanAttribute });
  readonly pick = output<Event>();
  readonly dropDraft = output<void>();

  protected readonly toneOf = (x: AbsEntry) => ABS_STATUS_TONE[x.status];
  protected readonly word = (n: number) => plural(n, 'день', 'дня', 'дней');
  protected readonly reqWord = (n: number) => plural(n, 'заявка', 'заявки', 'заявок');
  protected readonly av = (p: AbsPerson) => avCls(p.n, p.av);
  protected readonly mePhoto = ME_PHOTO;
  /** заместитель: фото, ФИО, должность по ФИО */
  protected dep(n: string): { n: string; pos: string; av: string; me: boolean } {
    const p = PEOPLE.find((x) => x[0] === n);
    return { n, pos: n === ME[0] ? ME[1] : (p?.[1] ?? ''), av: avCls(n, p?.[3] ?? 0), me: n === ME[0] };
  }
  protected readonly admin = computed(() => this.s.store.role() === 'admin');
  protected readonly me = computed(() => ({ p: this.s.store.me(), mine: true }));
  private readonly sort = (l: AbsEntry[]) => [...l].sort((a, b) => a.from.split('.').reverse().join('').localeCompare(b.from.split('.').reverse().join('')));

  /** сотрудник: свои заявки периода */
  protected readonly mine = computed(() => this.sort(this.s.visible(this.s.store.me(), true)));
  /** администратор: команда и добавленные — строки с заявками и суммой дней */
  protected readonly groups = computed<Group[]>(() => {
    const g = (p: AbsPerson, added: boolean): Group => {
      const items = this.sort(this.s.visible(p, true));
      return { p, added, items, days: items.reduce((a, x) => a + absCount(x), 0) };
    };
    return [
      ...this.s.store.team().filter((p) => this.s.match(p)).map((p) => g(p, false)),
      ...this.s.store.addedPeople().filter((p) => this.s.match(p)).map((p) => g(p, true)),
    ];
  });
  /** свернутые строки сотрудников */
  protected readonly fold = signal(new Set<string>());
  protected toggle(n: string): void {
    this.fold.update((s) => {
      const x = new Set(s);
      x.has(n) ? x.delete(n) : x.add(n);
      return x;
    });
  }

  protected kindName(x: AbsEntry): string {
    return ABS_KIND_LABEL[x.kind] + (x.trip ? ' — ' + x.trip.city : '');
  }
  protected period(x: AbsEntry): string {
    return x.open ? 'с ' + x.from + ' · открыт' : x.from === x.to ? x.from : x.from + ' – ' + x.to;
  }
  protected count(x: AbsEntry): string {
    const n = absCount(x);
    return n + ' ' + this.word(n);
  }

  protected open(r: { p: AbsPerson }, x: AbsEntry): void {
    this.s.entry.set({ p: r.p, x, mine: r.p.n === this.s.store.me().n });
  }
}
