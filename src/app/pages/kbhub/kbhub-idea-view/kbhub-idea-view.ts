import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { IdeasStore } from '../../../core/demo/ideas-store.service';
import { IDEA_STATUS_TONE } from '../../../data/kb.data';
import { plural } from '../../../data/org.data';
import { ConfirmService } from '../../../shared/ui/confirm/confirm.service';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Icon } from '../../../shared/ui/icon/icon';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/**
 * Сайдбар «Просмотр идеи»: поля только для чтения, ответ эксперта, голоса.
 * Своя идея — «Удалить идею» (с подтверждением); идея коллеги — «Поддержать» / «Вы поддержали».
 */
@Component({
  selector: 'app-kbhub-idea-view',
  imports: [Drawer, Icon],
  templateUrl: './kbhub-idea-view.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbhubIdeaView {
  readonly ideaId = input<string | null>(null);
  readonly closed = output<void>();
  private readonly store = inject(IdeasStore);
  private readonly confirm = inject(ConfirmService);
  private readonly toast = inject(ToastService);
  protected readonly tone = IDEA_STATUS_TONE;
  protected readonly i = computed(() => this.store.list().find((x) => x.id === this.ideaId()) ?? null);
  protected readonly votesText = (n: number) => `${n} ${plural(n, 'коллега', 'коллеги', 'коллег')}`;

  protected async ok(): Promise<void> {
    const i = this.i();
    if (!i) return;
    if (i.my) {
      const yes = await this.confirm.ask({
        title: 'Удалить идею?',
        text: `«${i.title}» будет удалена вместе с голосами${i.answer ? ' и ответом эксперта' : ''}. Восстановить ее не получится.`,
        ok: 'Удалить',
        danger: true,
      });
      if (!yes) return;
      this.store.remove(i.id);
      this.closed.emit();
      this.toast.show('Идея удалена', `«${i.title}»`);
      return;
    }
    const r = this.store.vote(i.id);
    this.toast.show(r.voted ? 'Вы поддержали идею' : 'Голос отменен', `«${i.title}»`);
  }
}
