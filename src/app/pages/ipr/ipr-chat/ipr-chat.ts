import { ChangeDetectionStrategy, Component, ElementRef, afterRenderEffect, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { IprStore } from '../../../core/demo/ipr-store.service';
import { IPR_RATES } from '../../../data/ipr.data';
import { shortFio } from '../../../data/org.data';
import { avCls } from '../../../data/people.data';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Icon } from '../../../shared/ui/icon/icon';

/** Сайдбар «Комментарии к задаче» на аттестации: задача с оценкой, переписка руководителя и сотрудника, поле ввода */
@Component({
  selector: 'app-ipr-chat',
  imports: [Drawer, Icon],
  template: `
    <app-drawer title="Комментарии к задаче" panel="ipw" okLabel="" cancelLabel="Закрыть" [open]="true" (openChange)="closed.emit()">
      @let t = task();
      <div class="ipatc">
        <b>{{ t.t }}</b><small>{{ t.res }}</small>
        <div class="iprm">
          <span><app-icon name="calendar" />до {{ t.due }}</span><span class="bdg" [class]="rate()?.tone ?? ''">{{ rate()?.label ?? 'Не оценено' }}</span>
        </div>
      </div>
      <div class="chat ipatch" #chat>
        @for (m of list(); track $index) {
          @let w = who(m.who);
          <div class="cmsg" [class.own]="(m.who === 'mgr') === s.isMgr()">
            <span class="av" [class]="w.av"></span>
            <div class="cmb">
              <div class="cmh"><b>{{ w.name }}</b><time>{{ m.at }}</time></div>
              <p>{{ m.text }}</p>
            </div>
          </div>
        } @empty {
          <div class="empty sm">Комментариев пока нет</div>
        }
      </div>
      <div class="chatin">
        <input class="fin" #inp [placeholder]="why() && s.isMgr() ? 'Поясните оценку: что не выполнено и почему' : 'Напишите комментарий'" (keydown.enter)="send()" />
        <button class="sendb" title="Отправить" (click)="send()"><app-icon name="sendArrow" /></button>
      </div>
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IprChat {
  protected readonly s = inject(IprStore);
  readonly index = input.required<number>();
  /** открыт после оценки «частично» / «не выполнена»: просим пояснить */
  readonly why = input(false);
  readonly closed = output<void>();
  private readonly chat = viewChild<ElementRef<HTMLElement>>('chat');
  private readonly inp = viewChild<ElementRef<HTMLInputElement>>('inp');

  protected readonly task = computed(() => this.s.plan().tasks[this.index()]);
  protected readonly list = computed(() => this.s.comments()[this.index()] || []);
  protected readonly rate = computed(() => IPR_RATES.find((r) => r.k === this.s.att()[this.index()]));
  private readonly mgr = computed(() => this.s.plan().mgr[0]);
  protected who(r: 'mgr' | 'emp'): { name: string; av: string } {
    return r === 'mgr' ? { name: shortFio(this.mgr()), av: avCls(this.mgr(), 5) } : { name: 'Иванов П. С.', av: avCls('Иванов Павел Сергеевич', 1) };
  }

  constructor() {
    afterRenderEffect(() => {
      this.list();
      const c = this.chat()?.nativeElement;
      if (c) c.scrollTop = c.scrollHeight;
    });
    let first = true;
    afterRenderEffect(() => {
      const i = this.inp()?.nativeElement;
      if (i && first && this.why()) i.focus();
      first = false;
    });
  }

  protected send(): void {
    const i = this.inp()!.nativeElement,
      v = i.value.trim();
    if (!v) return;
    this.s.addComment(this.index(), v);
    i.value = '';
    i.focus();
  }
}
