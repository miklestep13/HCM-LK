import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Progress } from '../progress/progress';

/** прогресс в шапке объекта: «Выполнено» и процент над полосой, подпись под ней */
export interface ObjectHeadProgress {
  label: string;
  value: string;
  percent: number;
  tone?: '' | 'warn' | 'ok' | 'dg';
  caption?: string;
}

/** плитка показателя (KPI Card): подпись серым, значение; tone — цвет значения (warn, dg) */
export interface ObjectHeadKpi {
  label: string;
  value: string;
  tone?: '' | 'warn' | 'dg';
}

/**
 * Шапка объекта (DS Q.HCM «Object Header», .q-ohead): остров на всю ширину, первый на странице, поля 24, радиус 12.
 * Сверху вниз: название 20/26 и бейджи сразу после него (<span ohStatus>, до 3), справа — до 2 иконочных кнопок (<button ohAction>);
 * подзаголовок 14/18 серым через 4 (<span ohSub>); уведомление, участник и прочее (контент без атрибута) через 20;
 * описание (desc) до 720 через 20; показатели [kpis] — 2–5 серых плиток в ряд через 20; прогресс через 20.
 * <div app-object-head [title]="…" [desc]="…" [progress]="{ label: 'Выполнено', value: '36%', percent: 36 }">…</div>
 */
@Component({
  selector: '[app-object-head]',
  imports: [Progress],
  template: `
    <div class="ohtt">
      <div class="ohts">
        <h2>{{ title() }}</h2>
        <ng-content select="[ohStatus]" />
      </div>
      <div class="ohbtns"><ng-content select="[ohAction]" /></div>
    </div>
    <div class="ohsub"><ng-content select="[ohSub]" /></div>
    <ng-content />
    @if (desc()) {
      <p class="ohdesc">{{ desc() }}</p>
    }
    @if (kpis().length) {
      <div class="ohkpi">
        @for (k of kpis(); track k.label) {
          <div class="ohk"><span class="l">{{ k.label }}</span><b [class]="k.tone || ''">{{ k.value }}</b></div>
        }
      </div>
    }
    @if (progress(); as p) {
      <app-progress class="ohpr" [label]="p.label" [value]="p.value" [percent]="p.percent" [tone]="p.tone || ''" [caption]="p.caption || ''" />
    }
  `,
  host: { class: 'q-ohead' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ObjectHead {
  readonly title = input.required<string>();
  /** описание (абзац M) */
  readonly desc = input('');
  readonly progress = input<ObjectHeadProgress | null>(null);
  readonly kpis = input<ObjectHeadKpi[]>([]);
}
