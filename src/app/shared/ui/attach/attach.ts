import { ChangeDetectionStrategy, Component, ElementRef, booleanAttribute, inject, input, model, signal } from '@angular/core';
import { AttachFile } from '../../../interface/attach';
import { Icon } from '../icon/icon';
import { ToastService } from '../toast/toast.service';
import { AttachPreviewService } from './attach-preview.service';
import { attachKind, attachSize, todayDmy } from './attach.utils';

/**
 * Прикрепленные файлы (.attl): карточка — плитка типа, имя, «размер · кто загрузил», справа действия; клик — предпросмотр.
 *   <app-attach [files]="docs" />                    — просмотр: скопировать ссылку, скачать
 *   <app-attach edit [(files)]="docs" />             — редактирование: зона загрузки, переименовать, удалить, отмена загрузки
 * Пока файл грузится — плитка со спиннером («Загружаем…»); занятость — attachBusy(files).
 */
@Component({
  selector: 'app-attach',
  imports: [Icon],
  template: `
    @if (edit()) {
      <div class="dropz sm attdz" [class.over]="over()" (dragover)="$event.preventDefault(); over.set(true)" (dragleave)="leave($event)" (drop)="drop($event)">
        <div class="dzi"><app-icon name="upload" /></div>
        <b>Перетащите файлы сюда</b><small>PDF, DOCX, XLSX, PPTX, JPG или PNG, до 50 МБ каждый</small>
        <button class="btn raised" type="button" (click)="pick()">Выбрать файлы</button>
      </div>
    }
    <div class="attl">
      @for (f of files(); track f.id) {
        <div class="attc" [class.load]="f.st === 'load'" [attr.data-afc]="f.id" (click)="open(f, $event)">
          <span class="atti" [class]="'atti k-' + (f.st === 'load' ? 'load' : kind(f.name))"
            ><app-icon [name]="f.st === 'load' ? 'spin' : kind(f.name) === 'img' ? 'fileImg' : 'fileDoc'"
          /></span>
          @if (ren() === f.id) {
            <span class="attn"
              ><span class="attren"
                ><input class="fin" [value]="base(f.name)" (keydown.enter)="$event.preventDefault(); rename(f, $any($event.target).value)"
                  (keydown.escape)="$event.preventDefault(); $event.stopPropagation(); ren.set('')" (blur)="rename(f, $any($event.target).value)" /><em>{{ ext(f.name) }}</em></span
              ><small>Enter — сохранить, Esc — отменить</small></span
            >
          } @else {
            <span class="attn"
              ><b [title]="f.name">{{ f.name }}</b
              ><small>
                @if (f.st === 'load') {
                  <app-icon name="wand" />Загружаем…
                } @else {
                  {{ size(f.size) }}{{ f.by ? ' · ' + f.by : ' · загружен ' + f.date }}
                }
              </small></span
            >
          }
          <span class="atta">
            @if (f.st === 'load') {
              <button class="attb dg" title="Отменить загрузку" aria-label="Отменить загрузку" (click)="cancel(f, $event)"><app-icon name="close" /></button>
            } @else {
              <button class="attb" title="Скопировать ссылку" aria-label="Скопировать ссылку" (click)="$event.stopPropagation(); pv.copy(f)"><app-icon name="copy" /></button>
              @if (edit()) {
                <button class="attb" title="Переименовать" aria-label="Переименовать" (click)="startRename(f, $event)"><app-icon name="edit" /></button>
                <button class="attb" title="Удалить" aria-label="Удалить" (click)="remove(f, $event)"><app-icon name="trash" /></button>
              } @else {
                <button class="attb" title="Скачать" aria-label="Скачать" (click)="$event.stopPropagation(); pv.download(f)"><app-icon name="download" /></button>
              }
            }
          </span>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Attach {
  readonly files = model<AttachFile[]>([]);
  readonly edit = input(false, { transform: booleanAttribute });
  protected readonly pv = inject(AttachPreviewService);
  private readonly toast = inject(ToastService);
  private readonly el: HTMLElement = inject(ElementRef).nativeElement;
  protected readonly over = signal(false);
  protected readonly ren = signal('');
  protected readonly kind = attachKind;
  protected readonly size = attachSize;
  protected readonly base = (n: string) => (n.lastIndexOf('.') > 0 ? n.slice(0, n.lastIndexOf('.')) : n);
  protected readonly ext = (n: string) => (n.lastIndexOf('.') > 0 ? n.slice(n.lastIndexOf('.')) : '');

  protected open(f: AttachFile, e: Event): void {
    if (f.st === 'load' || (e.target as HTMLElement).closest('input')) return;
    this.pv.open(f);
  }
  protected pick(): void {
    const i = document.createElement('input');
    i.type = 'file';
    i.multiple = true;
    i.onchange = () => i.files && this.add(i.files);
    i.click();
  }
  protected leave(e: DragEvent): void {
    if (!(e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) this.over.set(false);
  }
  protected drop(e: DragEvent): void {
    e.preventDefault();
    this.over.set(false);
    if (e.dataTransfer?.files) this.add(e.dataTransfer.files);
  }
  /** загрузка: файл появляется сразу, через секунду-другую — готов */
  private add(list: FileList): void {
    const add: AttachFile[] = [];
    for (const file of Array.from(list)) {
      if (file.size > 50 * 1048576) {
        this.toast.show('Файл слишком большой', `«${file.name}» больше 50 МБ.`);
        continue;
      }
      const f: AttachFile = { id: 'f' + Date.now() + Math.random().toString(36).slice(2, 6), name: file.name, size: file.size, st: 'load', url: URL.createObjectURL(file) };
      add.push(f);
      setTimeout(
        () => this.files.update((l) => l.map((x) => (x.id === f.id ? { ...x, st: 'ok', date: todayDmy() } : x))),
        1400 + Math.min(2600, file.size / 2000),
      );
    }
    this.files.update((l) => [...l, ...add]);
  }
  protected cancel(f: AttachFile, e: Event): void {
    e.stopPropagation();
    this.files.update((l) => l.filter((x) => x.id !== f.id));
    this.toast.show('Загрузка отменена', `«${f.name}»`);
  }
  protected remove(f: AttachFile, e: Event): void {
    e.stopPropagation();
    this.files.update((l) => l.filter((x) => x.id !== f.id));
    this.toast.show('Файл удален', `«${f.name}»`);
  }
  protected startRename(f: AttachFile, e: Event): void {
    e.stopPropagation();
    this.ren.set(f.id);
    setTimeout(() => {
      const i = this.el.querySelector<HTMLInputElement>('.attren input');
      i?.focus();
      i?.select();
    });
  }
  protected rename(f: AttachFile, v: string): void {
    if (this.ren() !== f.id) return;
    this.ren.set('');
    const name = v.trim() + this.ext(f.name);
    if (!v.trim() || name === f.name) return;
    this.files.update((l) => l.map((x) => (x.id === f.id ? { ...x, name } : x)));
    this.toast.show('Файл переименован', `«${name}»`);
  }
}

/** файлы еще загружаются */
export const attachBusy = (l: AttachFile[]) => l.some((f) => f.st === 'load');
