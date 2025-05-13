
import {IEvents} from "../../components/base/events";
import { TemplateType } from "../../components/view/view";

export interface IView {
    emitter: IEvents;
    uppendPlaces: Record<string, HTMLElement>;
    modalWindow: HTMLElement;
    headerBusketButton: HTMLButtonElement;
    headerBusketButtonCounter: HTMLSpanElement;
    templateBusket: HTMLTemplateElement;
    templateCardCatalog: HTMLTemplateElement;
    templateCardPreview: HTMLTemplateElement;
    templateCardBasket: HTMLTemplateElement;
    
    addAppendPlace<T extends HTMLElement>(placeName: string, classForAppend: string, context?: HTMLElement): void;
    addModalWindowContainer<T extends HTMLElement>(place: string): void
    renderCardsArray (cardsArray: ProductSettings[], cardType: TemplateType, place: string): void;
    renderCard(settingsCard: ProductSettings, cardType: TemplateType): HTMLElement;
    renderBusket(productList: ProductSettings[], totalPrice: string): void;
    removeProductFromBusketList(data: {id: string}): void;
    renderOrderFirst(): void;
    renderOrderContacts(): void;
    renderPayDone(totalOrder: string): void;
    uppendElement(element: HTMLElement, place: string, doEmpty: boolean): void;
    openModalWindow(): void;
    closeModalWindow(): void;
    handleEscKeyUp(evt: KeyboardEvent): void;
    openBusketListener(): void;
    
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
}

export interface BusketData {
    products_for_purchase: ProductData[];
    total_price: number;
}

export interface BusketSettings {
    products_for_purchase: ProductData[];
    total_price: number;
}

