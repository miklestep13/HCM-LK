# Icon — спецификация компонента и сборка в Figma

Источник: Figma «Q.HCM-components» (`RNiVz75ZZ0mNKJxcVYNMVq`), секция `icon` (`112:5565`), компонент **Icon**,
node `112:5574`, key `e30ee9265d3a359dc36ba90774c1d13d1389f63c`, собран 01.11.2026. Размеры в px. В CSS —
`assets/icon.css`. Правила выбора — `references/icon.md`.

## 1. Варианты и свойства

42 варианта: `Type=Image` × 6 размеров + `Type=Icon` × 6 цветов × 6 размеров.

| Свойство | Тип | Значения / по умолчанию | CSS |
|---|---|---|---|
| `Type` | Variant | Image, Icon · Image | `<img>` внутри / `.pi` внутри |
| `Color` | Variant | Default, Info, Success, Warning, Error, Grey · Default (у Image — только Default) | `.q-icon-tile` · `--info` · `--success` · `--warning` · `--error` · `--grey` |
| `Size` | Variant | 24, 32, 36, 40, 48, 64 · 24 | `--24` · по умолчанию (32) · `--36` · `--40` · `--48` · `--64` |
| `Icon#125:0` | Instance swap | Q.Icons, вариант `Size=18 px`; по умолчанию `pi-user`, в быстром выборе `pi-user`, `pi-users` | класс `pi-*` |

- Матрица неполная: при `Type=Image` в панели видно `Color`, но на изображение он не влияет.
- При подмене иконки размер и цвет сохраняются (проверено подменой `pi-user` → `pi-users`).

## 2. Токены

| `Color` | Фон (переменная Q.Palette) | Иконка (переменная Q.Palette) | CSS |
|---|---|---|---|
| Default | `Badge-Component/badge-bg` | `Page/page-link-active` | `--q-badge-bg` / `--q-page-link-active` |
| Info | `Badge-Component/badge-info-bg` | `Info/info-700` | `--q-badge-info-bg` / `--q-info-700` |
| Success | `Badge-Component/badge-success-bg` | `Success/success-700` | `--q-badge-success-bg` / `--q-success-700` |
| Warning | `Badge-Component/badge-warning-bg` | `Warning/warning-700` | `--q-badge-warning-bg` / `--q-warning-700` |
| Error | `Badge-Component/badge-danger-bg` | `Error/error-700` | `--q-badge-danger-bg` / `--q-error-700` |
| Grey | `Badge/badge-grey-bg` | `Badge/badge-grey-color` | `--q-badge-grey-bg` / `--q-badge-grey-color` |

Цвет задается только свойством `Color`; цвет векторов иконки привязан к переменной в каждом варианте.

## 3. Геометрия

| Size | Радиус | Иконка |
|---|---|---|
| 24 | 6 | 14 (вариант 18 px, масштаб) |
| 32 | 8 | 18 |
| 36 | 10 | 18 |
| 40 | 10 | 24 (масштаб) |
| 48 | 12 | 24 (масштаб) |
| 64 | 12 | 32 (масштаб) |

- Корень — auto layout, иконка по центру, ширина и высота Fixed, Clip content. Без обводки и тени.
- `Type=Image` — заливка Image (Fill) у корня; по умолчанию — нейтральная заглушка-градиент (не фото человека).

## 4. Где используется

- `Table / Cell`, `Type=Icon` — Icon 32, открытый экземпляр: в панели ячейки меняются `Type`, `Color`, `Icon` (и `Size` —
  в таблице держать 32).

## 5. Сборка в Figma (агент через Figma MCP)

1. Импортировать: `await figma.importComponentSetByKeyAsync('e30ee9265d3a359dc36ba90774c1d13d1389f63c')`
   (в файле компонентов — `figma.getNodeByIdAsync('112:5574')`).
2. Вариант по имени: `Type=Icon, Color=Grey, Size=32`. Цвет — по `icon.md`, §3; размер — §4 (как у соседних аватаров).
3. Иконка: компонент `Size=18 px` из набора Q.Icons, например `importComponentSetByKeyAsync('<key набора pi-*>')`,
   затем `inst.setProperties({ 'Icon#125:0': icon18.id })`.
4. Изображение: вариант `Type=Image, Color=Default, Size=…`, затем `inst.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash }]`.
5. Рядом название: горизонтальный auto layout, gap 8, по центру; название 14/20 SemiBold, подпись 12/16 `base-500`
   вплотную. В таблице — только через `Table / Cell`, `Type=Icon`.

## 6. Открытые вопросы

- **Плашка с количеством в углу** (награды) в компоненте не предусмотрена.
- **`Color` у `Type=Image`** виден в панели, хотя не действует.
- **Info** — пара `badge-info-bg` / `info-700` из Q.PALETTE; у бейджа `bage` Info другой (`#dbeafe` / `primary-500`, сырые
  цвета) — сверить, когда бейдж переведут на переменные.
