# Avatar — спецификация компонента и сборка в Figma

Источник: Figma «Q.HCM-components» (`RNiVz75ZZ0mNKJxcVYNMVq`), секция `avatar` (`112:4022`), компонент **Avatar**,
node `112:4458`, key `51ea9c22536b7a9f91e82d13a82404426f234b35`, собран 01.11.2026. Размеры в px. В CSS —
`assets/avatar.css`. Правила выбора — `references/avatar.md`.

## 1. Варианты и свойства

14 вариантов: `Type` × `Size`.

| Свойство | Значения | По умолчанию | CSS |
|---|---|---|---|
| `Type` | Photo, No photo | Photo | `<img class="q-avatar">` / `<span class="q-avatar q-avatar--empty"><i class="pi pi-user"></i></span>` |
| `Size` | 24, 32, 36, 40, 48, 64, 112 | 24 | `.q-avatar--24` · `.q-avatar` (32) · `--36` · `--40` · `--48` · `--64` · `--112` |

Photo — фото заливкой Image самого экземпляра (Fill, по центру). No photo — фон `Badge/badge-grey-bg`, иконка `pi-user`
(Q.Icons) `Badge/badge-grey-color`, по центру. Текстовых и булевых свойств нет.

## 2. Геометрия

| Size | Радиус | Иконка No photo |
|---|---|---|
| 24 | 6 | 14 |
| 32 | 8 | 18 |
| 36 | 10 | 18 |
| 40 | 10 | 24 |
| 48 | 12 | 24 |
| 64 | 12 | 32 |
| 112 | 12 | 48 |

- Корень — фрейм-компонент, Clip content, заливка Image, без обводки и тени. Радиусы — по шкале `SKILL.md`
  («Радиусы»: до 24 — 6, до 32 — 8, 36–44 — 10, от 48 — 12).
- В группе аватаров обводка 2 снаружи цвета `Content/content-background` задается у экземпляра, наложение — отрицательный
  промежуток −8 в auto layout, первый сверху (`itemReverseZIndex`).

## 3. Где используется

- `Table / Cell`, `Type=Person` — Avatar 32 (закрыт: размер в таблице не меняется).
- `Table / Cell`, `Type=Avatars` — 3 × Avatar 32 с обводкой 2 и наложением 8.
- `User` (секция `user`, `149:2900`) — Avatar 32 / 36 / 64 / 112 по `Size`; переключатель `Photo` показывает `No photo`.

## 4. Сборка в Figma (агент через Figma MCP)

1. Импортировать: `await figma.importComponentSetByKeyAsync('51ea9c22536b7a9f91e82d13a82404426f234b35')`
   (в файле компонентов — `figma.getNodeByIdAsync('112:4458')`).
2. Вариант: `set.children.find(c => c.name === 'Type=Photo, Size=36').createInstance()`; фото нет — `Type=No photo`. Размер — по `avatar.md`, §3; другой размер
   не делать масштабированием экземпляра.
3. Фото: `inst.fills = [{ type: 'IMAGE', scaleMode: 'FILL', imageHash }]`. Людей и фото — только из `hcm-demo-legend`.
4. Рядом имя: горизонтальный auto layout, gap 8, выравнивание по центру; имя 14/20 SemiBold, должность 12/16 `base-500`,
   вертикальный промежуток 0.
5. Группа: горизонтальный auto layout, `itemSpacing = -8`, `itemReverseZIndex = true`; у каждого экземпляра
   `strokes = [content-background]`, `strokeWeight = 2`, `strokeAlign = 'OUTSIDE'`; «+N» 12/16 SemiBold `primary-500` через 8.
6. В таблице аватар не вставлять отдельно — брать `Table / Cell`, `Type=Person` или `Type=Avatars`.

## 5. Открытые вопросы

- **Тултип с ФИО** у аватара без имени (группа, шапка) в Figma не показывается — только в верстке (`title`).
- **Dark-тема** на аватар не влияет; обводка в группе берет `content-background` текущей темы.
