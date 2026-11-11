# Button — спецификация компонента и сборка в Figma

Источник: Figma «Q.HCM-components» (`RNiVz75ZZ0mNKJxcVYNMVq`), компонент **Button**, node `15:2505`,
key `27a1c19e655f548e69bb7bdf261923d70760db87`. Компонент исправлен 31.10.2026. Размеры в px. В CSS — `assets/button.css`.
Правила выбора — `references/button.md`.

## 1. Варианты и свойства

84 варианта — не полная матрица, есть только перечисленные сочетания (каждое × 6 состояний).

| Свойство Figma | Значения | По умолчанию |
|---|---|---|
| `Variant` | Primary, Secondary, White, Ghost, Link | Primary |
| `Intent` | Default, Destructive | Default |
| `Content` | Text, Icon only, Text with icon | Text |
| `Size` | M, S | M |
| `State` | Default, Hover, Pressed, Focus, Disabled, Loading | Default |
| `Icon#102:0` | Подмена экземпляра: иконки Q.Icons (`pi-*`, вариант `Size=18 px`, уменьшен до 16) | у каждого варианта своя |
| `Label#15:249` | Text, «Кнопка» | — |
| `Link label#15:431` | Text, «Ссылка» | — |
| `Show icon#15:340` | Boolean, иконка в `Text with icon` | true |

Предпочтительные иконки свойства `Icon`: pi-filter, pi-pencil, pi-trash, pi-chevron-left, pi-plus, pi-ellipsis-h.

Существующие сочетания:

| Сочетание | Размеры | Иконка по умолчанию | Соответствие ДС |
|---|---|---|---|
| Primary · Default · Text | M, S | — | Primary |
| Primary · Default · Text with icon | M | pi-plus | Primary «+ Добавить» |
| Secondary · Default · Text | M, S | — | Secondary (мягкая; раньше Raised) |
| Secondary · Default · Text with icon | M | pi-plus | Secondary с иконкой |
| White · Default · Text | M, S | — | White — только на голубом фоне |
| Secondary · Destructive · Text | M, S | — | Danger (заливка) |
| Secondary · Default · Icon only | M | pi-filter | `.q-ib--soft` (воронка фильтров) |
| Ghost · Default · Icon only | S | pi-pencil; для «Еще» — подменить на pi-ellipsis-h | `.q-actb` 28 |
| Ghost · Destructive · Icon only | S | pi-trash | `.q-actb--danger` 28 |
| Ghost · Default · Icon only | M | pi-chevron-left | `.q-back` 36 |
| Link · Default / Destructive · Text | S | — | `.q-link--strong` / ссылка-удаление |

В Figma нет: Danger soft, Text-кнопки, Split, `.q-ib` с рамкой. L, XS и серой Secondary нет ни в Figma, ни в правилах.

## 2. Токены (переменные Q.Palette)

| Сочетание | Default | Hover | Pressed | Текст и иконка |
|---|---|---|---|---|
| Primary | `primary-500` | `primary-700` | `primary-900` | `base-0` |
| Secondary | `primary-50` | `primary-100` | `primary-100` | `primary-500`; pressed `primary-700` |
| White | `base-0` | `primary-100` | `primary-100` | `primary-500`; pressed `primary-700` |
| Secondary · Destructive | `error-500` | `error-700` | `error-900` | `base-0` |
| Ghost | нет | `primary-50` | `primary-100` | `page-text-ui`; hover и pressed `primary-500` |
| Ghost · Destructive | нет | `error-500` | `error-700` | `page-text-ui`; hover и pressed `base-0` |
| Ghost · Chevron left | `content-background` | `primary-50` | `primary-100` | `page-text-ui` → `primary-500` |
| Link | нет | — | — | `primary-500` / `700` / `900`; destructive `error-500` / `700` / `900` |

- Focus: у всех типов один слой «Focus ring» — обводка 2 `primary-500` с зазором 2 от кнопки (прямоугольник
  на 4 больше с каждой стороны, радиус кнопки + 4). Фон и текст — как в Default.
- Disabled: прозрачность слоя 45 % (у Link — прозрачность текста 45 %).
- Loading: текст прозрачный (ширина как в Default), спиннер 14 по центру, цвет — цвет текста.

## 3. Геометрия

| | Высота | Отступы | Радиус | Gap | Шрифт |
|---|---|---|---|---|---|
| M текст | 36 | 0 · 16 | 8 | 8 | Open Sans SemiBold 14/20 |
| S текст | 28 | 0 · 12 | 8 | 8 | Open Sans SemiBold 14/20 |
| Icon only M | 36 × 36 | — | 8 (Filter), 10 (Chevron left) | — | — |
| Icon only S | 28 × 28 | — | 8 | — | — |
| Link | 20 | 0 | 0 | 8 | `HCM/12 SemiBold · 20` |
| Иконка | 16 × 16 | | | | |

Стиль текста у кнопок отвязан (в библиотеке стиль «Button M» — 14/18); размер задан напрямую.

## 4. Остались расхождения с ДС

| Что | В компоненте | В ДС |
|---|---|---|
| Disabled | прозрачность 45 % | фон `--q-content-background-disabled`, текст `--q-base-100`, курсор not-allowed |
| Радиус иконочной M (Filter) | 8 | 10 |
| Link | 12/20 | `ui-button-s-xs` 12/20 — совпадает; на 14/20 не переводили |
| Названия | `Secondary + Destructive` = Danger | Danger, Danger soft |

## 5. Сборка в Figma (агент через Figma MCP)

1. Импортировать: `await figma.importComponentSetByKeyAsync('27a1c19e655f548e69bb7bdf261923d70760db87')`
   (в файле компонентов — `figma.getNodeByIdAsync('15:2505')`).
2. Вариант по имени, например `Variant=Primary, Intent=Default, Content=Text, Size=M, State=Default`.
   Тип выбирать по `button.md`, §2; соответствие — таблица §1. Сочетания нет — не собирать кнопку фигурами, сообщить.
3. Текст: `inst.setProperties({ 'Label#15:249': 'Сохранить' })`, у ссылки — `'Link label#15:431'`.
4. Иконка: `inst.setProperties({ 'Icon#102:0': iconComponent.id })`, где `iconComponent` — `Size=18 px` из набора
   Q.Icons, например «Еще» — pi-ellipsis-h (`importComponentByKeyAsync('90c7eb8037771288916694f47e71a45d72fd06e9')`).
5. На голубом фоне — `Variant=White`, на белом и сером — `Variant=Secondary`.
6. Группа — горизонтальный auto layout, gap 8, выравнивание вправо, Primary последней.
7. Состояния Hover, Pressed, Focus, Loading — только для показа состояний; на макете экрана — Default или Disabled.
