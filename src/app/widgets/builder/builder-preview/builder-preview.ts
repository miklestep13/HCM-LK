import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { BLD_MOD_KINDS, bldBlockLabel, bldBlockName } from '../../../data/builder.data';
import { BldBlock, BldModule } from '../../../interface/builder';
import { Icon } from '../../../shared/ui/icon/icon';
import { Progress } from '../../../shared/ui/progress/progress';
import { BldBlockView } from '../builder-block/builder-block';
import { BuilderState } from '../builder.state';

/** экран прохождения: модуль целиком или один его блок */
interface Screen {
  m: BldModule;
  b?: BldBlock;
}

/**
 * «Предпросмотр» — как увидит сотрудник, в раскладке страницы прохождения (.pg-pass, как плеер курса и прохождение опроса):
 * слева — название и прогресс, структура (разделы и модули; пройденные — галочкой, при последовательном порядке следующие — с замком),
 * справа — модуль: название, описание, блоки (можно отвечать), «Назад» / «Далее» / «Завершить».
 * «По одному блоку» — каждый блок отдельным экраном. Один уровень (только блоки) — в структуре блоки, заголовок — название материала.
 * Открывается на модуле, который выбран в редакторе.
 */
@Component({
  selector: '[bld-preview]',
  imports: [Icon, Progress, BldBlockView],
  template: `
    @let M = s.mat();
    @let _v = s.ver();
    @let sc = cur();
    <div class="plside">
      <div class="c">
        <div class="cb">
          <div class="pltitle">{{ M.t || s.conf().name + ' без названия' }}</div>
          <app-progress class="plpr" label="Выполнено" [value]="pct() + '%'" [percent]="pct()" [tone]="pct() === 100 ? 'ok' : ''" [caption]="'Пройдено ' + passed() + ' из ' + total()" />
        </div>
      </div>
      <div class="c">
        <div class="cb pltoc">
          @if (M.one) {
            <div class="sect flat">
              @for (b of s.mods()[0]?.blocks ?? []; track b.id; let k = $index) {
                @let at = screenOf(b);
                <div class="cblk plrow" [class.on]="sc?.b === b" (click)="go(at)">
                  <div class="cbi">
                    @if (at < i() || fin()) {
                      <span class="pli ok"><app-icon name="pliOk" /></span>
                    } @else {
                      {{ k + 1 }}
                    }
                  </div>
                  <div><b>{{ label(b) || name(b) }}</b></div>
                </div>
              }
            </div>
          }
          @for (S of M.one ? [] : M.secs; track S.id; let si = $index) {
            <div class="sect" [class.flat]="M.flat">
              @if (!M.flat) {
                <div class="secth"><span class="secn">{{ si + 1 }}</span><b>{{ S.t }}</b></div>
              }
              @for (m of S.mods; track m.id) {
                @let lock = locked(m);
                <div class="cblk plrow" [class.on]="sc?.m === m" [class.lock]="lock" (click)="!lock && goMod(m)">
                  <div class="cbi">
                    @if (done().has(m)) {
                      <span class="pli ok"><app-icon name="pliOk" /></span>
                    } @else if (lock) {
                      <span class="pli"><app-icon name="lock" /></span>
                    } @else {
                      {{ s.modNum(m) }}
                    }
                  </div>
                  @if (s.kinded()) {
                    <span class="bldmk" [title]="kinds[m.mk ?? 'mod'].name"><app-icon [name]="kinds[m.mk ?? 'mod'].icon" /></span>
                  }
                  <div><b>{{ m.t }}</b></div>
                </div>
              }
            </div>
          }
        </div>
      </div>
    </div>
    <div class="c full plmain">
      @if (fin()) {
        <div class="lfres ok"><app-icon name="pliOk" /><b>{{ s.conf().name }} пройден</b><span>Так сотрудник увидит завершение. Вернитесь в редактор, чтобы продолжить настройку.</span></div>
        <div class="plnav" style="justify-content: center"><button class="btn raised" (click)="restart()">Пройти заново</button></div>
      } @else if (sc) {
        <div class="plhd">
          <h2>{{ M.one ? M.t || s.conf().name : sc.m.t }}</h2>
          <span class="bmeta">{{ M.one ? '' : s.conf().mod + ' ' + s.modNum(sc.m) + (sc.b ? ' · ' : '') }}{{ sc.b ? (M.one ? 'Страница ' : 'блок ') + (sc.m.blocks.indexOf(sc.b) + 1) + ' из ' + sc.m.blocks.length : '' }}</span>
        </div>
        @if (!M.one && sc.m.d && (!sc.b || sc.m.blocks[0] === sc.b)) {
          <p class="pld">{{ sc.m.d }}</p>
        }
        <div class="plbody bldpvb">
          @for (b of sc.b ? [sc.b] : sc.m.blocks; track b.id) {
            <div bld-block live [b]="b"></div>
          } @empty {
            <div class="blph">В этом {{ s.conf().mod.toLowerCase() }}е пока нет блоков</div>
          }
        </div>
        <div class="plnav">
          <button class="btn raised" [disabled]="!i()" (click)="go(i() - 1)">Назад</button>
          @if (i() < screens().length - 1) {
            <button class="btn pri" (click)="go(i() + 1)">Далее</button>
          } @else {
            <button class="btn pri" (click)="finish()">Завершить</button>
          }
        </div>
      }
    </div>
  `,
  host: { class: 'plgrid bldpv' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BldPreview {
  protected readonly s = inject(BuilderState);
  protected readonly i = signal(0);
  protected readonly label = bldBlockLabel;
  protected readonly kinds = BLD_MOD_KINDS;
  protected readonly name = bldBlockName;
  protected readonly done = signal(new Set<BldModule>());
  protected readonly fin = signal(false);
  protected readonly screens = computed<Screen[]>(() => {
    const block = this.s.mat().paging === 'block';
    return this.s.mods().flatMap((m) => (block && m.blocks.length ? m.blocks.map((b) => ({ m, b })) : [{ m }]));
  });
  protected readonly cur = computed(() => this.screens()[this.i()] ?? null);
  /** пройдено: модулей, без модулей — экранов (блоков) */
  protected readonly total = computed(() => (this.s.mat().one ? this.screens().length : this.s.mods().length));
  protected readonly passed = computed(() => (this.s.mat().one ? (this.fin() ? this.total() : this.i()) : this.done().size));
  protected readonly pct = computed(() => (this.total() ? Math.round((this.passed() / this.total()) * 100) : 0));

  constructor() {
    // открыть на модуле, выбранном в редакторе
    effect(() => {
      const m = this.s.mod();
      untracked(() => {
        const k = this.screens().findIndex((x) => x.m === m);
        this.i.set(Math.max(0, k));
      });
    });
  }
  /** последовательный порядок: модуль закрыт, пока не пройдены предыдущие */
  protected locked(m: BldModule): boolean {
    if (this.s.mat().order !== 'seq') return false;
    const l = this.s.mods(), k = l.indexOf(m);
    return l.slice(0, k).some((x) => !this.done().has(x));
  }
  /** экран блока (модуль целиком — экран модуля) */
  protected screenOf(b: BldBlock): number {
    const l = this.screens();
    const k = l.findIndex((x) => x.b === b);
    return k >= 0 ? k : l.findIndex((x) => x.m.blocks.includes(b));
  }
  protected goMod(m: BldModule): void {
    this.go(this.screens().findIndex((x) => x.m === m));
  }
  protected go(k: number): void {
    const c = this.cur();
    // уходя вперед с последнего экрана модуля — модуль пройден
    if (c && k > this.i() && (!c.b || c.m.blocks[c.m.blocks.length - 1] === c.b)) this.done.update((d) => new Set(d).add(c.m));
    this.i.set(k);
  }
  protected finish(): void {
    this.go(this.i() + 1);
    this.done.set(new Set(this.s.mods()));
    this.fin.set(true);
  }
  protected restart(): void {
    this.done.set(new Set());
    this.fin.set(false);
    this.i.set(0);
  }
}
