import {IProduct} from "../../types/model/model";
import { ILarek } from "../../types/presenter/presenter";
import { ILarekModel} from "../../types/model/model";
import {IEvents} from "../base/events";
import { IView, ProductSettings} from "../../types/view/view";



export class Larek implements ILarek {

    larekModel: ILarekModel;
    emitter: IEvents;
    view: IView;


    constructor(larekModel: ILarekModel, emitter: IEvents, view: IView) {
        this.larekModel=larekModel;
        this.emitter=emitter;
        this.view=view;

        this.emitter.on('openBusket', () => this.openBusket());
        this.emitter.on('addToBusket', (data: {id: string}) => this.addToBusket(data));
        this.emitter.on('deleteFromBusket', (data: {id: string}) => this.deleteProductFromBusket(data));
        this.emitter.on('openOrder', () => this.openOrder());
        this.emitter.on('orderContinue', ((data: { pay: "personally" | "online" | null, address: string; }) => this.orderContinue(data)));
        this.emitter.on('doPay', (data: { mail: string; phone: string }) => this.doPay(data));
        this.emitter.on('newBuys', () => this.newBuys());
        this.emitter.on('selectProduct', (data: {id: string}) => this.selectProduct(data));
        this.emitter.on('deleteFromBusketModel', (data: {id: string}) => this.deleteProductFromBusketModel(data));

    }

    async init(): Promise<IProduct[]> {
        this.view.init();

       await this.renderProductList();
       this.view.startStartListeners();
       return this.renderProductList();

    }

    async renderProductList(): Promise<IProduct[]> {
        
        const products: IProduct[] = await this.larekModel.getProductList(); // ждём завершения асинхронного вызова
        
        this.view.renderCardsArray(products, 'CardCatalog', 'gallery'); // рендерим после получения данных
        return products;
    }

    openOrder(): void {
        this.view.renderOrderFirst();
        this.view.modalWindow.openModalWindow();
    };

    orderContinue(data:  { pay: "personally" | "online" | null, address: string; }): void {
        this.larekModel.personalInformation.addressSet=data.address;
        this.larekModel.personalInformation.paySet=data.pay;
        this.view.renderOrderContacts();
    }

    async doPay(data: { mail: string; phone: string }): Promise<void> {
        this.larekModel.personalInformation.mailSet=data.mail;
        this.larekModel.personalInformation.phoneSet=data.phone;
        await this.larekModel.doPay();
        this.view.renderPayDone(this.larekModel.order.totalOrder.toString());
        this.view.emptyButtonBasketCounter();
        this.larekModel.busket.emtyBusket();
    }

    newBuys(): void {
        this.view.modalWindow.closeModalWindow();
        this.renderProductList();
    }


    async selectProduct(data: { id: string }): Promise<IProduct> {
        const rawProduct: IProduct = await this.larekModel.selectProduct(data.id);
        const settings: ProductSettings = {
            id: rawProduct.id,
            title: rawProduct.title,
            category: rawProduct.category,
            description: rawProduct.description,
            price: rawProduct.price,
            image: rawProduct.image,
        };
        this.view.uppendElement(this.view.renderCard(settings, 'CardPreview'), 'modalContent', true);
        this.view.modalWindow.openModalWindow();
        return rawProduct;
    }

    deleteProductFromBusket(data: {id: string}): void {
        this.deleteProductFromBusketModel(data);
        this.view.renderBusket(this.larekModel.busket.productList, this.larekModel.busket.totalPrice.toString());
        
    }

    deleteProductFromBusketModel(data: {id: string}): void {
        let productForDelette=this.larekModel.productList.find((item: IProduct) => item.id === data.id) as IProduct;
        this.larekModel.busket.deleteProductFromBusket(productForDelette);
    }

    addToBusket(data: {id: string}): void {
        let productForAdd=this.larekModel.productList.find((item: IProduct) => item.id === data.id) as IProduct;
        this.larekModel.busket.productListSet=productForAdd;
        this.larekModel.busket.totalPriceSet=productForAdd;
        this.larekModel.busket.idListSet=productForAdd;
    }

    openBusket(): void {
        this.view.renderBusket(this.larekModel.busket.productList, this.larekModel.busket.totalPrice.toString());
        this.view.modalWindow.openModalWindow();
       
    };

}