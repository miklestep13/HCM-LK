import { signal } from '@angular/core';

/** Сборка «только карьерные треки»: в адресе export=career. Обычный прототип этот флаг не ставит. */
export const careerPack = signal(/[?&]export=career\b/.test(location.href));
