import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { Icon } from '../icon/icon';
import { AttachPreviewService } from './attach-preview.service';
import { attachSize } from './attach.utils';

/**
 * Предпросмотр документа на весь экран: PDF и изображения — просмотр (демо-PDF без содержимого — макет страницы),
 * остальные форматы — сообщение и кнопки «Скачать» / «Скопировать ссылку». Стоит в app.html.
 */
@Component({
  selector: 'app-attach-preview',
  imports: [Icon],
  template: `
    @if (svc.file(); as f) {
      <div class="atpv">
        <div class="atpvt">
          <span class="atpvi" [class.bl]="ext() !== 'pdf'"><app-icon [name]="img() ? 'fileImg' : 'fileDoc'" /></span>
          <div class="atpvn">
            <b>{{ f.name }}</b><small>{{ size(f.size) }}@if (f.by) { · {{ f.by }}}</small>
          </div>
          <div class="atpva">
            <button class="btn raised atpvb" (click)="svc.copy(f)"><app-icon name="copy" />Скопировать ссылку</button>
            <button class="btn raised atpvb" (click)="svc.download(f)"><app-icon name="download" />Скачать</button>
            <button class="atpvx" title="Закрыть" aria-label="Закрыть" (click)="svc.close()"><app-icon name="closeSm" /></button>
          </div>
        </div>
        <div class="atpvb" (click)="$event.target === $event.currentTarget ? svc.close() : null">
          @if (ok()) {
            @if (f.url) {
              @if (img()) {
                <img class="atpvimg" [src]="f.url" alt="" />
              } @else {
                <iframe class="atpvfr" [src]="safeUrl()"></iframe>
              }
            } @else if (img()) {
              <div class="atpvph"><app-icon name="fileImg" /></div>
            } @else {
              <div class="atpvpg">
                <div class="atpvh"><b>АО «Меридиан Банк»</b><span>{{ f.date || '' }}</span></div>
                <h2>{{ base() }}</h2>
                @for (t of mock; track $index) {
                  <p>{{ t }}</p>
                }
                <div class="atpvln"></div>
                <div class="atpvln s"></div>
                <div class="atpvln"></div>
                <div class="atpvsg"><span>Председатель комиссии</span><span>Крылов М. П.</span></div>
              </div>
            }
          } @else {
            <div class="atpvno">
              <span class="atpvi"><app-icon name="fileDoc" /></span><b>Предпросмотр недоступен</b>
              <p>Файлы формата {{ ext().toUpperCase() }} нельзя открыть в браузере. Скачайте документ или скопируйте ссылку на него.</p>
              <div class="atpvnb">
                <button class="btn raised atpvb" (click)="svc.download(f)"><app-icon name="download" />Скачать</button>
                <button class="btn raised atpvb" (click)="svc.copy(f)"><app-icon name="copy" />Скопировать ссылку</button>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  host: { '(document:keydown.escape)': 'svc.close()' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AttachPreview {
  protected readonly svc = inject(AttachPreviewService);
  private readonly san = inject(DomSanitizer);
  protected readonly size = attachSize;
  protected readonly ext = computed(() => (this.svc.file()?.name.split('.').pop() || '').toLowerCase());
  protected readonly img = computed(() => ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(this.ext()));
  protected readonly ok = computed(() => this.img() || this.ext() === 'pdf');
  protected readonly base = computed(() => (this.svc.file()?.name || '').replace(/\.[^.]+$/, ''));
  protected readonly safeUrl = computed(() => this.san.bypassSecurityTrustResourceUrl(this.svc.file()?.url || ''));
  /** текст макета страницы демо-PDF */
  protected readonly mock = [
    'Аттестуемый: Иванов Павел Сергеевич, кредитный специалист (старший).',
    'Период аттестационной кампании: 01.09.2026 – 30.09.2026.',
    'Комиссия рассмотрела результаты оценок, цели периода и выполнение ИПР. Решение принято единогласно.',
    'Рекомендации: продолжить развитие компетенций по коммуникации с клиентом и управлению сроками.',
  ];
  constructor() {
    // пока открыт предпросмотр — страница не прокручивается
    effect(() => (document.body.style.overflow = this.svc.file() ? 'hidden' : ''));
  }
}
