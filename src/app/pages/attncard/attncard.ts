import { ChangeDetectionStrategy, Component, OnDestroy, ViewEncapsulation, effect, inject, signal, untracked } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AttestStore } from '../../core/demo/attest-store.service';
import { DevPanelService, devValue } from '../../core/layout/dev-panel/dev-panel.service';
import { ATT_STAGES } from '../../data/attest.data';
import { AttPerson, AttStage } from '../../interface/attest';
import { attachBusy } from '../../shared/ui/attach/attach';
import { todayDmy } from '../../shared/ui/attach/attach.utils';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { AttncardActs } from './attncard-acts/attncard-acts';
import { AttncardDocs } from './attncard-docs/attncard-docs';
import { AttncardEvents } from './attncard-events/attncard-events';
import { AttncardFinal } from './attncard-final/attncard-final';
import { AttncardHead } from './attncard-head/attncard-head';
import { AttncardIpr } from './attncard-ipr/attncard-ipr';
import { AttncardIprBlocks } from './attncard-ipr-blocks/attncard-ipr-blocks';
import { AttncardPeople } from './attncard-people/attncard-people';
import { AttncardPeopleTable } from './attncard-people-table/attncard-people-table';
import { AttncardPersonEdit } from './attncard-person-edit/attncard-person-edit';
import { AttncardRates } from './attncard-rates/attncard-rates';
import { AttncardResult } from './attncard-result/attncard-result';
import { pl } from './attncard.utils';

/**
 * «Мой кабинет → Аттестация → Бланк аттестации»: шапка бланка; мероприятия, пройденные и требуемые оценки,
 * после решения комиссии — итог (и ИПР); справа — участники и документы.
 * Демо (dev-панель): этап бланка, роль, раскладка (две колонки / одна), способ ввода значения оценки.
 */
@Component({
  selector: 'app-attncard',
  imports: [
    NgTemplateOutlet,
    PageHead,
    AttncardHead,
    AttncardEvents,
    AttncardActs,
    AttncardRates,
    AttncardResult,
    AttncardIpr,
    AttncardIprBlocks,
    AttncardFinal,
    AttncardPeople,
    AttncardPeopleTable,
    AttncardDocs,
    AttncardPersonEdit,
  ],
  template: `
    <app-page-head title="Бланк аттестации" />
    <div class="c mb iphead atclean atfin" attncard-head></div>
    @if (s.layout() === 'one') {
      <div class="atfone">
        <div class="c astw atfppl afpplt" attncard-people-table (edit)="person.set({ x: $event })" (remove)="remove($event)"></div>
        <ng-container *ngTemplateOutlet="main" />
        @if (s.post()) {
          <div class="c mt astw afres afresb afdocb" attncard-docs></div>
        }
      </div>
    } @else {
      <div class="two73 atfgrid">
        <div class="atfcol"><ng-container *ngTemplateOutlet="main" /></div>
        <div class="atfcol stickR">
          <div class="c astw atfppl" attncard-people (edit)="person.set({ x: $event })" (remove)="remove($event)"></div>
          @if (s.post()) {
            <div class="c mt astw afres afresb afdocb" attncard-docs></div>
          }
        </div>
      </div>
    }
    @if (s.stage() === 'mgr' && s.role() === 'mgr') {
      <div class="c atfact"><div class="facts"><button class="btn pri" (click)="toComm()">На оценку комиссии</button></div></div>
    }
    @if (s.stage() === 'meet' && s.role() === 'comm') {
      <div class="c atfact"><div class="facts"><button class="btn pri" (click)="finish()">Завершить аттестацию</button></div></div>
    }
    <ng-template #main>
      <div class="c mt astw afevt" attncard-events></div>
      <div class="c mt astw afact2" attncard-acts></div>
      <div class="c mt astw astw-t atfin2" attncard-rates></div>
      @if (s.post()) {
        <div class="c mt astw afres afresb" attncard-result></div>
        @if (s.stage() === 'ipr' || s.stage() === 'iprok') {
          <div class="c mt astw atfipr" attncard-ipr></div>
        }
      }
      @if (s.stage() === 'meet' && s.role() === 'comm') {
        <div class="c mt astw afform" attncard-final></div>
        @if (s.form().dec === 'Пройдена с условиями') {
          <div attncard-ipr-blocks></div>
        }
      }
    </ng-template>
    @if (person(); as p) {
      <app-attncard-person-edit [person]="p.x" (closed)="person.set(null)" />
    }
  `,
  styleUrl: './attncard.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-attncard' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Attncard implements OnDestroy {
  protected readonly s = inject(AttestStore);
  private readonly dev = inject(DevPanelService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  protected readonly person = signal<{ x: AttPerson | null } | null>(null);
  private off: (() => void)[] = [];

  constructor() {
    this.off.push(
      this.dev.register(
        { id: 'attStage', label: 'Состояние бланка', options: ATT_STAGES.map(([value, label]) => ({ value, label })), value: devValue<AttStage>(() => this.s.stage(), (v) => this.s.setStage(v)) },
        {
          id: 'attLayout',
          label: 'Раскладка',
          options: [
            { value: 'two', label: 'Две колонки' },
            { value: 'one', label: 'Одна колонка' },
          ],
          value: this.s.layout,
        },
        {
          id: 'attInput',
          label: 'Ввод значения',
          options: [
            { value: 'seg', label: 'Выбор A–E' },
            { value: 'list', label: 'Выпадающий список' },
            { value: 'text', label: 'Текстовое поле' },
            { value: 'num', label: 'Числовое поле' },
          ],
          value: this.s.inputMode,
        },
      ),
    );
    // роли зависят от этапа
    effect(() => {
      const roles = this.s.roles();
      untracked(() =>
        this.off.push(this.dev.register({ id: 'attRole', label: 'Роль', options: roles.map(([value, label]) => ({ value, label })), value: this.s.role })),
      );
    });
  }

  ngOnDestroy(): void {
    this.off.forEach((f) => f());
  }

  protected toComm(): void {
    const m = this.s.list().find((a) => a.k === 'mgr');
    if (m && m.st !== 'done') return this.toast.show('Нет оценки руководителя', 'Передать бланк комиссии можно после оценки руководителя.');
    this.toast.show('Бланк передан на оценку комиссии', 'Члены комиссии получат задачу на оценку.');
  }

  /** «Завершить аттестацию»: решение и комментарий обязательны; итог попадает в «Итог» следующих этапов */
  protected finish(): void {
    const F = this.s.form(),
      bad = new Set<string>();
    if (!F.dec) bad.add('dec');
    if (!F.cm.trim()) bad.add('cm');
    if (bad.size) {
      this.s.formErr.set(bad);
      document.querySelector('.pg-attncard .afform')?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      return this.toast.show('Итоги аттестации', 'Выберите решение и напишите комментарий.');
    }
    if (attachBusy(F.docs)) return this.toast.show('Документы загружаются', 'Дождитесь окончания загрузки файлов.');
    this.s.result.update((r) => ({ ...r, dec: F.dec, cand: F.cand ? 1 : 0, cm: F.cm.trim(), docs: F.docs.slice() }));
    const n = F.docs.length;
    this.toast.show(
      'Аттестация завершена',
      'Решение: ' +
        F.dec +
        (F.cand ? ', кандидат на повышение' : '') +
        (F.dec === 'Пройдена с условиями' ? ' · ИПР по условиям создан' : '') +
        (n ? ' · ' + n + ' ' + pl(n, 'документ', 'документа', 'документов') : '') +
        '.',
    );
  }

  /** исключить участника: уходит в недействующие с отметкой «Участвовал до» */
  protected async remove(x: AttPerson): Promise<void> {
    if (x.name === this.s.responsible()) return this.toast.show('Нельзя исключить ответственного', 'Сначала назначьте ответственным за бланк другого участника.');
    const ok = await this.confirm.ask({
      title: 'Исключить участника?',
      text: `${x.name}${x.role ? ' (' + x.role.toLowerCase() + ')' : ''} больше не сможет смотреть и править бланк. Его оценки и комментарии сохранятся, в списке он появится среди недействующих.`,
      ok: 'Исключить',
      danger: true,
    });
    if (!ok) return;
    this.s.people.update((l) => l.map((z) => (z === x ? { ...z, till: todayDmy() } : z)));
    this.toast.show('Участник исключен', x.name + ' — в списке недействующих.');
  }
}

