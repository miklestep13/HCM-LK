export { LEARN_TONE, LearnStore, learnDur, learnMin } from '../../core/demo/learn-store.service';

/** «6 курсов», «2 теста» */
export const iprPlural = (n: number, f: string[]): string =>
  n + ' ' + f[n % 10 === 1 && n % 100 !== 11 ? 0 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 1 : 2];
