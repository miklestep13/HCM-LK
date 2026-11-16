# Цветовые токены Q.PALETTE

Снимок для макетов Q.HCM, 10.11.2026. В макете подписывают имя токена (`--q-primary-500`), не hex. Этот файл нужен, чтобы завести переменные в Figma или другом инструменте и сверить цвет.

Светлая тема — обычный макет. Темная включается только явно: на корне `data-hcm-theme="dark"`. В темной шкалы инвертированы, токен выбирают по роли. Ступень 500 у цветных палитр в этом снимке не переопределена и остается той же.

В источнике темной темы записаны палитры, страница, контент и часть бейджей. Остальные токены ссылаются на палитру и пересчитываются сами. Колонка «Темная» — уже пересчитанный цвет. Если в колонке «Задан как» есть пометка «темная», запись токена в темной теме другая, а не только палитра под ним.

Прозрачность — 8-значный hex: последние два знака альфа (`00` полностью прозрачный, `ff` плотный).

Имена `--blue`, `--raised`, `--dg` — алиасы прототипа. В новых макетах пишут `--q-*`.

Отступы и радиусы экрана — узкий набор, полная шкала лежит внизу файла. Разрешенный набор — в `foundations.md` дизайн-системы: отступы 4, 8, 12, 16, 24 (20 только у compact-виджета и карточки обучения); радиусы кнопок и полей 8, виджета 12, бейджа 6. Виджету тень не задают.

## Основные цвета экрана

| Роль | Токен | Светлая | Темная |
|---|---|---|---|
| Фон страницы | `--q-page-background` | #f0f3fa | #131313 |
| Фон виджета | `--q-content-background` | #ffffff | #1d1d1d |
| Фон виджета, второй | `--q-content-background-alt` | #f9fbff | #242424 |
| Текст | `--q-content-text` | #222b45 | #c7c7c7 |
| Текст вторичный | `--q-content-text-secondary` | #4a4a4a | #b6b6b6 |
| Текст приглушенный | `--q-base-500` | #69727b | #777777 |
| Ссылка и Primary | `--q-primary-500` | #3b82f6 | #3b82f6 |
| Тихий голубой фон | `--q-primary-50` | #e8f1f8 | #030b12 |
| Primary при наведении | `--q-primary-700` | #11446e | #77aad4 |
| Успех | `--q-success-500` | #29ab61 | #29ab61 |
| Успех, текст | `--q-success-700` | #1e7e47 | #1e7e47 |
| Предупреждение | `--q-warning-500` | #e18e46 | #e18e46 |
| Предупреждение, текст | `--q-warning-700` | #a26633 | #a26633 |
| Ошибка | `--q-error-500` | #c63737 | #c63737 |
| Ошибка, тихий фон | `--q-error-50` | #f9ebeb | #140606 |
| Ошибка, текст | `--q-error-700` | #8a2222 | #8a2222 |
| Обводка | `--q-content-border-secondary` | #d2d5d7 | #4d4d4d |
| Затемнение | `--q-overlay` | #00000066 | #00000099 |

## Палитры

Ступени одной палитры. Пустая ступень в источнике не задана.

### Нейтральный `base`

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-base` | var(--q-base-500) | #69727b | #777777 |
| `--q-base-0` | #ffffff → темная: #000000 | #ffffff | #000000 |
| `--q-base-50` | #ededed → темная: #0c0c0c | #ededed | #0c0c0c |
| `--q-base-100` | #d2d5d7 → темная: #242424 | #d2d5d7 | #242424 |
| `--q-base-300` | #969ca3 → темная: #535353 | #969ca3 | #535353 |
| `--q-base-500` | #69727b → темная: #777777 | #69727b | #777777 |
| `--q-base-700` | #3f444a → темная: #adadad | #3f444a | #adadad |
| `--q-base-900` | #151719 → темная: #e4e4e4 | #151719 | #e4e4e4 |
| `--q-base-1000` | #000000 → темная: #ffffff | #000000 | #ffffff |
| `--q-base-transparent-50` | #69727b0d → темная: #7777770d | #69727b0d | #7777770d |
| `--q-base-transparent-100` | #69727b1a → темная: #7777771a | #69727b1a | #7777771a |
| `--q-base-transparent-300` | #69727b4d → темная: #7777774d | #69727b4d | #7777774d |
| `--q-base-transparent-500` | #69727b80 → темная: #77777780 | #69727b80 | #77777780 |
| `--q-base-transparent-700` | #69727bb2 → темная: #777777b2 | #69727bb2 | #777777b2 |
| `--q-base-transparent-900` | #69727be5 → темная: #777777e5 | #69727be5 | #777777e5 |
| `--q-base-transparent` | var(--q-base-transparent-500) | #69727b80 | #77777780 |

### Основной синий `primary`

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-primary` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-primary-50` | #e8f1f8 → темная: #030b12 | #e8f1f8 | #030b12 |
| `--q-primary-100` | #bbd4ea → темная: #092237 | #bbd4ea | #092237 |
| `--q-primary-300` | #619ccd → темная: #144f81 | #619ccd | #144f81 |
| `--q-primary-500` | #3b82f6 | #3b82f6 | #3b82f6 |
| `--q-primary-700` | #11446e → темная: #77aad4 | #11446e | #77aad4 |
| `--q-primary-900` | #061725 → темная: #d2e3f1 | #061725 | #d2e3f1 |
| `--q-primary-transparent-50` | #7cc2fc0d → темная: #1d71b80d | #7cc2fc0d | #1d71b80d |
| `--q-primary-transparent-100` | #1d71b81a | #1d71b81a | #1d71b81a |
| `--q-primary-transparent-300` | #1d71b84d | #1d71b84d | #1d71b84d |
| `--q-primary-transparent-500` | #1d71b880 | #1d71b880 | #1d71b880 |
| `--q-primary-transparent-700` | #1d71b8b2 | #1d71b8b2 | #1d71b8b2 |
| `--q-primary-transparent-900` | #1d71b8e5 | #1d71b8e5 | #1d71b8e5 |
| `--q-primary-transparent` | var(--q-primary-transparent-500) | #1d71b880 | #1d71b880 |

### Дополнительный, бордо `extra`

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-extra` | var(--q-extra-500) | #b20035 | #b20035 |
| `--q-extra-50` | #f7e6eb → темная: #120005 | #f7e6eb | #120005 |
| `--q-extra-100` | #e8b3c2 → темная: #350010 | #e8b3c2 | #350010 |
| `--q-extra-300` | #c94d72 → темная: #7d0025 | #c94d72 | #7d0025 |
| `--q-extra-500` | #b20035 | #b20035 | #b20035 |
| `--q-extra-700` | #6b0020 → темная: #d16686 | #6b0020 | #d16686 |
| `--q-extra-900` | #490c1e → темная: #f0ccd7 | #490c1e | #f0ccd7 |
| `--q-extra-transparent-50` | #b200350d | #b200350d | #b200350d |
| `--q-extra-transparent-100` | #b200351a | #b200351a | #b200351a |
| `--q-extra-transparent-300` | #b200354d | #b200354d | #b200354d |
| `--q-extra-transparent-500` | #b2003580 | #b2003580 | #b2003580 |
| `--q-extra-transparent-700` | #b20035b2 | #b20035b2 | #b20035b2 |
| `--q-extra-transparent-900` | #b20035e5 | #b20035e5 | #b20035e5 |
| `--q-extra-transparent` | var(--q-extra-transparent-500) | #b2003580 | #b2003580 |

### Информация `info`

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-info` | var(--q-info-500) | #22bbee | #22bbee |
| `--q-info-50` | #e9f8fd → темная: #031318 | #e9f8fd | #031318 |
| `--q-info-100` | #bdebfa → темная: #0a3847 | #bdebfa | #0a3847 |
| `--q-info-300` | #64cff3 → темная: #1883a7 | #64cff3 | #1883a7 |
| `--q-info-500` | #22bbee | #22bbee | #22bbee |
| `--q-info-700` | #1988ad | #1988ad | #1988ad |
| `--q-info-900` | #10556c | #10556c | #10556c |
| `--q-info-transparent-50` | #22bbee0d | #22bbee0d | #22bbee0d |
| `--q-info-transparent-100` | #22bbee1a | #22bbee1a | #22bbee1a |
| `--q-info-transparent-300` | #22bbee4d | #22bbee4d | #22bbee4d |
| `--q-info-transparent-500` | #22bbee80 | #22bbee80 | #22bbee80 |
| `--q-info-transparent-700` | #22bbeeb2 | #22bbeeb2 | #22bbeeb2 |
| `--q-info-transparent-900` | #22bbeee5 | #22bbeee5 | #22bbeee5 |
| `--q-info-transparent` | var(--q-info-transparent-500) | #22bbee80 | #22bbee80 |

### Успех `success`

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-success` | var(--q-success-500) | #29ab61 | #29ab61 |
| `--q-success-50` | #eaf7ef → темная: #04110a | #eaf7ef | #04110a |
| `--q-success-100` | #bfe6d0 → темная: #0c331d | #bfe6d0 | #0c331d |
| `--q-success-300` | #69c490 → темная: #1d7844 | #69c490 | #1d7844 |
| `--q-success-500` | #29ab61 | #29ab61 | #29ab61 |
| `--q-success-700` | #1e7e47 | #1e7e47 | #1e7e47 |
| `--q-success-900` | #13512e | #13512e | #13512e |
| `--q-success-transparent-50` | #29ab610d | #29ab610d | #29ab610d |
| `--q-success-transparent-100` | #29ab611a | #29ab611a | #29ab611a |
| `--q-success-transparent-300` | #29ab614d | #29ab614d | #29ab614d |
| `--q-success-transparent-500` | #29ab6180 | #29ab6180 | #29ab6180 |
| `--q-success-transparent-700` | #29ab61b2 | #29ab61b2 | #29ab61b2 |
| `--q-success-transparent-900` | #29ab61e5 | #29ab61e5 | #29ab61e5 |
| `--q-success-transparent` | var(--q-success-transparent-500) | #29ab6180 | #29ab6180 |

### Предупреждение `warning`

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-warning` | var(--q-warning-500) | #e18e46 | #e18e46 |
| `--q-warning-50` | #fcf4ed → темная: #170e07 | #fcf4ed | #170e07 |
| `--q-warning-100` | #f6ddc8 → темная: #442b15 | #f6ddc8 | #442b15 |
| `--q-warning-300` | #eab07e → темная: #9e6331 | #eab07e | #9e6331 |
| `--q-warning-500` | #e18e46 | #e18e46 | #e18e46 |
| `--q-warning-700` | #a26633 | #a26633 | #a26633 |
| `--q-warning-900` | #573c1f → темная: #fceddd | #573c1f | #fceddd |
| `--q-warning-transparent-50` | #e18e460d | #e18e460d | #e18e460d |
| `--q-warning-transparent-100` | #e18e461a | #e18e461a | #e18e461a |
| `--q-warning-transparent-300` | #e18e464d | #e18e464d | #e18e464d |
| `--q-warning-transparent-500` | #e18e4680 | #e18e4680 | #e18e4680 |
| `--q-warning-transparent-700` | #e18e46b2 | #e18e46b2 | #e18e46b2 |
| `--q-warning-transparent-900` | #e18e46e5 → темная: #f2a354e6 | #e18e46e5 | #f2a354e6 |
| `--q-warning-transparent` | var(--q-warning-transparent-500) | #e18e4680 | #e18e4680 |

### Ошибка `error`

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-error` | var(--q-error-500) | #c63737 | #c63737 |
| `--q-error-50` | #f9ebeb → темная: #140606 | #f9ebeb | #140606 |
| `--q-error-100` | #eec3c3 → темная: #3b1111 | #eec3c3 | #3b1111 |
| `--q-error-300` | #d77373 → темная: #8b2727 | #d77373 | #8b2727 |
| `--q-error-500` | #c63737 | #c63737 | #c63737 |
| `--q-error-700` | #8a2222 | #8a2222 | #8a2222 |
| `--q-error-900` | #4d0d0d | #4d0d0d | #4d0d0d |
| `--q-error-transparent-50` | #c637370d | #c637370d | #c637370d |
| `--q-error-transparent-100` | #c637371a | #c637371a | #c637371a |
| `--q-error-transparent-300` | #c637374d | #c637374d | #c637374d |
| `--q-error-transparent-500` | #c6373780 | #c6373780 | #c6373780 |
| `--q-error-transparent-700` | #c63737b2 | #c63737b2 | #c63737b2 |
| `--q-error-transparent-900` | #c63737e5 | #c63737e5 | #c63737e5 |
| `--q-error-transparent` | var(--q-error-transparent-500) | #c6373780 | #c6373780 |

## Токены компонентов

Сортировка по имени токена. «Задан как» — запись в светлой теме; стрелка показывает другую запись в темной.

## Оверлей

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-overlay` | #00000066 → темная: #00000099 | #00000066 | #00000099 |

## Страница

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-page-background` | #f0f3fa → темная: #131313 | #f0f3fa | #131313 |
| `--q-page-link` | var(--q-primary-500) → темная: var(--q-primary-700) | #3b82f6 | #77aad4 |
| `--q-page-link-active` | var(--q-primary-700) | #11446e | #77aad4 |
| `--q-page-link-hover` | var(--q-primary-500) → темная: var(--q-primary-700) | #3b82f6 | #77aad4 |
| `--q-page-text` | #222b45 → темная: #c7c7c7 | #222b45 | #c7c7c7 |
| `--q-page-text-secondary` | #4a4a4a → темная: #b6b6b6 | #4a4a4a | #b6b6b6 |
| `--q-page-text-ui` | #7182ac → темная: #fafafa | #7182ac | #fafafa |

## Контент

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-content-background` | #ffffff → темная: #1d1d1d | #ffffff | #1d1d1d |
| `--q-content-background-alt` | #f9fbff → темная: var(--q-base-100) | #f9fbff | #242424 |
| `--q-content-background-disabled` | #f6f8fa → темная: #333333 | #f6f8fa | #333333 |
| `--q-content-border` | var(--q-primary-transparent-300) → темная: var(--q-base-transparent-300) | #1d71b84d | #7777774d |
| `--q-content-border-disabled` | #d2d5d7 → темная: #4d4d4d | #d2d5d7 | #4d4d4d |
| `--q-content-border-secondary` | var(--q-base-100) → темная: #4d4d4d | #d2d5d7 | #4d4d4d |
| `--q-content-focus-color` | var(--q-primary-transparent-500) | #1d71b880 | #1d71b880 |
| `--q-content-label` | var(--q-base-700) → темная: #848990 | #3f444a | #848990 |
| `--q-content-shadow-color` | #484e511a → темная: #0c0c0c | #484e511a | #0c0c0c |
| `--q-content-text` | #222b45 → темная: #c7c7c7 | #222b45 | #c7c7c7 |
| `--q-content-text-current` | var(--q-primary-700) | #11446e | #77aad4 |
| `--q-content-text-current-hover` | var(--q-primary-500) → темная: var(--q-primary-700) | #3b82f6 | #77aad4 |
| `--q-content-text-disabled` | #a6a6a6 → темная: var(--q-base-transparent-700) | #a6a6a6 | #777777b2 |
| `--q-content-text-inverted` | var(--q-base-0) → темная: var(--q-base-1000) | #ffffff | #ffffff |
| `--q-content-text-secondary` | #4a4a4a → темная: #b6b6b6 | #4a4a4a | #b6b6b6 |
| `--q-content-text-ui` | var(--q-base-700) → темная: #fafafa | #3f444a | #fafafa |

## Бейджи

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-badge-bg` | var(--q-primary-100) | #bbd4ea | #092237 |
| `--q-badge-burgundy-bg` | #d9b7ae → темная: #9f5c4a | #d9b7ae | #9f5c4a |
| `--q-badge-burgundy-color` | #722511 → темная: var(--q-base-1000) | #722511 | #ffffff |
| `--q-badge-burgundy-dot` | #722511 → темная: #9f5c4a | #722511 | #9f5c4a |
| `--q-badge-danger-bg` | var(--q-error-100) | #eec3c3 | #3b1111 |
| `--q-badge-danger-color` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-badge-danger-dot` | var(--q-error) | #c63737 | #c63737 |
| `--q-badge-dot` | var(--q-primary-100) | #bbd4ea | #092237 |
| `--q-badge-grey-bg` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-badge-grey-color` | var(--q-base-900) | #151719 | #e4e4e4 |
| `--q-badge-grey-dot` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-badge-info-bg` | var(--q-info-100) | #bdebfa | #0a3847 |
| `--q-badge-info-color` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-badge-info-dot` | var(--q-info) | #22bbee | #22bbee |
| `--q-badge-pink-bg` | #e9cbcb → темная: #9f407a | #e9cbcb | #9f407a |
| `--q-badge-pink-color` | #820000 → темная: var(--q-base-1000) | #820000 | #ffffff |
| `--q-badge-pink-dot` | #820000 → темная: #9f407a | #820000 | #9f407a |
| `--q-badge-purple-bg` | #e2d0db → темная: var(--q-extra-transparent-700) | #e2d0db | #b20035b2 |
| `--q-badge-purple-color` | #431733 → темная: var(--q-base-1000) | #431733 | #ffffff |
| `--q-badge-purple-dot` | #431733 → темная: var(--q-extra-transparent-700) | #431733 | #b20035b2 |
| `--q-badge-success-bg` | var(--q-success-100) | #bfe6d0 | #0c331d |
| `--q-badge-success-color` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-badge-success-dot` | var(--q-success) | #29ab61 | #29ab61 |
| `--q-badge-text` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-badge-turquoise-bg` | #d4dfe2 → темная: #506f7a | #d4dfe2 | #506f7a |
| `--q-badge-turquoise-color` | #31505c → темная: var(--q-base-1000) | #31505c | #ffffff |
| `--q-badge-turquoise-dot` | #31505c | #31505c | #31505c |
| `--q-badge-ui-bg` | var(--q-content-text-ui) | #3f444a | #fafafa |
| `--q-badge-ui-color` | var(--q-base-0) | #ffffff | #000000 |
| `--q-badge-ui-dot` | var(--q-content-text-ui) | #3f444a | #fafafa |
| `--q-badge-violet-bg` | #d6d1e7 → темная: #614fa3 | #d6d1e7 | #614fa3 |
| `--q-badge-violet-color` | #332272 → темная: var(--q-base-1000) | #332272 | #ffffff |
| `--q-badge-violet-dot` | #332272 → темная: #614fa3 | #332272 | #614fa3 |
| `--q-badge-warning-bg` | var(--q-warning-100) | #f6ddc8 | #442b15 |
| `--q-badge-warning-color` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-badge-warning-dot` | var(--q-warning) | #e18e46 | #e18e46 |

## Баннер

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-banner-bg` | var(--q-primary-700) | #11446e | #77aad4 |

## Кнопки

### Primary

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-button-primary-active-bg` | var(--q-primary-900) | #061725 | #d2e3f1 |
| `--q-button-primary-active-border` | var(--q-primary-900) | #061725 | #d2e3f1 |
| `--q-button-primary-bg` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-button-primary-border` | var(--q-button-primary-bg) | #3b82f6 | #3b82f6 |
| `--q-button-primary-constant-active-bg` | var(--q-button-primary-hover-bg) | #11446e | #77aad4 |
| `--q-button-primary-constant-active-border` | var(--q-button-primary-hover-border) | #11446e | #77aad4 |
| `--q-button-primary-constant-active-text` | var(--q-button-primary-text) | #ffffff | #000000 |
| `--q-button-primary-focus-outline` | var(--q-primary-transparent-500) | #1d71b880 | #1d71b880 |
| `--q-button-primary-hover-bg` | var(--q-primary-700) | #11446e | #77aad4 |
| `--q-button-primary-hover-border` | var(--q-button-primary-hover-bg) | #11446e | #77aad4 |
| `--q-button-primary-outlined-active-bg` | var(--q-primary-transparent-300) | #1d71b84d | #1d71b84d |
| `--q-button-primary-outlined-active-border` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-button-primary-outlined-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-primary-outlined-border` | var(--q-button-primary-outlined-text) | #3b82f6 | #3b82f6 |
| `--q-button-primary-outlined-constant-active-bg` | var(--q-button-primary-outlined-hover-bg) | #1d71b81a | #1d71b81a |
| `--q-button-primary-outlined-constant-active-border` | var(--q-button-primary-outlined-hover-border) | #3b82f6 | #3b82f6 |
| `--q-button-primary-outlined-constant-active-text` | var(--q-primary-700) | #11446e | #77aad4 |
| `--q-button-primary-outlined-focus-outline` | var(--q-button-primary-focus-outline) | #1d71b880 | #1d71b880 |
| `--q-button-primary-outlined-hover-bg` | var(--q-primary-transparent-100) | #1d71b81a | #1d71b81a |
| `--q-button-primary-outlined-hover-border` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-button-primary-outlined-text` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-button-primary-text` | var(--q-base-0) | #ffffff | #000000 |
| `--q-button-primary-text-active-bg` | var(--q-primary-transparent-300) | #1d71b84d | #1d71b84d |
| `--q-button-primary-text-active-border` | #00000000 | #00000000 | #00000000 |
| `--q-button-primary-text-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-primary-text-border` | #00000000 | #00000000 | #00000000 |
| `--q-button-primary-text-constant-active-bg` | var(--q-button-primary-text-hover-bg) | #1d71b81a | #1d71b81a |
| `--q-button-primary-text-constant-active-border` | var(--q-button-primary-text-hover-border) | #00000000 | #00000000 |
| `--q-button-primary-text-constant-active-text` | var(--q-button-primary-text-text) | #3b82f6 | #3b82f6 |
| `--q-button-primary-text-focus-outline` | var(--q-button-primary-focus-outline) | #1d71b880 | #1d71b880 |
| `--q-button-primary-text-hover-bg` | var(--q-primary-transparent-100) | #1d71b81a | #1d71b81a |
| `--q-button-primary-text-hover-border` | #00000000 | #00000000 | #00000000 |
| `--q-button-primary-text-text` | var(--q-primary-500) | #3b82f6 | #3b82f6 |

### Secondary

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-button-secondary-active-bg` | var(--q-base-700) | #3f444a | #adadad |
| `--q-button-secondary-active-border` | var(--q-button-secondary-active-bg) | #3f444a | #adadad |
| `--q-button-secondary-bg` | var(--q-base-300) | #969ca3 | #535353 |
| `--q-button-secondary-border` | var(--q-button-secondary-bg) | #969ca3 | #535353 |
| `--q-button-secondary-constant-active-bg` | var(--q-button-secondary-hover-bg) | #69727b | #777777 |
| `--q-button-secondary-constant-active-border` | var(--q-button-secondary-hover-border) | #69727b | #777777 |
| `--q-button-secondary-constant-active-text` | var(--q-button-secondary-text) | #ffffff | #000000 |
| `--q-button-secondary-focus-outline` | var(--q-base-transparent-500) | #69727b80 | #77777780 |
| `--q-button-secondary-hover-bg` | var(--q-base-500) | #69727b | #777777 |
| `--q-button-secondary-hover-border` | var(--q-button-secondary-hover-bg) | #69727b | #777777 |
| `--q-button-secondary-outlined-active-bg` | var(--q-base-300) | #969ca3 | #535353 |
| `--q-button-secondary-outlined-active-border` | var(--q-button-secondary-outlined-border) | #3f444a | #adadad |
| `--q-button-secondary-outlined-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-secondary-outlined-border` | var(--q-button-secondary-outlined-text) | #3f444a | #adadad |
| `--q-button-secondary-outlined-constant-active-bg` | var(--q-button-secondary-outlined-hover-bg) | #d2d5d7 | #242424 |
| `--q-button-secondary-outlined-constant-active-border` | var(--q-button-secondary-outlined-hover-border) | #3f444a | #adadad |
| `--q-button-secondary-outlined-constant-active-text` | var(--q-button-secondary-outlined-text) | #3f444a | #adadad |
| `--q-button-secondary-outlined-focus-outline` | var(--q-button-secondary-focus-outline) | #69727b80 | #77777780 |
| `--q-button-secondary-outlined-hover-bg` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-button-secondary-outlined-hover-border` | var(--q-button-secondary-outlined-border) | #3f444a | #adadad |
| `--q-button-secondary-outlined-text` | var(--q-base-700) | #3f444a | #adadad |
| `--q-button-secondary-text` | var(--q-base-0) | #ffffff | #000000 |
| `--q-button-secondary-text-active-bg` | var(--q-base-transparent-300) | #69727b4d | #7777774d |
| `--q-button-secondary-text-active-border` | var(--q-button-secondary-text-border) | #00000000 | #00000000 |
| `--q-button-secondary-text-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-secondary-text-border` | var(--q-button-secondary-text-bg) | #00000000 | #00000000 |
| `--q-button-secondary-text-constant-active-bg` | var(--q-button-secondary-text-hover-bg) | #69727b1a | #7777771a |
| `--q-button-secondary-text-constant-active-border` | var(--q-button-secondary-text-hover-border) | #00000000 | #00000000 |
| `--q-button-secondary-text-constant-active-text` | var(--q-button-secondary-text-text) | #3f444a | #adadad |
| `--q-button-secondary-text-focus-outline` | var(--q-button-secondary-focus-outline) | #69727b80 | #77777780 |
| `--q-button-secondary-text-hover-bg` | var(--q-base-transparent-100) | #69727b1a | #7777771a |
| `--q-button-secondary-text-hover-border` | var(--q-button-secondary-text-border) | #00000000 | #00000000 |
| `--q-button-secondary-text-text` | var(--q-base-700) | #3f444a | #adadad |

### Info

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-button-info-active-bg` | var(--q-info-900) | #10556c | #10556c |
| `--q-button-info-active-border` | var(--q-info-900) | #10556c | #10556c |
| `--q-button-info-bg` | var(--q-info) | #22bbee | #22bbee |
| `--q-button-info-border` | var(--q-info) | #22bbee | #22bbee |
| `--q-button-info-constant-active-bg` | var(--q-button-info-hover-bg) | #1988ad | #1988ad |
| `--q-button-info-constant-active-border` | var(--q-button-info-hover-border) | #1988ad | #1988ad |
| `--q-button-info-constant-active-text` | var(--q-button-info-text) | #ffffff | #000000 |
| `--q-button-info-focus-outline` | var(--q-info-300) | #64cff3 | #1883a7 |
| `--q-button-info-hover-bg` | var(--q-info-700) | #1988ad | #1988ad |
| `--q-button-info-hover-border` | var(--q-info-700) | #1988ad | #1988ad |
| `--q-button-info-outlined-active-bg` | var(--q-info-transparent-300) | #22bbee4d | #22bbee4d |
| `--q-button-info-outlined-active-border` | var(--q-button-info-outlined-border) | #22bbee | #22bbee |
| `--q-button-info-outlined-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-info-outlined-border` | var(--q-button-info-outlined-text) | #22bbee | #22bbee |
| `--q-button-info-outlined-constant-active-bg` | var(--q-button-info-outlined-hover-bg) | #22bbee1a | #22bbee1a |
| `--q-button-info-outlined-constant-active-border` | var(--q-button-info-outlined-hover-border) | #22bbee | #22bbee |
| `--q-button-info-outlined-constant-active-text` | var(--q-button-info-outlined-text) | #22bbee | #22bbee |
| `--q-button-info-outlined-focus-outline` | var(--q-button-info-focus-outline) | #64cff3 | #1883a7 |
| `--q-button-info-outlined-hover-bg` | var(--q-info-transparent-100) | #22bbee1a | #22bbee1a |
| `--q-button-info-outlined-hover-border` | var(--q-button-info-outlined-border) | #22bbee | #22bbee |
| `--q-button-info-outlined-text` | var(--q-info-500) | #22bbee | #22bbee |
| `--q-button-info-text` | var(--q-base-0) | #ffffff | #000000 |
| `--q-button-info-text-active-bg` | var(--q-info-transparent-300) | #22bbee4d | #22bbee4d |
| `--q-button-info-text-active-border` | var(--q-button-info-text-border) | #00000000 | #00000000 |
| `--q-button-info-text-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-info-text-border` | var(--q-button-info-text-bg) | #00000000 | #00000000 |
| `--q-button-info-text-constant-active-bg` | var(--q-button-info-text-hover-bg) | #22bbee1a | #22bbee1a |
| `--q-button-info-text-constant-active-border` | var(--q-button-info-text-hover-border) | #00000000 | #00000000 |
| `--q-button-info-text-constant-active-text` | var(--q-button-info-text-text) | #22bbee | #22bbee |
| `--q-button-info-text-focus-outline` | var(--q-button-info-focus-outline) | #64cff3 | #1883a7 |
| `--q-button-info-text-hover-bg` | var(--q-info-transparent-100) | #22bbee1a | #22bbee1a |
| `--q-button-info-text-hover-border` | var(--q-button-info-text-border) | #00000000 | #00000000 |
| `--q-button-info-text-text` | var(--q-info) | #22bbee | #22bbee |

### Success

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-button-success-active-bg` | var(--q-success-900) | #13512e | #13512e |
| `--q-button-success-active-border` | var(--q-success-900) | #13512e | #13512e |
| `--q-button-success-bg` | var(--q-success) | #29ab61 | #29ab61 |
| `--q-button-success-border` | var(--q-success) | #29ab61 | #29ab61 |
| `--q-button-success-constant-active-bg` | var(--q-button-success-hover-bg) | #1e7e47 | #1e7e47 |
| `--q-button-success-constant-active-border` | var(--q-button-success-hover-border) | #1e7e47 | #1e7e47 |
| `--q-button-success-constant-active-text` | var(--q-button-success-text) | #ffffff | #000000 |
| `--q-button-success-focus-outline` | var(--q-success-300) | #69c490 | #1d7844 |
| `--q-button-success-hover-bg` | var(--q-success-700) | #1e7e47 | #1e7e47 |
| `--q-button-success-hover-border` | var(--q-success-700) | #1e7e47 | #1e7e47 |
| `--q-button-success-outlined-active-bg` | var(--q-success-transparent-300) | #29ab614d | #29ab614d |
| `--q-button-success-outlined-active-border` | var(--q-button-success-outlined-border) | #29ab61 | #29ab61 |
| `--q-button-success-outlined-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-success-outlined-border` | var(--q-button-success-outlined-text) | #29ab61 | #29ab61 |
| `--q-button-success-outlined-constant-active-bg` | var(--q-button-success-outlined-hover-bg) | #29ab611a | #29ab611a |
| `--q-button-success-outlined-constant-active-border` | var(--q-button-success-outlined-hover-border) | #29ab61 | #29ab61 |
| `--q-button-success-outlined-constant-active-text` | var(--q-button-success-outlined-text) | #29ab61 | #29ab61 |
| `--q-button-success-outlined-focus-outline` | var(--q-button-success-focus-outline) | #69c490 | #1d7844 |
| `--q-button-success-outlined-hover-bg` | var(--q-success-transparent-100) | #29ab611a | #29ab611a |
| `--q-button-success-outlined-hover-border` | var(--q-button-success-outlined-border) | #29ab61 | #29ab61 |
| `--q-button-success-outlined-text` | var(--q-success-500) | #29ab61 | #29ab61 |
| `--q-button-success-text` | var(--q-base-0) | #ffffff | #000000 |
| `--q-button-success-text-active-bg` | var(--q-success-transparent-300) | #29ab614d | #29ab614d |
| `--q-button-success-text-active-border` | var(--q-button-success-text-border) | #00000000 | #00000000 |
| `--q-button-success-text-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-success-text-border` | var(--q-button-success-text-bg) | #00000000 | #00000000 |
| `--q-button-success-text-constant-active-bg` | var(--q-button-success-text-hover-bg) | #29ab611a | #29ab611a |
| `--q-button-success-text-constant-active-border` | var(--q-button-success-text-hover-border) | #00000000 | #00000000 |
| `--q-button-success-text-constant-active-text` | var(--q-button-success-text-text) | #29ab61 | #29ab61 |
| `--q-button-success-text-focus-outline` | var(--q-button-success-focus-outline) | #69c490 | #1d7844 |
| `--q-button-success-text-hover-bg` | var(--q-success-transparent-100) | #29ab611a | #29ab611a |
| `--q-button-success-text-hover-border` | var(--q-button-success-text-border) | #00000000 | #00000000 |
| `--q-button-success-text-text` | var(--q-success) | #29ab61 | #29ab61 |

### Warning

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-button-warning-active-bg` | var(--q-warning-900) | #573c1f | #fceddd |
| `--q-button-warning-active-border` | var(--q-warning-900) | #573c1f | #fceddd |
| `--q-button-warning-bg` | var(--q-warning) | #e18e46 | #e18e46 |
| `--q-button-warning-border` | var(--q-warning) | #e18e46 | #e18e46 |
| `--q-button-warning-constant-active-bg` | var(--q-button-warning-hover-bg) | #a26633 | #a26633 |
| `--q-button-warning-constant-active-border` | var(--q-button-warning-hover-border) | #a26633 | #a26633 |
| `--q-button-warning-constant-active-text` | var(--q-button-warning-text) | #ffffff | #000000 |
| `--q-button-warning-focus-outline` | var(--q-warning-300) | #eab07e | #9e6331 |
| `--q-button-warning-hover-bg` | var(--q-warning-700) | #a26633 | #a26633 |
| `--q-button-warning-hover-border` | var(--q-warning-700) | #a26633 | #a26633 |
| `--q-button-warning-outlined-active-bg` | var(--q-warning-transparent-300) | #e18e464d | #e18e464d |
| `--q-button-warning-outlined-active-border` | var(--q-button-warning-outlined-border) | #e18e46 | #e18e46 |
| `--q-button-warning-outlined-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-warning-outlined-border` | var(--q-button-warning-outlined-text) | #e18e46 | #e18e46 |
| `--q-button-warning-outlined-constant-active-bg` | var(--q-button-warning-outlined-hover-bg) | #e18e461a | #e18e461a |
| `--q-button-warning-outlined-constant-active-border` | var(--q-button-warning-outlined-hover-border) | #e18e46 | #e18e46 |
| `--q-button-warning-outlined-constant-active-text` | var(--q-button-warning-outlined-text) | #e18e46 | #e18e46 |
| `--q-button-warning-outlined-focus-outline` | var(--q-button-warning-focus-outline) | #eab07e | #9e6331 |
| `--q-button-warning-outlined-hover-bg` | var(--q-warning-transparent-100) | #e18e461a | #e18e461a |
| `--q-button-warning-outlined-hover-border` | var(--q-button-warning-outlined-border) | #e18e46 | #e18e46 |
| `--q-button-warning-outlined-text` | var(--q-warning-500) | #e18e46 | #e18e46 |
| `--q-button-warning-text` | var(--q-base-0) | #ffffff | #000000 |
| `--q-button-warning-text-active-bg` | var(--q-warning-transparent-300) | #e18e464d | #e18e464d |
| `--q-button-warning-text-active-border` | var(--q-button-warning-text-border) | #00000000 | #00000000 |
| `--q-button-warning-text-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-warning-text-border` | var(--q-button-warning-text-bg) | #00000000 | #00000000 |
| `--q-button-warning-text-constant-active-bg` | var(--q-button-warning-text-hover-bg) | #e18e461a | #e18e461a |
| `--q-button-warning-text-constant-active-border` | var(--q-button-warning-text-hover-border) | #00000000 | #00000000 |
| `--q-button-warning-text-constant-active-text` | var(--q-button-warning-text-text) | #e18e46 | #e18e46 |
| `--q-button-warning-text-focus-outline` | var(--q-button-warning-focus-outline) | #eab07e | #9e6331 |
| `--q-button-warning-text-hover-bg` | var(--q-warning-transparent-100) | #e18e461a | #e18e461a |
| `--q-button-warning-text-hover-border` | var(--q-button-warning-text-border) | #00000000 | #00000000 |
| `--q-button-warning-text-text` | var(--q-warning) | #e18e46 | #e18e46 |

### Help, палитра extra

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-button-help-active-bg` | var(--q-extra-900) | #490c1e | #f0ccd7 |
| `--q-button-help-active-border` | var(--q-extra-900) | #490c1e | #f0ccd7 |
| `--q-button-help-bg` | var(--q-extra) | #b20035 | #b20035 |
| `--q-button-help-border` | var(--q-extra) | #b20035 | #b20035 |
| `--q-button-help-constant-active-bg` | var(--q-button-help-hover-bg) | #6b0020 | #d16686 |
| `--q-button-help-constant-active-border` | var(--q-button-help-hover-border) | #6b0020 | #d16686 |
| `--q-button-help-constant-active-text` | var(--q-button-help-text) | #ffffff | #000000 |
| `--q-button-help-focus-outline` | var(--q-extra-300) | #c94d72 | #7d0025 |
| `--q-button-help-hover-bg` | var(--q-extra-700) | #6b0020 | #d16686 |
| `--q-button-help-hover-border` | var(--q-extra-700) | #6b0020 | #d16686 |
| `--q-button-help-outlined-active-bg` | var(--q-extra-transparent-300) | #b200354d | #b200354d |
| `--q-button-help-outlined-active-border` | var(--q-button-help-outlined-border) | #b20035 | #b20035 |
| `--q-button-help-outlined-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-help-outlined-border` | var(--q-button-help-outlined-text) | #b20035 | #b20035 |
| `--q-button-help-outlined-constant-active-bg` | var(--q-button-help-outlined-hover-bg) | #b200351a | #b200351a |
| `--q-button-help-outlined-constant-active-border` | var(--q-button-help-outlined-hover-border) | #b20035 | #b20035 |
| `--q-button-help-outlined-constant-active-text` | var(--q-button-help-outlined-text) | #b20035 | #b20035 |
| `--q-button-help-outlined-focus-outline` | var(--q-button-help-focus-outline) | #c94d72 | #7d0025 |
| `--q-button-help-outlined-hover-bg` | var(--q-extra-transparent-100) | #b200351a | #b200351a |
| `--q-button-help-outlined-hover-border` | var(--q-button-help-outlined-border) | #b20035 | #b20035 |
| `--q-button-help-outlined-text` | var(--q-extra-500) | #b20035 | #b20035 |
| `--q-button-help-text` | var(--q-base-0) | #ffffff | #000000 |
| `--q-button-help-text-active-bg` | var(--q-extra-transparent-300) | #b200354d | #b200354d |
| `--q-button-help-text-active-border` | var(--q-button-help-text-border) | #00000000 | #00000000 |
| `--q-button-help-text-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-help-text-border` | var(--q-button-help-text-bg) | #00000000 | #00000000 |
| `--q-button-help-text-constant-active-bg` | var(--q-button-help-text-hover-bg) | #b200351a | #b200351a |
| `--q-button-help-text-constant-active-border` | var(--q-button-help-text-hover-border) | #00000000 | #00000000 |
| `--q-button-help-text-constant-active-text` | var(--q-button-help-text-text) | #b20035 | #b20035 |
| `--q-button-help-text-focus-outline` | var(--q-button-help-focus-outline) | #c94d72 | #7d0025 |
| `--q-button-help-text-hover-bg` | var(--q-extra-transparent-100) | #b200351a | #b200351a |
| `--q-button-help-text-hover-border` | var(--q-button-help-text-border) | #00000000 | #00000000 |
| `--q-button-help-text-text` | var(--q-extra) | #b20035 | #b20035 |

### Danger

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-button-danger-active-bg` | var(--q-error-900) | #4d0d0d | #4d0d0d |
| `--q-button-danger-active-border` | var(--q-error-900) | #4d0d0d | #4d0d0d |
| `--q-button-danger-bg` | var(--q-error) | #c63737 | #c63737 |
| `--q-button-danger-border` | var(--q-error) | #c63737 | #c63737 |
| `--q-button-danger-constant-active-bg` | var(--q-button-danger-hover-bg) | #8a2222 | #8a2222 |
| `--q-button-danger-constant-active-border` | var(--q-button-danger-hover-border) | #8a2222 | #8a2222 |
| `--q-button-danger-constant-active-text` | var(--q-button-danger-text) | #ffffff | #000000 |
| `--q-button-danger-focus-outline` | var(--q-error-300) | #d77373 | #8b2727 |
| `--q-button-danger-hover-bg` | var(--q-error-700) | #8a2222 | #8a2222 |
| `--q-button-danger-hover-border` | var(--q-error-700) | #8a2222 | #8a2222 |
| `--q-button-danger-outlined-active-bg` | var(--q-error-transparent-300) | #c637374d | #c637374d |
| `--q-button-danger-outlined-active-border` | var(--q-button-danger-outlined-border) | #c63737 | #c63737 |
| `--q-button-danger-outlined-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-danger-outlined-border` | var(--q-button-danger-outlined-text) | #c63737 | #c63737 |
| `--q-button-danger-outlined-constant-active-bg` | var(--q-button-danger-outlined-hover-bg) | #c637371a | #c637371a |
| `--q-button-danger-outlined-constant-active-border` | var(--q-button-danger-outlined-hover-border) | #c63737 | #c63737 |
| `--q-button-danger-outlined-constant-active-text` | var(--q-button-danger-outlined-text) | #c63737 | #c63737 |
| `--q-button-danger-outlined-focus-outline` | var(--q-button-danger-focus-outline) | #d77373 | #8b2727 |
| `--q-button-danger-outlined-hover-bg` | var(--q-error-transparent-100) | #c637371a | #c637371a |
| `--q-button-danger-outlined-hover-border` | var(--q-button-danger-outlined-border) | #c63737 | #c63737 |
| `--q-button-danger-outlined-text` | var(--q-error-500) | #c63737 | #c63737 |
| `--q-button-danger-text` | var(--q-base-0) | #ffffff | #000000 |
| `--q-button-danger-text-active-bg` | var(--q-error-transparent-300) | #c637374d | #c637374d |
| `--q-button-danger-text-active-border` | var(--q-button-danger-text-border) | #00000000 | #00000000 |
| `--q-button-danger-text-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-danger-text-border` | var(--q-button-danger-text-bg) | #00000000 | #00000000 |
| `--q-button-danger-text-constant-active-bg` | var(--q-button-danger-text-hover-bg) | #c637371a | #c637371a |
| `--q-button-danger-text-constant-active-border` | var(--q-button-danger-text-hover-border) | #00000000 | #00000000 |
| `--q-button-danger-text-constant-active-text` | var(--q-button-danger-text-text) | #c63737 | #c63737 |
| `--q-button-danger-text-focus-outline` | var(--q-button-danger-focus-outline) | #d77373 | #8b2727 |
| `--q-button-danger-text-hover-bg` | var(--q-error-transparent-100) | #c637371a | #c637371a |
| `--q-button-danger-text-hover-border` | var(--q-button-danger-text-border) | #00000000 | #00000000 |
| `--q-button-danger-text-text` | var(--q-error) | #c63737 | #c63737 |

### Plain

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-button-plain-active-bg` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-button-plain-active-border` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-button-plain-bg` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-button-plain-border` | var(--q-button-plain-bg) | #000000 | #ffffff |
| `--q-button-plain-constant-active-bg` | var(--q-button-plain-hover-bg) | #11446e | #77aad4 |
| `--q-button-plain-constant-active-border` | var(--q-button-plain-hover-border) | #11446e | #77aad4 |
| `--q-button-plain-constant-active-text` | var(--q-button-plain-text) | #ffffff | #000000 |
| `--q-button-plain-focus-outline` | var(--q-primary-900) | #061725 | #d2e3f1 |
| `--q-button-plain-hover-bg` | var(--q-primary-700) | #11446e | #77aad4 |
| `--q-button-plain-hover-border` | var(--q-primary-700) | #11446e | #77aad4 |
| `--q-button-plain-outlined-active-bg` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-button-plain-outlined-active-border` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-button-plain-outlined-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-plain-outlined-border` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-button-plain-outlined-constant-active-bg` | var(--q-button-plain-outlined-hover-bg) | #1d71b81a | #1d71b81a |
| `--q-button-plain-outlined-constant-active-border` | var(--q-button-plain-outlined-hover-border) | #000000 | #ffffff |
| `--q-button-plain-outlined-constant-active-text` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-button-plain-outlined-focus-outline` | var(--q-base-500) | #69727b | #777777 |
| `--q-button-plain-outlined-hover-bg` | var(--q-primary-transparent-100) | #1d71b81a | #1d71b81a |
| `--q-button-plain-outlined-hover-border` | var(--q-button-plain-outlined-border) | #000000 | #ffffff |
| `--q-button-plain-outlined-text` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-button-plain-text` | var(--q-base-0) | #ffffff | #000000 |
| `--q-button-plain-text-active-bg` | var(--q-primary-transparent-300) | #1d71b84d | #1d71b84d |
| `--q-button-plain-text-active-border` | var(--q-primary-transparent-300) | #1d71b84d | #1d71b84d |
| `--q-button-plain-text-bg` | #00000000 | #00000000 | #00000000 |
| `--q-button-plain-text-border` | var(--q-button-plain-text-bg) | #00000000 | #00000000 |
| `--q-button-plain-text-constant-active-bg` | var(--q-button-plain-text-hover-bg) | #1d71b81a | #1d71b81a |
| `--q-button-plain-text-constant-active-border` | var(--q-button-plain-text-hover-border) | #1d71b81a | #1d71b81a |
| `--q-button-plain-text-constant-active-text` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-button-plain-text-focus-outline` | var(--q-primary-transparent-300) | #1d71b84d | #1d71b84d |
| `--q-button-plain-text-hover-bg` | var(--q-primary-transparent-100) | #1d71b81a | #1d71b81a |
| `--q-button-plain-text-hover-border` | var(--q-primary-transparent-100) | #1d71b81a | #1d71b81a |
| `--q-button-plain-text-text` | var(--q-base-1000) | #000000 | #ffffff |

### Raised

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-button-raised-text-bg` | var(--q-primary-50) | #e8f1f8 | #030b12 |

## Диалог

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-dialog-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-dialog-content-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-dialog-footer-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-dialog-footer-fileview` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-dialog-footer-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-dialog-header-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-dialog-header-text` | var(--q-content-text) | #222b45 | #c7c7c7 |

## Корневые панели

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-root-feedback-edit-settings-border` | var(--q-primary-300) | #619ccd | #144f81 |
| `--q-root-plugins-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-root-plugins-border` | var(--q-content-border) | #1d71b84d | #7777774d |
| `--q-root-plugins-panel-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-root-plugins-panel-border` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-root-plugins-panel-button-active-bg` | var(--q-primary-transparent-100) | #1d71b81a | #1d71b81a |
| `--q-root-plugins-panel-button-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-root-plugins-panel-button-bg-hover` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-root-plugins-panel-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-root-plugins-panel-text-active` | var(--q-content-text-current) | #11446e | #77aad4 |
| `--q-root-plugins-panel-text-hover` | var(--q-content-text-current-hover) | #3b82f6 | #77aad4 |
| `--q-root-plugins-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-root-sp-menu-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-root-tabs-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-root-tabs-border` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-root-tabs-button-bg-hover` | var(--q-primary-transparent-100) | #1d71b81a | #1d71b81a |
| `--q-root-tabs-divider` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |
| `--q-root-tabs-tab-after-bg` | var(--q-content-text-current) | #11446e | #77aad4 |
| `--q-root-tabs-tab-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-root-tabs-tab-bg-hover` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-root-tabs-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-root-tabs-text-hover` | var(--q-content-text-current-hover) | #3b82f6 | #77aad4 |

## Сайдбар

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-sidebar-active-bg` | var(--q-primary-transparent-100) | #1d71b81a | #1d71b81a |
| `--q-sidebar-active-text` | var(--q-primary-700) | #11446e | #77aad4 |
| `--q-sidebar-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-sidebar-border` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-sidebar-hover` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-sidebar-icon` | var(--q-base-500) | #69727b | #777777 |
| `--q-sidebar-text` | var(--q-content-text) | #222b45 | #c7c7c7 |

## Сегмент

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-selectbutton-bg` | #00000000 | #00000000 | #00000000 |
| `--q-selectbutton-bg-active` | var(--q-base-0) | #ffffff | #000000 |
| `--q-selectbutton-bg-hover` | var(--q-base-transparent-300) | #69727b4d | #7777774d |
| `--q-selectbutton-text` | var(--q-base-1000) | #000000 | #ffffff |

## Переключатель-кнопка

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-togglebutton-bg` | var(--q-base-0) | #ffffff | #000000 |
| `--q-togglebutton-bg-active` | var(--q-primary) | #3b82f6 | #3b82f6 |
| `--q-togglebutton-bg-active-hover` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-togglebutton-bg-hover` | var(--q-primary-50) | #e8f1f8 | #030b12 |

## Поля

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-input-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-input-bg-disabled` | var(--q-content-background-disabled) | #f6f8fa | #333333 |
| `--q-input-border` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |
| `--q-input-border-disabled` | var(--q-content-border-disabled) | #d2d5d7 | #4d4d4d |
| `--q-input-error` | var(--q-error) | #c63737 | #c63737 |
| `--q-input-error-focus` | var(--q-error-transparent-500) | #c6373780 | #c6373780 |
| `--q-input-filled` | var(--q-primary) | #3b82f6 | #3b82f6 |
| `--q-input-float-label-color-active` | var(--q-input-filled) | #3b82f6 | #3b82f6 |
| `--q-input-float-label-color-default` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-input-focus-outline` | var(--q-primary-300) | #619ccd | #144f81 |
| `--q-input-hover-border` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-input-icon-color` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-input-label-text` | var(--q-content-label) | #3f444a | #848990 |
| `--q-input-panel-bg` | var(--q-base-0) | #ffffff | #000000 |
| `--q-input-panel-header-bg` | var(--q-base-50) | #ededed | #0c0c0c |
| `--q-input-panel-item-active-color` | var(--q-primary) | #3b82f6 | #3b82f6 |
| `--q-input-panel-item-hover-bg` | var(--q-primary-transparent-300) | #1d71b84d | #1d71b84d |
| `--q-input-panel-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-input-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-input-text-disabled` | var(--q-content-text-disabled) | #a6a6a6 | #777777b2 |
| `--q-input-token-bg` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--q-input-token-color` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-input-warning` | var(--q-warning) | #e18e46 | #e18e46 |

## Меню

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-menu-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-menu-bg-active` | var(--q-primary-transparent-300) | #1d71b84d | #1d71b84d |
| `--q-menu-border` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |
| `--q-menu-hover` | var(--q-primary-transparent-300) | #1d71b84d | #1d71b84d |
| `--q-menu-separator` | var(--q-menu-border) | #d2d5d7 | #4d4d4d |
| `--q-menu-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-menu-text-active` | var(--q-primary) | #3b82f6 | #3b82f6 |
| `--q-menu-text-disabled` | var(--q-content-text-disabled) | #a6a6a6 | #777777b2 |

## Календарь

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-calendar-bg` | var(--q-base-0) | #ffffff | #000000 |
| `--q-calendar-bg-active` | var(--q-primary-100) | #bbd4ea | #092237 |
| `--q-calendar-bg-hover` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-calendar-border` | var(--q-primary-300) | #619ccd | #144f81 |
| `--q-calendar-header-title-elems-bg` | #00000000 | #00000000 | #00000000 |
| `--q-calendar-header-title-elems-color` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-calendar-shadow` | var(--q-content-shadow-color) | #484e511a | #0c0c0c |
| `--q-calendar-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-calendar-text-active` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-calendar-text-disabled` | var(--q-content-text-disabled) | #a6a6a6 | #777777b2 |
| `--q-calendar-time-border` | var(--q-primary-300) | #619ccd | #144f81 |
| `--q-calendar-today-bg` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-calendar-today-text` | var(--q-base-0) | #ffffff | #000000 |

## Чекбокс

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-checkbox-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-checkbox-bg-active` | var(--q-primary) | #3b82f6 | #3b82f6 |
| `--q-checkbox-border` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-checkbox-border-active` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-checkbox-color` | var(--q-content-text-secondary) | #4a4a4a | #b6b6b6 |
| `--q-checkbox-error-main` | var(--q-error) | #c63737 | #c63737 |
| `--q-checkbox-focus` | var(--q-primary-300) | #619ccd | #144f81 |
| `--q-checkbox-hover` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-checkbox-icon-active` | #ffffff | #ffffff | #ffffff |

## Радиокнопка

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-radiobutton-bg-active` | var(--q-primary) | #3b82f6 | #3b82f6 |
| `--q-radiobutton-border` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-radiobutton-border-active` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-radiobutton-error-main` | var(--q-error) | #c63737 | #c63737 |
| `--q-radiobutton-focus` | var(--q-primary-300) | #619ccd | #144f81 |
| `--q-radiobutton-hover` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-radiobutton-icon-active` | #ffffff | #ffffff | #ffffff |

## Свитчер

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-switcher-bg` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-switcher-bg-active` | var(--q-primary) | #3b82f6 | #3b82f6 |
| `--q-switcher-border` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-switcher-border-active` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-switcher-border-inverted` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-switcher-checked-border-inverted` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-switcher-error-focus` | #d0030554 | #d0030554 | #d0030554 |
| `--q-switcher-error-main` | var(--q-error) | #c63737 | #c63737 |
| `--q-switcher-focus` | var(--q-primary-300) | #619ccd | #144f81 |
| `--q-switcher-slider` | #ffffff | #ffffff | #ffffff |
| `--q-switcher-slider-active` | #ffffff | #ffffff | #ffffff |

## Карточка

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-card-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-card-border` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |
| `--q-card-header-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-card-header-border-bottom` | #00000000 | #00000000 | #00000000 |
| `--q-card-header-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-card-text` | var(--q-content-text) | #222b45 | #c7c7c7 |

## Фильтр

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-filter-wrapper-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-filter-wrapper-bg-active` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-filter-wrapper-bg-hover` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--q-filter-wrapper-border` | var(--q-content-border) | #1d71b84d | #7777774d |
| `--q-filter-wrapper-border-active` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-filter-wrapper-border-hover` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-filter-wrapper-text` | var(--q-content-text) | #222b45 | #c7c7c7 |

## Таблица

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-table-body-bg` | var(--q-base-0) | #ffffff | #000000 |
| `--q-table-body-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-table-border` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |
| `--q-table-checkbox-border` | var(--q-switcher-border) | #d2d5d7 | #242424 |
| `--q-table-header-bg` | var(--q-base-0) | #ffffff | #000000 |
| `--q-table-header-border` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |
| `--q-table-header-input-bg` | var(--q-base-0) | #ffffff | #000000 |
| `--q-table-header-text` | var(--q-content-text-ui) | #3f444a | #fafafa |
| `--q-table-hover-header-bg` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--q-table-hover-header-text` | var(--q-primary-700) | #11446e | #77aad4 |
| `--q-table-hover-tr` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--q-table-select` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--q-table-striped-line-bg` | var(--q-base-50) | #ededed | #0c0c0c |

## Пагинация

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-pagination-arrow` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-pagination-bg-active` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--q-pagination-bg-hover` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--q-pagination-dropdown-bg` | #00000000 | #00000000 | #00000000 |
| `--q-pagination-dropdown-border` | var(--q-content-border) | #1d71b84d | #7777774d |
| `--q-pagination-focus` | var(--q-primary-300) | #619ccd | #144f81 |
| `--q-pagination-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-pagination-text-active` | var(--q-primary-500) | #3b82f6 | #3b82f6 |

## Дерево

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-tree-bg-hover` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--q-tree-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-tree-text-hover` | var(--q-primary-500) | #3b82f6 | #3b82f6 |

## Ссылка

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-link-text` | var(--q-primary-500) | #3b82f6 | #3b82f6 |

## Тултип

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-tooltip-bg` | var(--q-content-text-ui) | #3f444a | #fafafa |
| `--q-tooltip-text` | var(--q-base-0) | #ffffff | #000000 |

## Подтверждение

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-confirm-popup-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-confirm-popup-reject-text` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-confirm-popup-text` | var(--q-content-text) | #222b45 | #c7c7c7 |

## Аккордеон

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-accordion-border` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |
| `--q-accordion-content-bg` | var(--q-base-0) | #ffffff | #000000 |
| `--q-accordion-content-border-top` | var(--q-accordion-border) | #d2d5d7 | #4d4d4d |
| `--q-accordion-header-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-accordion-header-bg-active` | var(--q-base-50) | #ededed | #0c0c0c |
| `--q-accordion-header-bg-hover` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--q-accordion-secondary-border` | var(--q-page-background) | #f0f3fa | #131313 |
| `--q-accordion-secondary-content-bg` | var(--q-page-background) | #f0f3fa | #131313 |
| `--q-accordion-secondary-content-border-top` | var(--q-page-background) | #f0f3fa | #131313 |
| `--q-accordion-secondary-header-bg` | var(--q-page-background) | #f0f3fa | #131313 |
| `--q-accordion-secondary-header-bg-active` | var(--q-page-background) | #f0f3fa | #131313 |
| `--q-accordion-secondary-header-bg-hover` | var(--q-page-background) | #f0f3fa | #131313 |
| `--q-accordion-secondary-toggle-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-accordion-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-accordion-toggle-bg` | #00000000 | #00000000 | #00000000 |

## Вкладки

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-tabs-active` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-tabs-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-tabs-border-color` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |
| `--q-tabs-btn-border-color` | var(--q-tabs-border-color) | #d2d5d7 | #4d4d4d |
| `--q-tabs-content-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-tabs-disabled` | var(--q-content-text-disabled) | #a6a6a6 | #777777b2 |
| `--q-tabs-header-text` | var(--q-base-900) | #151719 | #e4e4e4 |
| `--q-tabs-hover` | var(--q-base-500) | #69727b | #777777 |
| `--q-tabs-nav-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-tabs-nav-item-bg` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-tabs-nav-item-bg-active` | var(--q-tabs-nav-item-bg) | #ffffff | #1d1d1d |
| `--q-tabs-nav-item-bg-hover` | var(--q-content-background) | #ffffff | #1d1d1d |
| `--q-tabs-nav-item-border-color` | var(--q-tabs-border-color) | #d2d5d7 | #4d4d4d |
| `--q-tabs-nav-item-border-color-hover` | var(--q-tabs-border-color) | #d2d5d7 | #4d4d4d |
| `--q-tabs-text` | var(--q-content-text) | #222b45 | #c7c7c7 |

## Хлебные крошки

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-breadcrumb-bg` | #00000000 | #00000000 | #00000000 |
| `--q-breadcrumb-icon` | var(--q-content-text-secondary) | #4a4a4a | #b6b6b6 |
| `--q-breadcrumb-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-breadcrumb-text-current` | var(--q-content-text) | #222b45 | #c7c7c7 |

## Разделитель

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-divider-bg` | var(--q-primary-300) | #619ccd | #144f81 |

## Карусель

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-carousel-arrow-bg` | var(--q-primary-100) | #bbd4ea | #092237 |
| `--q-carousel-arrow-border` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-carousel-arrow-hover` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-carousel-arrow-icon` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-carousel-item-bg` | var(--q-base-0) | #ffffff | #000000 |
| `--q-carousel-pagination-active` | #8ecaff | #8ecaff | #8ecaff |
| `--q-carousel-pagination-bg` | #b9bec4 | #b9bec4 | #b9bec4 |

## Спиннер

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-spinner-base` | var(--q-base-1000) | #000000 | #ffffff |
| `--q-spinner-error` | var(--q-error) | #c63737 | #c63737 |
| `--q-spinner-extra` | var(--q-extra) | #b20035 | #b20035 |
| `--q-spinner-info` | var(--q-info) | #22bbee | #22bbee |
| `--q-spinner-primary` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-spinner-success` | var(--q-success) | #29ab61 | #29ab61 |
| `--q-spinner-warning` | var(--q-warning) | #e18e46 | #e18e46 |

## Полоса прогресса

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-progressbar-bg` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-progressbar-text` | var(--q-base-0) | #ffffff | #000000 |
| `--q-progressbar-value-bg` | var(--q-primary-500) | #3b82f6 | #3b82f6 |

## Слайдер

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-slider-bg` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--q-slider-knob-bg` | #ffffff | #ffffff | #ffffff |
| `--q-slider-range` | var(--q-primary-500) | #3b82f6 | #3b82f6 |

## Шаги

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-steps-active-bg` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-steps-active-icon` | var(--q-base-0) | #ffffff | #000000 |
| `--q-steps-active-text` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--q-steps-bg` | var(--q-primary-100) | #bbd4ea | #092237 |
| `--q-steps-border` | var(--q-primary-300) | #619ccd | #144f81 |
| `--q-steps-done` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--q-steps-hover` | #2f79bb | #2f79bb | #2f79bb |
| `--q-steps-text` | #484e51bf | #484e51bf | #484e51bf |

## Сообщения

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-message-error-bg` | var(--q-error-100) | #eec3c3 | #3b1111 |
| `--q-message-info-bg` | var(--q-primary-100) | #bbd4ea | #092237 |
| `--q-message-success-bg` | var(--q-success-100) | #bfe6d0 | #0c331d |
| `--q-message-warning-bg` | var(--q-warning-100) | #f6ddc8 | #442b15 |

## Загрузка файлов

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-uploader-bg` | var(--q-base-0) | #ffffff | #000000 |
| `--q-uploader-border` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |
| `--q-uploader-img-bg` | var(--q-primary-100) | #bbd4ea | #092237 |
| `--q-uploader-img-border` | var(--q-primary-300) | #619ccd | #144f81 |
| `--q-uploader-img-hover` | var(--q-primary) | #3b82f6 | #3b82f6 |
| `--q-uploader-text` | var(--q-content-text) | #222b45 | #c7c7c7 |

## Панель

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-panel-border` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |

## Комплект документов

| Токен | Задан как | Светлая | Темная |
|---|---|---|---|
| `--q-docset-section-bg` | var(--q-card-bg) | #ffffff | #1d1d1d |

## Алиасы прототипа

Старые короткие имена. Новый макет пишет правый `--q-*` токен из колонки «Задан как».

| Алиас | Задан как | Светлая | Темная |
|---|---|---|---|
| `--bdg-n` | var(--q-base-50) | #ededed | #0c0c0c |
| `--black` | var(--t1) | #222b45 | #c7c7c7 |
| `--blue` | var(--q-primary-500) | #3b82f6 | #3b82f6 |
| `--blue-bg` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--blue-bg2` | var(--q-primary-100) | #bbd4ea | #092237 |
| `--blue-br` | var(--q-input-hover-border) | #3b82f6 | #3b82f6 |
| `--chip` | var(--s2) | #ededed | #0c0c0c |
| `--chip-bg` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--dg` | var(--q-error-700) | #8a2222 | #8a2222 |
| `--dg-ac` | var(--q-error-500) | #c63737 | #c63737 |
| `--dg-bg` | var(--q-badge-danger-bg) | #eec3c3 | #3b1111 |
| `--grey` | var(--t2) | #4a4a4a | #b6b6b6 |
| `--hv` | var(--q-primary-50) | #e8f1f8 | #030b12 |
| `--ok` | var(--q-success-700) | #1e7e47 | #1e7e47 |
| `--ok-ac` | var(--q-success-500) | #29ab61 | #29ab61 |
| `--ok-bg` | var(--q-badge-success-bg) | #bfe6d0 | #0c331d |
| `--org` | var(--warn) | #a26633 | #a26633 |
| `--org-bg` | var(--warn-bg) | #f6ddc8 | #442b15 |
| `--page` | var(--q-page-background) | #f0f3fa | #131313 |
| `--pink` | var(--q-badge-pink-dot) | #820000 | #9f407a |
| `--pink-bg` | var(--q-badge-pink-bg) | #e9cbcb | #9f407a |
| `--raised` | var(--blue-bg) | #e8f1f8 | #030b12 |
| `--red` | var(--dg) | #8a2222 | #8a2222 |
| `--red-bg` | var(--dg-bg) | #eec3c3 | #3b1111 |
| `--s1` | var(--q-content-background-disabled) | #f6f8fa | #333333 |
| `--s2` | var(--q-base-50) | #ededed | #0c0c0c |
| `--stroke` | var(--q-content-border-secondary) | #d2d5d7 | #4d4d4d |
| `--stroke2` | var(--q-input-border) | #d2d5d7 | #4d4d4d |
| `--stroke3` | var(--q-base-100) | #d2d5d7 | #242424 |
| `--t1` | var(--q-content-text) | #222b45 | #c7c7c7 |
| `--t2` | var(--q-content-text-secondary) | #4a4a4a | #b6b6b6 |
| `--t3` | var(--q-base-500) | #69727b | #777777 |
| `--t4` | var(--q-content-text-disabled) | #a6a6a6 | #777777b2 |
| `--track` | var(--q-base-50) | #ededed | #0c0c0c |
| `--ui` | var(--q-page-text-ui) | #7182ac | #fafafa |
| `--violet` | var(--q-badge-violet-bg) | #d6d1e7 | #614fa3 |
| `--warn` | var(--q-warning-700) | #a26633 | #a26633 |
| `--warn-ac` | var(--q-warning-500) | #e18e46 | #e18e46 |
| `--warn-bg` | var(--q-badge-warning-bg) | #f6ddc8 | #442b15 |
| `--white` | var(--q-content-background) | #ffffff | #1d1d1d |

## Отступы, радиусы, тени

Полная шкала Q.PALETTE. На экране берут узкий набор из `foundations.md`: отступы 4 · 8 · 12 · 16 · 24, и 20 только у compact-виджета и карточки обучения. Радиусы: кнопки и поля 8, иконочная кнопка 36 — 10, KPI 10, виджет и карточка 12, модалка 16, бейдж и счетчик 6, бары и чипсы — полный. Нельзя 5, 7, 9, 14. Кругов нет.

Виджету и карточке тень не задают. Тени ниже — у выпадающих списков, поповеров, тостов, календаря, панелей и баннера.

Кольцо фокуса кнопок — 2 px `--q-primary-500` с зазором 2 px. У остальных контролов рамка и кольцо 3 px, токен `--q-focus-ring-width`.

| Токен | Значение |
|---|---|
| `--q-spacing-0` | 0px |
| `--q-spacing-1` | 4px |
| `--q-spacing-2` | 8px |
| `--q-spacing-3` | 12px |
| `--q-spacing-4` | 16px |
| `--q-spacing-5` | 20px |
| `--q-spacing-6` | 24px |
| `--q-spacing-8` | 32px |
| `--q-spacing-10` | 40px |
| `--q-spacing-12` | 48px |
| `--q-spacing-16` | 64px |
| `--q-spacing-20` | 80px |
| `--q-spacing-24` | 96px |
| `--q-radius-none` | 0px |
| `--q-radius-xs` | 2px |
| `--q-radius-sm` | 4px |
| `--q-radius-md` | 8px |
| `--q-radius-control` | 10px |
| `--q-radius-lg` | 12px |
| `--q-radius-xl` | 16px |
| `--q-radius-2xl` | 24px |
| `--q-radius-3xl` | 32px |
| `--q-radius-full` | 9999px |
| `--q-shadow-dropdown` | 0 8px 24px 0 rgba(207, 210, 236, 0.35) |
| `--q-shadow-popover` | 0 4px 12px 0 rgba(207, 210, 236, 0.35) |
| `--q-shadow-toast` | 0 4px 12px 0 rgba(190, 208, 224, 0.20) |
| `--q-shadow-calendar` | 0 0 4px 0 rgba(141, 137, 137, 0.25), 6px 6px 10px 0 rgba(137, 124, 124, 0.10) |
| `--q-shadow-panel` | 0 8px 24px 0 rgba(120, 125, 174, 0.35) |
| `--q-shadow-banner` | 0 4px 4px 0 rgba(0, 0, 0, 0.25) |
| `--q-shadow-line` | inset 0 -1px 0 0 #d3d3d3 |
| `--q-focus-ring-width` | 3px |
| `--q-transition` | 150ms ease |

В справочнике 699 цветовых записей, из них алиасов прототипа 40. Плюс 32 токенов размеров и теней.
