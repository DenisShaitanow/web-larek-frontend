import { ILarekModel} from "../../types/model/model";
import {IEvents} from "../../components/base/events";
import { IView} from "../../types/view/view";
import {IProduct} from "../../types/model/model";


export interface ILarek {
    larekModel: ILarekModel;
    emitter: IEvents;
    view: IView;

    renderProductList(): Promise<IProduct[]>;
    openOrder(): void;
    orderContinue(data:  { pay: "personally" | "online", address: string; }): void;
    doPay(data: { mail: string; phone: string }): Promise<void>;
    newBuys(): void;
    selectProduct(data: { id: string }): Promise<IProduct>;
    deleteProductFromBusket(data: {id: string}): void;
    addToBusket(data: {id: string}): void;
    openBusket(): void;
}