
import {IEvents} from "../../components/base/events";
import { TemplateType } from "../../components/view/view";

export interface IView {
    emitter: IEvents;
    uppendPlaces: Record<string, HTMLElement>;
    modalWindow: HTMLElement;
    
    addAppendPlace(placeName: string, classForAppend: string): void;
    renderCardsArray (cardsArray: ProductSettings[], cardType: TemplateType, place: string): void;
    renderCard(settingsCard: ProductSettings, cardType: TemplateType, img: string): HTMLElement;
    renderBusket(productList: ProductSettings[], totalPrice: string): void;
    removeProductFromBusketList(data: {id: string}): void;
    renderOrderFirst(): void;
    renderOrderContacts(): void;
    renderPayDone(totalOrder: string): void;
    uppendElement(element: HTMLElement, place: string, doEmpty: boolean): void;
    openModalWindow(): void;
    closeModalWindow(): void;
    handleEscKeyUp(evt: KeyboardEvent): void;
    
}


export interface ProductData {
    id: string;
    title: string;
    category: string;
    description: string;
    price: number;
    image: string;
}

export interface ProductSettings {
    id: string;
    title: string;
    category: string;
    description: string;
    price: number;
    image: string;
    imageSvg?: string;
}

export interface BusketData {
    products_for_purchase: ProductData[];
    total_price: number;
}

export interface BusketSettings {
    products_for_purchase: ProductData[];
    total_price: number;
}

