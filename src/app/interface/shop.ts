/** Категория товара */
export type ProductCat = 'merch' | 'tech' | 'acc' | 'health';

/** Товар корпоративного магазина (PRODS прототипа) */
export interface Product {
  id: string;
  name: string;
  cat: ProductCat;
  /** цена в коинах */
  price: number;
  /** остаток: 999 — без ограничений, 998 — под заказ, 0 — нет */
  stock: number;
  /** число фото в слайдере */
  photos: number;
  desc: string;
  img: string;
  /** артикул */
  art: string;
  /** просмотры — для сортировки «По популярности» */
  views: number;
  /** подробное описание: заголовок и список */
  long: [string, string[]];
}

/** Комментарий к товару: [портрет, автор, дата, текст, —, лайки, мой лайк] */
export type ProductComment = [number, string, string, string, number, number, number?];

/** Позиция заказа: [товар, количество, тон статуса, статус] */
export type OrderItem = [string, number, string, string];

/** Заказ в истории */
export interface Order {
  no: string;
  /** «04.09.2026 21:30» */
  created: string;
  /** [тон, статус] */
  status: [string, string];
  items: OrderItem[];
  /** планируемая дата поставки */
  plan: string;
  comment: string;
  /** pick — самовывоз, dlv — доставка */
  method: 'pick' | 'dlv';
  address: string;
}
