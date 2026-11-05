/* Реестр иконок (SVG из прототипа). Добавить иконку: новое имя → разметка <svg>. */
export const ICONS: Record<string, string> = {
  video:
    '<svg viewBox="0 0 18 18" fill="none"><rect x="1.2" y="3.6" width="10.4" height="10.8" rx="2" stroke="currentColor" stroke-width="1.5"></rect><path d="M11.6 7.6L16.8 4.9v8.2l-5.2-2.7z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path></svg>',
  chat: '<svg viewBox="0 0 18 18" fill="none"><path d="M2.2 8A5.2 5.2 0 0 1 7.4 2.8h3.2a5.2 5.2 0 0 1 0 10.4H6.2l-3.2 2.8v-3.4A5.2 5.2 0 0 1 2.2 8Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path></svg>',
  bug: '<svg viewBox="0 0 18 18" fill="none"><rect x="5.2" y="5.6" width="7.6" height="9" rx="3.8" stroke="currentColor" stroke-width="1.5"></rect><path d="M6.6 5.4a2.4 2.4 0 0 1 4.8 0M2.6 8h2.6m7.6 0h2.6M2.6 12.4h2.6m7.6 0h2.6M4.4 4l1.6 1.6M13.6 4L12 5.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path></svg>',
  link: '<svg viewBox="0 0 18 18" fill="none"><path d="M7.5 10.5l3-3M8 5.5l1.2-1.2a3 3 0 0 1 4.3 4.3L12.3 9.8M10 12.5l-1.2 1.2a3 3 0 0 1-4.3-4.3L5.7 8.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"></path></svg>',
  heart:
    '<svg viewBox="0 0 18 18" fill="none"><path d="M9 15.2 3.2 9.6A3.4 3.4 0 0 1 8 4.8l1 1 1-1a3.4 3.4 0 0 1 4.8 4.8L9 15.2z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path></svg>',
  splitView:
    '<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="2.8" width="12" height="10.4" rx="1.6" stroke="currentColor" stroke-width="1.4"></rect><path d="M9.4 2.8v10.4" stroke="currentColor" stroke-width="1.4"></path><path d="M11 6h1.4M11 8h1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path></svg>',
  open: '<svg viewBox="0 0 16 16" fill="none"><path d="M9 2.6h4.4V7M13 3 8.2 7.8M12.4 9.6v2.8a1.4 1.4 0 0 1-1.4 1.4H4.2a1.4 1.4 0 0 1-1.4-1.4V5.6a1.4 1.4 0 0 1 1.4-1.4H7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  wallet:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H17v3" stroke="var(--q-button-primary-text)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path><rect x="4" y="7.5" width="16" height="11.5" rx="2.5" stroke="var(--q-button-primary-text)" stroke-width="1.8"></rect><path d="M15.5 13.2h2" stroke="var(--q-button-primary-text)" stroke-width="2.2" stroke-linecap="round"></path></svg>',
  coin: '<svg viewBox="0 0 18 18" fill="none" class="cuico"><rect x="1" y="1" width="16" height="16" rx="2.6" fill="#AE1F3E"></rect><path d="M3.7 13.4c.8-4 3.9-7.1 7.6-7.1 1.5 0 2.8.5 3.7 1.4-.9-.1-1.7.1-2.3.6.8.4 1.4 1 1.7 1.8-.9-.8-2.1-1.1-3.4-1.1-3.1 0-5.8 1.6-7.3 4.4Z" fill="#fff"></path></svg>',
  info: '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4"></circle><path d="M8 7.2v4M8 4.9v.1" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path></svg>',
  edit: '<svg viewBox="0 0 16 16" fill="none"><path d="M11.2 2.6a1.7 1.7 0 0 1 2.4 2.4l-7.5 7.5-3.2.8.8-3.2 7.5-7.5Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"></path></svg>',
  calendarGrey:
    '<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3.4" width="12" height="10.6" rx="1.8" stroke="var(--q-base-500)" stroke-width="1.3"></rect><path d="M2 6.4h12M5.4 2v2.6M10.6 2v2.6" stroke="var(--q-base-500)" stroke-width="1.3" stroke-linecap="round"></path></svg>',
  calendar:
    '<svg viewBox="0 0 16 16" fill="none"><rect x="2" y="3.4" width="12" height="10.4" rx="2" stroke="currentColor" stroke-width="1.4"></rect><path d="M5.2 1.8v2.6M10.8 1.8v2.6M2 6.6h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path></svg>',
  clock:
    '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4"></circle><path d="M8 4.6V8l2.4 1.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  pin: '<svg viewBox="0 0 16 16" fill="none"><path d="M8 14.2s4.4-4 4.4-7.4a4.4 4.4 0 1 0-8.8 0c0 3.4 4.4 7.4 4.4 7.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"></path><circle cx="8" cy="6.8" r="1.6" stroke="currentColor" stroke-width="1.4"></circle></svg>',
  user: '<svg viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.6" r="2.4" stroke="currentColor" stroke-width="1.3"></circle><path d="M2.2 12.2a4.8 4.8 0 0 1 9.6 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path></svg>',
  gift: '<svg viewBox="0 0 14 14" fill="none"><rect x="1.8" y="5.6" width="10.4" height="6.6" rx="1.1" stroke="currentColor" stroke-width="1.3"></rect><path d="M1.2 5.6h11.6v2.1H1.2zM7 5.6v6.6" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"></path><path d="M7 5.6S6.2 1.8 4.4 1.8a1.6 1.6 0 0 0 0 3.2H7Zm0 0s.8-3.8 2.6-3.8a1.6 1.6 0 0 1 0 3.2H7Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"></path></svg>',
  heartSm:
    '<svg viewBox="0 0 14 14" fill="none"><path d="M7 11.8S1.6 8.6 1.6 5.2A2.9 2.9 0 0 1 7 3.7a2.9 2.9 0 0 1 5.4 1.5c0 3.4-5.4 6.6-5.4 6.6Z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"></path></svg>',
  chevron:
    '<svg viewBox="0 0 12 12" fill="none"><path d="M3 4.6 6 7.6l3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  search:
    '<svg viewBox="0 0 20 20" fill="none"><circle cx="9" cy="9" r="5.6" stroke="currentColor" stroke-width="1.7"></circle><path d="M13.2 13.2 17.2 17.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"></path></svg>',
  bell: '<svg viewBox="0 0 20 20" fill="none"><path d="M10 3.2a4.4 4.4 0 0 0-4.4 4.4v2.7L4.3 13h11.4l-1.3-2.7V7.6A4.4 4.4 0 0 0 10 3.2Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path><path d="M8.2 15.4a1.9 1.9 0 0 0 3.6 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path></svg>',
  settings:
    '<svg viewBox="0 0 20 20" fill="none"><path d="M15.53 8.63 17.50 8.75 17.50 11.25 15.53 11.37 14.88 12.94 16.18 14.42 14.42 16.18 12.94 14.88 11.37 15.53 11.25 17.50 8.75 17.50 8.63 15.53 7.06 14.88 5.58 16.18 3.82 14.42 5.12 12.94 4.47 11.37 2.50 11.25 2.50 8.75 4.47 8.63 5.12 7.06 3.82 5.58 5.58 3.82 7.06 5.12 8.63 4.47 8.75 2.50 11.25 2.50 11.37 4.47 12.94 5.12 14.42 3.82 16.18 5.58 14.88 7.06Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path><circle cx="10" cy="10" r="2.4" stroke="currentColor" stroke-width="1.6"></circle></svg>',
  like: '<svg viewBox="0 0 20 20" fill="none"><path d="M6.4 17.2V8.6l3.8-5.4c.9-.2 1.7.4 1.7 1.3v3.3h3.6a1.6 1.6 0 0 1 1.6 1.9l-.9 5.2a1.9 1.9 0 0 1-1.9 1.6H6.4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path><rect x="2.4" y="8.6" width="4" height="8.6" rx="1.2" stroke="currentColor" stroke-width="1.5"></rect></svg>',
  comment:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M13.4 9.4a1.6 1.6 0 0 1-1.6 1.6H5.2L2.6 13.6V3.8a1.6 1.6 0 0 1 1.6-1.6h7.6a1.6 1.6 0 0 1 1.6 1.6v5.6Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"></path></svg>',
  eye: '<svg viewBox="0 0 16 16" fill="none"><path d="M1.4 8S3.8 3.6 8 3.6 14.6 8 14.6 8 12.2 12.4 8 12.4 1.4 8 1.4 8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"></path><circle cx="8" cy="8" r="2.1" stroke="currentColor" stroke-width="1.4"></circle></svg>',
  filter:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M2.2 3.4h11.6L9.4 8.4v4.4L6.6 14V8.4L2.2 3.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  chevDown:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M4 6.4 8 10.4l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  plus: '<svg viewBox="0 0 16 16" fill="none"><path d="M8 3.2v9.6M3.2 8h9.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  minus:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M3.2 8h9.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  /** свернуть все: стрелки к центру */
  collapseAll: '<svg viewBox="0 0 16 16" fill="none"><path d="M4.8 2.8 8 6l3.2-3.2M4.8 13.2 8 10l3.2 3.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  /** развернуть все: стрелки от центра */
  expandAll: '<svg viewBox="0 0 16 16" fill="none"><path d="M4.8 6 8 2.8 11.2 6M4.8 10 8 13.2 11.2 10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  fit: '<svg viewBox="0 0 16 16" fill="none"><path d="M2.4 5.6V2.4h3.2M10.4 2.4h3.2v3.2M13.6 10.4v3.2h-3.2M5.6 13.6H2.4v-3.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrowUp:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M8 13V3.4M4 7.2 8 3.2l4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  subordinates:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M4 3v5.4a1.6 1.6 0 0 0 1.6 1.6H12M9.6 7.6 12 10l-2.4 2.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chevXs:
    '<svg viewBox="0 0 12 12" fill="none"><path d="M3 4.6 6 7.6l3-3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  course:
    '<svg viewBox="0 0 18 18" fill="none"><path d="M9 3.4 16 7l-7 3.6L2 7l7-3.6z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"></path><path d="M4.8 8.6v3.6c0 .9 1.9 1.9 4.2 1.9s4.2-1 4.2-1.9V8.6M15.6 7.4v3.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path></svg>',
  lock: '<svg viewBox="0 0 16 16" fill="none"><rect x="3.4" y="7" width="9.2" height="6.6" rx="1.6" stroke="currentColor" stroke-width="1.4"/><path d="M5.4 7V5.4a2.6 2.6 0 0 1 5.2 0V7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  fileImg:
    '<svg viewBox="0 0 24 24" fill="none"><rect x="3.5" y="4.5" width="17" height="15" rx="3" fill="currentColor" opacity=".9"/><circle cx="9" cy="9.6" r="1.8" fill="var(--q-button-primary-text)"/><path d="m4.5 18 5-5 3.4 3 2.6-2.4 4.5 4.4" stroke="var(--q-button-primary-text)" stroke-width="1.6" stroke-linejoin="round"/></svg>',
  fileDoc:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" fill="currentColor" opacity=".9"/><path d="M14 3v5h5" fill="var(--q-button-primary-text)" opacity=".5"/><path d="M9 12.5h6M9 15.5h6M9 18h4" stroke="var(--q-button-primary-text)" stroke-width="1.5" stroke-linecap="round"/></svg>',
  copy: '<svg viewBox="0 0 16 16" fill="none"><rect x="5.4" y="5.4" width="8" height="8.6" rx="1.6" stroke="currentColor" stroke-width="1.4"/><path d="M10.6 5.4V3.6a1.6 1.6 0 0 0-1.6-1.6H4.2a1.6 1.6 0 0 0-1.6 1.6v5.6a1.6 1.6 0 0 0 1.6 1.6h1.2" stroke="currentColor" stroke-width="1.4"/></svg>',
  copyLink:
    '<svg viewBox="0 0 16 16" fill="none"><rect x="5.4" y="5.4" width="8.2" height="8.2" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M10.6 5.4V4.4a2 2 0 0 0-2-2H4.4a2 2 0 0 0-2 2v4.2a2 2 0 0 0 2 2h1" stroke="currentColor" stroke-width="1.4"/></svg>',
  trash:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M2.8 4.4h10.4M6.4 4.4V3.2a1 1 0 0 1 1-1h1.2a1 1 0 0 1 1 1v1.2M4.2 4.4l.6 8.2a1.2 1.2 0 0 0 1.2 1.1h4a1.2 1.2 0 0 0 1.2-1.1l.6-8.2M6.6 7v4M9.4 7v4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  trashSm:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M2.8 4.4h10.4M6.4 4.4V3.2a1 1 0 0 1 1-1h1.2a1 1 0 0 1 1 1v1.2M4.2 4.4l.6 8.2a1.2 1.2 0 0 0 1.2 1.1h4a1.2 1.2 0 0 0 1.2-1.1l.6-8.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  download:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M8 2.6v7.6M5 7.4l3 3 3-3M3 13.2h10" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  /** меню-гамбургер (шапка, когда пункты меню не помещаются) */
  burger: '<svg viewBox="0 0 16 16" fill="none"><path d="M2.5 4h11M2.5 8h11M2.5 12h11" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  close: '<svg viewBox="0 0 16 16" fill="none"><path d="M4.4 4.4l7.2 7.2M11.6 4.4l-7.2 7.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  closeSm: '<svg viewBox="0 0 16 16" fill="none"><path d="M4.6 4.6 11.4 11.4M11.4 4.6 4.6 11.4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  spin: '<svg class="attspin" viewBox="0 0 24 24" fill="none"><path d="M12 4a8 8 0 1 0 8 8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  wand: '<svg viewBox="0 0 16 16" fill="none"><path d="m2.4 13.6 8-8M9 4.2l2.8 2.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M12.4 1.6l.5 1.1 1.1.5-1.1.5-.5 1.1-.5-1.1-1.1-.5 1.1-.5.5-1.1ZM5.4 2l.4.8.8.4-.8.4-.4.8-.4-.8-.8-.4.8-.4.4-.8ZM13.6 8.4l.4.8.8.4-.8.4-.4.8-.4-.8-.8-.4.8-.4.4-.8Z" fill="currentColor"/></svg>',
  upload:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M8 12V3.6M4.8 6.8 8 3.6l3.2 3.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M2.6 11.6v1.2A1.6 1.6 0 0 0 4.2 14.4h7.6a1.6 1.6 0 0 0 1.6-1.6v-1.2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  dots: '<svg viewBox="0 0 16 16" fill="none"><circle cx="3.4" cy="8" r="1.5" fill="currentColor"/><circle cx="8" cy="8" r="1.5" fill="currentColor"/><circle cx="12.6" cy="8" r="1.5" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 16 16" fill="none"><path d="m3.6 8.4 2.8 2.8 6-6.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cross: '<svg viewBox="0 0 16 16" fill="none"><path d="m4.4 4.4 7.2 7.2M11.6 4.4l-7.2 7.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  group:
    '<svg viewBox="0 0 16 16" fill="none"><circle cx="6" cy="5.6" r="2.4" stroke="currentColor" stroke-width="1.4"/><path d="M1.8 13a4.2 4.2 0 0 1 8.4 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M10.6 3.4a2.4 2.4 0 0 1 0 4.4M11.6 9.4a4.2 4.2 0 0 1 2.6 3.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  monitor:
    '<svg viewBox="0 0 16 16" fill="none"><rect x="2.4" y="3" width="11.2" height="8" rx="1.6" stroke="currentColor" stroke-width="1.4"/><path d="M5.6 14h4.8M8 11v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="m5.6 7 1.6 1.6L10.4 5.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  target:
    '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="5.8" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2.6" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r=".6" fill="currentColor"/></svg>',
  chevSm:
    '<svg viewBox="0 0 12 12" fill="none"><path d="M3 4.6 6 7.6l3-3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  stepUp:
    '<svg viewBox="0 0 12 12" fill="none"><path d="M3.2 7.4 6 4.6l2.8 2.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  stepDown:
    '<svg viewBox="0 0 12 12" fill="none"><path d="M3.2 4.6 6 7.4l2.8-2.8" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  userSm:
    '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5.4" r="2.8" stroke="currentColor" stroke-width="1.4"/><path d="M2.8 13.6a5.2 5.2 0 0 1 10.4 0" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  sliders:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M2.4 4.4h5.4M12 4.4h1.6M2.4 8h1.4M8 8h5.6M2.4 11.6h5.4M12 11.6h1.6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path><circle cx="9.9" cy="4.4" r="1.5" stroke="currentColor" stroke-width="1.3"></circle><circle cx="5.9" cy="8" r="1.5" stroke="currentColor" stroke-width="1.3"></circle><circle cx="9.9" cy="11.6" r="1.5" stroke="currentColor" stroke-width="1.3"></circle></svg>',
  docLines:
    '<svg viewBox="0 0 16 16" fill="none"><rect x="3" y="2.2" width="10" height="11.6" rx="1.6" stroke="currentColor" stroke-width="1.4"></rect><path d="M5.6 5.6h4.8M5.6 8h4.8M5.6 10.4h2.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path></svg>',
  clip:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M13.4 7.6 8.2 12.8a3.3 3.3 0 0 1-4.7-4.7l5.4-5.4a2.2 2.2 0 0 1 3.1 3.1L6.7 11.1a1.1 1.1 0 0 1-1.6-1.6l4.8-4.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  refresh:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M13.2 8A5.2 5.2 0 0 1 4 11.3M2.8 8A5.2 5.2 0 0 1 12 4.7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"></path><path d="M12.6 2.4v2.6H10M3.4 13.6V11H6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  userXs:
    '<svg viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.6" r="2.4" stroke="currentColor" stroke-width="1.3"></circle><path d="M2.2 12.2a4.8 4.8 0 0 1 9.6 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"></path></svg>',
  book:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 6.5C10.3 5.2 8 4.6 4.5 4.6c-.5 0-.9.4-.9.9v11.4c0 .5.4.9.9.9 3.3 0 5.6.6 7.5 1.9 1.9-1.3 4.2-1.9 7.5-1.9.5 0 .9-.4.9-.9V5.5c0-.5-.4-.9-.9-.9-3.5 0-5.8.6-7.5 1.9Z" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"></path><path d="M12 6.5v12.2" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"></path></svg>',
  sort:
    '<svg viewBox="0 0 12 12" fill="none"><path d="M3.6 9.4V2.6M1.9 4.3 3.6 2.6l1.7 1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path><path d="M8.4 2.6v6.8M6.7 7.7l1.7 1.7 1.7-1.7" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  bubble:
    '<svg viewBox="0 0 20 20" fill="none"><path d="M2.6 9.2A5.8 5.8 0 0 1 8.4 3.4h3.2a5.8 5.8 0 0 1 0 11.6H7l-3.6 3.1v-3.8a5.8 5.8 0 0 1-.8-5.1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"></path></svg>',
  emptyTasks:
    '<svg viewBox="0 0 32 32" fill="none"><rect x="6" y="5" width="20" height="22" rx="3" stroke="currentColor" stroke-width="1.8"></rect><path d="m10.6 12.2 1.8 1.8 3-3.2M19 12.6h3.4M10.8 20h2.6M19 20h3.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  emptyTarget:
    '<svg viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="10.6" stroke="currentColor" stroke-width="1.8"></circle><circle cx="16" cy="16" r="5.4" stroke="currentColor" stroke-width="1.8"></circle><circle cx="16" cy="16" r="1.2" fill="currentColor"></circle></svg>',
  loupe:
    '<svg viewBox="0 0 16 16" fill="none"><circle cx="7.2" cy="7.2" r="4.8" stroke="currentColor" stroke-width="1.5"/><path d="m10.8 10.8 3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  pgPrev:
    '<svg viewBox="0 0 12 12" fill="none"><path d="M7.6 3 4.6 6l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  pgNext:
    '<svg viewBox="0 0 12 12" fill="none"><path d="M4.4 3l3 3-3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  sendArrow:
    '<svg viewBox="0 0 18 18" fill="none"><path d="M3 9h11M9.6 4.4 14.2 9l-4.6 4.6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  clearX:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M4.5 4.5l7 7M11.5 4.5l-7 7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  plusThin:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M8 3.2v9.6M3.2 8h9.6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>',
  tplDoc:
    '<svg viewBox="0 0 16 16" fill="none"><rect x="2.6" y="2.6" width="10.8" height="10.8" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5.4 6h5.2M5.4 8.4h5.2M5.4 10.8h3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  calSm:
    '<svg viewBox="0 0 16 16" fill="none"><rect x="2.2" y="3.6" width="11.6" height="10.2" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5.4 2v3M10.6 2v3M2.2 6.8h11.6" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  checkSm:
    '<svg viewBox="0 0 16 16" fill="none"><path d="m3.6 8.4 2.8 2.8 6-6.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  chev16:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M4 6.4 8 10.4l4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  thumbUp:
    '<svg viewBox="0 0 20 20" fill="none"><path d="M6.4 17.2V8.6l3.8-5.4c.9-.2 1.7.4 1.7 1.3v3.3h3.6a1.6 1.6 0 0 1 1.6 1.9l-.9 5.2a1.9 1.9 0 0 1-1.9 1.6H6.4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><rect x="2.4" y="8.6" width="4" height="8.6" rx="1.2" stroke="currentColor" stroke-width="1.5"/></svg>',
  thumbDown:
    '<svg viewBox="0 0 20 20" fill="none"><path d="M6.4 2.8v8.6l3.8 5.4c.9.2 1.7-.4 1.7-1.3v-3.3h3.6a1.6 1.6 0 0 0 1.6-1.9l-.9-5.2a1.9 1.9 0 0 0-1.9-1.6H6.4Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><rect x="2.4" y="2.8" width="4" height="8.6" rx="1.2" stroke="currentColor" stroke-width="1.5"/></svg>',
  userXs2:
    '<svg viewBox="0 0 14 14" fill="none"><circle cx="7" cy="4.6" r="2.4" stroke="currentColor" stroke-width="1.3"/><path d="M2.2 12.2a4.8 4.8 0 0 1 9.6 0" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>',
  bookmark:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M4 2.6h8v11l-4-2.8-4 2.8v-11Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  mDoc:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M9 1.8H4.6A1.6 1.6 0 0 0 3 3.4v9.2a1.6 1.6 0 0 0 1.6 1.6h6.8a1.6 1.6 0 0 0 1.6-1.6V5.8L9 1.8Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M9 1.8v4h4" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  mMedia:
    '<svg viewBox="0 0 16 16" fill="none"><rect x="1.8" y="3.4" width="12.4" height="9.2" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M6.8 6.6 10 8l-3.2 1.4V6.6Z" fill="currentColor"/></svg>',
  mText:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M3 3.4h10M3 6.8h10M3 10.2h7M3 13.6h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  mTask:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M10.4 3.4H12a1.4 1.4 0 0 1 1.4 1.4v8.2A1.4 1.4 0 0 1 12 14.4H4a1.4 1.4 0 0 1-1.4-1.4V4.8A1.4 1.4 0 0 1 4 3.4h1.6" stroke="currentColor" stroke-width="1.4"/><rect x="5.6" y="1.8" width="4.8" height="2.8" rx="1" stroke="currentColor" stroke-width="1.4"/><path d="m6 9.4 1.4 1.4 2.8-2.8" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  mQuiz:
    '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4"/><path d="M6.2 6.2a1.9 1.9 0 1 1 2.6 1.8c-.5.2-.8.6-.8 1.1v.3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="11.4" r=".9" fill="currentColor"/></svg>',
  mKb:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M2.6 3.4A1.6 1.6 0 0 1 4.2 1.8H13v10.4H4.2a1.6 1.6 0 0 0-1.6 1.6V3.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M2.6 13.8A1.6 1.6 0 0 1 4.2 12.2H13v2H4.2a1.6 1.6 0 0 1-1.6-.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/></svg>',
  mPres:
    '<svg viewBox="0 0 16 16" fill="none"><rect x="1.8" y="2.4" width="12.4" height="8.2" rx="1.6" stroke="currentColor" stroke-width="1.4"/><path d="M8 10.6v2M5.4 14 8 12.6 10.6 14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  cup:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M5 2.4h6v4.2a3 3 0 0 1-6 0V2.4Z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M5 3.6H2.8v1a2.2 2.2 0 0 0 2.2 2.2M11 3.6h2.2v1A2.2 2.2 0 0 1 11 6.8M8 9.6v2.6M5.4 13.6h5.2" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  pliOk:
    '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4"/><path d="m5.4 8.2 1.8 1.8 3.6-3.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  pliCur:
    '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4"/><path d="M8 1.8a6.2 6.2 0 0 1 0 12.4Z" fill="currentColor"/></svg>',
  pliFail:
    '<svg viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6.2" stroke="currentColor" stroke-width="1.4"/><path d="M8 4.8v3.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="8" cy="11" r=".9" fill="currentColor"/></svg>',
  playFill:
    '<svg viewBox="0 0 16 16" fill="none"><path d="M6.2 4.6v6.8L11.6 8 6.2 4.6Z" fill="currentColor"/></svg>',
  backArrow:
    '<svg viewBox="0 0 20 20" fill="none"><path d="M12.4 4.6 7 10l5.4 5.4" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  uploadBig:
    '<svg viewBox="0 0 24 24" fill="none"><path d="M12 16V5m0 0-4 4m4-4 4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M4 15v2.6A2.4 2.4 0 0 0 6.4 20h11.2a2.4 2.4 0 0 0 2.4-2.4V15" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>',
  tkFile:
    '<svg viewBox="0 0 20 20" fill="none"><path d="M5.5 2.5h6l4 4v10a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1v-13a1 1 0 0 1 1-1Z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/><path d="M11.5 2.5v4h4" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/></svg>',
};

export type IconName = keyof typeof ICONS;
