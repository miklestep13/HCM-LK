import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { NavService } from '../../core/navigation/nav.service';
import { ME_PHOTO } from '../../data/people.data';
import { REQ_DEPS, REQ_ME, REQ_STATUSES, REQ_STATUS_TONE, REQ_TYPES } from '../../data/req.data';
import { Req, ReqPerson } from '../../interface/req';
import { DateField } from '../../shared/ui/date-field/date-field';
import { Field } from '../../shared/ui/field/field';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Select } from '../../shared/ui/select/select';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { CommentItem, Comments } from '../../widgets/comments/comments';
import { ReqState, reqEnd } from '../req/req.state';

/** «дд.мм.гггг» → число для сравнения */
const dk = (d: string) => d.split('.').reverse().join('');
const NOW_TEXT = '30.09.2026 12:00';

/** кнопка действия внизу просмотра: ключ, подпись, вид (pri — основная, raised — голубая, dng — красная) */
type Act = [string, string, 'pri' | 'raised' | 'dng'];

/**
 * «Заявки → Новая заявка» и просмотр заявки — одна форма.
 * Поля (как карточка бизнес-объекта, 4 колонки): тип заявки; номер и дата создания — автоматически, заблокированы; код, наименование;
 * даты с и по, дата завершения обработки (поле даты без времени), порядковый номер; подразделение, состояние; описание. Автор — текущий сотрудник.
 * Новая: форма-страница, только «Создать» (без «Отменить»); параметр адреса type — тип (быстрые заявки, «Повторить заявку»).
 * Просмотр (параметр rq — номер): как шапка цели — тип заявки заголовком и статус, описание, «подпись / значение» в 4 колонки; ниже — комментарии, под ними — действия.
 */
@Component({
  selector: 'app-reqnew',
  imports: [PageHead, Field, Select, DateField, Comments],
  template: `
    @let R = req();
    <app-page-head [title]="R ? 'Просмотр заявки' : 'Новая заявка'" backTo="req" backLabel="К заявкам" />
    <div class="c rqnf" [class.rqnview]="!!R">
      @if (R) {
        <!-- просмотр: название (тип) · номер и статус; участники (как в шапке ИПР); даты; дополнительная информация -->
        <div class="rqnvt">
          <!-- номер — рядом с заголовком через точку -->
          <h2>{{ R.n }} · {{ R.id }}</h2>
          <span class="bdg" [class]="tone[R.st]">{{ R.st }}</span>
        </div>
        <!-- автор и ответственный — отдельными блоками в две колонки (без обертки): подпись роли, фото, ФИО, должность -->
        <div class="rqnppl">
          @for (p of people(); track p.role) {
            <div class="rqntile">
              <span class="l">{{ p.role }}</span>
              @if (p.who; as w) {
                <span class="rqnwho">
                  @if (w.av === 'me') {
                    <img class="av" [src]="me" alt="" />
                  } @else {
                    <span class="av" [class]="w.av"></span>
                  }
                  <span><b>{{ w.n }}</b><small>{{ w.pos }}</small></span>
                </span>
              } @else {
                <span class="gr">—</span>
              }
            </div>
          }
        </div>
        <div class="rqnvw">
          <!-- даты — в тех же двух колонках, что автор и ответственный: «Дата по» под ответственным -->
          <div class="rqnrow rqnr2">
            <div class="rqnkv"><span class="l">Дата с</span>{{ R.created.split(' ')[0] }}</div>
            <div class="rqnkv"><span class="l">Дата по</span>{{ end(R) || '—' }}</div>
          </div>
          <!-- дополнительная информация — ниже остальных данных -->
          <div class="rqnkv"><span class="l">Дополнительная информация</span><span [class.gr]="!R.info">{{ info(R) }}</span></div>
        </div>
      } @else {
      <!-- как карточка бизнес-объекта: 4 колонки; номер и дата создания — автоматически (заблокированы), без маски номера -->
      <div class="rqngrid">
          <app-field class="rqn2" label="Тип заявки" required [filled]="!!t()" [error]="err() && !t()">
            <app-select [options]="types" [search]="true" placeholder="Выберите тип заявки" [value]="t()" (valueChange)="t.set($event)" />
          </app-field>
          <app-field class="dis" label="Номер" filled>
            <input class="fin" disabled [value]="no()" />
          </app-field>
          <app-field class="dis" label="Дата и время создания" filled>
            <input class="fin" disabled [value]="now" />
          </app-field>
          <app-field class="rqn2" label="Код" [filled]="!!code()">
            <input class="fin" [value]="code()" (input)="code.set($any($event.target).value)" />
          </app-field>
          <app-field class="rqn2" label="Наименование" [filled]="!!name()">
            <input class="fin" [value]="name()" (input)="name.set($any($event.target).value)" />
          </app-field>
          <app-field label="Дата с" required [filled]="!!from()" [error]="err() && !from()">
            <app-date-field [(value)]="from" />
          </app-field>
          <app-field label="Дата по" [filled]="!!to()" [error]="badRange()">
            <app-date-field [(value)]="to" />
          </app-field>
          <app-field label="Дата завершения обработки" [filled]="!!procEnd()">
            <app-date-field [(value)]="procEnd" />
          </app-field>
          <app-field label="Порядковый номер" [filled]="!!ord()">
            <input class="fin" inputmode="numeric" [value]="ord()" (input)="digits($any($event.target))" />
          </app-field>
          <app-field class="rqn2" label="Подразделение" [filled]="!!dep()">
            <app-select [options]="deps" [search]="true" placeholder="Выберите подразделение" [value]="dep()" (valueChange)="dep.set($event)" />
          </app-field>
          <app-field class="rqn2" label="Состояние" filled>
            <app-select [options]="statuses" [value]="st()" (valueChange)="st.set($event)" />
          </app-field>
          <app-field class="rqnfull" label="Описание" [filled]="!!text()">
            <textarea class="fta" rows="3" [value]="text()" (input)="text.set($any($event.target).value)"></textarea>
          </app-field>
      </div>
      }
      @if (!R && badRange()) {
        <div class="rqnerr">Дата по не может быть раньше даты с.</div>
      }
    </div>
    @if (R) {
      <!-- комментарии — над кнопками действий -->
      <div class="c rqncm">
        <div class="ch"><h3>Комментарии</h3><span class="chip">{{ comments().length }}</span></div>
        <div class="cb">
          <app-comments [items]="comments()" hint="Комментарий увидят автор и участники согласования" empty="" (send)="comment($event)" (like)="like($event)" (remove)="uncomment($event)" (todo)="toast.show('Готово', $event)" />
        </div>
      </div>
      @if (acts().length) {
        <div class="c rqnact">
          @for (a of acts(); track a[0]) {
            <button class="btn" [class]="'btn ' + a[2]" (click)="act(a[0], R)">{{ a[1] }}</button>
          }
        </div>
      }
    } @else {
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
  protected readonly code = signal('');
  protected readonly name = signal('');
  /** дата завершения обработки */
  protected readonly procEnd = signal('');
  protected readonly ord = signal('');
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
  protected readonly comments = computed(() => this.s.comments()[this.rq()] ?? []);

  /** действия внизу просмотра — по вкладке и статусу */
  protected readonly acts = computed((): Act[] => {
    const r = this.req();
    if (!r) return [];
    if (this.s.final(r)) return REQ_TYPES.includes(r.n) ? [['repeat', 'Повторить заявку', 'raised']] : [];
    if (r.tab === 'act' && r.ini.av !== 'me') return [['reject', 'Отклонить', 'dng'], ['back', 'Вернуть на доработку', 'raised'], ['approve', 'Согласовать', 'pri']];
    if (r.st === 'На доработке') return [['recall', 'Отозвать', 'dng'], ['resend', 'Отправить повторно', 'pri']];
    if (r.tab === 'watch') return [['unwatch', 'Перестать наблюдать', 'raised']];
    return [['recall', 'Отозвать', 'dng'], ['remind', 'Напомнить ответственному', 'raised']];
  });

  constructor() {
    effect(() => {
      const ty = this.type();
      untracked(() => ty && this.t.set(ty));
    });
  }

  /** порядковый номер — только цифры */
  protected digits(el: HTMLInputElement): void {
    el.value = el.value.replace(/\D/g, '');
    this.ord.set(el.value);
  }

  protected end(r: Req): string {
    return reqEnd(r).split(' ')[0];
  }
  protected info(r: Req): string {
    return r.info || '—';
  }

  protected create(): void {
    if (!this.t() || !this.from() || this.badRange()) {
      this.err.set(true);
      return this.toast.show('Заполните обязательные поля', this.badRange() ? 'Дата по не может быть раньше даты с.' : 'Укажите тип заявки и дату с.');
    }
    const id = this.no();
    this.s.add({ t: this.t(), st: this.st(), from: this.from(), to: this.to(), info: this.text().trim(), name: this.name().trim() || undefined, dep: this.dep() || undefined });
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
    }
  }
  private done(title: string, text: string): void {
    this.toast.show(title, text);
    this.nav.go('req');
  }

  protected comment(text: string): void {
    if (!text) return this.toast.show('Пустой комментарий', 'Напишите текст комментария.');
    const c: CommentItem = { av: 0, author: 'Вы', date: NOW_TEXT, text, likes: 0, mine: true };
    this.s.comments.update((m) => ({ ...m, [this.rq()]: [...(m[this.rq()] ?? []), c] }));
    this.toast.show('Комментарий добавлен', 'Его увидят автор и участники согласования.');
  }
  protected like(k: number): void {
    this.s.comments.update((m) => ({
      ...m,
      [this.rq()]: (m[this.rq()] ?? []).map((c, i) => (i === k ? { ...c, liked: !c.liked, likes: c.likes + (c.liked ? -1 : 1) } : c)),
    }));
  }
  protected uncomment(k: number): void {
    this.s.comments.update((m) => ({ ...m, [this.rq()]: (m[this.rq()] ?? []).filter((_, i) => i !== k) }));
  }
}
