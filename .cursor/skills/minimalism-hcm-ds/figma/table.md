# Table — спецификация компонентов и сборка в Figma

Источник: Figma «Q.HCM-components» (`RNiVz75ZZ0mNKJxcVYNMVq`), фрейм «Таблица · компоненты» в секции `87:3220`,
собрано 31.10–01.11.2026 по прототипу Q.HCM с приведением разъехавшихся стилей к одному значению (§6). Размеры в px.
В CSS — `assets/table.css`. Правила выбора — `references/table.md`.

| Компонент | Node | Key |
|---|---|---|
| `Table / Header` | `109:1572` | `6cc2491440cc5d37e2459e963d86c2fc5657c11a` |
| `Table / Cell` | `120:2600` | `601934c2144b0b017b71616d062cd96c3b44fadb` |
| `Avatar` (секция `avatar`) | `112:4458` | `51ea9c22536b7a9f91e82d13a82404426f234b35` |
| `Icon` (секция `icon`) | `112:5574` | `e30ee9265d3a359dc36ba90774c1d13d1389f63c` |
| `_Table / Grade letter` (служебный, не публикуется) | `115:1507` | `681388ee7bd5f1977a31756a8798c62c98d5ddb9` |
| `Table / Cell chevron` | `301:5669` | — |
| `Table / Expand area` | `303:5730` | — |
| `Table / Tree` | `304:5829` | — |
| `Table / Expandable` | `305:6073` | — |
| `_Table / Tree row` (служебный, строка-дочка по умолчанию) | `303:5694` | — |
| `_Table / Slot` (служебный, заглушка слота) | `303:5692` | — |

Новые компоненты — во фрейме «Таблица · дерево и раскрытие» (`301:5668`) той же секции; ключи — `node.key`.

Все цвета — переменные Q.Palette, тексты — Open Sans 400/600, заглушки на английском.

## 1. `Table / Header` — 8 вариантов

| Свойство | Значения | По умолчанию |
|---|---|---|
| `Type` | Text, Checkbox, Empty | Text |
| `Sort` | None, Asc, Desc (только Text) | None |
| `Align` | Left, Right (только Text) | Left |
| `Header` | Text | «Header» |
| `Show sort` | Boolean | true |
| `Padding left` / `Padding right` | Boolean | true |

- Высота 40, отступы 0 · 12 (слои `Padding left/right` по 12), линия снизу 1 `content-border-secondary`, без заливки.
- Текст 14/20 SemiBold `base-500`; иконка сортировки `pi-sort-alt` 12 через 4: None — `content-text-disabled`,
  Asc / Desc — `primary-500` (Desc — поворот 180).
- Checkbox — Checkbox Q.PALETTE без подписи (открытый экземпляр), ширина 40. Empty — над действиями, шевроном, ручкой.

## 2. `Table / Cell` — 44 варианта

Вариант = `Type` + `Variant` + `Align`. Матрица неполная: в панели видны все значения `Variant`, но существуют только
сочетания из таблицы; Figma показывает только свойства, которые есть у выбранного варианта.

| `Type` | `Variant` | `Align` | Ширина по умолчанию | Содержимое |
|---|---|---|---|---|
| Text | Default, Secondary, Strong, Link, Danger, Positive | Left, Right | 200 | `Text` + `Subtitle` |
| Date | Default, Overdue | Left | 140 | `Date` + `Subtitle` |
| Number | Default, Positive, Negative | Right | 140 | `Number` + `Subtitle` |
| Person | Default | Left | 240 | Avatar 32 + `Name` + `Position` |
| Icon | Default | Left | 240 | Icon 32 (открытый экземпляр) + `Text` + `Subtitle` |
| Badge | Default, Info, Success, Warning, Error | Left | 184 | `bage` size=160px, Fill по ширине ячейки (открытый) |
| Progress | Normal, Success, Warning, Error | Left | 200 | Трек 6 + `Value` справа (размер S) |
| Level | 0, 1, 2, 3, 4 | Left | 200 | 4 точки 10 + `Level` |
| Grade | Default | Left | 120 | 1–2 буквы `_Table / Grade letter` (открытые) |
| Actions | Default | Left | 120 | Button Ghost Icon only S 28: Edit, Delete, More (открытые) |
| Checkbox | Default | Left | 40 | Checkbox Q.PALETTE без подписи (открытый) |
| Toggle | Default | Left | 56 | Toggle Q.PALETTE без подписи (открытый) |
| Avatars | Default | Left | 160 | 3 × Avatar 32 с наложением 8 + `Count` |
| Step | Default | Left | 240 | Номер `Step` 24 + `Text` |
| Expand | Collapsed, Expanded | Left | 52 | Button Ghost S 28 с `pi-chevron-right` / `pi-chevron-down` |
| Drag | Default | Left | 40 | `pi-bars` 16 |
| Group | Default | Left | 600 (тянуть) | `Show chevron` + `Group` + `Description` |
| Empty | Default | Left | 600 (тянуть) | `Empty text` по центру |

Свойства набора:

| Свойство | Тип | По умолчанию | Где |
|---|---|---|---|
| `Padding left` / `Padding right` | Boolean | true | Все; у крайних столбцов выключить |
| `Hover` / `Selected` | Boolean | false | Все, кроме Group и Empty; включать у всех ячеек строки |
| `Text`, `Subtitle` | Text | «Text», «Subtitle» | Text, Date, Number, Icon, Step |
| `Show subtitle` | Boolean | false | Text, Date, Number, Icon |
| `Date`, `Number` | Text | «Date», «Number» | Date, Number |
| `Name`, `Position`, `Show position` | Text / Boolean | «Name», «Position», true | Person |
| `Value`, `Show value` | Text / Boolean | «Value», true | Progress |
| `Level` | Text | «Level» | Level |
| `Count`, `Show count`, `Photo 2`, `Photo 3` | Text / Boolean | «+N», true | Avatars |
| `Step` | Text | «1» | Step |
| `Edit`, `Delete`, `More` | Boolean | false, false, true | Actions |
| `Second grade` | Boolean | true | Grade |
| `Group`, `Description`, `Show description`, `Show chevron` | Text / Boolean | «Group», «Description», true, false | Group |
| `Empty text` | Text | «No results» | Empty |

## 3. Токены и геометрия ячейки

- Горизонтальный auto layout: `Padding left` 12 · содержимое (Fill) · `Padding right` 12; сверху и снизу 16
  (Group — 10, высота 40). Линия снизу 1 `content-border-secondary` (не входит в размер).
- Подпись (`Subtitle`, `Position`) — вплотную к основному тексту, отступ 0 во всех ячейках.
- Слои `Hover` (`Table/table-hover-tr`) и `Selected` (`Table/table-select`) — абсолютные прямоугольники под
  содержимым, растянуты на всю ячейку.

| Элемент | Стиль | Переменная |
|---|---|---|
| Text Default, Date Default, Number Default, Name, Text в Icon и Step | 14/18 (Name и Strong — 14/20 SemiBold) | `Table/table-body-text` |
| Secondary, `Subtitle`, `Position`, `Level`, `Description`, Empty | 14/18 или 12/16 | `Base/base-500` |
| Link | 14/18 | `Primary/primary-500` |
| Danger, Overdue, Negative | 14/18 Regular | `Error/error-700` |
| Positive | 14/18 | `Success/success-700` |
| Progress: трек / заливка / значение | 6, радиус 3 / — / 12/16 Regular справа, мин. 34 | `base-100` / `primary-500`, `success-500`, `warning-500`, `error-500` / `content-text-secondary` |
| Level: точки 10, gap 4 | — | 1 `error-500` · 2 `warning-500` · 3 `success-500` · 4 `primary-500`, пустые `base-50` |
| Grade: 24 × 24, радиус 6, 14/20 SemiBold | — | A `primary-50`/`primary-500` · B `success-100`/`success-700` · C `base-50`/`base-500` · D, E `error-100`/`error-700` |
| Step: номер 24, радиус 8, 12/16, gap 12 | — | `primary-50` / `primary-500` |
| Avatars: обводка 2 снаружи, наложение 8, «+N» 12/16 SemiBold | — | `content-background` / `primary-500` |
| Group: фон | — | `content-background-disabled` |
| Иконки Drag, Group | 16 | `page-text-ui` |

## 3a. Дерево и раскрытие строк

**`Table / Cell chevron`** — ячейка названия с шевроном, 12 вариантов: `State` (Collapsed — шеврон вправо, Expanded —
вниз, Leaf — детей нет, пустое место 28) × `Level` (0–3, отступ 28 на уровень). Шеврон — Button Ghost S 28
(`pi-chevron-right` / `pi-chevron-down`), до текста 8. Свойства как у `Table / Cell`: `Text`, `Subtitle`, `Show subtitle`,
`Hover`, `Selected`, `Padding left/right`. Первый столбец, Fill; при `Padding left: false` текст уровня 0 начинается с 36.

**`Table / Expand area`** — область аккордеона сразу под строкой с `State=Expanded`, Fill по ширине таблицы:
- `Type=Rows` — дочерние строки: `Row 1–3` видны, `Row 4`, `Row 5` — Boolean. `Row` (Instance swap) — компонент
  строки, меняет все строки сразу; по умолчанию `_Table / Tree row` (chevron Level=1 + Вес 120 + Срок 160 + Статус 180,
  свойства ячейки названия выведены наружу). Для своих столбцов — сделать свою строку-компонент и подставить в `Row`.
- `Type=Slot` — свободный слот: `Content` (Instance swap, по умолчанию `_Table / Slot`) — любой компонент. Отступы
  16 · 0 · 16 · 36 (по тексту названия родителя), линия снизу `content-border-secondary`.

**`Table / Tree`** (древовидная) и **`Table / Expandable`** (раскрывающаяся со слотом) — готовые таблицы 960 из
Header, Cell, Cell chevron и Expand area. Другие столбцы — Detach и правка или сборка по §5.

## 4. `Avatar` и `Icon`

Вложенные компоненты описаны отдельно: `references/avatar.md` и `avatar-spec.md`, `references/icon.md` и `icon-spec.md`.
В таблице оба — 32: `Type=Person` (Avatar, закрыт), `Type=Avatars` (3 × Avatar), `Type=Icon` (Icon, открытый экземпляр).

## 5. Сборка в Figma (агент через Figma MCP)

1. Импортировать: `importComponentSetByKeyAsync('6cc2491440cc5d37e2459e963d86c2fc5657c11a')` (Header) и
   `'601934c2144b0b017b71616d062cd96c3b44fadb'` (Cell); в файле компонентов — `getNodeByIdAsync('109:1572')` и `'120:2600'`.
2. Таблица — фрейм: вертикальный auto layout, ширина Fixed (ширина виджета − 48). Строка — горизонтальный auto layout,
   ширина Fixed (= таблица), `layoutAlign = STRETCH`.
3. Ячейка — `set.children.find(c => c.name === 'Type=Date, Variant=Overdue, Align=Left').createInstance()`, в строку,
   `layoutAlign = 'STRETCH'`. Первый (растягиваемый) столбец — `layoutGrow = 1`, остальным — `resize(w, h)`.
   В строке заголовков ячейки высоты 40: `layoutSizingVertical = 'FIXED'`.
4. Свойства: `inst.setProperties({ [ключ]: значение })`, ключ — по началу имени: `'Text#…'`, `'Show subtitle#…'`.
   У первой ячейки строки — `Padding left: false`, у последней — `Padding right: false`.
5. Текст бейджа: `const t = cell.findOne(n => n.name === 'Badge').findOne(n => n.type === 'TEXT'); await figma.loadFontAsync(t.fontName); t.characters = 'Утверждено'`.
   Все ячейки столбца статуса — одной ширины; длинный статус — расширить весь столбец.
6. Hover / Selected — включить у всех ячеек строки. Group и Empty — на всю ширину таблицы (`layoutAlign = STRETCH`).
7. Нужного `Type` нет — не собирать ячейку фигурами, сообщить.

## 6. Что приведено к одному значению

| Что | В прототипе | В компоненте |
|---|---|---|
| Плотность ячеек | 12 · 12, 8 · 12, 6 · 10, 14 · 14, 8 · 14, 14 · 10, 12 · 10, 8 по бокам | 16 · 12 у всех; заголовок 40, 0 · 12 |
| Крайние столбцы | 0 и 24 | Отступ выключен, край таблицы = поля виджета |
| Подпись под названием | отступ 1, 2, 3 и 6 | 0 — вплотную к названию (Text, Date, Number, Person, Icon) |
| Вторичный текст | t2, t3, content-text-secondary | `base-500` |
| Просрочка | жирным | Regular, `error-700` |
| Коды записей | моноширинный | Link 14/18 Open Sans |
| Аватар | 18 размеров 20–120 | 7 размеров (24–112); в таблице 32 |
| Группа аватаров | 26 и 28 | 32 |
| Буква оценки | 26, gap 6 | 24, gap 4 |
| Точки уровня | gap 5, подпись t2 | gap 4, `base-500` |
| Номер этапа | gap 11 | gap 12 |
| Бейдж статуса | 160 | Fill по столбцу (не уже 160) |
| Прогресс в ячейке | подпись под треком, отступ 5 | размер S: трек + значение справа |

## 7. Открытые вопросы

- **Иконка меню.** `SKILL.md` («Table») — `pi-ellipsis-v`; Button и ячейка Actions — `pi-ellipsis-h`. Решение отложено, пока в ячейке — `pi-ellipsis-h`.
- **Hover названия.** В Hover название записи должно стать `primary-500`; сейчас это вручную `Variant=Link`, а Link —
  Regular, у Strong — SemiBold. Нужен вариант «Strong link» или правило.
- **Значения `table-hover-tr` и `table-select`** берутся из Q.Palette; совпадают ли они визуально — проверить в dark.
- **Чекбокс** Q.PALETTE без промежуточного состояния («выбраны не все»).
- **Ширина ячеек внутри экземпляра** через Plugin API не меняется — поэтому строки собираются фреймами, а не
  экземплярами компонента строки. Вручную в Figma ячейку внутри экземпляра тянуть можно.
- **Открытые экземпляры** (Icon в ячейке) показывают и свой `Size` — в таблице держать 32.
- **Высота строки** зависит от содержимого: 48 (Progress, Level), 50 (Text), 52 (Strong), 56 (Badge), 60 (Actions,
  Expand), 64 (Icon, Avatars, Person без должности), 68 (Person с должностью).
