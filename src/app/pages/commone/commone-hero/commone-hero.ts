import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, inject } from '@angular/core';
import { COMM_CATS, commRate } from '../../../data/comm.data';
import { Clamp } from '../../../shared/ui/clamp/clamp';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { CommCover } from '../../../widgets/comm-cover/comm-cover';
import { CommoneState } from '../commone.state';

/** Шапка сообщества (как у курса): обложка, название и категория, дата создания и место, описание (длинное обрезается по высоте обложки — «Читать все»), вступление, оценки. */
@Component({
  selector: '[commone-hero]',
  imports: [CommCover, Clamp],
  template: `
    @if (s.c(); as c) {
      <div class="cb crshd">
        <div class="crsimg" app-comm-cover [comm]="c"></div>
        <div class="crsinfo">
          <h2>{{ c.name }}</h2>
          <small class="cmhct">{{ cats[c.cat] }}</small>
          <div class="cmeta2 crsm">
            <span title="Дата создания"
              ><svg viewBox="0 0 16 16" fill="none">
                <rect x="2" y="3.4" width="12" height="10.4" rx="2" stroke="currentColor" stroke-width="1.4" />
                <path d="M5.2 1.8v2.6M10.8 1.8v2.6M2 6.6h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg
              >{{ c.created }}</span
            >
          </div>
          @if (c.aboutHtml) {
            <div class="abt crsab" [appClamp]="c.aboutHtml" [innerHTML]="c.aboutHtml"></div>
          } @else {
            <div class="abt crsab" [appClamp]="c.short"><p>{{ c.short }}</p></div>
          }
          <div class="crsbtn">
            @if (c.joined) {
              <button class="btn raised cmj on" (click)="join()">
                <svg viewBox="0 0 16 16" fill="none"><path d="m3.4 8.4 3 3 6.2-6.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" /></svg>Вы участник
              </button>
            } @else if (c.sent) {
              <button class="btn raised cmj" disabled>Заявка отправлена</button>
            } @else {
              <button class="btn pri cmj" (click)="join()">{{ c.byRequest ? 'Подать заявку' : 'Присоединиться' }}</button>
            }
            <div class="npf crsf">
              <button class="npb" [class.on]="my() === 1" title="Нравится" (click)="s.store.vote(c.id, 1)">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M6.4 17.2V8.6l3.8-5.4c.9-.2 1.7.4 1.7 1.3v3.3h3.6a1.6 1.6 0 0 1 1.6 1.9l-.9 5.2a1.9 1.9 0 0 1-1.9 1.6H6.4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  <rect x="2.4" y="8.6" width="4" height="8.6" rx="1.2" stroke="currentColor" stroke-width="1.5" /></svg
                ><span>{{ rate()[0] }}</span>
              </button>
              <button class="npb" [class.on]="my() === -1" title="Не нравится" (click)="s.store.vote(c.id, -1)">
                <svg viewBox="0 0 20 20" fill="none">
                  <path d="M6.4 2.8v8.6l3.8 5.4c.9.2 1.7-.4 1.7-1.3v-3.3h3.6a1.6 1.6 0 0 0 1.6-1.9l-.9-5.2a1.9 1.9 0 0 0-1.9-1.6H6.4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
                  <rect x="2.4" y="2.8" width="4" height="8.6" rx="1.2" stroke="currentColor" stroke-width="1.5" /></svg
                ><span>{{ rate()[1] }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c crsv cmhero' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommoneHero {
  protected readonly s = inject(CommoneState);
  private readonly toast = inject(ToastService);
  protected readonly cats = COMM_CATS;
  protected readonly my = computed(() => this.s.store.rate()[this.s.id()] || 0);
  protected readonly rate = computed(() => commRate(this.s.c()!, this.my()));

  protected join(): void {
    const [t, m] = this.s.store.join(this.s.id());
    this.toast.show(t, m);
  }
}
