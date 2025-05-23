import { IPersonalInformation, IProduct, IBasket, IOrder, OrderData, IProductResponse } from "../../types/model/model";
import { ILarekModel } from "../../types/model/model";
import { API_URL, CDN_URL } from '../../utils/constants';

import {Api} from "../base/api";

export class LarekModel implements ILarekModel {
     productList?: IProduct[];
     personalInformation: IPersonalInformation;
     busket: IBasket;
     order: IOrder;
     api: Api;


    constructor(
        personalInformationArg: IPersonalInformation,
        busketArg: IBasket,
        orderArg: IOrder,
        apiArg: Api,
    ) {
        this.personalInformation=personalInformationArg;
        this.busket=busketArg;
        this.order=orderArg;
        this.api=apiArg;
    }

    getProductList(): Promise<IProduct[]> {
        return this.api.get('/product/').then((results: IProductResponse) => {
            if (Array.isArray(results.items)) {
                const mappedItems: IProduct[] =  results.items.map((item: any) => {
                    if ((item.price === null)) {
                        item.price=0;
                    }
                    if (
                        typeof item === 'object' &&
                        item !== null &&
                        typeof item.id === 'string' &&
                        typeof item.title === 'string' &&
                        typeof item.category === 'string' &&
                        typeof item.description === 'string' &&
                        typeof item.price === 'number' &&
                        typeof item.image === 'string'
                    ) {
                       return item as IProduct;
                    } else {
                        throw new Error('Полученный объект не соответствует структуре IProduct.');
                    }
                });
                if (!this.productList) {
                    this.productList = [];
                }
    
                // Заполняем массив результатами
                this.productList.push(...mappedItems);
    
                return mappedItems;
            } else {
                throw new Error('Ответ сервера не содержит массив "items".');
            }
        });
    }

   

    doPay(): Promise<{id: string, total: number}> {
        const orderData: OrderData = {
            payment: this.personalInformation.pay,
            email: this.personalInformation.mail,
            phone: this.personalInformation.phone,
            address: this.personalInformation.address,
            total: this.busket.totalPrice,
            items: this.busket.idList
        };
        console.log(orderData);
        return this.api.post(`/order`, orderData)
        .then((response: {id: string, total: number}) => {
            this.order.idOrderSet=response.id;
            this.order.totalOrderSet=response.total;
            return response;
        }).catch(error => {
            throw new Error(`Ошибка при создании заказа: ${error}`);   
        });
    };

    selectProduct(id: string): Promise<IProduct> {
        return this.api.get(`/product/${id}`).then((result: any) => {
            
            if ((result.price === null)) {
                result.price=0;
            }
            if (
                typeof result === 'object' &&
                result !== null &&
                typeof result.id === 'string' &&
                typeof result.title === 'string' &&
                typeof result.category === 'string' &&
                typeof result.description === 'string' &&
                typeof result.price === 'number'  &&
                typeof result.image === 'string'
            ) {
                return result as IProduct; 
            } else {
                throw new Error('Полученный объект не соответствует структуре IProduct.');
            }
        });
    }
}



export class PersonalInformation implements IPersonalInformation {
    pay: "personally" | "online";
    mail: string;
    phone: string;
    address: string;

    constructor () {}

    set paySet(value: "personally" | "online") {
        this.pay=value;
    };  // Значение, которое присваивается
    set mailSet(value: string) {
        this.mail=value;
    };                  // Почту можно устанавливать новым значением
    set phoneSet(value: string) {
        this.phone=value;
    };                 // Номер телефона устанавливается подобным образом
    set addressSet(value: string) {
        this.address=value;
    };               // Устанавливаем новое значение адреса
}


export class Basket implements IBasket {
    productList: IProduct[] = [];
    totalPrice: number = 0;
    idList: string[] = [];

    constructor() {}

    emtyBusket(): void {
        this.productList=[];
        this.totalPrice=0;
        this.idList=[];
    }

    deleteProductFromBusket(product: IProduct): void {
        this.productList = this.productList.filter(item => {return item.id !== product.id});
        this.totalPrice=this.totalPrice - product.price;
        this.idList = this.idList.filter(item => { return item !== product.id});
    };
    
    set productListSet(product: IProduct) {
        this.productList.push(product);
        
    };

    set totalPriceSet(product: IProduct) {
        this.totalPrice += product.price;
        
    }

    set idListSet(product: IProduct) {
        this.idList.push(product.id);
    }

      // Геттеры для общего доступа
    get TotalPrice(): number {
        return this.totalPrice;
    }

    get IdList(): string[] {
        return this.idList.slice(); // Возвращаем копию массива
    }
}

export class Order implements IOrder {
    
    idOrder: string = "";

    totalOrder: number;
    

    constructor() {}

    set idOrderSet(id: string) {
        this.idOrder=id;
    }

    set totalOrderSet(total: number) {
        this.totalOrder=total;
    }
 
}