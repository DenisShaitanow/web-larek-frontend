
import {Api} from "../../components/base/api";

export interface ILarekModel {
    productList?: IProduct[];
    personalInformation: IPersonalInformation;
    busket: IBasket;
    order: IOrder;
    api: Api;
    apiImage: Api;

    getProductList():  Promise<IProduct[]>;
    selectProduct(id: string): Promise<IProduct>;
    doPay(): void;
}

export interface IProduct {
    id: string;
    title: string;
    category: string;
    description: string;
    price: number;
    image: string;
}

export interface IProductResponse {
    total: number;
    items: IProduct[];
}

export interface IPersonalInformation {
    pay: "personally" | "online";
    mail: string;
    phone: string;
    address: string;

    set paySet(value: "personally" | "online");  // Значение, которое присваивается
    set mailSet(value: string);                  // Почту можно устанавливать новым значением
    set phoneSet(value: string);                 // Номер телефона устанавливается подобным образом
    set addressSet(value: string);               // Устанавливаем новое значение адреса
}

export interface IBasket {
    productList: IProduct[];
    totalPrice: number;
    idList: string[];

    emtyBusket(): void;
    deleteProductFromBusket(product: IProduct): void;
    set productListSet(product: IProduct);
    set totalPriceSet(product: IProduct);
    set idListSet(product: IProduct);
    get TotalPrice(): number;
    get IdList(): string[];
}

export interface IOrder {
    idOrder: string;
    totalOrder: number;

    set idOrderSet(id: string);
    set totalOrderSet(total: number);

}

export type OrderData={
    paymentMethod: "personally" | "online";
    email: string;
    phone: string;
    deliveryAddress: string;
    totalAmount: number;
    orderedProducts: string[];
}
