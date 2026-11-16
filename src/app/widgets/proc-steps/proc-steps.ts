import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { ProcStep } from '../../interface/proc-step';
import { Icon } from '../../shared/ui/icon/icon';

/**
 * «Ход процесса» — шаги процесса по горизонтали (заявка; подходит для любого маршрута согласования):
 * кружок с номером (пройден — зеленый с галочкой, текущий — синий с ореолом, впереди — серый, отклонен — красный с крестиком), линия до следующего, название и подпись.
 *   <div app-proc-steps [steps]="steps" title="Ход обработки"></div>
 * Шагов может быть много (2–20): у шага минимальная ширина, лишние уходят вправо — лента прокручивается
 * (колесо, тачпад, свайп) и стрелками ‹ › в шапке, как у слайдера; у края, за которым есть шаги, — плавное затухание.
 * При открытии лента сама прокручена к текущему шагу. В шапке — «Этап N из M».
 */
@Component({
  selector: '[app-proc-steps]',
  imports: [Icon],
  templateUrl: './proc-steps.html',
  styleUrl: './proc-steps.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'w-proc' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProcSteps {
  readonly steps = input.required<ProcStep[]>();
  readonly title = input('Ход процесса');
  /** номер текущего (или последнего пройденного) шага — для «Этап N из M» */
  protected readonly at = computed(() => {
    const l = this.steps(), i = l.findIndex((s) => s.st !== 'done');
    return i < 0 ? l.length : i + 1;
  });
  protected readonly allDone = computed(() => this.steps().every((s) => s.st === 'done'));

  private readonly track = viewChild.required<ElementRef<HTMLElement>>('track');
  /** можно прокрутить влево / вправо — стрелки и затухание у края */
  protected readonly canL = signal(false);
  protected readonly canR = signal(false);

  constructor() {
    const destroy = inject(DestroyRef);
    afterNextRender(() => {
      const el = this.track().nativeElement;
      // к текущему шагу: он — второй слева (видно и пройденный перед ним)
      const cur = el.querySelector<HTMLElement>('.wpst.cur, .wpst.fail, .wpst.stop');
      if (cur) {
        const prev = cur.previousElementSibling as HTMLElement | null;
        el.scrollLeft = Math.max(0, cur.offsetLeft - (prev?.offsetWidth ?? 0));
      }
      this.check();
      const ro = new ResizeObserver(() => this.check());
      ro.observe(el);
      destroy.onDestroy(() => ro.disconnect());
    });
  }
  protected check(): void {
    const el = this.track().nativeElement;
    this.canL.set(el.scrollLeft > 2);
    this.canR.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }
  /** стрелки: прокрутка на ширину видимой части минус один шаг (последний видимый шаг остается на экране) */
  protected go(dir: 1 | -1): void {
    const el = this.track().nativeElement, step = el.querySelector<HTMLElement>('.wpst')?.offsetWidth || 200;
    el.scrollBy({ left: dir * Math.max(step, el.clientWidth - step), behavior: 'smooth' });
  }
}
