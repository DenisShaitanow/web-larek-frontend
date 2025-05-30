


// интерфейс api
export interface IDataApi {
  getProducts(): Promise<IProduct[]>;
  getProduct(id: string): Promise<IProduct>;
  sendOrder(data: IOrder): Promise<IOrderResult>;
  }
  
  // тип оплаты
  export type PaymentType = 
    'online' |
    'personally' |
    null;
  
  
  // данные товара
  export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null; // есть товар, у которого нет цены
  }
  
  // модель заказа
  export interface IOrderModel {
    customerFullInfo: IOrder;
    payment: PaymentType;
    address: string;
    email: string;
    phone: string;
    items: string[];
    total: number;
  }
  
  // данные заказа
  export interface IOrder {
    payment: PaymentType;
    address: string;
    email: string;
    phone: string;
    items: string[];
    total: number;
  }
  
  // интерфейс корзины
  export interface IBasket {
    items: string[];
    total: number;

     
    /*add(item: Partial<IItem>): void;
    remove(item: Partial<IItem>): void;
    clear(): void;*/
  }



  /*export interface IOrderResult {
    id: string;
    total: number;
  }*/

  export type IOrderResult = Pick<IOrder, 'total' | 'items'>

  export type IOrderForm = Omit<IOrder, 'total' | 'items'>
  /*
  // интерфейс eventEmitter
  export interface IEventEmitter {
    emit: (event: string, data?: unknown) => void
  }
  
  // интерфейс корзины
  export interface IBasketView {
    addItem(item: HTMLElement, itemId: string, sum: number): void;
    removeItem(itemId: string): void;
    clear(): void;
  }
  
  // интерфейс товара
  export interface IItemView {
    getBasketItemView(element: HTMLElement): HTMLElement;
    getModalItemView(element: HTMLElement): HTMLElement;
    data: Partial<IItem>;
  }
  
  // интерфейс модального окна
  export interface IModalView {
    openModal: (element: HTMLElement) => void;
    closeModal: () => void;
  }
  
  // интерфейс базового класса вью
  export interface IView {
    render(data?: unknown): HTMLElement;
    toggleClass(element: HTMLElement, className: string): void;
  }
  
  // данные для передачи в eventEmitter
  export interface IEventData {
    element: HTMLElement;
    data?: Partial<IItem>;*/
