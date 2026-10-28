import { bkGeo } from '../../../data/booking.data';
import { BkRoom } from '../../../interface/booking';

/** План этажа (SVG 1200×740): помещения, столы переговорных, столы опенспейсов, двери, окна (bkSvg прототипа) */
export function mapPlan(R: BkRoom[]): string {
  const W = 'var(--q-base-100)',
    g = bkGeo(),
    rc = (x: number, y: number, w: number, h: number, f: string, sw?: number) =>
      '<rect x="' +
      x +
      '" y="' +
      y +
      '" width="' +
      w +
      '" height="' +
      h +
      '" fill="' +
      f +
      '" stroke="' +
      W +
      '" stroke-width="' +
      (sw || 5) +
      '"/>';
  const door = (x: number, y: number, up: number) =>
    '<path d="M' +
    x +
    ' ' +
    y +
    'h36" stroke="var(--q-content-background)" stroke-width="7"/><path d="M' +
    x +
    ' ' +
    y +
    'v' +
    (up ? -34 : 34) +
    'M' +
    x +
    ' ' +
    (y + (up ? -34 : 34)) +
    'A34 34 0 0 ' +
    (up ? 1 : 0) +
    ' ' +
    (x + 34) +
    ' ' +
    y +
    '" stroke="var(--q-base-100)" stroke-width="1.3" fill="none"/>';
  let s =
    '<svg class="bkpl" viewBox="0 0 1200 740" width="1200" height="740"><rect x="5" y="5" width="1190" height="730" fill="var(--q-content-background)"/>';
  (
    [
      [480, 0, 220, 190, 'Кухня'],
      [1040, 0, 160, 190, 'Санузлы'],
      [400, 550, 220, 190, 'Лифтовой холл'],
    ] as [number, number, number, number, string][]
  ).forEach(
    (a) =>
      (s +=
        rc(a[0], a[1], a[2], a[3], 'var(--q-content-background-disabled)') +
        '<text x="' +
        (a[0] + a[2] / 2) +
        '" y="' +
        (a[1] + a[3] / 2 + 5) +
        '">' +
        a[4] +
        '</text>'),
  );
  s += rc(620, 550, 340, 190, 'var(--q-content-background-alt)');
  R.forEach((r) => {
    const k = Math.ceil(r.cap / 2),
      tw = Math.min(r.w - 70, k * 24 + 12),
      cx = r.x + r.w / 2,
      cy = r.y + r.h / 2 + 4,
      tx = cx - tw / 2;
    s +=
      rc(r.x, r.y, r.w, r.h, 'var(--q-content-background)') +
      '<rect x="' +
      tx +
      '" y="' +
      (cy - 16) +
      '" width="' +
      tw +
      '" height="32" rx="5" fill="var(--q-base-50)" stroke="var(--q-base-100)"/>';
    for (let i = 0; i < k; i++) {
      const x = tx + 6 + ((i + 0.5) * (tw - 12)) / k;
      s +=
        '<circle cx="' +
        x +
        '" cy="' +
        (cy - 25) +
        '" r="6" fill="var(--q-content-background)" stroke="var(--q-base-100)"/><circle cx="' +
        x +
        '" cy="' +
        (cy + 25) +
        '" r="6" fill="var(--q-content-background)" stroke="var(--q-base-100)"/>';
    }
  });
  g.T.forEach(
    (t) =>
      (s +=
        '<rect x="' +
        t[0] +
        '" y="' +
        t[1] +
        '" width="' +
        t[2] +
        '" height="' +
        t[3] +
        '" rx="6" fill="var(--q-base-50)" stroke="var(--q-base-100)"/>'),
  );
  s +=
    '<path d="M600 236V514" stroke="var(--q-base-100)" stroke-width="4" stroke-linecap="round"/>';
  [
    [220, 190, 1],
    [420, 190, 1],
    [780, 190, 1],
    [980, 190, 1],
    [640, 190, 1],
    [1100, 190, 1],
    [180, 550, 0],
    [340, 550, 0],
    [880, 550, 0],
    [1040, 550, 0],
    [480, 550, 0],
  ].forEach((d) => (s += door(d[0], d[1], d[2])));
  s +=
    '<text class="bkz" x="24" y="222">Опенспейс А</text><text class="bkz" x="624" y="222">Опенспейс Б</text><text class="bkz" x="636" y="578">Тихая зона</text>' +
    '<rect x="5" y="5" width="1190" height="730" fill="none" stroke="' +
    W +
    '" stroke-width="10"/>';
  [
    [30, 250],
    [310, 450],
    [510, 690],
    [730, 810],
    [870, 1010],
  ].forEach(
    (w) =>
      (s +=
        '<path d="M' +
        w[0] +
        ' 5H' +
        w[1] +
        'M' +
        w[0] +
        ' 735H' +
        w[1] +
        '" stroke="var(--q-primary-300)" stroke-width="4"/>'),
  );
  s += '<path d="M5 230V520M1195 230V520" stroke="var(--q-primary-300)" stroke-width="4"/></svg>';
  return s;
}

/** Иллюстрация переговорной для карточки в списке (bkRoomArt прототипа) */
export function roomArt(r: BkRoom): string {
  const k = Math.ceil(r.cap / 2),
    tw = 26 + k * 30,
    tx = 140 - tw / 2,
    busy = r.st !== 'free' ? (r.ppl?.length ?? 0) : 0;
  let s =
    '<svg viewBox="0 0 280 150" preserveAspectRatio="xMidYMid slice"><rect width="280" height="150" fill="var(--q-base-50)"/><rect x="14" y="14" width="252" height="122" rx="10" fill="var(--q-content-background-alt)" stroke="var(--q-base-100)"/>';
  if (r.eq.includes('ТВ'))
    s += '<rect x="254" y="48" width="6" height="54" rx="2" fill="var(--q-base-700)"/>';
  if (r.eq.includes('Доска'))
    s += '<rect x="20" y="44" width="5" height="62" rx="2" fill="var(--q-base-100)"/>';
  s +=
    '<circle cx="244" cy="120" r="9" fill="var(--q-success-100)"/><circle cx="238" cy="114" r="6" fill="var(--q-success-300)"/><rect x="' +
    tx +
    '" y="56" width="' +
    tw +
    '" height="38" rx="8" fill="var(--q-content-background)" stroke="var(--q-base-100)"/>';
  for (let i = 0; i < r.cap; i++) {
    const top = i < k,
      x = tx + 28 + (top ? i : i - k) * 30;
    s +=
      '<rect x="' +
      (x - 10) +
      '" y="' +
      (top ? 38 : 100) +
      '" width="20" height="12" rx="5" fill="' +
      (i < busy ? 'var(--q-primary-500)' : 'var(--q-primary-100)') +
      '"/>';
  }
  if (r.eq.includes('Толк'))
    s += '<ellipse cx="140" cy="75" rx="10" ry="5" fill="var(--q-base-100)"/>';
  return s + '</svg>';
}
