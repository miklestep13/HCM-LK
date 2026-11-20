import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, effect, inject, signal, untracked } from '@angular/core';
import { CareerRoleStore } from '../../core/demo/career-role.service';
import { NavService } from '../../core/navigation/nav.service';
import { personAvatar } from '../../data/avatar';
import { CT_ROLE, CT_ROLE_DESC, CT_ROLES, CT_TPL_ROLE, CtRoleFlag, ctActs, ctKinds, ctNoGrade, ctSort, ctTerm, ctYmd } from '../../data/career-track.data';
import { ORG } from '../../data/org.data';
import { ConfirmService } from '../../shared/ui/confirm/confirm.service';
import { DateRange, DateRangeField, EMPTY_RANGE, inRange } from '../../shared/ui/date-range/date-range';
import { FilterBar } from '../../shared/ui/filter-bar/filter-bar';
import { Icon } from '../../shared/ui/icon/icon';
import { MultiSelect, MultiSelectMeta } from '../../shared/ui/multi-select/multi-select';
import { PageHead } from '../../shared/ui/page-head/page-head';
import { Pager, paginate } from '../../shared/ui/pager/pager';
import { Select } from '../../shared/ui/select/select';
import { TableSettings } from '../../shared/ui/table-settings/table-settings';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { Tooltip } from '../../shared/ui/tooltip/tooltip';
import { CtSort } from '../ctrack/ct-sort';

type ListStatus = 'Действует' | 'Не действует';
type ColKey = 'ico' | 'name' | 'words' | 'leader' | 'comps' | 'people' | 'from' | 'to' | 'status';

interface Col {
  k: ColKey;
  t: string;
  num?: boolean;
  stb?: boolean;
  /** пустой заголовок: признаки читаются по значкам */
  bare?: boolean;
  /** столбец оставлен в разметке, в таблице его нет */
  off?: boolean;
}

interface TrackRow {
  id: string;
  name: string;
  direction: string;
  /** основная, дополнительная или обе сразу */
  kinds: CtRoleFlag[];
  /** нет лестницы грейдов */
  noGrade: boolean;
  desc: string;
  leader: string;
  comps: number;
  people: number;
  from: string;
  /** пусто — бессрочно */
  to: string;
  status: ListStatus;
  /** карточка, собранная в этой сессии, ее не сбрасывать при открытии */
  fresh: boolean;
}

/**
 * «Управление персоналом → Карьерные треки»: список должностей.
 * Строка открывает карточку должности. «Кредитный специалист» — заполненный трек, остальные открывают его как шаблон.
 */
@Component({
  selector: 'app-careers',
  imports: [PageHead, FilterBar, Select, MultiSelect, DateRangeField, TableSettings, CtSort, Icon, Tooltip, Pager],
  templateUrl: './careers.html',
  styleUrl: './careers.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'pg pg-careers' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Careers {
  private readonly nav = inject(NavService);
  private readonly role = inject(CareerRoleStore);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);

  protected readonly cols: Col[] = [
    { k: 'ico', t: '', bare: true },
    { k: 'name', t: 'Должность' },
    { k: 'words', t: 'Вариант 2', off: true },
    { k: 'leader', t: 'Лидер' },
    { k: 'comps', t: 'Кол-во компетенций', num: true },
    { k: 'people', t: 'Кол-во сотрудников', num: true },
    { k: 'from', t: 'Дата действия с' },
    { k: 'to', t: 'Дата действия по' },
    { k: 'status', t: 'Статус', stb: true },
  ];
  /** в настройке нет пустого столбца признаков и спрятанного варианта 2 */
  protected readonly tune = this.cols.filter((c) => !c.off && c.t);
  protected readonly colNames = this.tune.map((c) => c.t);
  protected readonly statuses: ListStatus[] = ['Действует', 'Не действует'];
  protected readonly leaderOpts = uniq(CT_ROLES.map((r) => r.leader));
  protected readonly leaderMeta: Record<string, MultiSelectMeta> = Object.fromEntries(
    this.leaderOpts.map((n) => {
      const a = personAvatar(n);
      const org = ORG.find((x) => x.name === n);
      return [n, a.photo ? { img: a.photo, sub: org?.role || '' } : { av: a.cls, sub: org?.role || '' }];
    }),
  );
  protected readonly av = personAvatar;

  protected readonly q = signal('');
  protected readonly leaders = signal<string[]>([]);
  protected readonly comp = signal('');
  protected readonly people = signal('');
  /** по умолчанию только действующие: недействующие в списке не видны, пока фильтр не сменят */
  protected readonly status = signal<string>('Действует');
  protected readonly fromAt = signal<DateRange>({ ...EMPTY_RANGE });
  protected readonly toAt = signal<DateRange>({ ...EMPTY_RANGE });
  protected readonly opened = signal(false);
  /** скрытые столбцы — номера с 1, как у app-table-settings; первый не скрывается */
  protected readonly hidden = signal<number[]>([]);
  protected readonly sort = signal<{ k: ColKey; d: 1 | -1 }>({ k: 'name', d: 1 });
  /** постранично, как у участников события */
  protected readonly pg = paginate(() => this.rows(), 10);
  /** раскрытые описания: несколько строк сразу */
  protected readonly openIds = signal<string[]>([]);

  protected readonly span = computed(() => this.cols.filter((c) => this.shown(c)).length + 2);
  protected readonly compOpts = computed(() => uniqNum(this.catalog().map((r) => r.comps)));
  protected readonly peopleOpts = computed(() => uniqNum(this.catalog().map((r) => r.people)));

  protected readonly rows = computed(() => {
    const q = this.q().trim().toLowerCase();
    const who = this.leaders();
    const comp = this.comp();
    const people = this.people();
    const st = this.status();
    const fromAt = this.fromAt();
    const toAt = this.toAt();
    const list = this.catalog().filter(
      (r) =>
        (!q || r.name.toLowerCase().includes(q) || r.desc.toLowerCase().includes(q)) &&
        (!who.length || who.includes(r.leader)) &&
        (!comp || r.comps === Number(comp)) &&
        (!people || r.people === Number(people)) &&
        (!st || r.status === st) &&
        inRange(fromAt, r.from) &&
        inRange(toAt, r.to),
    );
    const s = this.sort();
    const picks: Record<ColKey, (r: TrackRow) => string | number> = {
      ico: (r) => this.flagKey(r),
      name: (r) => r.name,
      words: (r) => this.flagKey(r),
      leader: (r) => r.leader,
      comps: (r) => r.comps,
      people: (r) => r.people,
      from: (r) => ctYmd(r.from),
      to: (r) => ctYmd(r.to) || 99999999,
      status: (r) => r.status,
    };
    return ctSort(list, picks[s.k], s.d);
  });

  constructor() {
    effect(() => {
      this.q();
      this.leaders();
      this.comp();
      this.people();
      this.status();
      this.fromAt();
      this.toAt();
      untracked(() => this.pg.page.set(0));
    });
  }

  /** должность лидера — подпись под ФИО, как в бланке аттестации */
  protected post(name: string): string {
    return ORG.find((x) => x.name === name)?.role || '';
  }
  private flagKey(r: TrackRow): string {
    return r.kinds.join(' ') + (r.noGrade ? ' без' : '');
  }

  protected shown(c: Col): boolean {
    if (c.off) return false;
    if (!c.t) return true;
    const n = this.tune.indexOf(c) + 1;
    return n > 0 && !this.hidden().includes(n);
  }

  protected isOpen(id: string): boolean {
    return this.openIds().includes(id);
  }
  protected toggle(id: string): void {
    this.openIds.update((ids) => (ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]));
  }

  protected sortBy(k: ColKey, e: Event): void {
    e.stopPropagation();
    const s = this.sort();
    this.sort.set(s.k === k ? { k, d: s.d === 1 ? -1 : 1 } : { k, d: 1 });
  }

  /** название открывает карточку, строка при этом не раскрывается */
  protected openName(row: TrackRow, e: Event): void {
    e.stopPropagation();
    this.open(row);
  }

  protected add(): void {
    this.role.setMode('create');
    this.nav.go('careerhr');
  }

  protected open(row: TrackRow): void {
    const live = row.fresh || (row.id === CT_TPL_ROLE && this.role.name() === row.name);
    if (!live) this.role.setMode(row.status === 'Не действует' ? 'inactive' : 'active');
    this.nav.go('careerhr');
  }

  /** карандаш: та же карточка, сразу в режиме правки */
  protected edit(row: TrackRow): void {
    this.open(row);
    this.role.shaping.set(true);
  }

  /** копия в форме создания: поля образца уже заполнены, другую должность выбирают в списке */
  protected copy(row: TrackRow): void {
    this.role.copyFrom(row.name);
    this.nav.go('careerhr');
  }

  protected async remove(row: TrackRow): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Удалить должность?',
      text: '«' + row.name + '» перестанет действовать. В списке она останется со статусом «Не действует».',
      ok: 'Удалить',
      danger: true,
    });
    if (!ok) return;
    this.role.deactivate(row.id);
    this.toast.show('Должность не действует', '«' + row.name + '» больше не действует.');
  }

  /** справочник плюс должность, созданная в этой сессии. Статус кредитного специалиста — с карточки. */
  private catalog(): TrackRow[] {
    const liveName = this.role.name();
    const live = !(this.role.mode() === 'create' && !this.role.kept()) && !!liveName;
    const stopped = new Set(this.role.stopped());
    const rows: TrackRow[] = CT_ROLES.map((r) => {
      const term = ctTerm(r.id);
      const own = r.id === CT_TPL_ROLE && live && liveName === r.name;
      const off = stopped.has(r.id) || (own && this.role.status() === 'Не действует');
      return {
        id: r.id,
        name: r.name,
        direction: r.direction,
        kinds: ctKinds(r),
        noGrade: ctNoGrade(r.id),
        desc: r.id === CT_TPL_ROLE ? CT_ROLE.desc : CT_ROLE_DESC[r.id] || 'Описание должности еще не заполнено.',
        leader: r.leader,
        comps: r.comps,
        people: r.people,
        from: term.from,
        to: term.to,
        status: off ? 'Не действует' : ctActs(term.from, term.to),
        fresh: false,
      };
    });
    if (live && !CT_ROLES.some((r) => r.name === liveName)) {
      rows.unshift({
        id: 'new',
        name: liveName,
        direction: '—',
        kinds: ['Основная'],
        noGrade: this.role.grades().length === 0,
        desc: this.role.desc() || 'Описание должности еще не заполнено.',
        leader: this.role.leader() || '—',
        comps: this.role.comps().length,
        people: 0,
        from: '30.09.2026',
        to: '',
        status: stopped.has('new') || this.role.status() === 'Не действует' ? 'Не действует' : 'Действует',
        fresh: true,
      });
    }
    return rows;
  }
}

function uniq(list: string[]): string[] {
  return [...new Set(list)].sort((a, b) => a.localeCompare(b, 'ru'));
}

function uniqNum(list: number[]): string[] {
  return [...new Set(list)].sort((a, b) => a - b).map(String);
}
