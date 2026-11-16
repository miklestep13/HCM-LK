# Badge (`bage`) — спецификация компонента и сборка в Figma

Источник: Figma «Q.HCM-components» (`RNiVz75ZZ0mNKJxcVYNMVq`), компонент **bage**, node `1:333`,
key `794235889b5c463c780dcebb9c7f0ec433a76662`, сверка 31.10.2026. Размеры в px. В CSS — токены `--q-badge-*`
(`assets/badge.css`). Правила выбора — `references/badge.md`.

## 1. Варианты и свойства

10 вариантов: `state` × `size`.

| Свойство Figma | Значения | По умолчанию | CSS |
|---|---|---|---|
| `state` | Default, success, warning, Error, Info | Default | `.q-badge` / `--success` / `--warning` / `--error` / `--info` |
| `size` | 160px, hug | 160px | `.q-badge--fixed` / по умолчанию |

Текст не вынесен в свойство: меняется прямо в слое `Text` экземпляра. По умолчанию в наборе стоит `size=160px` —
при вставке вне таблицы ширину выставлять явно (`hug`).

## 2. Токены

| Состояние | Фон (переменная Figma) | Текст (переменная Figma) | CSS фон / текст |
|---|---|---|---|
| Default | `HCM Tokens/status/violet-bg` #efe9fa | `HCM Spacing/Primary` #5e4bd3 | `--q-badge-default-bg` / `--q-badge-default-color` |
| success | `HCM Tokens/status/ok-bg` #e3f4ea | `HCM Tokens/success` #1f8a55 | `--q-badge-success-bg` / `--q-badge-success-color` |
| warning | `HCM Tokens/status/warn-bg` #fceedc | `HCM Tokens/Warning` #b26a00 | `--q-badge-warning-bg` / `--q-badge-warning-color` |
| Error | `HCM Tokens/status/risk-bg` #fbe7e7 | без переменной, #c4283f | `--q-badge-danger-bg` / `--q-badge-danger-color` |
| Info | без переменной, #dbeafe | без переменной, #3b82f6 | `--q-badge-info-bg` / `--q-primary-500` |

Текст — Open Sans 12/16, вес 500 (переменная `HCM Typography/font-weight/medium`), как `ui-badge` в ДС.

## 3. Геометрия

- Горизонтальный auto layout, высота 24, радиус 6, padding 3 · 6 · 4 · 6, выравнивание по центру.
- `hug`: ширина по тексту (с текстом «Text» — 38). `160px`: ширина Fixed 160, текст по центру.
- Текст: одна строка, Hug, усечение ENDING (в Fixed-варианте не срабатывает: текст Hug и может выйти за край).

## 4. Поведение

- Интерактивных состояний нет: бейдж не нажимается.
- Длинный текст в `160px` не обрезается и вылезает за подложку — подбирать ширину столбца (`badge.md`, §3).
- Dark-значений нет.

## 5. Открытые вопросы

- **Стиль `ui-badge` в библиотеке Minimalism UI задан с весом 600**, в ДС — 500. В компоненте вес исправлен (31.10.2026)
  привязкой к переменной `HCM Typography/font-weight/medium` = 500 (у Open Sans в Figma нет начертания Medium, вес
  задается осью wght); текстовый стиль при этом отвязан. Исправить стиль в библиотеке и привязать его снова.
- **Отступы.** 3 · 6 · 4 · 6 против 4 · 8 в прежних правилах ДС. В CSS — по компоненту.
- **Без переменных.** Текст Error, фон и текст Info — сырые цвета. Текст Default привязан к переменной `Primary` из
  коллекции `HCM Spacing` — имя и коллекция не соответствуют смыслу.
- **Регистр значений `state`.** Default, success, warning, Error, Info — нужно привести к одному виду.
- **Нет свойства текста** — удобнее `Text` как text property.
- **Секция в Figma** называется «Progress Bar» — переименовать в «Badge».
- **Нет вариантов** `sm`, «на фото» и `live`, которые есть в верстке.
- **Dark-тема** не задана.

## 6. Сборка в Figma (агент через Figma MCP)

1. Импортировать набор: `await figma.importComponentSetByKeyAsync('794235889b5c463c780dcebb9c7f0ec433a76662')`
   (в файле компонентов — `figma.getNodeByIdAsync('1:333')`).
2. Вариант по имени: `state=Info, size=hug` — по умолчанию; `size=160px` — только в столбце статуса таблицы.
3. Текст: `const t = inst.findOne(n => n.type === 'TEXT'); await figma.loadFontAsync(t.fontName); t.characters = 'Утверждено'`.
4. В таблице — ячейка `Table / Cell`, `Type=Badge` (`table-spec.md`): бейдж `size=160px` растянут на ширину ячейки.
   Текст длиннее — расширить все ячейки столбца одинаково, не обрезать.
5. Цвета не переопределять: состояние задается только свойством `state`.
