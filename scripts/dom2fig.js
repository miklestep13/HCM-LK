// Сериализация видимой страницы в компактный список примитивов для сборки макета в Figma (scripts/dom2fig.js).
// В браузере: dom2fig(root, { skip }) → { w, h, st: [стили], ic: [svg], n: [узлы] }.
// Узел: [тип, x, y, w, h, ...] — 'b' блок (фон/рамка/скругление/тень, имя — первый класс), 't' текст, 'i' иконка (svg), 'p' фото.
window.dom2fig = function (root, opt = {}) {
  const R1 = root.getBoundingClientRect();
  // корень — не ниже окна и всей прокрутки (на странице старого прототипа body ниже шапки пустой)
  const isDoc = root === document.body || root === document.documentElement;
  const H0 = isDoc ? Math.max(R1.height, innerHeight, document.documentElement.scrollHeight) : R1.height;
  const R0 = { left: R1.left, top: R1.top, width: R1.width, height: H0, right: R1.right, bottom: R1.top + H0 };
  const st = [], stIx = new Map(), ic = [], icIx = new Map(), out = [];
  const S = (o) => { const k = JSON.stringify(o); if (!stIx.has(k)) { stIx.set(k, st.length); st.push(o); } return stIx.get(k); };
  const I = (svg) => { if (!icIx.has(svg)) { icIx.set(svg, ic.length); ic.push(svg); } return icIx.get(svg); };
  const col = (c) => {
    const m = /rgba?\(([^)]+)\)/.exec(c || ''); if (!m) return null;
    const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number); if (+a === 0) return null;
    return '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('') + (+a < 1 ? Math.round(+a * 100).toString(16).padStart(2, '0') : '');
  };
  const rx = (r0) => { const r = cut(r0); return [Math.round(r.left - R0.left), Math.round(r.top - R0.top), Math.round(r.width), Math.round(r.height)]; };
  const vis = (el, cs) => cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.02;
  let OX = 0, OY = 0; // сдвиг для содержимого iframe (страницы старого прототипа)
  const B = (q) => ({ left: q.left + OX, top: q.top + OY, right: q.right + OX, bottom: q.bottom + OY, width: q.width, height: q.height });
  let CL = { left: R0.left, top: R0.top, right: R0.right, bottom: R0.bottom };
  const clipOk = (r) => r.width > 0.5 && r.height > 0.5 && r.bottom > CL.top + 0.5 && r.top < CL.bottom - 0.5 && r.right > CL.left + 0.5 && r.left < CL.right - 0.5;
  // прямоугольник, обрезанный рамками с overflow: hidden
  const cut = (r) => { const left = Math.max(r.left, CL.left), top = Math.max(r.top, CL.top), right = Math.min(r.right, CL.right), bottom = Math.min(r.bottom, CL.bottom); return { left, top, right, bottom, width: right - left, height: bottom - top, cutW: right - left < r.width - 1, cutH: bottom - top < r.height - 1 }; };
  const walk = (el, op) => {
    if (opt.skip && el.matches && el.matches(opt.skip)) return;
    const cs = getComputedStyle(el); if (!vis(el, cs)) return;
    const o = op * (+cs.opacity || 1);
    const r = B(el.getBoundingClientRect());
    const tag = el.tagName;
    if (tag === 'svg' || tag === 'SVG') {
      if (clipOk(r)) { const cl = el.cloneNode(true); cl.setAttribute('width', Math.round(r.width)); cl.setAttribute('height', Math.round(r.height));
        let s = cl.outerHTML.replace(/currentColor/g, col(cs.color) || '#000').replace(/var\(--[^)]+\)/g, col(cs.color) || '#000').replace(/\s(class|_ngcontent[^=]*|_nghost[^=]*)="[^"]*"/g, '').replace(/<!--[\s\S]*?-->/g, '');
        let M = new DOMMatrix(); for (let e = el, k = 0; e && k < 4; e = e.parentElement, k++) { const tr = getComputedStyle(e).transform; if (tr && tr !== 'none') M = new DOMMatrix(tr).multiply(M); }
        const tf = Math.abs(M.a - 1) + Math.abs(M.b) + Math.abs(M.c) + Math.abs(M.d - 1) > 0.01 ? [M.a, M.b, M.c, M.d].map((v) => +v.toFixed(3)) : 0;
        out.push(tf ? ['i', ...rx(r), I(s), tf] : ['i', ...rx(r), I(s)]); }
      return;
    }
    if (tag === 'IFRAME') { let d = null; try { d = el.contentDocument; } catch (e) {} if (d && d.body) { const ox = OX, oy = OY; OX = r.left - R0.left + R0.left + (parseFloat(cs.borderLeftWidth) || 0); OY = r.top + (parseFloat(cs.borderTopWidth) || 0); walk(d.body, op); OX = ox; OY = oy; } return; }
    if (tag === 'IMG') { if (clipOk(r)) out.push(['p', ...rx(r), +parseFloat(cs.borderTopLeftRadius) || 0, el.getAttribute('src') || '']); return; }
    if (clipOk(r)) {
      const bg = col(cs.backgroundColor), img = cs.backgroundImage && cs.backgroundImage !== 'none' ? cs.backgroundImage : '';
      const bw = parseFloat(cs.borderTopWidth) || 0, bl = parseFloat(cs.borderLeftWidth) || 0, bb = parseFloat(cs.borderBottomWidth) || 0, brw = parseFloat(cs.borderRightWidth) || 0;
      const bc = col(cs.borderTopColor) || col(cs.borderLeftColor) || col(cs.borderBottomColor);
      const sides = [bw, brw, bb, bl];
      const hasB = sides.some((x) => x > 0) && (col(cs.borderTopColor) || col(cs.borderLeftColor) || col(cs.borderBottomColor) || col(cs.borderRightColor));
      const sh = cs.boxShadow !== 'none' ? cs.boxShadow : '';
      if (bg || hasB || sh || /url\(/.test(img) || /gradient/.test(img)) {
        const b = {};
        if (bg) b.f = bg;
        if (/gradient/.test(img)) { b.g = img.slice(0, 400); const bs = cs.backgroundSize.split(' ')[0]; const m = /([\d.]+)(%|px)/.exec(bs); if (m && bs !== 'auto' && cs.backgroundRepeat !== 'no-repeat') { const tw = m[2] === '%' ? r.width * +m[1] / 100 : +m[1]; if (tw > 2 && tw < r.width - 1) b.tw = +tw.toFixed(2); } }
        if (/url\(/.test(img)) b.u = /url\("?([^")]+)"?\)/.exec(img)[1];
        const rad = parseFloat(cs.borderTopLeftRadius) || 0; if (rad) b.r = Math.min(rad, r.height / 2, r.width / 2);
        if (hasB) { b.s = [col(cs.borderTopColor), col(cs.borderRightColor), col(cs.borderBottomColor), col(cs.borderLeftColor)]; b.sw = sides; if (cs.borderTopStyle === 'dashed' || cs.borderLeftStyle === 'dashed') b.d = 1; if (cs.borderTopStyle === 'dotted' || cs.borderLeftStyle === 'dotted') b.d = 2; }
        if (sh) b.sh = sh.slice(0, 120);
        out.push(['b', ...rx(r), S(b), +o.toFixed(2), (typeof el.className === 'string' && el.className.trim().split(/\s+/)[0]) || el.tagName.toLowerCase(), Math.round(Math.max(0, CL.top - r.top))]);
      }
    }
    const pseudo = (pp) => { const ps = getComputedStyle(el, pp); if (!ps.content || ps.content === 'none' || ps.display === 'none' || ps.position !== 'absolute') return;
      const w = parseFloat(ps.width) || 0, h = parseFloat(ps.height) || 0; if (w < 1 || h < 1) return;
      const bl0 = parseFloat(cs.borderLeftWidth) || 0, bt0 = parseFloat(cs.borderTopWidth) || 0, br0 = parseFloat(cs.borderRightWidth) || 0, bb0 = parseFloat(cs.borderBottomWidth) || 0;
      const L = ps.left !== 'auto' ? r.left + bl0 + parseFloat(ps.left) : r.right - br0 - parseFloat(ps.right) - w;
      const Tp = ps.top !== 'auto' ? r.top + bt0 + parseFloat(ps.top) : r.bottom - bb0 - parseFloat(ps.bottom) - h;
      let M = ps.transform && ps.transform !== 'none' ? new DOMMatrix(ps.transform) : null;
      const pr = { left: L + (M ? M.e : 0), top: Tp + (M ? M.f : 0), width: w, height: h }; pr.right = pr.left + w; pr.bottom = pr.top + h; if (!clipOk(pr)) return;
      const b = {}; const bg = col(ps.backgroundColor); if (bg) b.f = bg; const rad = parseFloat(ps.borderTopLeftRadius) || 0; if (rad) b.r = Math.min(rad, w / 2, h / 2);
      const sw = parseFloat(ps.borderTopWidth) || 0, sc = col(ps.borderTopColor); if (sw && sc) { b.s = [sc, sc, sc, sc]; b.sw = [sw, sw, sw, sw]; }
      if (ps.boxShadow !== 'none') b.sh = ps.boxShadow.slice(0, 120);
      if (!b.f && !b.s && !b.sh) return;
      out.push(['b', ...rx(pr), S(b), +o.toFixed(2), ((typeof el.className === 'string' && el.className.trim().split(/\s+/)[0]) || el.tagName.toLowerCase()) + pp]); };
    pseudo('::before');
    const ov = cs.overflowX !== 'visible' || cs.overflowY !== 'visible', prev = CL;
    if (ov && tag !== 'BODY' && tag !== 'HTML') CL = cut(r);
    const over = el.scrollWidth > el.clientWidth + 1 || el.scrollHeight > el.clientHeight + 1;
    // текст: прямые текстовые узлы элемента
    for (const ch of el.childNodes) {
      if (ch.nodeType !== 3) continue;
      const t = ch.textContent.replace(/\s+/g, ' ');
      if (!t.trim()) continue;
      // прямоугольник — только по видимым символам: без начальных и конечных пробелов (иначе текст после числа «прилипает»)
      const raw = ch.textContent, i0 = raw.search(/\S/), i1 = raw.length - (raw.match(/\s*$/)[0].length);
      const rg = document.createRange(); rg.setStart(ch, i0); rg.setEnd(ch, i1); const tr = B(rg.getBoundingClientRect()); if (!clipOk(tr)) continue;
      const lines = rg.getClientRects().length;
      const ct = cut(tr); if (ct.cutH && ct.height < parseFloat(cs.fontSize)) continue;
      const tf = S({ fs: Math.round(parseFloat(cs.fontSize)), lh: Math.round(parseFloat(cs.lineHeight)) || 0, fw: +cs.fontWeight >= 600 ? 600 : +cs.fontWeight >= 500 ? 500 : 400, c: col(cs.color) || '#000', ta: cs.textAlign === 'center' ? 'c' : cs.textAlign === 'right' || cs.textAlign === 'end' ? 'r' : '', td: cs.textDecorationLine === 'underline' ? 1 : 0, el: (cs.textOverflow === 'ellipsis' && over) || ct.cutW || ct.cutH ? 1 : 0 });
      out.push(['t', ...rx(tr), tf, t.trim(), lines > 1 && !ct.cutH ? 1 : 0]);
    }
    // поля ввода: значение или плейсхолдер
    if ((tag === 'INPUT' || tag === 'TEXTAREA') && clipOk(r)) {
      const v = el.value || el.getAttribute('placeholder') || '';
      const phHidden = !el.value && !col(getComputedStyle(el, '::placeholder').color);
      if (v && !phHidden && !(el.type === 'date' && !el.value)) { const pl = parseFloat(cs.paddingLeft) || 0, pt = parseFloat(cs.paddingTop) || 0, pb = parseFloat(cs.paddingBottom) || 0;
        const ph = !el.value; const pcs = ph ? getComputedStyle(el, '::placeholder') : cs;
        const tf = S({ fs: Math.round(parseFloat(cs.fontSize)), lh: Math.round(parseFloat(cs.lineHeight)) || Math.round(parseFloat(cs.fontSize) * 1.3), fw: +cs.fontWeight >= 600 ? 600 : 400, c: col(pcs.color) || col(cs.color) || '#000', ta: '', td: 0, el: 1 });
        const lh = Math.round(parseFloat(cs.lineHeight)) || 18;
        const y = tag === 'TEXTAREA' ? r.top + pt : r.top + pt + (r.height - pt - pb - lh) / 2;
        out.push(['t', Math.round(r.left - R0.left + pl), Math.round(y - R0.top), Math.round(r.width - pl - (parseFloat(cs.paddingRight) || 0)), lh, tf, v, 0]); }
    }
    const kids = [...el.children].map((c, i) => { const p = getComputedStyle(c); const pos = p.position !== 'static'; return { c, i, z: pos ? (parseInt(p.zIndex) || 0) + 1 : 0 }; });
    kids.sort((a, b) => a.z - b.z || a.i - b.i);
    for (const k of kids) walk(k.c, o);
    pseudo('::after');
    CL = prev;
  };
  walk(root, 1);
  return { w: Math.round(R0.width), h: Math.round(R0.height), st, ic, n: out };
};
