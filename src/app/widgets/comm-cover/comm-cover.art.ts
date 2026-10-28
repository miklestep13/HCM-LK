import { Community } from '../../interface/comm';

/** фон и акцент обложки по категории (токены палитры) */
const COVER_BG: Record<string, [string, string]> = {
  sport: ['var(--q-success-50)', 'var(--q-success-300)'],
  hobby: ['var(--q-warning-50)', 'var(--q-warning-500)'],
  prof: ['var(--q-primary-50)', 'var(--q-primary-500)'],
  lang: ['var(--q-badge-violet-bg)', 'var(--q-badge-violet-color)'],
  vol: ['var(--q-error-50)', 'var(--q-extra-300)'],
};

/**
 * Иллюстрация-обложка сообщества (SVG, как cmCover в прототипе).
 * v: 'card' — карточка в списке, 'wide' — шапка страницы сообщества, 'post' — новость сообщества.
 * У сообщества, созданного через форму, своей иллюстрации нет — остается фон категории.
 */
export function commCover(
  c: Pick<Community, 'id' | 'cat'>,
  v: 'card' | 'wide' | 'post' = 'card',
): string {
  const [bg, ac] = COVER_BG[c.cat],
    B = '#3B82F6',
    L = '#93C5FD',
    W = '#fff';
  const ART: Record<string, string> = {
    run:
      '<path d="M60 128c60-30 140-30 200 0" stroke="' +
      L +
      '" stroke-width="10" fill="none"/><path d="M40 146c70-36 170-36 240 0" stroke="' +
      ac +
      '" stroke-width="8" fill="none"/><path d="M190 40v56" stroke="#3A4A61" stroke-width="4"/><path d="M192 40h40l-8 10 8 10h-40z" fill="' +
      B +
      '"/><circle cx="120" cy="70" r="16" fill="' +
      ac +
      '" opacity=".25"/>',
    games:
      '<rect x="96" y="44" width="58" height="58" rx="12" fill="' +
      W +
      '" stroke="' +
      L +
      '" stroke-width="3" transform="rotate(-12 125 73)"/><rect x="166" y="58" width="58" height="58" rx="12" fill="' +
      B +
      '" transform="rotate(10 195 87)"/><g fill="' +
      ac +
      '"><circle cx="112" cy="62" r="5"/><circle cx="126" cy="74" r="5"/><circle cx="140" cy="86" r="5"/></g><g fill="#fff"><circle cx="182" cy="76" r="5"/><circle cx="206" cy="80" r="5"/><circle cx="180" cy="98" r="5"/><circle cx="204" cy="102" r="5"/></g>',
    fe:
      '<rect x="80" y="36" width="160" height="96" rx="10" fill="' +
      W +
      '" stroke="#D5DFEE" stroke-width="2"/><path d="M80 54h160" stroke="#D5DFEE" stroke-width="2"/><g fill="' +
      L +
      '"><circle cx="92" cy="45" r="3"/><circle cx="102" cy="45" r="3"/><circle cx="112" cy="45" r="3"/></g><path d="m138 76-16 14 16 14M182 76l16 14-16 14M168 70l-16 40" stroke="' +
      B +
      '" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
    ux:
      '<path d="M70 120C110 40 190 140 250 56" stroke="' +
      L +
      '" stroke-width="4" fill="none"/><rect x="64" y="114" width="12" height="12" rx="2" fill="' +
      W +
      '" stroke="' +
      B +
      '" stroke-width="3"/><rect x="244" y="50" width="12" height="12" rx="2" fill="' +
      W +
      '" stroke="' +
      B +
      '" stroke-width="3"/><path d="m160 50 26 44-26 30-26-30z" fill="' +
      B +
      '"/><circle cx="160" cy="92" r="7" fill="#fff"/><path d="M160 50v35" stroke="#fff" stroke-width="3"/>',
    eng:
      '<rect x="70" y="42" width="110" height="60" rx="16" fill="' +
      ac +
      '"/><path d="m96 102-8 18 26-18z" fill="' +
      ac +
      '"/><text x="125" y="81" text-anchor="middle" font-family="Open Sans,Segoe UI,system-ui,sans-serif" font-size="20" font-weight="600" fill="#fff">Hi!</text><rect x="150" y="76" width="104" height="54" rx="16" fill="' +
      W +
      '" stroke="#CFE1FD" stroke-width="2"/><text x="202" y="110" text-anchor="middle" font-family="Open Sans,Segoe UI,system-ui,sans-serif" font-size="16" font-weight="600" fill="' +
      ac +
      '">Привет</text>',
    kind:
      '<path d="M160 128s-52-30-52-64a26 26 0 0 1 52-8 26 26 0 0 1 52 8c0 34-52 64-52 64Z" fill="' +
      ac +
      '"/><path d="M160 66v34M143 83h34" stroke="#fff" stroke-width="8" stroke-linecap="round"/><circle cx="92" cy="50" r="8" fill="' +
      ac +
      '" opacity=".3"/><circle cx="236" cy="112" r="10" fill="' +
      ac +
      '" opacity=".25"/>',
    books:
      '<rect x="96" y="104" width="130" height="22" rx="4" fill="' +
      B +
      '"/><rect x="108" y="82" width="112" height="22" rx="4" fill="' +
      ac +
      '"/><rect x="100" y="60" width="120" height="22" rx="4" fill="' +
      L +
      '"/><path d="M200 60v22M206 82v22M112 104v22" stroke="#fff" stroke-width="3" opacity=".7"/><path d="M218 34l10 26-10-6-10 6z" fill="' +
      ac +
      '"/>',
    chess:
      '<g>' +
      [0, 1, 2, 3, 4, 5]
        .map((i) =>
          [0, 1, 2]
            .map(
              (j) =>
                '<rect x="' +
                (80 + i * 26) +
                '" y="' +
                (92 + j * 18) +
                '" width="26" height="18" fill="' +
                ((i + j) % 2 ? L : W) +
                '"/>',
            )
            .join(''),
        )
        .join('') +
      '</g><circle cx="200" cy="52" r="12" fill="#3A4A61"/><path d="M190 66h20l6 26h-32z" fill="#3A4A61"/><rect x="180" y="90" width="40" height="8" rx="3" fill="#3A4A61"/>',
    bike:
      '<circle cx="112" cy="102" r="30" stroke="' +
      B +
      '" stroke-width="7" fill="none"/><circle cx="212" cy="102" r="30" stroke="' +
      B +
      '" stroke-width="7" fill="none"/><path d="M112 102l32-44h44l24 44M144 58l24 44 20-44M136 50h20M186 50h16" stroke="' +
      ac +
      '" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>',
  };
  const art =
    ART[c.id] ??
    ''; /* у сообщества, созданного через форму, своей иллюстрации нет — остается фон категории */
  const vb =
    v === 'wide' ? [-440, -4, 1200, 168] : v === 'post' ? [-80, -8, 480, 172] : [-40, 0, 400, 160];
  return (
    '<svg viewBox="' +
    vb.join(' ') +
    '" preserveAspectRatio="xMidYMid slice"><rect x="' +
    vb[0] +
    '" y="' +
    vb[1] +
    '" width="' +
    vb[2] +
    '" height="' +
    vb[3] +
    '" fill="' +
    bg +
    '"/><circle cx="286" cy="22" r="46" fill="#fff" opacity=".5"/><circle cx="26" cy="150" r="38" fill="#fff" opacity=".45"/>' +
    art +
    '</svg>'
  );
}
