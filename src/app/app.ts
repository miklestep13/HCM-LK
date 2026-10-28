import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from './core/layout/header/header';
import { DevPanel } from './core/layout/dev-panel/dev-panel';
import { LegacyHost } from './core/legacy/legacy-host/legacy-host';
import { LegacyService } from './core/legacy/legacy.service';
import { Toasts } from './shared/ui/toast/toasts';
import { Confirm } from './shared/ui/confirm/confirm';
import { AttachPreview } from './shared/ui/attach/attach-preview';
import { WalletSend } from './widgets/wallet-send/wallet-send';
import { startAvatarShape } from './core/layout/avatar-shape';

/** Оболочка приложения: шапка, контент страницы, мост к прототипу, dev-панель, уведомления */
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, DevPanel, LegacyHost, Toasts, Confirm, AttachPreview, WalletSend],
  templateUrl: './app.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly legacy = inject(LegacyService);
  constructor() {
    startAvatarShape();
  }
}
