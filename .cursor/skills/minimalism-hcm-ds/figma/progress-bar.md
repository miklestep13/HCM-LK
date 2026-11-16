# Progress Bar — спецификация компонента и сборка в Figma

Источник: Figma «Q.HCM-components» (`RNiVz75ZZ0mNKJxcVYNMVq`), компонент **Progress Bar**, node `8:342`,
key `bcfd8f5346aab511a7babd844ddd215053b2bc8f`, сверка 30.10.2026. Размеры в px. Цвета — переменные Q.Palette,
в CSS — токены `--q-*` (`assets/progress-bar.css`). Правила выбора — `references/progress-bar.md`.

## 1. Варианты и свойства

24 варианта: `Type` × `Progress`.

| Свойство Figma | Тип | Значения / по умолчанию | CSS |
|---|---|---|---|
| `Type` | Variant | Error, Warning, Normal, Success · по умолчанию Error | `.q-prg--danger` / `--warning` / — / `--success` |
| `Progress` | Variant | 0%, 25%, 29%, 50%, 75%, 100% · по умолчанию 29% | `--p` на `.q-prg__fill` и текст `.q-prg__value` |
| `Label#8:51` | Text | `Выполнено` | `.q-prg__label` |
| `Subtitle#8:76` | Text | `Закрыто 2 из 7 задач` | `.q-prg__sub` |
| `Show label#8:1` | Boolean | true | наличие `.q-prg__label` |
| `Show subtitle#8:26` | Boolean | true | наличие `.q-prg__sub` |

Процент — не свойство: текст и ширина заливки зашиты в вариант `Progress` и всегда совпадают. По умолчанию в наборе
стоит Error — при вставке экземпляра Type нужно выставить явно (обычно Normal).

## 2. Токены

| Элемент | Переменная Figma (Q.Palette) | Стиль текста | CSS |
|---|---|---|---|
| Подпись | `Page/page-text-secondary` | `ui-body-2` 14/18 | `--q-page-text-secondary`, `--q-font-ui-body-2` |
| Процент | `Page/page-text` | `ui-headline-2` 20/26 | `--q-page-text`, `--q-font-ui-headline-2` |
| Подсчет | `Page/page-text-secondary` | `ui-description-1` 12/16 | `--q-page-text-secondary`, `--q-font-ui-description-1` |
| Трек | `Base/base-100` | — | `--q-base-100` |
| Заливка Normal | `Primary/primary` | — | `--q-primary-500` |
| Заливка Success | `Success/success` | — | `--q-success-500` |
| Заливка Warning | `Warning/warning` | — | `--q-warning-500` |
| Заливка Error | `Error/error` | — | `--q-error-500` |

Тексты привязаны к стилям «Minimalism UI». Type меняет только заливку: процент, подпись и подсчет одного цвета.

## 3. Геометрия

- Корень: вертикальный auto layout, ширина Fixed (исходно 700, тянуть по контейнеру), высота Hug, padding сверху 8,
  остальные 0, gap 6. Исходная высота — 70 (без подсчета — 48).
- Шапка: горизонтальная, Fill × Hug, `space-between`, выравнивание по низу, padding снизу 2. Слева контейнер подписи
  (Fill), справа процент (Hug). Высота 28.
- Трек: Fill × 6, радиус full (99), без auto layout. Заливка — прямоугольник высотой 6, радиус full, ограничение
  по горизонтали SCALE: при растяжении экземпляра доля сохраняется.
- Подсчет: Fill × Hug, перенос по ширине.

## 4. Поведение

- Растягивать экземпляр по ширине контейнера — доля заливки сохранится.
- Ширину заливки в экземпляре изменить нельзя: ограничение SCALE пересчитывает ее от варианта. Компонент оставлен
  как есть (решение 30.10.2026); соответствие процента и заливки обеспечивает агент (§6, шаг 5).
- Текст процента без правки заливки не подменять.
- Скрытый подсчет выпадает из auto layout, высота 48.

## 5. Открытые вопросы

- **Только размер L.** Компонент — крупная полоса шапки. M (виджеты, карточки) и S (ячейки) есть в верстке
  (`assets/progress-bar.css`), но не в Figma. До появления компонентов агент собирает их в Figma из стилей и переменных:
  M — подпись `ui-body-2` `base-500`, значение `ui-headline-3` `page-text`, трек 6 `base-100` через 8, подсчет
  `ui-description-1` `base-500` через 6; S — трек от 48 + значение `ui-description-1` справа, gap 8.
- **Набор долей ограничен:** 0, 25, 29, 50, 75 и 100%. Остальные доли — только в отвязанной копии (§6, шаг 5).
- **По умолчанию Error.** Красный вариант по умолчанию провоцирует ошибку; логичнее Normal.
- **Цвет подписи и подсчета.** `page-text-secondary` (#4a4a4a), а в ДС серый вторичный текст — `--q-base-500`.
- **Трек.** `base-100`, а в `SKILL.md` для полосы указан `--q-base-50`; в компоненте KPI — тоже `base-100`
  (`progressbar-bg`). Нужно одно правило.
- **Отступ сверху 8 внутри компонента.** Отступ до полосы в шапке объекта задает контекст (20) — в сумме выходит 28.

## 6. Сборка в Figma (агент через Figma MCP)

1. Импортировать набор: `await figma.importComponentSetByKeyAsync('bcfd8f5346aab511a7babd844ddd215053b2bc8f')`
   (в файле компонентов — `figma.getNodeByIdAsync('8:342')`).
2. Найти вариант по имени `Type=Normal, Progress=29%` и сделать `createInstance()`. Type выставить явно.
3. Тексты и видимость: `inst.setProperties({ 'Label#8:51':'Выполнено', 'Subtitle#8:76':'Закрыто 2 из 7 задач',
   'Show subtitle#8:26':true })`. Перед этим загрузить Open Sans Regular и SemiBold.
4. Вставить в auto layout контейнера и выставить `layoutSizingHorizontal = 'FILL'`.
5. Нужного процента нет среди вариантов — сделать полосу точной: взять ближайший вариант, поставить в раскладку,
   затем `const d = inst.detachInstance(); const f = d.findOne(n => n.name === 'Fill');
   f.resize(d.findOne(n => n.name === 'Track').width * доля, f.height); d.findOne(n => n.name === 'Value').characters = '20%';
   d.name = 'Progress Bar · отвязано'`. Цвета и стили текста остаются привязанными. Текст процента без заливки не менять.
