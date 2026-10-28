import { Injectable, inject, signal } from '@angular/core';
import { AttachFile } from '../../../interface/attach';
import { ToastService } from '../toast/toast.service';

/**
 * Файлы: предпросмотр на весь экран (окно рисует <app-attach-preview /> в корне приложения), копирование ссылки, скачивание.
 *   inject(AttachPreviewService).open(file)
 */
@Injectable({ providedIn: 'root' })
export class AttachPreviewService {
  private readonly toast = inject(ToastService);
  readonly file = signal<AttachFile | null>(null);

  open(f: AttachFile): void {
    this.file.set(f);
  }
  close(): void {
    this.file.set(null);
  }
  /** ссылка на файл (условный адрес хранилища) */
  copy(f: AttachFile): void {
    const u = 'https://hcm.meridianbank.ru/files/' + f.id + '/' + encodeURIComponent(f.name);
    try {
      navigator.clipboard?.writeText(u).catch(() => {});
    } catch {
      /* буфер обмена недоступен */
    }
    this.toast.show('Ссылка скопирована', `«${f.name}» — ссылку можно вставить в чат или письмо.`);
  }
  download(f: AttachFile): void {
    if (!f.url) return this.toast.show('Скачивание', `«${f.name}» скачается на компьютер.`);
    const a = document.createElement('a');
    a.href = f.url;
    a.download = f.name;
    a.click();
  }
}
