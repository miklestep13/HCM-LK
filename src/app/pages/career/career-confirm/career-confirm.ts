import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { CareerStore } from '../../../core/demo/career-store.service';
import { CP_EXPERTS } from '../../../data/career-path.data';
import { CT_LEVELS, ctBehavior } from '../../../data/career-track.data';
import { shortFio } from '../../../data/org.data';
import { AttachFile } from '../../../interface/attach';
import { CpReqRow } from '../../../interface/career-path';
import { Attach } from '../../../shared/ui/attach/attach';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/**
 * Сайдбар «Подтверждение уровня»: компетенция, уровень (по умолчанию — требуемый), что умеет сотрудник на этом уровне,
 * эксперт должности, пример из работы (обязательно) и файлы. После отправки строка переходит в «На подтверждении».
 */
@Component({
  selector: 'app-career-confirm',
  imports: [Drawer, Field, Select, Attach],
  template: `
    <app-drawer title="Подтверждение уровня" okLabel="Отправить" [open]="true" (openChange)="closed.emit()" (ok)="send()">
      <div class="cpfrm">
        <app-field label="Компетенция" filled class="dis">
          <input class="fin" [value]="row().comp" disabled />
        </app-field>
        <app-field label="Уровень" required [filled]="!!level()">
          <app-select [options]="levels" [(value)]="level" />
        </app-field>
        <div class="cpbeh">
          <b>Что умеет сотрудник на уровне «{{ level() }}»</b>
          <p>{{ behavior() }}</p>
        </div>
        <app-field label="Эксперт" required [filled]="!!expert()">
          <app-select [options]="experts" [(value)]="expert" />
        </app-field>
        <app-field label="Пример из работы" required [filled]="!!example()" [error]="err()">
          <textarea class="fta" rows="5" placeholder="Опишите ситуацию, что сделали и каким был результат" [value]="example()" (input)="example.set($any($event.target).value); err.set(false)"></textarea>
          @if (err()) {
            <div class="fhelp cperr">Опишите пример из работы</div>
          } @else {
            <div class="fhelp">Эксперт увидит пример и подтвердит уровень или задаст вопросы в комментариях</div>
          }
        </app-field>
        <app-field label="Файлы" [float]="false" [filled]="!!files().length">
          <app-attach edit [(files)]="files" />
          <div class="fhelp">До 5 файлов: заключение, выписка, скриншот из АБС</div>
        </app-field>
      </div>
    </app-drawer>
  `,
  styleUrl: './career-confirm.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'career-confirm' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CareerConfirm {
  readonly row = input.required<CpReqRow>();
  readonly closed = output<void>();
  private readonly s = inject(CareerStore);
  private readonly toast = inject(ToastService);

  protected readonly levels = CT_LEVELS;
  /** уровень подтверждает лидер или эксперт должности, не ответственный за трек */
  private readonly reviewers = CP_EXPERTS.filter((e) => e.tag === 'Лидер' || e.tag === 'Эксперт');
  protected readonly experts = this.reviewers.map((e) => shortFio(e.name) + (e.tag === 'Лидер' ? ' (лидер должности)' : ''));
  /** уровень по умолчанию — требуемый на выбранном грейде */
  protected readonly level = linkedSignal(() => this.row().need);
  protected readonly expert = signal(this.experts[0]);
  protected readonly example = signal('');
  protected readonly files = signal<AttachFile[]>([]);
  protected readonly err = signal(false);
  protected readonly behavior = computed(() => ctBehavior(this.row().comp, this.level()));

  protected send(): void {
    if (!this.example().trim()) {
      this.err.set(true);
      return;
    }
    const expert = this.reviewers[this.experts.indexOf(this.expert())]?.name || this.reviewers[0].name;
    this.s.request(this.row().comp, expert);
    this.toast.show('Запрос отправлен', shortFio(expert) + ' получит уведомление и подтвердит уровень «' + this.level() + '»');
    this.closed.emit();
  }
}
