import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Modal } from '../../../shared/ui/modal/modal';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { PollsState, pplText } from '../polls.state';

/** Окно «Участники · опрос»: поиск по ФИО, должности, подразделению, первые 60 сотрудников, «…и еще N», выгрузка в Excel. */
@Component({
  selector: 'app-polls-people',
  imports: [Modal],
  template: `
    @let p = s.people();
    <app-modal [title]="'Участники · ' + (p?.n || '')" panel="mdl-md" [open]="!!p" (openChange)="onOpen($event)">
      @if (p) {
        <input class="fin mdlq" placeholder="Поиск по ФИО, должности или подразделению" [value]="q()" (input)="q.set($any($event.target).value)" />
        <div class="mdlppl">
          @for (x of list(); track $index) {
            <div class="mpp">
              <span class="av" [class]="'av av' + x[3]"></span>
              <span class="cnm"><b>{{ x[0] }}</b><small>{{ x[1] }} · {{ x[2] }}</small></span>
            </div>
          }
        </div>
        @if (p.total > shown && !q()) {
          <p class="mdlmore">…и еще {{ p.total - shown }} сотр. Полный список доступен в выгрузке.</p>
        }
        <div class="mdlf plpf"><span class="gr">Всего {{ ppl(p.total) }}</span><button class="btn raised" (click)="excel()">Выгрузить в Excel</button></div>
      }
    </app-modal>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PollsPeople {
  protected readonly s = inject(PollsState);
  private readonly toast = inject(ToastService);
  protected readonly q = signal('');
  protected readonly shown = 60;
  protected readonly ppl = pplText;
  protected readonly list = computed(() => {
    const p = this.s.people(), f = this.q().trim().toLowerCase();
    if (!p) return [];
    return this.s.persons(p, this.shown).filter((x) => !f || x.join(' ').toLowerCase().includes(f));
  });
  protected onOpen(v: boolean): void {
    if (!v) this.close();
  }
  protected close(): void {
    this.s.people.set(null);
    this.q.set('');
  }
  protected excel(): void {
    this.toast.show('Готово', 'Список участников выгружен в Excel.');
  }
}
