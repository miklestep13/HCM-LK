import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewEncapsulation, afterRenderEffect, computed, effect, inject, input, signal, untracked, viewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { DevPanelService } from '../../core/layout/dev-panel/dev-panel.service';
import { NavService } from '../../core/navigation/nav.service';
import { ME_PHOTO } from '../../data/people.data';
import { COMM_POOL } from '../../data/comm.data';
import { REQ_CHANNELS, REQ_DEPS, REQ_ME, REQ_MEMBER_ROLES, REQ_RES_REFUSE, REQ_STATUSES, REQ_STATUS_TONE, REQ_TYPES, reqForm, reqFormDocs, reqFormHead } from '../../data/req.data';
import { EvCol, EvMember } from '../../interface/member';
import { Req, ReqFieldKey, ReqFormField, ReqPerson } from '../../interface/req';
import { DateField } from '../../shared/ui/date-field/date-field';
import { Field } from '../../shared/ui/field/field';
import { Float } from '../../shared/ui/float/float';
import { Icon } from '../../shared/ui/icon/icon';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { EventMembers } from '../../widgets/event-members/event-members';
import { RelDocs } from '../../widgets/rel-docs/rel-docs';
import { ReqnewResult } from './reqnew-result/reqnew-result';
import { AttachFile } from '../../interface/attach';
import { attachBusy } from '../../shared/ui/attach/attach';
import { ReqState, reqEnd, reqFrom, reqProc, reqTo } from '../req/req.state';

/** «дд.мм.гггг» → число для сравнения */
const dk = (d: string) => d.split('.').reverse().join('');
const NOW_TEXT = '30.09.2026 12:00';

/** кнопка действия внизу просмотра: ключ, подпись, вид (pri — основная, raised — голубая, dng — красная) */
type Act = [string, string, 'pri' | 'raised' | 'dng'];

/**
 * «Заявки → Добавление заявки» и просмотр заявки — одна форма; под полями новой заявки — «Связанные документы» (widgets/rel-docs).
 * Тип выбирается на странице каталога (reqpick) и приходит в адресе: заголовок страницы — название типа, поля зависят от него (reqForm).
 * Карточка полей (4 колонки): номер и дата создания — автоматически, заблокированы; состояние; поля типа — подписи и обязательность из настройки. Автор — текущий сотрудник.
 * Новая: форма-страница, только «Создать» (без «Отменить»); параметр адреса type — тип (каталог, «Повторить заявку»).
 * Просмотр (параметр rq — номер) — как форма добавления: тип и номер заголовком, статус; автор и ответственный; ниже отдельным блоком «Параметры заявки» — поля «подпись / значение» в тех же 4 колонках;
 * в шапке — сразу под названием и статусом текст описания без серой подписи «Описание» (обрезка после 4 строк с градиентом и «Показать больше» / «Свернуть», max-width 700);
 * ниже — параметры заявки (даты, канал, подразделение) без отдельного заголовка: по умолчанию сетка из 4 колонок;
 * демо «Шапка заявки → Компактная» — как шапка объекта: под названием серые строки метаданных по 3 значения через « · », затем описание (без смены участников / документов / результата / футера);
 * ниже — «Участники» (widgets/event-members: колонки «Участник» и «Роль»; автор, заявитель и ответственный — из заявки);
 * ниже — «Документы» (widgets/rel-docs: секции «Входящие» / «Исходящие»); у завершенной — «Результат обработки» (плашка и комментарий; файлы — в исходящих).
 * Клик по строке списка — только просмотр (без действий внизу и без формы результата, даже если я ответственный).
 * Кнопка «Обработать» (?proc=1) — заголовок «Обработка заявки», форма результата, загрузка исходящих и split-кнопка «Согласовать».
 * В просмотре и обработке «Участники» и «Документы» свернуты по умолчанию (шеврон слева).
 * Комментариев к заявке нет.
 */
@Component({
  selector: 'app-reqnew',
  imports: [PageHead, Field, Select, DateField, RelDocs, EventMembers, ReqnewResult, Icon, Float],
  template: `
    @let R = req();
    <app-page-head [title]="pageTitle()" [backTo]="R ? 'req' : 'reqpick'" [backLabel]="R ? 'К заявкам' : 'К выбору типа'" />
    @if (R) {
      <div class="c rqnf rqnview">
        <!-- просмотр: название (тип) · номер и статус; участники (как в шапке ИПР); даты; дополнительная информация -->
        <div class="rqnvt">
          <!-- номер — рядом с заголовком через точку -->
          <h2>{{ R.n }} · {{ R.id }}</h2>
          <span class="bdg" [class]="tone[R.st]">{{ R.st }}</span>
        </div>
        @if (compactHead()) {
          <!-- демо «Компактная»: серые строки метаданных как ohsub — по 3 значения через « · » -->
          @if (metaLines().length) {
            <div class="rqnmeta">
              @for (line of metaLines(); track $index) {
                <div>{{ line }}</div>
              }
            </div>
          }
        }
        <!-- описание — под названием (и мета в компактном виде), без серой подписи -->
        @if (R.info) {
          <div class="rqnkv rqndesc">
            <div class="rqndtxt" #dsc [class.clamp]="descMore()" [class.open]="descOpen()">
              @for (p of descParts(); track $index) {
                <p>{{ p }}</p>
              }
            </div>
            @if (descMore()) {
              <button type="button" class="lnk rqndmore" [attr.aria-expanded]="descOpen()" (click)="toggleDesc()">{{ descOpen() ? 'Свернуть' : 'Показать больше' }}</button>
            }
          </div>
        }
        <!-- обычный вид: параметры сеткой 4 колонки; в компактном демо сетка скрыта -->
        @if (!compactHead()) {
          <div class="rqngrid rqnvgrid">
            @for (f of fields(); track f.l) {
              <div [class]="'rqnkv ' + (f.w || '')"><span class="l">{{ f.l }}</span>{{ f.v }}</div>
            }
          </div>
        }
      </div>
    }
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
        <div class="c rqnmem" event-members title="Участники" [(rows)]="members" [pool]="pool" [roles]="memberRoles" newRole="Согласующий" [cols]="memberCols" edit="all" addAt="bottom" paging="off"></div>
      }
    }
    @if (R) {
      <!-- участники: скрываем, если в списке только автор; в просмотре и обработке — свернуты -->
      @if (showMembers()) {
        <div class="c rqnmem" event-members title="Участники" [rows]="viewMembers()" [roles]="memberRoles" [cols]="memberCols" edit="none" paging="off" fold collapsed></div>
      }
      <!-- документы: входящие / исходящие; при обработке — пустые исходящие + зона загрузки; иначе блок только если есть файлы -->
      @if (processing()) {
        <div class="c rqndocs" app-rel-docs title="Документы" [incoming]="R.docs || []" [(outgoing)]="resDocs" editOut fold collapsed></div>
      } @else if (R.docs?.length || R.res?.docs?.length) {
        <div class="c rqndocs" app-rel-docs title="Документы" [incoming]="R.docs || []" [outgoing]="R.res?.docs || []" fold collapsed></div>
      }
      <!-- результат обработки: плашка и комментарий (без загрузки файлов и без выбора вида) -->
      @if (R.res) {
        <div class="c rqnres" reqnew-result [res]="R.res"></div>
      } @else if (processing()) {
        <div class="c rqnres" reqnew-result edit [(kind)]="resKind" [(text)]="resText" [(reason)]="resReason" [err]="resErr()"></div>
      }
      @if (processing()) {
        <div class="c rqnact">
          <button class="btn raised" type="button" (click)="cancelProcess()">Отмена</button>
          <span class="sbtn">
            <button class="btn pri" (click)="decide('approve', R)">Согласовать</button>
            <button class="btn pri sbar" aria-label="Другие действия" (click)="toggleMenu($event)"><app-icon name="chevSm" /></button>
          </span>
        </div>
      } @else if (acts().length) {
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
    @if (menu(); as m) {
      <div class="fpop selpop" [appFloat]="m" (click)="$event.stopPropagation()">
        <div class="folist">
          <div class="foi" (click)="decide('reject', req()!)">Отказать</div>
          <div class="foi" (click)="decide('clarify', req()!)">Уточнить у автора</div>
        </div>
      </div>
    }
  `,
  styleUrl: './reqnew.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-reqnew', '(document:click)': 'menu.set(null)' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Reqnew implements OnDestroy {
  /** тип из адреса (быстрая заявка, «Повторить заявку») */
  readonly type = input('');
  /** номер просматриваемой заявки */
  readonly rq = input('');
  /** «1» — режим обработки ответственным (кнопка «Обработать»); клик по строке — без этого, только просмотр */
  readonly proc = input('');
  protected readonly s = inject(ReqState);
  private readonly nav = inject(NavService);
  protected readonly toast = inject(ToastService);
  /** демо: обычная сетка параметров (4 колонки) или компактная шапка (3 в ряд под названием) */
  protected readonly headLayout = signal<'default' | 'compact'>('default');
  protected readonly compactHead = computed(() => this.headLayout() === 'compact');
  private readonly offDev = inject(DevPanelService).register({
    id: 'reqHead',
    label: 'Шапка заявки',
    options: [
      { value: 'default', label: 'Обычная' },
      { value: 'compact', label: 'Компактная' },
    ],
    value: this.headLayout,
  });
  protected readonly tone = REQ_STATUS_TONE;
  protected readonly me = ME_PHOTO;
  /** у новой заявки — начальные статусы */
  protected readonly statuses = REQ_STATUSES.filter((x) => ['Черновик', 'Зарегистрирована'].includes(x));
  /** тип из адреса: каталог или «Повторить заявку» */
  protected readonly t = computed(() => this.type());
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
  protected readonly resReason = signal('');
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
  /** блок «Участники» — только если есть кто-то кроме единственного автора */
  protected readonly showMembers = computed(() => {
    const m = this.viewMembers();
    if (!m.length) return false;
    if (m.length === 1 && m[0].roles.length === 1 && m[0].roles[0] === 'Автор') return false;
    return true;
  });
  /** режим обработки: только по «Обработать» (proc=1); клик по строке — просмотр без формы результата и без действий */
  protected readonly processing = computed(() => {
    const r = this.req();
    return this.proc() === '1' && !!r && !this.s.final(r) && r.resp?.av === 'me' && r.ini.av !== 'me' && !r.res;
  });
  /** заголовок страницы: обработка / просмотр / добавление */
  protected readonly pageTitle = computed(() => {
    if (!this.req()) return this.type() || 'Добавление заявки';
    return this.processing() ? 'Обработка заявки' : 'Просмотр заявки';
  });
  /** просмотр: параметры под описанием (без кода, наименования и описания), пустые не показываем; w — ширина (rqn2 — две колонки) */
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
    ].filter((f) => !!f.v);
  });
  /** компактная шапка: значения параметров по 3 в строке через « · » (как подзаголовок object-head) */
  protected readonly metaLines = computed(() => {
    const vals = this.fields().map((f) => f.v);
    const lines: string[] = [];
    for (let i = 0; i < vals.length; i += 3) lines.push(vals.slice(i, i + 3).join(' · '));
    return lines;
  });
  /** абзацы описания (пустые строки — разделитель) */
  protected readonly descParts = computed(() =>
    (this.req()?.info || '')
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean),
  );
  /** длинное описание — обрезка после 4 строк + «Показать больше» */
  private readonly dsc = viewChild<ElementRef<HTMLElement>>('dsc');
  protected readonly descMore = signal(false);
  protected readonly descOpen = signal(false);

  /** действия внизу — у завершенной «Повторить»; обработка — split-кнопка «Согласовать» (не через acts) */
  protected readonly acts = computed((): Act[] => {
    const r = this.req();
    if (!r || this.processing()) return [];
    if (this.s.final(r)) return REQ_TYPES.includes(r.n) ? [['repeat', 'Повторить заявку', 'raised']] : [];
    return [];
  });
  /** меню split-кнопки «Согласовать» */
  protected readonly menu = signal<HTMLElement | null>(null);

  private readonly title = inject(Title);
  ngOnDestroy(): void {
    this.offDev();
  }
  constructor() {
    // вкладка браузера: просмотр или добавление
    effect(() => this.title.setTitle(this.pageTitle() + ' · Q.HCM'));
    effect(() => {
      if (!this.rq() && !this.type()) this.nav.go('reqpick');
    });
    // обработка: исходящие всегда пустые при входе; сбрасываем поля результата при смене заявки
    effect(() => {
      this.rq();
      this.resKind.set('');
      this.resText.set('');
      this.resReason.set('');
      this.resErr.set(false);
      this.resDocs.set([]);
    });
    // при смене заявки / режима — свернуть описание и заново измерить высоту
    afterRenderEffect(() => {
      this.rq();
      this.proc();
      this.descParts();
      this.dsc();
      untracked(() => {
        this.descOpen.set(false);
        this.descMore.set(false);
      });
      requestAnimationFrame(() => this.measureDesc());
    });
  }

  /** нужно ли «Показать больше»: текст выше 4 строк */
  private measureDesc(): void {
    const el = this.dsc()?.nativeElement;
    if (!el) {
      this.descMore.set(false);
      return;
    }
    el.style.maxHeight = '';
    const lh = parseFloat(getComputedStyle(el.querySelector('p') || el).lineHeight) || 22;
    if (el.scrollHeight > lh * 4 + 4) {
      this.descMore.set(true);
      if (!this.descOpen()) el.style.maxHeight = lh * 4 + 'px';
    } else {
      this.descMore.set(false);
    }
  }

  protected toggleDesc(): void {
    const el = this.dsc()?.nativeElement;
    if (!el) return;
    const open = !this.descOpen();
    this.descOpen.set(open);
    const lh = parseFloat(getComputedStyle(el.querySelector('p') || el).lineHeight) || 22;
    el.style.maxHeight = open ? '' : lh * 4 + 'px';
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
        return this.finish(r, 'Выполнено');
    }
  }
  private done(title: string, text: string): void {
    this.toast.show(title, text);
    this.nav.go('req');
  }

  protected toggleMenu(e: MouseEvent): void {
    e.stopPropagation();
    const el = e.currentTarget as HTMLElement;
    this.menu.set(this.menu() ? null : el);
  }

  /** «Отмена» в обработке — назад к списку без сохранения результата */
  protected cancelProcess(): void {
    this.menu.set(null);
    this.nav.go('req');
  }

  /** split-кнопка: «Согласовать» / «Отказать» / «Уточнить у автора» */
  protected decide(a: 'approve' | 'reject' | 'clarify', r: Req): void {
    this.menu.set(null);
    if (a === 'clarify') return this.act('back', r);
    if (a === 'approve') {
      this.resKind.set('Выполнено');
      return this.finish(r, 'Выполнено');
    }
    this.resKind.set(REQ_RES_REFUSE);
    return this.finish(r, REQ_RES_REFUSE);
  }

  /** завершение обработки: вид задает split-кнопка; при отказе нужна причина */
  private finish(r: Req, kind: string): void {
    const refuse = kind === REQ_RES_REFUSE;
    if (refuse && !this.resReason().trim()) {
      this.resErr.set(true);
      return this.toast.show('Укажите причину отказа', 'Заполните поле «Причина отказа» в результате обработки.');
    }
    if (attachBusy(this.resDocs())) return this.toast.show('Документы загружаются', 'Дождитесь окончания загрузки файлов.');
    this.s.patch([r.id], {
      st: refuse ? 'Отклонена' : 'Выполнена',
      closed: NOW_TEXT,
      due: undefined,
      res: {
        kind,
        text: (refuse ? this.resReason() : this.resText()).trim(),
        docs: this.resDocs().length ? this.resDocs().map((f) => ({ ...f, by: f.by || 'Иванов П. С.' })) : undefined,
        date: NOW_TEXT.split(' ')[0],
        by: 'Иванов П. С.',
      },
    });
    this.toast.show('Обработка завершена', 'Заявка ' + r.id + ' — ' + (refuse ? 'отказ' : kind.toLowerCase()) + '. Автор получит уведомление.');
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }
}
