import { ChangeDetectionStrategy, Component, inject, model, output, signal } from '@angular/core';
import { IdeasStore } from '../../../core/demo/ideas-store.service';
import { IDEA_DIRS } from '../../../data/kb.data';
import { Drawer } from '../../../shared/ui/drawer/drawer';
import { Field } from '../../../shared/ui/field/field';
import { Select } from '../../../shared/ui/select/select';
import { ToastService } from '../../../shared/ui/toast/toast.service';

/** Сайдбар «Предложить идею»: название, направление, проблема, решение, видимость коллегам. */
@Component({
  selector: 'app-kbhub-idea-new',
  imports: [Drawer, Field, Select],
  template: `
    <app-drawer title="Предложить идею" okLabel="Отправить" [(open)]="open" (ok)="send()" (cancel)="reset()">
      <div class="bkf">
        <app-field label="Название идеи" required [filled]="!!t()" [error]="err() && !t()">
          <input class="fin" placeholder="Коротко, в одну строку" [value]="t()" (input)="t.set(val($event))" />
        </app-field>
        <app-field label="Направление" required [filled]="!!dir()" [error]="err() && !dir()">
          <app-select [options]="dirs" [(value)]="dir" />
        </app-field>
        <app-field label="Какую проблему решает" required [filled]="!!p()" [error]="err() && !p()">
          <textarea class="fta" rows="4" placeholder="Что сейчас неудобно или работает плохо" [value]="p()" (input)="p.set(val($event))"></textarea>
        </app-field>
        <app-field label="Что предлагаете" required [filled]="!!s()" [error]="err() && !s()">
          <textarea class="fta" rows="4" placeholder="Как это исправить и какой будет результат" [value]="s()" (input)="s.set(val($event))"></textarea>
        </app-field>
        <div class="hubvis">
          <label class="ckb anon srow"><input type="checkbox" [checked]="pub()" (change)="pub.set(!pub())" /><i></i><span>Показать идею коллегам после модерации</span></label>
          <div class="fhelp">Коллеги смогут поддержать идею голосом. Без отметки идею увидят только эксперты.</div>
        </div>
      </div>
    </app-drawer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KbhubIdeaNew {
  readonly open = model(false);
  readonly created = output<void>();
  private readonly store = inject(IdeasStore);
  private readonly toast = inject(ToastService);
  protected readonly dirs = IDEA_DIRS;
  protected readonly t = signal('');
  protected readonly dir = signal('');
  protected readonly p = signal('');
  protected readonly s = signal('');
  protected readonly pub = signal(true);
  protected readonly err = signal(false);
  protected val = (e: Event) => (e.target as HTMLInputElement).value;

  protected send(): void {
    const t = this.t().trim(), p = this.p().trim(), s = this.s().trim();
    if (!t || !this.dir() || !p || !s) return this.err.set(true);
    const d = new Date(), z = (n: number) => String(n).padStart(2, '0');
    this.store.add({
      id: 'i' + Date.now(), my: true, title: t, status: 'На модерации', date: `${z(d.getDate())}.${z(d.getMonth() + 1)}.${d.getFullYear()}`,
      votes: 0, dir: this.dir(), private: !this.pub(), problem: p, solution: s,
    });
    this.open.set(false);
    this.reset();
    this.created.emit();
    this.toast.show('Готово', 'Идея отправлена на модерацию. Статус — в «Моих идеях».');
  }
  protected reset(): void {
    this.t.set(''); this.dir.set(''); this.p.set(''); this.s.set(''); this.pub.set(true); this.err.set(false);
  }
}
