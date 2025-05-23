
import { cloneTemplate, ensureAllElements, isSelector, ensureElement, createElement } from "../../utils/utils";
import {IEvents} from "../base/events";
import { IView} from "../../types/view/view";
import { IValidation } from "../../types/view/validation";
import { Validation } from "./validation";
import { ProductSettings } from "../../types/view/view";
import { ModalWindow } from "./modalWindow";
import { IModalWindow } from "../../types/view/modalWindow";
import { API_URL, CDN_URL } from '../../utils/constants';
import { buffer } from "stream/consumers";


export type TemplateCardType =  "CardCatalog" | "CardPreview" | "CardBasket";


export class View implements IView {

    validation: IValidation;
    modalWindow: IModalWindow;
    emitter: IEvents;


    uppendPlaces: Record<string, HTMLElement> = {};
    headerBusketButton: HTMLButtonElement;
    headerBusketButtonCounter: HTMLSpanElement;
    Basket: HTMLElement;
    templateCardCatalog: HTMLTemplateElement;
    templateCardPreview: HTMLTemplateElement;
    templateCardBasket: HTMLTemplateElement;

    orderWindow: HTMLFormElement;
    listenersOrderAttached: boolean = false;
    orderData: { pay: "personally" | "online" | null, address: string};
    contactsWindow: HTMLFormElement;
    listenersContactsAttached: boolean = false;
    contactsData: {mail: string, phone: string};


    constructor(emitter: IEvents) {
        this.validation = new Validation();
        this.modalWindow = new ModalWindow();
        this.emitter=emitter;


        this.orderWindow  = cloneTemplate<HTMLFormElement>('#order');
        this.orderData = {
            pay: null,
            address: ''
        };
        this.contactsData = {
            mail: '',
            phone: ''
        };
        this.contactsWindow = cloneTemplate<HTMLFormElement>('#contacts');
        this.templateCardBasket=ensureElement<HTMLTemplateElement>('#card-basket');
        this.templateCardPreview=ensureElement<HTMLTemplateElement>('#card-preview');
        this.templateCardCatalog=ensureElement<HTMLTemplateElement>('#card-catalog');
        this.Basket=cloneTemplate<HTMLDivElement>('#basket');
        this.headerBusketButtonCounter=ensureElement<HTMLSpanElement>('.header__basket-counter');
        this.headerBusketButton=ensureElement<HTMLButtonElement>('.header__basket');
        
        
        this.emitter.on('deleteFromBusket', (data: {id: string}) => this.removeProductFromBusketList(data));

    }


    init(): void {
        this.addAppendPlace('gallery', 'gallery'); // назначаю место, куда будет вставляться карточки
        this.addAppendPlace<HTMLDivElement>('modalContent' , 'modal__content', this.modalWindow.modalWindow);  // назначаю место в модальном окне, куда вставляется контент
        this.addAppendPlace<HTMLUListElement>('basket' , 'basket__list', this.Basket); // назначаю место для апенда списка карточек в корзине
    }

    

    addAppendPlace<T extends HTMLElement>(placeName: string, classForAppend: string, context?: HTMLElement): void {
        const place: HTMLElement = ensureElement<T>(`.${classForAppend}`, context);
        if (!place) {
            throw new Error(`Элемент с классом .${classForAppend} не найден.`);
        }
        this.uppendPlaces[placeName] = place;
    };

    

    startStartListeners(): void {
        this.headerBusketButton.addEventListener('click', () => {
            this.emitter.emit('openBusket');
        });
        const buttonClose=ensureElement<HTMLButtonElement>('.modal__close' , this.modalWindow.modalWindow);

        buttonClose.addEventListener('click', () => this.modalWindow.closeModalWindow());

        this.modalWindow.modalWindow.addEventListener('click', (evt) => {
            this.modalWindow.modalWindow.addEventListener('click', (evt) => {
                const target = evt.target as HTMLElement;
                if (target.classList.contains('modal')) {
                    this.modalWindow.closeModalWindow();
                }
            });  
        })

        this.validation.formListSet( 'order', this.orderWindow as HTMLFormElement, 'form__input');
        this.validation.setEventListeners('order');
        this.validation.formListSet('contacts', this.contactsWindow as HTMLFormElement, 'form__input');
        this.validation.setEventListeners('contacts');

    }

    emptyButtonBasketCounter(): void {
        this.headerBusketButtonCounter.textContent='0';
    }
    

    renderCardsArray (cardsArray: ProductSettings[], cardType: TemplateCardType, place: string, doEmpty: boolean = false): void {
        let numberItem: number = 0;
        cardsArray.forEach(item => {
            numberItem +=1;
            this.uppendElement(this.renderCard(item, cardType, numberItem), place, doEmpty);
        })
    }

    renderCard(settingsCard: ProductSettings, cardType: TemplateCardType, numberItem: number = 1): HTMLElement {
        let rend: HTMLElement; 
    
        switch (cardType) {
            case "CardCatalog":
                rend = cloneTemplate<HTMLTemplateElement>(this.templateCardCatalog);
                const imgCat = rend.querySelector("img") as HTMLImageElement;
                const categoryCat = rend.querySelector('.card__category') as HTMLElement;
                const priceCat = rend.querySelector('.card__price') as HTMLElement;
                const titleCat = rend.querySelector('.card__title') as HTMLElement;
                if (!imgCat || !categoryCat || !priceCat || !titleCat) {
                    console.log('Отсутствуют необходимые элементы в шаблоне CardCatalog');
                }

                titleCat.textContent = settingsCard.title;
                priceCat.textContent = `${settingsCard.price} синапсов`;
                categoryCat.textContent = settingsCard.category;
                imgCat.src = CDN_URL+settingsCard.image;
                imgCat.alt = settingsCard.description;
                rend.dataset.id=`${settingsCard.id}`
                rend.addEventListener('click', () => {
                    this.emitter.emit('selectProduct' , {id: rend.dataset.id})
                });
                return rend;
    
            case "CardPreview":
                rend = cloneTemplate<HTMLTemplateElement>(this.templateCardPreview); 
                const imgPrev = rend.querySelector("img") as HTMLImageElement;
                const categoryPrev = rend.querySelector('.card__category') as HTMLElement;
                const pricePrev = rend.querySelector('.card__price') as HTMLElement;
                const titlePrev = rend.querySelector('.card__title') as HTMLElement;
                const descriptionPrev = rend.querySelector('.card__text') as HTMLElement;
                const buttonToBusket=rend.querySelector('.button')as HTMLButtonElement;

                if (!imgPrev || !categoryPrev || !pricePrev || !titlePrev || !descriptionPrev) {
                    console.log('Отсутствуют необходимые элементы в шаблоне CardPreview');
                  }

                titlePrev.textContent = settingsCard.title;
                pricePrev.textContent = `${settingsCard.price} синапсов`;

                if (settingsCard.price === 0) {
                    buttonToBusket.setAttribute('disabled','true');
                }

                categoryPrev.textContent = settingsCard.category;
                imgPrev.src = CDN_URL+settingsCard.image;
                imgPrev.alt = settingsCard.description;
                descriptionPrev.textContent = settingsCard.description;
                rend.dataset.id=`${settingsCard.id}`;
                buttonToBusket.addEventListener('click', () => {
                    if (buttonToBusket.textContent ==='В корзину') {
                        this.emitter.emit('addToBusket', { id: rend.dataset.id});
                        buttonToBusket.textContent='Удалить из корзины';
                        this.headerBusketButtonCounter.textContent=(Number(this.headerBusketButtonCounter.textContent) + 1).toString();
                    } else if (buttonToBusket.textContent === 'Удалить из корзины') {
                        this.emitter.emit('deleteFromBusketModel', {id: rend.dataset.id})
                        buttonToBusket.textContent='В корзину';
                        this.headerBusketButtonCounter.textContent=(Number(this.headerBusketButtonCounter.textContent) - 1).toString();
                    }
                });
                
                return rend;
    
            case "CardBasket":
                rend = cloneTemplate<HTMLTemplateElement>(this.templateCardBasket); 
                const titleBas = ensureElement<HTMLSpanElement>('.card__title' , rend);
                const priceBas = ensureElement<HTMLSpanElement>('.card__price' , rend);
                const buttonDeleteProduct = ensureElement<HTMLButtonElement>('.basket__item-delete' , rend);
                const itemIndex = ensureElement<HTMLSpanElement>('.basket__item-index' , rend);
                if (!titleBas || !priceBas) {
                    console.log('Отсутствуют необходимые элементы в шаблоне CardBasket');
                }

                itemIndex.textContent = numberItem.toString();
                titleBas.textContent = settingsCard.title;
                priceBas.textContent = settingsCard.price.toString();
                rend.dataset.id=`${settingsCard.id}`;
                buttonDeleteProduct.addEventListener('click', () => {
                    this.emitter.emit('deleteFromBusket', {id: rend.dataset.id})
                })
                return rend;
    
            default:
                throw new Error(`Неизвестный тип карточки: ${cardType}`);
        }
    }

    renderBusket(productList: ProductSettings[], totalPrice: string):void {
        const basket=this.Basket;
        const basketTitle=ensureElement<HTMLHeadElement>('.modal__title', basket);
        const basketPrice = ensureElement<HTMLSpanElement>('.basket__price' , basket);
        const buttonOrder = ensureElement<HTMLSpanElement>('.basket__button' , basket);
        this.uppendPlaces.basket.innerHTML='';
        this.renderCardsArray(productList, 'CardBasket', 'basket', false);
        this.headerBusketButtonCounter.textContent=productList.length.toString();
        buttonOrder.addEventListener('click', () => {
            this.emitter.emit('openOrder')
        })

        if (productList.length === 0) {
            basketTitle.textContent='В корзине нет товаров.'
            basketPrice.textContent='';
            buttonOrder.setAttribute('disabled','true');
        } else {
            basketTitle.textContent='Корзина'
            basketPrice.textContent=totalPrice;
            buttonOrder.removeAttribute('disabled');
        }

        this.uppendElement(basket, 'modalContent', true);
    }

    removeProductFromBusketList(data: {id: string}): void {
        const removeProduct=ensureElement<HTMLLIElement>(`[data-id="${data.id}"]`, this.uppendPlaces.basket);
        removeProduct.remove();
    }
    
    renderOrderFirst(): void {

        this.orderWindow.reset();
        this.validation.clearValidation('order');
        
        const buttonOnline=ensureElement<HTMLButtonElement>('button[name="card"]' , this.orderWindow);
        const buttonPersonally=ensureElement<HTMLButtonElement>('button[name="cash"]' , this.orderWindow);
        const buttonContinue=ensureElement<HTMLButtonElement>('.order__button' , this.orderWindow);
        const inputAddress=ensureElement<HTMLInputElement>('.form__input', this.orderWindow);

        if (this.listenersOrderAttached) {
            // Переходим сразу к отображению формы, если фукция запускается не первый раз. Чтобы не плодить слушатели.
            this.orderData = {pay: null,
                address: ''}
            buttonOnline.classList.remove('button_checked');
            buttonPersonally.classList.remove('button_checked');
            buttonContinue.setAttribute('disabled', 'true');
            this.uppendElement(this.orderWindow, 'modalContent', true);
            return;
        }

        buttonOnline.addEventListener('click', () => {
            this.orderData.pay='online';
            buttonOnline.classList.add('button_checked');
            buttonPersonally.classList.remove('button_checked');
            if (this.orderData.pay !== null && this.orderData.address !== '') {
                buttonContinue.removeAttribute('disabled');
            }
        });

        buttonPersonally.addEventListener('click', () => {
            this.orderData.pay='personally';
            buttonPersonally.classList.add('button_checked');
            buttonOnline.classList.remove('button_checked');
            if (this.orderData.pay !== null && this.orderData.address !== '') {
                buttonContinue.removeAttribute('disabled');
            }
        });

        inputAddress.addEventListener('input', () => {
            if (this.validation.formList['order'].validity === true) {
                this.orderData.address=inputAddress.value;
                if (this.orderData.pay !== null && this.orderData.address !== '') {
                    buttonContinue.removeAttribute('disabled');
                }
            } else {
                buttonContinue.setAttribute('disabled', 'true');
                this.orderData.address = '';
            }
        })

        buttonContinue.addEventListener('click',  event => {
            event.preventDefault();
            this.emitter.emit('orderContinue', this.orderData);
        });
        this.listenersOrderAttached =true;
        this.uppendElement(this.orderWindow, 'modalContent', true);
    }   

    renderOrderContacts(): void {

        const inputEmail = ensureElement<HTMLInputElement>('input[name="email"]' , this.contactsWindow);
        const inputPhone = ensureElement<HTMLInputElement>('input[name="phone"]' , this.contactsWindow);
        const buttonDoPay = ensureElement<HTMLButtonElement>('button[type="submit"]' , this.contactsWindow);

        if (this.listenersContactsAttached) {
            // Переходим сразу к отображению формы
            this.contactsData = {mail: '', phone: ''};
            this.contactsWindow.reset();
            this.validation.clearValidation('contacts');
            buttonDoPay.setAttribute('disabled', 'true');
            this.uppendElement(this.orderWindow, 'modalContent', true);
            return;
        }

        inputEmail.addEventListener('input', ()=> {
            if (this.validation.formList['contacts'].validity === true) {
                this.contactsData.mail=inputEmail.value.trim();
                this.contactsData.phone=inputPhone.value.trim();
                if (this.contactsData.mail !== '' && this.contactsData.phone !== '') {
                    buttonDoPay.removeAttribute('disabled');
                }
            } else { 
                buttonDoPay.setAttribute('disabled', 'true');
                this.contactsData.mail = '';
            }
        });

        inputPhone.addEventListener('input', () => {
            if (this.validation.formList['contacts'].validity === true) {
                this.contactsData.phone=inputPhone.value.trim();
                this.contactsData.mail=inputEmail.value.trim();
                buttonDoPay.setAttribute('disabled', 'true');
                if (this.contactsData.mail !== '' && this.contactsData.phone !== '') {
                    buttonDoPay.removeAttribute('disabled');
                }
            } else { 
                this.contactsData.phone = '';
                buttonDoPay.setAttribute('disabled', 'true');}
        });

        this.contactsWindow.addEventListener('submit', event => {
            event.preventDefault();
            
            // Отправляем данные в презентер
            this.emitter.emit('doPay', this.contactsData);
        });
        this.listenersContactsAttached = true;
        this.uppendElement(this.contactsWindow, 'modalContent', true);
    }

    renderPayDone(totalOrder: string): void {
       const payDone=cloneTemplate('#success');
        const totalPay=payDone.querySelector('.order-success__description');
        totalPay.textContent= `Списано ${totalOrder} синапсов`;
        const buttonNewBuys=payDone.querySelector('.order-success__close');
        buttonNewBuys.addEventListener('click', () => {
            this.emitter.emit('newBuys');
        });
       this.uppendElement(payDone, 'modalContent', true);


    }

    uppendElement(element: HTMLElement, place: string, doEmpty: boolean): void {
        let placeUppend: HTMLElement | undefined;
        /*console.log(this.uppendPlaces);*/
        for (let key in this.uppendPlaces) {

            if (place === key) {
                placeUppend = this.uppendPlaces[key]; // Нашел нужный элемент
                break;
            } 
        }

        if (!placeUppend) {
            throw new Error('Отсутствует место для рендеринга.');
        }
        
        if (doEmpty) {placeUppend.innerHTML='';}
        
        placeUppend.append(element); // вывожу на страницу
    }
}







    








