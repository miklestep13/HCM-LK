import { ChangeDetectionStrategy, Component, ElementRef, ViewEncapsulation, computed, effect, inject, signal, untracked } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { WalletStore } from '../../core/demo/wallet.service';
import { plural } from '../../data/org.data';
import { avCls } from '../../data/people.data';
import { COIN_SVG, fmt } from '../../data/shop.data';
import { WALLET_EMPLOYEES } from '../../data/wallet.data';
import { Drawer } from '../../shared/ui/drawer/drawer';
import { Field } from '../../shared/ui/field/field';
import { ToastService } from '../../shared/ui/toast/toast.service';
import { WalletSendService } from './wallet-send.service';

const coins = (n: number) => fmt(n) + ' ' + plural(n, 'коин', 'коина', 'коинов');

/**
 * Сайдбар «Перечислить валюту» (curSend прототипа): сотрудник (список с поиском, аватаркой и должностью), сумма, комментарий;
 * внизу — «Ваш баланс» и «Остаток». Перевод списывает коины и попадает в историю кошелька.
 */
@Component({
  selector: 'app-wallet-send',
  imports: [Drawer, Field],
  templateUrl: './wallet-send.html',
  styleUrl: './wallet-send.scss',
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 'w-wsend',
    '(document:click)': 'outside($event)',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WalletSend {
  protected readonly svc = inject(WalletSendService);
  protected readonly wallet = inject(WalletStore);
  private readonly toast = inject(ToastService);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly coin = inject(DomSanitizer).bypassSecurityTrustHtml(COIN_SVG);
  protected readonly fmt = fmt;
  protected readonly av = avCls;

  protected readonly who = signal('');
  /** сумма — только цифры */
  protected readonly amt = signal('50');
  protected readonly cm = signal('');
  protected readonly err = signal('');
  /** список сотрудников */
  protected readonly pop = signal<{ left: number; top: number; width: number } | null>(null);
  protected readonly q = signal('');

  protected readonly emp = computed(() => WALLET_EMPLOYEES.find((e) => e.name === this.who()));
  protected readonly list = computed(() => {
    const s = this.q().trim().toLowerCase();
    return WALLET_EMPLOYEES.filter((e) => !s || (e.name + ' ' + e.post).toLowerCase().includes(s));
  });
  protected readonly total = computed(() => (this.who() ? parseInt(this.amt(), 10) || 0 : 0));
  protected readonly rest = computed(() => this.wallet.balance() - this.total());

  constructor() {
    // при открытии — чистая форма (и получатель, если его передали)
    effect(() => {
      if (!this.svc.isOpen()) return;
      const to = this.svc.to();
      untracked(() => {
        this.who.set(to);
        this.amt.set('50');
        this.cm.set('');
        this.err.set('');
        this.pop.set(null);
      });
    });
  }

  protected togglePop(e: Event): void {
    e.stopPropagation();
    if (this.pop()) return this.pop.set(null);
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.q.set('');
    this.pop.set({ left: r.left, top: r.bottom + 6, width: r.width });
    setTimeout(() => this.el.querySelector<HTMLInputElement>('.cupop .fsq')?.focus());
  }
  protected pick(n: string): void {
    this.who.set(n);
    this.pop.set(null);
    this.err.set('');
  }
  protected unpick(e: Event): void {
    e.stopPropagation();
    this.who.set('');
  }
  protected outside(e: Event): void {
    if (this.pop() && !(e.target as HTMLElement).closest?.('.cupop')) this.pop.set(null);
  }
  /** разрядность «1 000 000»; курсор остается на той же цифре от конца */
  protected amtInput(e: Event): void {
    const inp = e.target as HTMLInputElement;
    const tail = inp.value.length - (inp.selectionStart ?? inp.value.length);
    const d = inp.value.replace(/\D/g, '').replace(/^0+(?=\d)/, '').slice(0, 9);
    inp.value = d ? fmt(+d) : '';
    this.amt.set(d);
    const pos = Math.max(0, inp.value.length - tail);
    inp.setSelectionRange(pos, pos);
  }
  protected send(): void {
    const n = this.who(), v = parseInt(this.amt(), 10) || 0;
    if (!n) return this.err.set('Выберите сотрудника.');
    if (!(v > 0)) return this.err.set('Укажите сумму для каждого перевода.');
    if (v > this.wallet.balance()) return this.err.set(`На балансе ${coins(this.wallet.balance())}, нужно ${coins(v)}. Уменьшите сумму.`);
    this.wallet.log('Перевод', this.cm().trim() || 'Перевод коллеге', 'Кому: ' + n, -v);
    this.svc.close();
    this.toast.show('Готово', `${n} получит ${coins(v)}.`);
  }
}
