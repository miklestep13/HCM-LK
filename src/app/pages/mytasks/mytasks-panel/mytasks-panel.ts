import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject, linkedSignal, signal } from '@angular/core';
import { NavService } from '../../../core/navigation/nav.service';
import { TASK_AUTHOR_PHOTO, TASK_QUICK, TASK_STATUS_TONE } from '../../../data/tasks.data';
import { avCls } from '../../../data/people.data';
import { AttachFile } from '../../../interface/attach';
import { Attach } from '../../../shared/ui/attach/attach';
import { Field } from '../../../shared/ui/field/field';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { MytasksState } from '../mytasks.state';

/**
 * Панель небольшого задания (разделенный экран справа от списка): что сделать, инициатор, срок, описание, документ,
 * свои файлы (если нужно дополнить), комментарий; кнопки обработки — основное действие и, если есть, второе.
 * «Открыть полностью» — страница задания. После обработки — следующее небольшое задание из списка или закрытие.
 */
@Component({
  selector: '[mytasks-panel]',
  imports: [Attach, Field, Icon],
  template: `
    @if (task(); as t) {
      @let q = quick()!;
      <div class="ch mtph">
        <span class="mtpk">{{ q.kind }}</span>
        <button class="actb" title="Закрыть" aria-label="Закрыть" (click)="s.quick.set(null)"><app-icon name="close" /></button>
      </div>
      <div class="cb mtpb">
        <h2 class="mtpt">{{ t.title }}</h2>
        <span class="bdg" [class]="tone[t.status] || ''">{{ t.status }}</span>
        <div class="mtpm">
          <div class="mtpa">
            @if (photo[t.author]; as ph) {
              <img class="av" [src]="ph" alt="" />
            } @else {
              <span class="av" [class]="av(t.author, 1)"></span>
            }
            <span class="cnm"><small>Инициатор</small><b>{{ t.author }}</b></span>
          </div>
          <div class="mtpd" [class.dgt]="due().over"><small>Срок</small><b>{{ due().t }}</b></div>
        </div>
        <p class="mtpx">{{ t.text }}</p>
        <div class="mtpl">Документ</div>
        <app-attach [files]="q.files" />
        @if (q.upload) {
          <div class="mtpl">Ваши документы</div>
          <app-attach edit [(files)]="mine" />
        }
        <div class="frm mtpc">
          <app-field label="Комментарий" full [filled]="!!cm()">
            <textarea class="fta" rows="3" [value]="cm()" (input)="cm.set($any($event.target).value)"></textarea>
          </app-field>
        </div>
      </div>
      <div class="mtpf">
        <button class="lnk" (click)="nav.go('mtext', { task: t.id })">Открыть полностью</button>
        <span class="mtpfb">
          @if (q.alt; as a) {
            <button class="btn raised" (click)="done(a)">{{ a.label }}</button>
          }
          <button class="btn pri" (click)="done(q.ok)">{{ q.ok.label }}</button>
        </span>
      </div>
    }
  `,
  styleUrl: './mytasks-panel.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c mtpanel' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MytasksPanel {
  protected readonly s = inject(MytasksState);
  protected readonly nav = inject(NavService);
  private readonly toast = inject(ToastService);
  protected readonly tone = TASK_STATUS_TONE;
  protected readonly photo = TASK_AUTHOR_PHOTO;
  protected readonly av = avCls;
  protected readonly task = computed(() => this.s.rows().find((t) => t.id === this.s.quick()) ?? null);
  protected readonly quick = computed(() => (this.s.quick() ? TASK_QUICK[this.s.quick()!] : null));
  protected readonly due = computed(() => this.s.dueText(this.task()?.due || ''));
  /** комментарий и свои файлы — заново для каждого задания */
  protected readonly cm = linkedSignal({ source: this.s.quick, computation: () => '' });
  protected readonly mine = signal<AttachFile[]>([]);

  /** обработать: новый статус, уведомление; дальше — следующее небольшое задание */
  protected done(a: { status: string; toast: string }): void {
    const t = this.task()!, rows = this.s.rows(), i = rows.findIndex((x) => x.id === t.id);
    if (this.quick()?.upload && !this.mine().length) return this.toast.show('Добавьте документы', 'Приложите недостающие документы перед отправкой.');
    this.s.setStatus(t.id, a.status);
    this.mine.set([]);
    this.toast.show(t.title, a.toast);
    const next = [...rows.slice(i + 1), ...rows.slice(0, i)].find((x) => x.id !== t.id && TASK_QUICK[x.id]);
    this.s.quick.set(next ? next.id : null);
  }
}
