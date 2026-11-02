import { Injectable, computed, signal } from '@angular/core';
import {
  ORG,
  ORG_BY_ID,
  ORG_HOME,
  orgKids,
  orgPath,
  orgUnit,
} from '../../data/org.data';

/** размеры карточки и отступы схемы (как в прототипе: OW, OH, GX, GY, GR) */
export const OW = 264,
  OH = 128,
  GX = 28,
  GY = 84,
  /** между рядами сетки — место под аватар (34) и шину ряда */
  GR = 76;

/** положение карточки на холсте */
export interface OrgBox {
  id: string;
  x: number;
  y: number;
  /** видимые подчиненные */
  vk: string[];
  /** подчиненные без своих подчиненных раскладываются сеткой */
  grid: boolean;
  cols: number;
  row: number;
}
export interface OrgLayout {
  boxes: Record<string, OrgBox>;
  ids: string[];
  lines: string[];
  w: number;
  h: number;
}

/**
 * Состояние схемы «Структура компании»: корень, раскрытые узлы, найденный сотрудник, масштаб и сдвиг.
 * Предоставляется страницей (providers), общий для панели поиска и схемы.
 */
@Injectable()
export class OrgState {
  readonly root = signal(ORG_HOME);
  readonly open = signal(new Set([ORG_HOME]));
  /** подсвеченный (найденный) сотрудник */
  readonly hit = signal<string | null>(null);
  readonly all = signal(false);
  /** масштаб (0 — подогнать при следующей отрисовке) и сдвиг холста */
  readonly z = signal(0);
  readonly x = signal(0);
  readonly y = signal(0);
  /** размер окна схемы — задает компонент схемы */
  readonly vw = signal(0);
  readonly vh = signal(0);

  readonly units = ORG.filter((n) => n.unit).map((n) => n.unit);
  readonly unit = computed(() => orgUnit(this.root()));
  /** «Мой департамент» — когда ушли со своего подразделения или кого-то нашли */
  readonly away = computed(() => this.root() !== ORG_HOME || !!this.hit());
  readonly layout = computed(() => layout(this.root(), this.open()));

  /** вернуться к своему подразделению */
  reset(): void {
    this.root.set(ORG_HOME);
    this.open.set(new Set([ORG_HOME]));
    this.hit.set(null);
    this.all.set(false);
    this.z.set(0);
  }

  /** выбрать подразделение в фильтре */
  setUnit(unit: string): void {
    const n = ORG.find((r) => r.unit === unit);
    if (!n) return;
    const kids = orgKids(n.id).filter((k) => orgKids(k).length && n.parent);
    this.root.set(n.id);
    this.open.set(new Set([n.id, ...kids]));
    this.hit.set(null);
    this.z.set(0);
    this.all.set(false);
  }

  /** «Развернуть все» / «Свернуть все» */
  toggleAll(): void {
    const all = !this.all();
    this.all.set(all);
    this.open.set(new Set(all ? withKids(this.root()) : [this.root()]));
    this.z.set(0);
  }

  /** раскрыть/свернуть подчиненных, не сдвигая карточку на экране */
  toggle(id: string): void {
    this.keep(id, () => {
      const o = new Set(this.open());
      o.has(id) ? o.delete(id) : o.add(id);
      this.open.set(o);
    });
  }

  /** «Уровень выше» */
  up(): void {
    const r = this.root(),
      p = ORG_BY_ID[r].parent;
    if (!p) return;
    this.keep(r, () => {
      this.root.set(p);
      this.open.set(new Set([...this.open(), p, r]));
    });
    this.reveal(p);
  }

  /** переход по хлебным крошкам */
  crumb(id: string): void {
    const r = this.root();
    this.keep(r, () => {
      this.root.set(id);
      this.open.set(new Set([...this.open(), ...orgPath(r)]));
    });
    this.reveal(id);
  }

  /** найти сотрудника: раскрыть путь внутри текущей схемы или перейти к его руководителю */
  find(id: string): void {
    const path: string[] = [];
    let inside = id === this.root();
    for (let a = ORG_BY_ID[id].parent; a; a = ORG_BY_ID[a].parent) {
      path.push(a);
      if (a === this.root()) {
        inside = true;
        break;
      }
    }
    if (!inside) return this.focus(id);
    this.open.set(new Set([...this.open(), ...path]));
    this.hit.set(id);
    this.center(id);
  }

  /** показать сотрудника в его подразделении */
  focus(id: string): void {
    const n = ORG_BY_ID[id],
      root = n.parent || id;
    const o = new Set([root]);
    if (orgKids(id).length) o.add(id);
    this.root.set(root);
    this.open.set(o);
    this.hit.set(id);
    this.all.set(false);
    this.fit();
    this.center(id);
  }

  // ——— масштаб и сдвиг ———
  fit(): void {
    const L = this.layout(),
      R = L.boxes[this.root()],
      vw = this.vw(),
      vh = this.vh();
    if (!vw) {
      this.z.set(0);
      return;
    }
    let z = Math.min(1, (vw - 100) / L.w, (vh - 20) / L.h);
    if (z < 0.6) {
      z = 0.8;
      this.set(z, vw / 2 - (R.x + OW / 2) * z, 10);
    } else this.set(z, (vw - L.w * z) / 2, Math.max(0, (vh - L.h * z) / 2));
  }
  center(id: string): void {
    const n = this.layout().boxes[id];
    if (!n) return;
    if (!this.z()) this.fit();
    const z = Math.max(this.z(), 0.9);
    this.set(z, this.vw() / 2 - (n.x + OW / 2) * z, this.vh() / 2 - (n.y + OH / 2) * z);
  }
  zoom(f: number, cx = this.vw() / 2, cy = this.vh() / 2): void {
    const z = this.z(),
      nz = Math.min(1.8, Math.max(0.3, z * f));
    this.set(nz, cx - ((cx - this.x()) * nz) / z, cy - ((cy - this.y()) * nz) / z);
  }
  pan(x: number, y: number): void {
    this.x.set(x);
    this.y.set(y);
  }

  private set(z: number, x: number, y: number): void {
    this.z.set(z);
    this.x.set(x);
    this.y.set(y);
  }

  /** изменить схему так, чтобы карточка id осталась на том же месте экрана */
  private keep(id: string, change: () => void): void {
    const b0 = this.layout().boxes[id],
      z = this.z();
    const sx = b0.x * z + this.x(),
      sy = b0.y * z + this.y();
    change();
    const b1 = this.layout().boxes[id];
    if (b1) this.pan(sx - b1.x * z, sy - b1.y * z);
  }
  /** подвинуть, если карточка ушла за край */
  private reveal(id: string): void {
    const n = this.layout().boxes[id],
      z = this.z();
    const sx = (n.x + OW / 2) * z + this.x(),
      sy = (n.y - 34) * z + this.y();
    if (sy < 64) this.y.update((v) => v + 64 - sy);
    if (sx < 80 || sx > this.vw() - 80) this.x.update((v) => v + this.vw() / 2 - sx);
  }
}

/** узлы, у которых есть подчиненные (для «Развернуть все») */
function withKids(id: string): string[] {
  const out: string[] = [];
  const w = (i: string) => {
    const k = orgKids(i);
    if (k.length) {
      out.push(i);
      k.forEach(w);
    }
  };
  w(id);
  return out;
}

/** раскладка дерева (ogLay + ogPos + линии из ogDraw прототипа) */
function layout(root: string, open: Set<string>): OrgLayout {
  type N = OrgBox & { w: number; h: number; cw: number };
  const M: Record<string, N> = {};
  const lay = (id: string): N => {
    const vk = open.has(id) ? orgKids(id) : [];
    const n: N = { id, x: 0, y: 0, vk, grid: false, cols: 0, row: 0, w: OW, h: OH, cw: OW };
    M[id] = n;
    if (!vk.length) return n;
    vk.forEach(lay);
    const L = vk.length;
    n.grid = L > 2 && vk.every((k) => !M[k].vk.length);
    n.cols = L <= 4 ? L : Math.min(4, Math.ceil(L / 2));
    if (n.grid) {
      const rows = Math.ceil(L / n.cols);
      n.cw = n.cols * OW + (n.cols - 1) * GX;
      n.h = OH + GY + rows * OH + (rows - 1) * GR;
    } else {
      n.cw = vk.reduce((a, k) => a + M[k].w, 0) + GX * (L - 1);
      n.h = OH + GY + Math.max(...vk.map((k) => M[k].h));
    }
    n.w = Math.max(OW, n.cw);
    return n;
  };
  const pos = (id: string, x: number, y: number) => {
    const n = M[id];
    n.x = x + (n.w - OW) / 2;
    n.y = y;
    if (!n.vk.length) return;
    const cx = x + (n.w - n.cw) / 2,
      ky = y + OH + GY;
    if (n.grid)
      n.vk.forEach((k, i) => {
        const K = M[k];
        K.x = cx + (i % n.cols) * (OW + GX);
        K.y = ky + Math.floor(i / n.cols) * (OH + GR);
        K.row = Math.floor(i / n.cols);
      });
    else {
      let xx = cx;
      n.vk.forEach((k) => {
        M[k].row = 0;
        pos(k, xx, ky);
        xx += M[k].w + GX;
      });
    }
  };
  const R = lay(root),
    top = 50;
  pos(root, 60, top);
  const ids: string[] = [];
  const vis = (id: string) => {
    ids.push(id);
    M[id].vk.forEach(vis);
  };
  vis(root);
  /**
   * Линии — ортогональные «шины», как в оргсхемах: от руководителя вниз, горизонтальная шина над подчиненными, от нее — отводы к каждому.
   * В сетке (много подчиненных без своих подчиненных) — ствол слева от первой колонки и своя шина над каждым рядом:
   * так линии не сливаются в одну и не проходят под карточками.
   */
  const lines: string[] = [];
  ids.forEach((id) => {
    const n = M[id];
    if (!n.vk.length) return;
    const top = (k: string) => M[k].y - 34,
      mid = (k: string) => M[k].x + OW / 2,
      x1 = n.x + OW / 2,
      y1 = n.y + OH,
      bus0 = y1 + (top(n.vk[0]) - y1) / 2;
    if (!n.grid || n.vk.length <= n.cols) {
      const xs = n.vk.map(mid);
      lines.push(`M${x1} ${y1}V${bus0}`);
      if (xs.length > 1 || xs[0] !== x1) lines.push(`M${Math.min(x1, ...xs)} ${bus0}H${Math.max(x1, ...xs)}`);
      n.vk.forEach((k) => lines.push(`M${mid(k)} ${bus0}V${top(k)}`));
      return;
    }
    const rows: string[][] = [];
    n.vk.forEach((k) => (rows[M[k].row] ??= []).push(k));
    const trunk = M[n.vk[0]].x - GX / 2;
    const busY = rows.map((r, i) => (i ? top(r[0]) - (GR - 34) / 2 : bus0));
    lines.push(`M${x1} ${y1}V${bus0}`);
    lines.push(`M${trunk} ${bus0}V${busY[busY.length - 1]}`);
    rows.forEach((r, i) => {
      const xs = r.map(mid);
      lines.push(`M${i ? trunk : Math.min(trunk, x1)} ${busY[i]}H${Math.max(x1 * (i ? 0 : 1), ...xs)}`);
      r.forEach((k) => lines.push(`M${mid(k)} ${busY[i]}V${top(k)}`));
    });
  });
  return { boxes: M, ids, lines, w: R.w + 120, h: R.h + top + 60 };
}
