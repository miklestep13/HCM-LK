import { ChangeDetectionStrategy, Component, ViewEncapsulation, inject, model, signal } from '@angular/core';
import { Icon } from '../../shared/ui/icon/icon';
import { ToastService } from '../../shared/ui/toast/toast.service';

/**
 * «Обложка» для форм (мероприятие, сообщество): одна картинка — выбор файла или перетаскивание, превью 16:9 с «Заменить» и «Удалить».
 * Новый файл заменяет прежний.   <div cover-upload [(value)]="cover"></div>   (value — data URL или null)
 */
@Component({
  selector: '[cover-upload]',
  imports: [Icon],
  template: `
    <div class="ch"><h3>Обложка</h3></div>
    <div class="cb">
      @if (value(); as src) {
        <div class="nncovw">
          <div class="nncovp" [class.over]="over()" (dragover)="drag($event, true)" (dragleave)="over.set(false)" (drop)="drop($event)">
            <img [src]="src" alt="" />
            <div class="nncova">
              <button class="ib3" title="Заменить обложку" aria-label="Заменить обложку" (click)="pick()"><app-icon name="upload" /></button>
              <button class="ib3 nncovrm" title="Удалить обложку" aria-label="Удалить обложку" (click)="value.set(null)"><app-icon name="trash" /></button>
            </div>
          </div>
          @if (name()) {
            <div class="nncovm"><b>{{ name() }}</b></div>
          }
        </div>
      } @else {
        <div class="dropz sm" [class.over]="over()" (dragover)="drag($event, true)" (dragleave)="over.set(false)" (drop)="drop($event)">
          <div class="dzi"><app-icon name="upload" /></div>
          <b>Перетащите изображение сюда</b>
          <small>JPG или PNG, рекомендуемый размер 1280×720</small>
          <button class="btn raised" (click)="pick()">Выбрать файл</button>
        </div>
      }
    </div>
  `,
  styleUrl: './cover-upload.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'c mb w-cover' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CoverUpload {
  readonly value = model<string | null>(null);
  private readonly toast = inject(ToastService);
  protected readonly over = signal(false);
  protected readonly name = signal('');

  protected pick(): void {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = 'image/*';
    i.onchange = () => i.files?.[0] && this.read(i.files[0]);
    i.click();
  }
  protected drag(e: DragEvent, on: boolean): void {
    e.preventDefault();
    this.over.set(on);
  }
  protected drop(e: DragEvent): void {
    e.preventDefault();
    this.over.set(false);
    const f = e.dataTransfer?.files[0];
    if (f) this.read(f);
  }
  private read(f: File): void {
    if (!/^image\//.test(f.type)) return this.toast.show('Не тот формат', 'Для обложки подойдет изображение JPG или PNG.');
    const r = new FileReader();
    r.onload = () => {
      this.name.set(f.name);
      this.value.set(String(r.result));
    };
    r.readAsDataURL(f);
  }
}
