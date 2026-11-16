import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { NavService } from '../../core/navigation/nav.service';
import { ME_PHOTO } from '../../data/people.data';
import { COMM_POOL } from '../../data/comm.data';
import { REQ_CHANNELS, REQ_DEPS, REQ_ME, REQ_MEMBER_ROLES, REQ_RES_REFUSE, REQ_STATUSES, REQ_STATUS_TONE, REQ_TYPES, reqForm, reqFormDocs, reqFormHead } from '../../data/req.data';
import { EvCol, EvMember } from '../../interface/member';
import { Req, ReqFieldKey, ReqFormField, ReqPerson } from '../../interface/req';
import { DateField } from '../../shared/ui/date-field/date-field';
import { Field } from '../../shared/ui/field/field';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { EventMembers } from '../../widgets/event-members/event-members';
import { ProcSteps } from '../../widgets/proc-steps/proc-steps';
import { RelDocs } from '../../widgets/rel-docs/rel-docs';
import { ReqnewResult } from './reqnew-result/reqnew-result';
import { AttachFile } from '../../interface/attach';
import { attachBusy } from '../../shared/ui/attach/attach';
import { ReqState, reqEnd, reqFrom, reqProc, reqProcess, reqTo } from '../req/req.state';

/** «дд.мм.гггг» → число для сравнения */
const dk = (d: string) => d.split('.').reverse().join('');
const NOW_TEXT = '30.09.2026 12:00';

/** кнопка действия внизу просмотра: ключ, подпись, вид (pri — основная, raised — голубая, dng — красная) */
type Act = [string, string, 'pri' | 'raised' | 'dng'];

/**
 * «Заявки → Добавление заявки» и просмотр заявки — одна форма; под полями новой заявки — «Связанные документы» (widgets/rel-docs).
 * Сверху — карточка «Тип заявки»: от типа зависят поля ниже (reqForm в data/req.data.ts — по типу или категории; пока тип не выбран — ниже ничего нет).
 * Карточка полей (4 колонки): номер и дата создания — автоматически, заблокированы; состояние; поля типа — подписи и обязательность из настройки. Автор — текущий сотрудник.
 * Новая: форма-страница, только «Создать» (без «Отменить»); параметр адреса type — тип (быстрые заявки, «Повторить заявку»).
 * Просмотр (параметр rq — номер) — как форма добавления: тип и номер заголовком, статус; автор и ответственный; ниже отдельным блоком «Параметры заявки» — поля «подпись / значение» в тех же 4 колонках;
 * в шапке — «Ход обработки» (widgets/proc-steps: этапы со скроллом и стрелками, если их много);
 * вторым блоком — «Участники» (widgets/event-members: колонки «Участник» и «Роль»; автор, заявитель и ответственный — из заявки);
 * ниже — «Документы» (просмотр) и «Результат обработки» (reqnew-result): ответственный заполняет вид результата, комментарий (при отказе — причину) и документы;
 * когда решение есть — итог как в бланке аттестации. Комментариев к заявке нет. Внизу — действия.
 */
@Component({
  selector: 'app-reqnew',
  imports: [PageHead, Field, Select, DateField, RelDocs, EventMembers, ProcSteps, ReqnewResult],
  template: `
    @let R = req();
    <app-page-head [title]="R ? 'Просмотр заявки' : 'Добавление заявки'" backTo="req" backLabel="К заявкам" />
    <div class="c rqnf" [class.rqnview]="!!R">
      @if (R) {
        <!-- просмотр: название (тип) · номер и статус; участники (как в шапке ИПР); даты; дополнительная информация -->
        <div class="rqnvt">
          <!-- номер — рядом с заголовком через точку -->
          <h2>{{ R.n }} · {{ R.id }}</h2>
          <span class="bdg" [class]="tone[R.st]">{{ R.st }}</span>
        </div>
      } @else {
      <!-- сверху — тип заявки: от него зависят поля ниже -->
      <div class="rqngrid">
          <app-field class="rqnfull" label="Тип заявки" required [filled]="!!t()" [error]="err() && !t()">
            <app-select [options]="types" [search]="true" placeholder="Выберите тип заявки" [value]="t()" (valueChange)="t.set($event)" />
          </app-field>
      </div>
      }
    </div>
    @if (!R) {
      @if (t()) {
        <!-- поля выбранного типа: номер и дата создания — автоматически (заблокированы), состояние; остальные — по типу (reqForm) -->
        <div class="c rqnf rqnflds">
          <div class="rqngrid">
            @if (head()) {
              <app-field class="dis" label="Номер" filled>
                <input class="fin" disabled [value]="no()" />
              </app-field>
              <app-field class="dis" label="Дата и время создания" filled>
                <input class="fin" disabled [value]="now" />
              </app-field>
              <app-field class="rqn2" label="Состояние" filled>
                <app-select [options]="statuses" [value]="st()" (valueChange)="st.set($event)" />
              </app-field>
            }
            @for (f of form(); track f.k) {
              @let bad = err() && !!f.req && !val(f.k).trim();
              @switch (f.k) {
                @case ('from') {
                  <app-field [class]="wcls(f)" [label]="f.l" [required]="!!f.req" [filled]="!!from()" [error]="bad">
                    <app-date-field [(value)]="from" />
                  </app-field>
                }
                @case ('to') {
                  <app-field [class]="wcls(f)" [label]="f.l" [required]="!!f.req" [filled]="!!to()" [error]="bad || badRange()">
                    <app-date-field [(value)]="to" />
                  </app-field>
                }
                @case ('procEnd') {
                  <app-field [class]="wcls(f)" [label]="f.l" [required]="!!f.req" [filled]="!!procEnd()" [error]="bad">
                    <app-date-field [(value)]="procEnd" />
                  </app-field>
                }
                @case ('chan') {
                  <app-field [class]="wcls(f)" [label]="f.l" [required]="!!f.req" [filled]="!!chan()" [error]="bad">
                    <app-select [options]="channels" placeholder="Выберите канал" [value]="chan()" (valueChange)="chan.set($event)" />
                  </app-field>
                }
                @case ('dep') {
                  <app-field [class]="wcls(f)" [label]="f.l" [required]="!!f.req" [filled]="!!dep()" [error]="bad">
                    <app-select [options]="deps" [search]="true" placeholder="Выберите подразделение" [value]="dep()" (valueChange)="dep.set($event)" />
                  </app-field>
                }
                @case ('code') {
                  <app-field [class]="wcls(f)" [label]="f.l" [required]="!!f.req" [filled]="!!code()" [error]="bad">
                    <input class="fin" [value]="code()" (input)="code.set($any($event.target).value)" />
                  </app-field>
                }
                @case ('name') {
                  <app-field [class]="wcls(f)" [label]="f.l" [required]="!!f.req" [filled]="!!name()" [error]="bad">
                    <input class="fin" [value]="name()" (input)="name.set($any($event.target).value)" />
                  </app-field>
                }
                @case ('text') {
                  <app-field [class]="wcls(f)" [label]="f.l" [required]="!!f.req" [filled]="!!text()" [error]="bad">
                    <textarea class="fta" rows="3" [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
                  </app-field>
                }
              }
            }
          </div>
          @if (badRange()) {
            <div class="rqnerr">Дата по не может быть раньше даты с.</div>
          }
        </div>
        <!-- участники заявки — виджет «Участники события»: только «Участник» и «Роль» -->
        <div class="c rqnmem" event-members title="Участники" [(rows)]="members" [pool]="pool" [roles]="memberRoles" newRole="Согласующий" [cols]="memberCols" edit="all" addAt="bottom" paging="pages"></div>
      }
    }
    @if (R) {
      <!-- маршрут обработки: этапы заявки (их может быть много — лента листается стрелками) -->
      <div class="c rqnproc">
        <div class="ch"><h3>Маршрут обработки</h3></div>
        <div class="cb">
          <div app-proc-steps [steps]="steps()"></div>
        </div>
      </div>
      <!-- параметры заявки — отдельным блоком: даты, порядковый номер, подразделение, описание (4 колонки, как в форме добавления; пустые не показываем) -->
      <div class="c rqnpar">
        <div class="ch"><h3>Параметры заявки</h3></div>
        <div class="cb">
          <div class="rqngrid rqnvgrid">
            @for (f of fields(); track f.l) {
              <div [class]="'rqnkv ' + (f.w || '')"><span class="l">{{ f.l }}</span>{{ f.v }}</div>
            }
          </div>
        </div>
      </div>
      <!-- участники: автор, заявитель, ответственный и добавленные (только просмотр) -->
      <div class="c rqnmem" event-members title="Участники" [rows]="viewMembers()" [roles]="memberRoles" [cols]="memberCols" edit="none" paging="pages"></div>
      <!-- документы — как в форме добавления, только просмотр; нет документов — блока нет -->
      @if (R.docs?.length) {
        <div class="c rqndocs" app-rel-docs title="Документы" [files]="R.docs!"></div>
      }
      <!-- результат обработки: решение — итог (как в бланке аттестации); без решения — форма, если ответственный я -->
      @if (R.res) {
        <div class="c rqnres" reqnew-result [res]="R.res"></div>
      } @else if (processing()) {
        <div class="c rqnres" reqnew-result edit [(kind)]="resKind" [(text)]="resText" [(docs)]="resDocs" [err]="resErr()"></div>
      }
      @if (acts().length) {
        <div class="c rqnact">
          @for (a of acts(); track a[0]) {
            <button class="btn" [class]="'btn ' + a[2]" (click)="act(a[0], R)">{{ a[1] }}</button>
          }
        </div>
      }
    } @else {
      <!-- документы к заявке — общий виджет «Связанные документы» -->
      @if (t() && withDocs()) {
        <div class="c rqndocs" app-rel-docs title="Документы" edit [(files)]="docs"></div>
      }
      <div class="c rqnact"><button class="btn pri" (click)="create()">Создать</button></div>
    }
  `,
  styleUrl: './reqnew.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-reqnew' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reqnew {
  /** тип из адреса (быстрая заявка, «Повторить заявку») */
  readonly type = input('');
  /** номер просматриваемой заявки */
  readonly rq = input('');
  protected readonly s = inject(ReqState);
  private readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
  protected readonly tone = REQ_STATUS_TONE;
  protected readonly me = ME_PHOTO;
  protected readonly types = REQ_TYPES;
  /** у новой заявки — начальные статусы */
  protected readonly statuses = REQ_STATUSES.filter((x) => ['Черновик', 'Зарегистрирована'].includes(x));
  protected readonly t = signal('');
  protected readonly st = signal('Зарегистрирована');
  protected readonly from = signal('');
  protected readonly to = signal('');
  protected readonly text = signal('');
  /** связанные документы новой заявки */
  protected readonly docs = signal<AttachFile[]>([]);
  protected readonly code = signal('');
  protected readonly name = signal('');
  /** дата завершения обработки */
  protected readonly procEnd = signal('');
  protected readonly chan = signal('');
  protected readonly channels = REQ_CHANNELS;
  // ——— участники (виджет «Участники события»: «Участник» и «Роль») ———
  protected readonly pool = COMM_POOL;
  protected readonly memberRoles = REQ_MEMBER_ROLES;
  protected readonly memberCols: EvCol[] = ['member', 'role'];
  /** новая заявка: автор — я */
  protected readonly members = signal<EvMember[]>([{ id: 'mme', n: REQ_ME.n, pos: REQ_ME.pos, av: REQ_ME.av, type: 'Сотрудник', roles: ['Автор'], from: '' }]);
  // ——— результат обработки (ответственный) ———
  protected readonly resKind = signal('');
  protected readonly resText = signal('');
  protected readonly resDocs = signal<AttachFile[]>([]);
  protected readonly resErr = signal(false);
  protected readonly dep = signal('');
  protected readonly deps = REQ_DEPS;
  /** дата и время создания — текущие (заблокировано) */
  protected readonly now = NOW_TEXT;
  protected readonly err = signal(false);
  /** просматриваемая заявка (с правками из действий) */
  protected readonly req = computed(() => (this.rq() ? this.s.all().find((r) => r.id === this.rq()) ?? null : null));
  /** автор: у новой — текущий сотрудник */
  protected readonly who = computed((): ReqPerson => this.req()?.ini ?? REQ_ME);
  /** номер новой заявки — следующий после последнего */
  protected readonly no = computed(() => this.s.nextId());
  /** поля выбранного типа заявки */
  protected readonly form = computed(() => reqForm(this.t()));
  /** строка «Номер / Дата создания / Состояние» — не у всех типов (у 2-НДФЛ скрыта, номер и дата — автоматически) */
  protected readonly head = computed(() => reqFormHead(this.t()));
  /** блок «Документы» — не у всех типов (у 2-НДФЛ скрыт) */
  protected readonly withDocs = computed(() => reqFormDocs(this.t()));
  /** значение поля формы — для проверки обязательных */
  protected val(k: ReqFieldKey): string {
    return { code: this.code, name: this.name, from: this.from, to: this.to, procEnd: this.procEnd, chan: this.chan, dep: this.dep, text: this.text }[k]();
  }
  /** ширина поля в сетке из 4 колонок */
  protected wcls(f: ReqFormField): string {
    return f.w === 4 ? 'rqnfull' : f.w === 2 ? 'rqn2' : '';
  }
  protected readonly badRange = computed(() => !!this.from() && !!this.to() && dk(this.to()) < dk(this.from()));
  /** блоки участников: автор и ответственный — всегда два (у завершенной ответственного нет — прочерк) */
  protected readonly people = computed((): { who: ReqPerson | null; role: string }[] => {
    const r = this.req();
    if (!r) return [];
    return [
      { who: r.ini, role: 'Автор' },
      { who: r.resp && !this.s.final(r) ? r.resp : null, role: 'Ответственный' },
    ];
  });
  /** ход обработки — этапы заявки */
  protected readonly steps = computed(() => (this.req() ? reqProcess(this.req()!) : []));
  /** просмотр: участники — автор, заявитель, ответственный (из заявки) и добавленные */
  protected readonly viewMembers = computed((): EvMember[] => {
    const r = this.req();
    if (!r) return [];
    const m = (id: string, p: ReqPerson, role: string): EvMember => ({ id, n: p.n, pos: p.pos, av: p.av, type: 'Сотрудник', roles: [role], from: '' });
    return [
      m('ini', r.ini, 'Автор'),
      ...(r.app ? [m('app', r.app, 'Заявитель')] : []),
      ...(r.resp && !this.s.final(r) ? [m('resp', r.resp, 'Ответственный')] : []),
      ...(r.members ?? []),
    ];
  });
  /** я — ответственный за обработку открытой заявки (не автор): вместо комментариев — форма «Результат обработки» */
  protected readonly processing = computed(() => {
    const r = this.req();
    return !!r && !this.s.final(r) && r.resp?.av === 'me' && r.ini.av !== 'me' && !r.res;
  });
  /** просмотр: поля в порядке формы добавления (без кода и наименования), пустые не показываем; w — ширина (rqn2 — две колонки, rqnfull — вся строка) */
  protected readonly fields = computed((): { l: string; v: string; w?: string }[] => {
    const r = this.req();
    if (!r) return [];
    return [
      { l: 'Дата и время создания', v: r.created },
      { l: 'Дата с', v: reqFrom(r) },
      { l: 'Дата по', v: reqTo(r) },
      { l: 'Дата завершения обработки', v: reqProc(r) },
      { l: 'Тип канала поступления', v: r.chan || '' },
      { l: 'Подразделение', v: r.dep || '', w: 'rqn2' },
      { l: 'Описание', v: r.info || '', w: 'rqnfull' },
    ].filter((f) => !!f.v);
  });

  /** действия внизу просмотра — по вкладке и статусу */
  protected readonly acts = computed((): Act[] => {
    const r = this.req();
    if (!r) return [];
    if (this.s.final(r)) return REQ_TYPES.includes(r.n) ? [['repeat', 'Повторить заявку', 'raised']] : [];
    // ответственный: результат — в блоке «Результат обработки» (отказ — вид результата «Отказ»)
    if (this.processing()) return [['back', 'Вернуть на доработку', 'raised'], ['finish', 'Завершить обработку', 'pri']];
    if (r.st === 'На доработке') return [['recall', 'Отозвать', 'dng'], ['resend', 'Отправить повторно', 'pri']];
    if (r.tab === 'watch') return [['unwatch', 'Перестать наблюдать', 'raised']];
    return [['recall', 'Отозвать', 'dng'], ['remind', 'Напомнить ответственному', 'raised']];
  });

  private readonly title = inject(Title);
  constructor() {
    // вкладка браузера: просмотр или добавление
    effect(() => this.title.setTitle((this.rq() ? 'Просмотр заявки' : 'Добавление заявки') + ' · Q.HCM'));
    effect(() => {
      const ty = this.type();
      untracked(() => ty && this.t.set(ty));
    });
  }


  protected end(r: Req): string {
    return reqEnd(r).split(' ')[0];
  }

  protected create(): void {
    if (attachBusy(this.docs())) return this.toast.show('Документы загружаются', 'Дождитесь окончания загрузки файлов.');
    const miss = this.form().filter((f) => f.req && !this.val(f.k).trim());
    if (!this.t() || miss.length || this.badRange()) {
      this.err.set(true);
      return this.toast.show(
        'Заполните обязательные поля',
        !this.t() ? 'Выберите тип заявки.' : this.badRange() ? 'Дата по не может быть раньше даты с.' : 'Укажите: ' + miss.map((f) => f.l.toLowerCase()).join(', ') + '.',
      );
    }
    // поля, которых нет у выбранного типа, не сохраняем
    const on = new Set(this.form().map((f) => f.k));
    const v = (k: ReqFieldKey) => (on.has(k) ? this.val(k).trim() : '');
    const id = this.no();
    this.s.add({ t: this.t(), st: this.st(), from: v('from') || v('procEnd') || this.now.split(' ')[0], to: v('to'), info: v('text'), name: v('name') || undefined, dep: v('dep') || undefined, code: v('code') || undefined, chan: v('chan') || undefined, members: this.members().filter((m) => m.n), procEnd: v('procEnd') || undefined, docs: this.withDocs() && this.docs().length ? this.docs() : undefined });
    this.toast.show('Заявка создана', id + ' · ' + this.t());
    this.nav.go('req');
  }

  protected act(a: string, r: Req): void {
    const one = 'Заявка ' + r.id;
    switch (a) {
      case 'approve':
        this.s.patch([r.id], { st: 'В работе', tab: 'watch' });
        return this.done('Заявка согласована', one + ' передана на следующий этап.');
      case 'back':
        this.s.patch([r.id], { st: 'На доработке' });
        return this.done('Возвращено на доработку', one + ' — автор получит уведомление.');
      case 'reject':
        this.s.patch([r.id], { st: 'Отклонена', closed: NOW_TEXT });
        return this.done('Заявка отклонена', one + ' — автор получит уведомление.');
      case 'resend':
        this.s.patch([r.id], { st: 'Зарегистрирована' });
        return this.done('Заявка отправлена повторно', one + ' вернулась на согласование.');
      case 'recall':
        this.s.patch([r.id], { st: 'Отозвана', closed: NOW_TEXT, due: undefined });
        return this.done('Заявка отозвана', one + ' — статус «Отозвана».');
      case 'remind':
        return this.toast.show('Напоминание отправлено', one + ' — ответственный получит уведомление.');
      case 'unwatch':
        this.s.patch([r.id], { tab: 'x' as Req['tab'] });
        return this.done('Вы больше не наблюдаете', one + ' убрана из списка.');
      case 'repeat':
        return this.nav.go('reqnew', { type: r.n });
      case 'finish':
        return this.finish(r);
    }
  }
  private done(title: string, text: string): void {
    this.toast.show(title, text);
    this.nav.go('req');
  }

  /** «Завершить обработку»: вид результата обязателен, при отказе — и причина; заявка выполнена или отклонена, блок показывает решение */
  private finish(r: Req): void {
    const refuse = this.resKind() === REQ_RES_REFUSE;
    if (!this.resKind() || (refuse && !this.resText().trim())) {
      this.resErr.set(true);
      return this.toast.show('Заполните результат обработки', !this.resKind() ? 'Выберите вид результата обработки.' : 'Укажите причину отказа.');
    }
    if (attachBusy(this.resDocs())) return this.toast.show('Документы загружаются', 'Дождитесь окончания загрузки файлов.');
    this.s.patch([r.id], {
      st: refuse ? 'Отклонена' : 'Выполнена',
      closed: NOW_TEXT,
      due: undefined,
      res: { kind: this.resKind(), text: this.resText().trim(), docs: this.resDocs().length ? this.resDocs() : undefined, date: NOW_TEXT.split(' ')[0], by: 'Иванов П. С.' },
    });
    this.toast.show('Обработка завершена', 'Заявка ' + r.id + ' — ' + (refuse ? 'отказ' : this.resKind().toLowerCase()) + '. Автор получит уведомление.');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
}
