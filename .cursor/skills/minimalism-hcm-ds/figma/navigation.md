# Navigation и Nav / Menu item — спецификация и сборка в Figma

Источник: Figma «Q.HCM-components» (`RNiVz75ZZ0mNKJxcVYNMVq`), секция `user` (`142:5941`), фрейм «Navigation · компоненты»
(временно, будет разнесено), собрано 01.11.2026 по шапке прототипа Q.HCM, цвета поправлены дизайнером вручную 01.11.2026 (`.hd`, `.tab`, `.menu`, `.mi`, `.me`, `.ib`).
Размеры в px. В CSS — `assets/navigation.css`. Правила — `references/navigation.md`.

| Компонент | Node | Key |
|---|---|---|
| `Nav / Menu item` | `156:3227` | `3ad14120047115d1bf9d55698c46a13d10f7ecb0` |
| `Navigation` | `157:3457` | `22d9a7dae1824f14da784434970d8467e5ea159a` |

Страница правил в Figma — «Navigation · Правила использования» (`166:3558`), рядом с компонентами.

## 1. `Nav / Menu item` — 8 вариантов

| Свойство | Значения | По умолчанию |
|---|---|---|
| `Level` | Top, Dropdown, Separator | Top |
| `State` | Top: Default, Hover, Active · Dropdown: Default, Hover, Selected, Danger · Separator: Default | Default |
| `Label` | Text | «Menu item» |
| `Value` | Text (Dropdown) | «Value» |
| `Chevron` | Boolean (Top) | true |
| `Submenu` | Boolean (Dropdown) — шеврон вложенного списка | false |
| `Show value` | Boolean (Dropdown) | false |

| Вариант | Геометрия | Текст | Фон |
|---|---|---|---|
| Top · Default | h32, 6 · 8, gap 8, радиус 8, шеврон 12 | 14/20 SemiBold `Menus/menu-text`, шеврон `page-text-ui` | — |
| Top · Hover | | `Primary/primary-500`, шеврон `page-text-ui` | `Primary/primary-50` |
| Top · Active | | `Menus/menu-text-active`, шеврон тоже | `Primary/primary-50` |
| Dropdown · Default | 232 × 36, 0 · 12, gap 8, радиус 8 | 14/20 SemiBold `Menus/menu-text`; значение 14/18 `base-500`; шеврон вправо 12 `page-text-ui` | — |
| Dropdown · Hover | | `Menus/menu-text-active`, шеврон тоже | `Primary/primary-50` |
| Dropdown · Selected | | `Primary/primary-500` | `Primary/primary-50` |
| Dropdown · Danger | | 14/20 SemiBold `Error/error-500` | — |
| Separator | 232, 4 · 8 | линия 1 `content-border-secondary` | — |

## 2. `Navigation` — 3 варианта

| Свойство | Значения | По умолчанию |
|---|---|---|
| `State` | Default, Menu open, Profile open | Default |
| `Search`, `Notifications` | Boolean | true |
| `Settings` | Boolean | false |
| `Item 3` | Boolean — третий раздел (в Q.HCM — «Управление персоналом», роль 2) | true |

Открытые экземпляры: `Item 1`–`Item 3` (Label, State), `User` (Name, Position, Photo).

- Корень: 1440 × 48, горизонтальный auto layout, поля 120 (контейнер 1240), фон `content-background`, линия снизу 1
  `Base/base-transparent-300`, прозрачность заливки 30 %.
- `Left`: `Logo` (знак 24 радиус 6 `primary-500` с «Q» 14/20 SemiBold `base-0` + «Q.HCM» 14/20 SemiBold) → 16 → `Menu`
  (3 × `Level=Top`, gap 8). `Spacer` — Fill.
- `Right`: `Actions` (3 × Button Ghost Icon only M: `pi-search`, `pi-bell`, `pi-cog`, gap 0) → 8 → `Profile`
  (padding 4 8 4 4, радиус 10, gap 8: `User` Row M шириной 220 + шеврон 12 `page-text-ui`; в Profile open — фон
  `primary-50`).
- Выпадающий список (`Dropdown`): 240, padding 4, радиус 8, фон `Menus/menu-bg`, тень 0 8 24 rgba(207, 210, 236, .35)
  (`--q-shadow-dropdown`); абсолютно, y = 52 (48 + 4), x — по левому краю пункта. Вложенный (`Submenu`) — справа от
  списка, по верху пункта с `Submenu`. Меню пользователя — по правому краю (x = 1440 − 120 − 240, привязка Right: при изменении ширины шапки остается под
  областью пользователя).

## 3. Сборка в Figma (агент через Figma MCP)

1. Импортировать: `importComponentSetByKeyAsync('22d9a7dae1824f14da784434970d8467e5ea159a')` (Navigation) и
   `'3ad14120047115d1bf9d55698c46a13d10f7ecb0'` (Menu item).
2. Экран: `Navigation`, `State=Default`, ширина 1440 сверху страницы. Разделы — по роли: `Item 3` выкл. для роли 1.
3. Тексты разделов: `inst.findOne(n => n.name === 'Item 2').setProperties({ [ключ 'Label#…']: 'Мой кабинет', State: 'Active' })`.
4. Пользователь: `inst.findOne(n => n.name === 'User')` → `Name`, `Position`; фото — заливка экземпляра `Photo`.
5. Показ списков — `State=Menu open` / `Profile open`; тексты пунктов — `Label` вложенных экземпляров.
6. Отдельные списки для других мест (меню «…» в карточке) собирать из `Nav / Menu item`, `Level=Dropdown`.

## 4. Что приведено к одному значению

| Что | В прототипе | В компоненте |
|---|---|---|
| Пункт раздела | h32, 0 · 12, gap 5 | h32, 6 · 8, gap 8 (ДС `.q-menu-item`) |
| Активный раздел / ховер | фон primary-50, активный — текст primary-500 | так же: фон `primary-50`; Active — текст `menu-text-active` |
| Выпадающий список | радиус 12, padding 6, тень 0 10 34 | радиус 8, padding 4, тень dropdown (ДС Dropdown list) |
| Пункт списка | 14/20 SemiBold, 9 · 12 (38); ховер и текущий — фон primary-50, текст primary-500 | 14/20 SemiBold, h36 (сетка 4); цвета как в прототипе |
| Вложенный список | шеврон вниз, повернутый | `Submenu` — chevron-right 12 |
| Иконки действий | `.ib` 36, радиус 10 | Button Ghost Icon only M 36, радиус 10, иконки 18 |
| Область пользователя | аватар 36 круглый, подпись page-text-ui, 4 6 4 4 | `User` Row M (аватар радиус 10, подпись base-500), 4 8 4 4 |
| Логотип | «Q.HCM» 20/26 primary-700 | знак 24 + «Q.HCM» 14/20 SemiBold (ДС: `ui-headline-4`, иконка primary-500) |

## 5. Открытые вопросы

- **Знак логотипа** (квадрат 24 с «Q») — допущение; в ДС только «логотип `ui-headline-4`, иконка primary-500».
- **Ширина**: компонент на 1440 (поля 120); на 1280 и 1536 поля меняются вместе с `.q-wrap` — в Figma вручную.
- **Открытый раздел** выглядит как Hover — отдельного варианта нет.
- **`Menus/menu-hover`** в Q.Palette — primary 30 %, темнее прототипа; в навигации вместо него `primary-50`.
- **Радиус списка**: в прототипе 12, в ДС (Dropdown list) 8 — в компоненте 8.
- **Значки на иконках** (количество уведомлений) в прототипе нет — в компоненте не предусмотрены.
