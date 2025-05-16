
import {IEvents} from "../../components/base/events";
import { TemplateCardType } from "../../components/view/view";

export interface IView {
    emitter: IEvents;
    uppendPlaces: Record<string, HTMLElement>;
    modalWindow: HTMLElement;
    headerBusketButton: HTMLButtonElement;
    headerBusketButtonCounter: HTMLSpanElement;
    templateBasket: HTMLElement;
    templateCardCatalog: HTMLTemplateElement;
    templateCardPreview: HTMLTemplateElement;
    templateCardBasket: HTMLTemplateElement;
    
    addAppendPlace<T extends HTMLElement>(placeName: string, classForAppend: string, context?: HTMLElement): void; // метод добавляет в массив "Места для аппенда" новое место. 
    addModalWindowContainer<T extends HTMLElement>(place: string): void // метод для заполнения поля, которое хранит ДОМ элемент с модальным окном, которое открывает и закрывают соответствующие методы
    renderCardsArray (cardsArray: ProductSettings[], cardType: TemplateCardType, place: string, doEmpty?: boolean): void; // рендерится сразу массив карточек и выводится на страницу
    renderCard(settingsCard: ProductSettings, cardType: TemplateCardType): HTMLElement; // рендерится карточка товара в одном из трех видов
    renderBusket(productList: ProductSettings[], totalPrice: string): void; // рендерится и выводится в модальное окно корзина
    removeProductFromBusketList(data: {id: string}): void; // метод удалаяет карточку товара из списка корзины
    renderOrderFirst(): void; // рендерит первую страницу оформления заказа, где выбирается форма оплаты и вводится адрес
    renderOrderContacts(): void; // рендерит форму ввода конактных данных в модальном окне
    renderPayDone(totalOrder: string): void; // рендерит модальное окно Покупка совершена
    uppendElement(element: HTMLElement, place: string, doEmpty: boolean): void; // выводит отрендеренный элемент в казанное место
    openModalWindow(): void; // открывает модальное окно
    closeModalWindow(): void;  // закрывает модальное окно
    handleEscKeyUp(evt: KeyboardEvent): void; // слушает нажатие ESC для закрытия модального окна
    startStartListeners(): void;  // навешивает слушатель на кнопку корзины, на крестик модального окна, не его окрестности.
    emptyButtonBasketCounter(): void // делает счетчик корзины нулевым
    
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

