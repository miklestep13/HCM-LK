/** тип файла → цвет плитки: img — оранжевые, pdf — красные, xls — зеленые, ppt — розовые, zip, doc — синие */
export function attachKind(name: string): string {
  const e = (name.split('.').pop() || '').toLowerCase();
  return /^(jpe?g|png|gif|webp|svg|heic)$/.test(e) ? 'img' : e === 'pdf' ? 'pdf' : /^(xlsx?|csv)$/.test(e) ? 'xls' : /^(pptx?|key)$/.test(e) ? 'ppt' : /^(zip|rar|7z)$/.test(e) ? 'zip' : 'doc';
}
/** «242 КБ», «1,2 МБ» */
export function attachSize(b: number): string {
  return b >= 1048576 ? (b / 1048576).toFixed(1).replace('.', ',') + ' МБ' : Math.max(1, Math.round(b / 1024)) + ' КБ';
}
/** сегодня: «27.10.2026» */
export function todayDmy(): string {
  const d = new Date(),
    z = (n: number) => String(n).padStart(2, '0');
  return z(d.getDate()) + '.' + z(d.getMonth() + 1) + '.' + d.getFullYear();
}
