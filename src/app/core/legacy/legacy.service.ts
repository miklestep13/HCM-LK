import { Injectable, NgZone, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ANGULAR_PAGES } from '../navigation/pages';

/**
 * Мост к старому прототипу (public/legacy/index.html).
 * Непереведенные страницы показываются в одном iframe, который живет всю сессию (не перезагружается при переходах).
 * Протокол сообщений:
 *   Angular → прототип: { type: 'hcm:go', page, attrs }       — открыть страницу прототипа
 *   прототип → Angular: { type: 'hcm:ready' }                  — прототип загрузился
 *                       { type: 'hcm:at', page }               — прототип сам перешел на страницу (синхронизируем адрес)
 *                       { type: 'hcm:nav', page }              — переход на страницу, которая уже есть в Angular
 * Общие данные (share): к 'hcm:go' добавляется state — данные Angular, которые нужны странице прототипа (например, цели карты),
 * к 'hcm:nav' прототип добавляет state со своими изменениями — Angular забирает их обратно.
 */
@Injectable({ providedIn: 'root' })
export class LegacyService {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  /** iframe создан (грузим прототип только при первом заходе на непереведенную страницу) */
  readonly started = signal(false);
  readonly active = signal(false);
  private frame?: HTMLIFrameElement;
  private ready = false;
  private pending: { page: string; attrs?: Record<string, string> } | null = null;
  private current = '';
  /** общие с прототипом данные: ключ → как взять и как применить */
  private readonly shared = new Map<string, { get: () => unknown; set: (v: any) => void }>();

  /** адрес прототипа: embed — режим встраивания, ng — страницы, которые открывает Angular */
  readonly src = 'legacy/index.html?embed=1&ng=' + Object.keys(ANGULAR_PAGES).join(',');

  constructor() {
    window.addEventListener('message', (e) => {
      const d = e.data || {};
      if (typeof d.type !== 'string' || !d.type.startsWith('hcm:')) return;
      this.zone.run(() => {
        if (d.type === 'hcm:ready') {
          this.ready = true;
          if (this.pending) {
            this.post(this.pending.page, this.pending.attrs);
            this.pending = null;
          }
        }
        if (d.type === 'hcm:at' && d.page && d.page !== this.current) {
          this.current = d.page;
          this.router.navigate(['/legacy', d.page], { state: { fromLegacy: true } });
        }
        if ((d.type === 'hcm:nav' || d.type === 'hcm:state') && d.state) this.apply(d.state);
        if (d.type === 'hcm:nav' && d.page) {
          const r = ANGULAR_PAGES[d.page];
          if (r) this.router.navigateByUrl(r);
        }
      });
    });
  }

  /** поделиться данными с прототипом: get — что отправить, set — как принять изменения */
  share(key: string, io: { get: () => unknown; set: (v: any) => void }): void {
    this.shared.set(key, io);
    // прототип мог прислать данные раньше, чем их владелец появился в Angular
    if (this.early.has(key)) {
      io.set(this.early.get(key));
      this.early.delete(key);
    }
  }
  private readonly early = new Map<string, unknown>();
  private apply(state: Record<string, unknown>): void {
    for (const [k, v] of Object.entries(state)) {
      const io = this.shared.get(k);
      io ? io.set(v) : this.early.set(k, v);
    }
  }
  private state(): Record<string, unknown> {
    const s: Record<string, unknown> = {};
    this.shared.forEach((io, k) => (s[k] = JSON.parse(JSON.stringify(io.get()))));
    return s;
  }

  attach(frame: HTMLIFrameElement): void {
    this.frame = frame;
  }

  /** открыть страницу прототипа */
  open(page: string, attrs?: Record<string, string>, fromLegacy = false): void {
    this.started.set(true);
    this.active.set(true);
    if (fromLegacy) return;
    if (page === this.current && !attrs) {
      // та же страница прототипа: обновим общие данные (могли поменяться в Angular)
      if (this.ready) this.frame?.contentWindow?.postMessage({ type: 'hcm:state', state: this.state() }, '*');
      return;
    }
    this.current = page;
    if (!this.ready) {
      this.pending = { page, attrs };
      return;
    }
    this.post(page, attrs);
  }

  hide(): void {
    // уходим со страницы прототипа (например, через меню Angular) — заберем изменения общих данных
    if (this.active() && this.ready) this.frame?.contentWindow?.postMessage({ type: 'hcm:pull' }, '*');
    this.active.set(false);
  }

  private post(page: string, attrs?: Record<string, string>): void {
    this.frame?.contentWindow?.postMessage({ type: 'hcm:go', page, attrs: attrs ?? null, state: this.state() }, '*');
  }
}
