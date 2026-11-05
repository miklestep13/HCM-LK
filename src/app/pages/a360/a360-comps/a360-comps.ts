import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { A360_COMMENTS, A360_COMPS, A360_ROLES, A360_ROLES_SHORT } from '../../../data/a360.data';
import { ME, ME_PHOTO, avCls } from '../../../data/people.data';
import { A360Comment } from '../../../interface/a360';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { FilterBar } from '../../../shared/ui/filter-bar/filter-bar';
import { Select } from '../../../shared/ui/select/select';
import { Tooltip } from '../../../shared/ui/tooltip/tooltip';
import { Icon } from '../../../shared/ui/icon/icon';

/** цвет оценки: до 35 — красный, до 60 — оранжевый, до 75 — светло-зеленый, выше — зеленый */
const tone = (v: number) => (v < 35 ? 'lo' : v < 60 ? 'md' : v < 75 ? 'ok' : 'hi');
const TAG_TONE: Record<string, string> = { 'Сильная сторона': 'ok', 'Зона роста': 'dg', 'Слепая зона': 'warn', 'Скрытый потенциал': 'warn' };
/** фильтр «Средняя оценка» */
const LEVELS: Record<string, (v: number) => boolean> = { 'Ниже 60': (v) => v < 60, 'От 60 до 74': (v) => v >= 60 && v < 75, '75 и выше': (v) => v >= 75 };
const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'комментарий' : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? 'комментария' : 'комментариев');

/**
 * «Оценка по каждой компетенции»: шапка с фильтрами (поиск по компетенции или индикатору, иконка «Свернуть все / Развернуть все»; доп. фильтры — вывод
 * и средняя оценка), шкала «Зона роста → Сильные стороны»,
 * аккордеоны компетенций (оценки по источникам и средняя), внутри — индикаторы. Оценка с комментариями — голубой кружок
 * со счетчиком в правом верхнем углу плашки; по клику — сайдбар «Комментарии» (категория, фото, ФИО, роль, дата, текст).
 */
@Component({
  selector: '[a360-comps]',
  imports: [Icon, Drawer, FilterBar, Select, Tooltip],
  template: `
    <div class="ch"><h3>Оценка по каждой компетенции</h3></div>
    <app-filter-bar placeholder="Поиск по компетенции или индикатору" [(query)]="q">
      <!-- иконка: все раскрыто — «Свернуть все», иначе — «Развернуть все» -->
      <button ftAction class="ib3 sq" [appTip]="anyOpen() ? 'Свернуть все' : 'Развернуть все'" [attr.aria-label]="anyOpen() ? 'Свернуть все' : 'Развернуть все'" (click)="foldAll()">
        <app-icon [name]="anyOpen() ? 'collapseAll' : 'expandAll'" />
      </button>
      <app-select label="Вывод" allLabel="Все выводы" [options]="tags" [(value)]="tag" />
      <app-select label="Средняя оценка" allLabel="Любая" [options]="levels" [(value)]="level" />
    </app-filter-bar>
    <div class="cb">
      <div class="scaleleg"><span>Зона роста</span><i></i><span>Сильные стороны</span></div>
      <div class="ctbl">
        <div class="schead">
          <span class="txt"></span>
          <span class="scs">
            @for (t of heads; track t) {
              <span>{{ t }}</span>
            }
          </span>
        </div>
        @for (c of list(); track c.k) {
          <div class="cgr" [class.open]="!closed().has(c.k)">
            <div class="cgh" (click)="toggle(c.k)">
              <app-icon class="cav" name="chevDown" />
              <span class="cgn">{{ c.name }}</span>
              @if (c.tag) {
                <span class="bdg" [class]="tagTone[c.tag]">{{ c.tag }}</span>
              }
              <span class="scs">
                @for (v of c.v; track $index; let r = $index) {
                  @let cm = comments(c.k, r);
                  @if (cm.length) {
                    <button class="sc hascm" [class]="tone(v)" title="Комментарии оценивающих" (click)="openCm(c.k, r, $event)">
                      {{ v }}<em class="sccm" [attr.aria-label]="cm.length + ' ' + plural(cm.length)">{{ cm.length }}</em>
                    </button>
                  } @else {
                    <span class="sc" [class]="tone(v)">{{ v }}</span>
                  }
                }
                <span class="sc sctot" [class]="tone(c.avg)">{{ c.avg }}</span>
              </span>
            </div>
            <div class="cgb">
              @for (i of c.ind; track i.name) {
                <div class="cgi">
                  <span class="txt">{{ i.name }}</span>
                  <span class="scs">
                    @for (v of i.v; track $index) {
                      <span class="sc" [class]="tone(v)">{{ v }}</span>
                    }
                    <span class="sc sctot" [class]="tone(avg(i.v))">{{ avg(i.v) }}</span>
                  </span>
                </div>
              }
            </div>
          </div>
        } @empty {
          <div class="empty sm">Ничего не найдено</div>
        }
      </div>
    </div>
    @if (cm(); as m) {
      <app-drawer title="Комментарии" okLabel="" cancelLabel="Закрыть" [open]="true" (openChange)="cm.set(null)">
        <p class="a3cmcat">{{ m.comp }} · {{ m.role }}</p>
        @for (x of m.list; track $index) {
          <div class="a3cm">
            @if (x.who === me) {
              <span class="av" [style.background-image]="'url(' + mePhoto + ')'"></span>
            } @else if (anon()) {
              <!-- сотруднику — анонимно: без фото и ФИО, только роль -->
              <span class="av a3anon"><app-icon name="user" /></span>
            } @else {
              <span class="av" [class]="avCls(x.who, x.av)"></span>
            }
            <div>
              <div class="a3cmh"
                ><span class="a3cmw"
                  >@if (anon() && x.who !== me) {<b>Анонимный сотрудник</b>} @else {<b>{{ x.who }}</b>}<span>{{ x.role }}</span></span
                ><time>{{ x.date }}</time></div
              >
              <p>{{ x.text }}</p>
            </div>
          </div>
        }
      </app-drawer>
    }
  `,
  host: { class: 'c' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class A360Comps {
  /** сотрудник: комментарии без ФИО и фото (кроме своих) */
  readonly anon = input(false);
  protected readonly heads = A360_ROLES_SHORT;
  protected readonly tagTone = TAG_TONE;
  protected readonly tone = tone;
  protected readonly plural = plural;
  protected readonly avCls = avCls;
  protected readonly me = ME[0];
  protected readonly mePhoto = ME_PHOTO;
  protected readonly q = signal('');
  protected readonly tags = Object.keys(TAG_TONE);
  protected readonly tag = signal('');
  protected readonly levels = Object.keys(LEVELS);
  protected readonly level = signal('');
  /** свернутые компетенции (по умолчанию все раскрыты) */
  protected readonly closed = signal(new Set<number>());
  protected readonly cm = signal<{ comp: string; role: string; list: A360Comment[] } | null>(null);

  /** поиск: компетенция целиком или только подходящие индикаторы */
  protected readonly list = computed(() => {
    const q = this.q().trim().toLowerCase(), tag = this.tag(), lv = LEVELS[this.level()];
    return A360_COMPS.map((c, k) => {
      if ((tag && c.tag !== tag) || (lv && !lv(c.avg))) return null;
      if (!q || c.name.toLowerCase().includes(q)) return { ...c, k };
      const ind = c.ind.filter((i) => i.name.toLowerCase().includes(q));
      return ind.length ? { ...c, k, ind } : null;
    }).filter((c) => !!c);
  });
  protected readonly anyOpen = computed(() => A360_COMPS.some((_, k) => !this.closed().has(k)));

  protected avg(v: number[]): number {
    return Math.round(v.reduce((a, b) => a + b, 0) / v.length);
  }
  protected comments(k: number, r: number): A360Comment[] {
    return A360_COMMENTS[k + '|' + r] ?? [];
  }
  protected toggle(k: number): void {
    const s = new Set(this.closed());
    if (s.has(k)) s.delete(k);
    else s.add(k);
    this.closed.set(s);
  }
  protected foldAll(): void {
    this.closed.set(this.anyOpen() ? new Set(A360_COMPS.map((_, k) => k)) : new Set());
  }
  protected openCm(k: number, r: number, e: Event): void {
    e.stopPropagation();
    this.cm.set({ comp: A360_COMPS[k].name, role: A360_ROLES[r], list: this.comments(k, r) });
  }
}
