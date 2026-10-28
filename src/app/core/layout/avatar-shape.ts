/**
 * Аватары — скругленный квадрат, радиус зависит от размера (правило прототипа от 21.10.2026):
 * до 20px — 4, до 28 — 6, до 32 — 8, до 44 — 10, больше — 12. Круглых аватаров нет.
 * Размер известен только после отрисовки, поэтому радиус ставится наблюдателем за DOM (как avShape в прототипе).
 */
const AV_SEL = '.av,.astav,.npav,.avme,.avimg,.avs .more,.ogav,.tkppl img,.me>img';

export function startAvatarShape(): void {
  let queued = false;
  const run = () => {
    queued = false;
    document.querySelectorAll<HTMLElement>(AV_SEL).forEach((el) => {
      const w = el.offsetWidth;
      if (!w) return;
      const r = w <= 20 ? '4px' : w <= 28 ? '6px' : w <= 32 ? '8px' : w <= 44 ? '10px' : '12px';
      if (el.style.borderRadius !== r) el.style.borderRadius = r;
    });
  };
  new MutationObserver(() => {
    if (!queued) { queued = true; requestAnimationFrame(run); }
  }).observe(document.documentElement, { childList: true, subtree: true });
  run();
}
