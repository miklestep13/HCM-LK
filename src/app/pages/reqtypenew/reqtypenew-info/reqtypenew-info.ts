import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, signal } from '@angular/core';
import { PEOPLE } from '../../../data/people.data';
import { REQ_CATS } from '../../../data/req.data';
import { REQ_FLOWS, REQ_TYPE_ICONS } from '../../../data/req-builder.data';
import { EmpPick, PickPerson } from '../../../shared/ui/emp-pick/emp-pick';
import { Field } from '../../../shared/ui/field/field';
import { Float } from '../../../shared/ui/float/float';
import { Icon } from '../../../shared/ui/icon/icon';
import { Select } from '../../../shared/ui/select/select';
import { ReqtypenewState } from '../reqtypenew.state';

/**
 * Шаг «Общая информация» нового типа заявки: название*, описание (многострочное), префикс*,
 * ответственные (несколько сотрудников), категория, иконка («Выбрать иконку» — сетка иконок), рабочий процесс заявки*.
 */
@Component({
  selector: '[reqtypenew-info]',
  imports: [Field, Select, EmpPick, Icon, Float],
  template: `
    <div class="cb frm rtnfrm">
      <app-field label="Название" required full [filled]="!!s.n()" [error]="s.tried() && !s.n().trim()">
        <input class="fin" placeholder="Например: Справка 2-НДФЛ" [value]="s.n()" (input)="s.n.set($any($event.target).value)" />
      </app-field>
      <app-field label="Описание" full [filled]="!!s.d()">
        <textarea class="fta" rows="3" placeholder="Для чего этот тип заявки — сотрудник увидит описание при выборе типа" [value]="s.d()" (input)="s.d.set($any($event.target).value)"></textarea>
      </app-field>
      <app-field label="Префикс" required [filled]="!!s.prefix()" [error]="s.tried() && !s.prefix().trim()">
        <input class="fin" placeholder="Например: NDFL" maxlength="10" [value]="s.prefix()" (input)="setPrefix($any($event.target))" />
      </app-field>
      <app-field label="Категория" [filled]="!!s.cat()">
        <app-select [options]="cats" placeholder="Выберите категорию" [value]="s.cat()" (valueChange)="s.cat.set($event)" />
      </app-field>
      <!-- как «Сотрудник» в сайдбаре «Выдать награду»: подпись в поле, выбранные — чипами с фото, список с поиском -->
      <app-field label="Ответственные" full [filled]="!!s.resp().length">
        <app-emp-pick [people]="people" [(value)]="s.resp" placeholder="Начните вводить ФИО" />
      </app-field>
      <app-field label="Рабочий процесс заявки" required full [filled]="!!s.flow()" [error]="s.tried() && !s.flow()">
        <app-select [options]="flows" placeholder="Выберите процесс" [value]="s.flow()" (valueChange)="s.flow.set($event)" />
      </app-field>
      <!-- иконка типа: выбранная — плитка; «Выбрать иконку» / «Изменить» — сетка иконок -->
      <div class="fld full rtnicon">
        <span class="rtnl">Иконка</span>
        <span class="rtnic">
          @if (s.icon()) {
            <span class="rtnit"><app-icon [name]="s.icon()" /></span>
          }
          <button type="button" class="lnk" (click)="openIcons($event)">{{ s.icon() ? 'Изменить иконку' : 'Выбрать иконку' }}</button>
          @if (s.icon()) {
            <button type="button" class="lnk rtnrm" (click)="s.icon.set('')">Убрать</button>
          }
        </span>
      </div>
    </div>
    @if (pick(); as a) {
      <div class="fpop rtnicons" [appFloat]="a" (click)="$event.stopPropagation()">
        @for (ic of icons; track ic) {
          <button type="button" class="rtnib" [class.on]="s.icon() === ic" [attr.aria-label]="'Иконка ' + ic" (click)="s.icon.set(ic); pick.set(null)"><app-icon [name]="ic" /></button>
        }
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c rtninfo', '(document:click)': 'pick.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReqtypenewInfo {
  protected readonly s = inject(ReqtypenewState);
  protected readonly cats = REQ_CATS;
  protected readonly flows = REQ_FLOWS;
  protected readonly icons = REQ_TYPE_ICONS;
  protected readonly people: PickPerson[] = PEOPLE.map((p) => ({ name: p[0], post: p[1], av: p[3] }));
  protected readonly pick = signal<HTMLElement | null>(null);
  /** префикс — латиница и цифры, заглавными */
  protected setPrefix(el: HTMLInputElement): void {
    el.value = el.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    this.s.prefix.set(el.value);
  }
  protected openIcons(e: Event): void {
    e.stopPropagation();
    const a = e.currentTarget as HTMLElement;
    this.pick.set(this.pick() === a ? null : a);
  }
}
