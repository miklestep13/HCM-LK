import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { Card } from '../../../shared/ui/card/card';
import { KvRow } from '../../../shared/ui/kv-row/kv-row';
import { PROFILE } from '../../../data/home.data';

/** Блок «Профиль»: фото, ФИО, должность и реквизиты сотрудника */
@Component({
  selector: 'app-home-profile',
  imports: [Card, KvRow],
  templateUrl: './home-profile.html',
  styleUrl: './home-profile.scss',
  encapsulation: ViewEncapsulation.None,
  host: { class: 'hm-profile' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeProfile {
  protected readonly p = PROFILE;
}
