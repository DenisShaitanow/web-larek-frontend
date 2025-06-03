


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
  }

  export type IOrderResult = Pick<IOrder, 'total' | 'items'>

  export type IOrderForm = Omit<IOrder, 'total' | 'items'>
 
