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
import { AttncardEvents } from './attncard-events/attncard-events';
import { AttncardFinal } from './attncard-final/attncard-final';
import { AttncardHead } from './attncard-head/attncard-head';
import { AttncardIpr } from './attncard-ipr/attncard-ipr';
import { AttncardIprBlocks } from './attncard-ipr-blocks/attncard-ipr-blocks';
import { AttncardPeopleTable } from './attncard-people-table/attncard-people-table';
import { AttncardRates } from './attncard-rates/attncard-rates';
import { AttncardResult } from './attncard-result/attncard-result';
import { pl } from './attncard.utils';

/**
 * «Мой кабинет → Аттестация → Бланк аттестации»: шапка бланка; мероприятия, пройденные и требуемые оценки,
 * после решения комиссии — итог (и ИПР); справа — участники и документы.
 * Демо (dev-панель): этап бланка, роль, способ ввода значения оценки.
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
    AttncardPeopleTable,
  ],
  template: `
    <app-page-head title="Бланк аттестации" />
    <div class="c mb iphead atclean atfin" attncard-head></div>
    <!-- участники — таблицей на всю ширину (раскладка с участниками в правой колонке убрана) -->
    <div class="atfone">
      <div class="c astw atfppl afpplt" attncard-people-table (remove)="remove($event)"></div>
      <ng-container *ngTemplateOutlet="main" />
    </div>
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
  private off: (() => void)[] = [];

  constructor() {
    this.off.push(
      this.dev.register(
        { id: 'attStage', label: 'Состояние бланка', options: ATT_STAGES.map(([value, label]) => ({ value, label })), value: devValue<AttStage>(() => this.s.stage(), (v) => this.s.setStage(v)) },
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

  /** исключить участника: отметка «Участвовал до», в списке участников больше не показывается */
  protected async remove(x: AttPerson): Promise<void> {
    if (x.name === this.s.responsible()) return this.toast.show('Нельзя исключить ответственного', 'Сначала назначьте ответственным за бланк другого участника.');
    const ok = await this.confirm.ask({
      title: 'Исключить участника?',
      text: `${x.name}${x.role ? ' (' + x.role.toLowerCase() + ')' : ''} больше не сможет смотреть и править бланк. Его оценки и комментарии сохранятся, из списка участников он пропадет.`,
      ok: 'Исключить',
      danger: true,
    });
    if (!ok) return;
    this.s.people.update((l) => l.map((z) => (z === x ? { ...z, till: todayDmy() } : z)));
    this.toast.show('Участник исключен', x.name + ' больше не участвует в аттестации.');
  }
}

