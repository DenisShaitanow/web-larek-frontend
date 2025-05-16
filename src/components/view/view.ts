
import { cloneTemplate, ensureAllElements, isSelector, ensureElement, createElement } from "../../utils/utils";
import {IEvents} from "../base/events";
import { IView } from "../../types/view/view";
import { ProductSettings } from "../../types/view/view";
import { API_URL, CDN_URL } from '../../utils/constants';
import { buffer } from "stream/consumers";


export type TemplateCardType =  "CardCatalog" | "CardPreview" | "CardBasket";


export class View implements IView {

    emitter: IEvents;
    uppendPlaces: Record<string, HTMLElement> = {};
    modalWindow: HTMLElement;
    headerBusketButton: HTMLButtonElement;
    headerBusketButtonCounter: HTMLSpanElement;
    templateBasket: HTMLElement;
    templateCardCatalog: HTMLTemplateElement;
    templateCardPreview: HTMLTemplateElement;
    templateCardBasket: HTMLTemplateElement;


    constructor(emitter: IEvents) {

        this.emitter=emitter;

        this.templateCardBasket=ensureElement<HTMLTemplateElement>('#card-basket');
        this.templateCardPreview=ensureElement<HTMLTemplateElement>('#card-preview');
        this.templateCardCatalog=ensureElement<HTMLTemplateElement>('#card-catalog');
        this.templateBasket=cloneTemplate<HTMLTemplateElement>('#basket');
        this.headerBusketButtonCounter=ensureElement<HTMLSpanElement>('.header__basket-counter');
        this.headerBusketButton=ensureElement<HTMLButtonElement>('.header__basket');
        
        
        this.emitter.on('deleteFromBusket', (data: {id: string}) => this.removeProductFromBusketList(data));

    }

    

    addAppendPlace<T extends HTMLElement>(placeName: string, classForAppend: string, context?: HTMLElement): void {
        const place: HTMLElement = ensureElement<T>(`.${classForAppend}`, context);
        if (!place) {
            throw new Error(`Элемент с классом .${classForAppend} не найден.`);
        }
        this.uppendPlaces[placeName] = place;
    };

    addModalWindowContainer<T extends HTMLElement>(place: string): void {
        this.modalWindow=ensureElement<T>(place);
    }

    startStartListeners(): void {
        this.headerBusketButton.addEventListener('click', () => {
            this.emitter.emit('openBusket');
        });
        const buttonClose=this.modalWindow.querySelector('.modal__close') as HTMLButtonElement;

        buttonClose.addEventListener('click', () => this.closeModalWindow());

        this.modalWindow.addEventListener('click', (evt) => {
            this.modalWindow.addEventListener('click', (evt) => {
                const target = evt.target as HTMLElement;
                if (target.classList.contains('modal')) {
                    this.closeModalWindow();
                }
            });
            
        })
    }

    emptyButtonBasketCounter(): void {
        this.headerBusketButtonCounter.textContent='0';
    }
    

    renderCardsArray (cardsArray: ProductSettings[], cardType: TemplateCardType, place: string, doEmpty: boolean = false): void {
        cardsArray.forEach(item => {
            this.uppendElement(this.renderCard(item, cardType), place, doEmpty);

        })
    }

    renderCard(settingsCard: ProductSettings, cardType: TemplateCardType): HTMLElement {
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
                const titleBas = rend.querySelector('.card__title') as HTMLElement;
                const priceBas = rend.querySelector('.card__price') as HTMLElement;
                const buttonDeleteProduct=rend.querySelector('.basket__item-delete') as HTMLButtonElement;
                if (!titleBas || !priceBas) {
                    console.log('Отсутствуют необходимые элементы в шаблоне CardBasket');
                  }
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
        const basket=this.templateBasket;
        const basketTitle=ensureElement<HTMLHeadElement>('.modal__title', basket);
        const basketPrice=basket.querySelector('.basket__price') as HTMLElement;
        const buttonOrder=basket.querySelector('.modal__actions button');
        this.uppendPlaces.basket.innerHTML='';
        this.renderCardsArray(productList, 'CardBasket', 'basket', false);
        this.headerBusketButtonCounter.textContent=productList.length.toString();
        buttonOrder.addEventListener('click', () => {
            this.emitter.emit('openOrder')
        })
        basketPrice.textContent=totalPrice;

        if (productList.length === 0) {
            basketTitle.textContent='В корзине нет товаров.'
            basketPrice.textContent='';
        }

        this.uppendElement(basket, 'modalContent', true);
        
    }

    removeProductFromBusketList(data: {id: string}): void {
        const removeProduct=ensureElement<HTMLLIElement>(`[data-id="${data.id}"]`, this.uppendPlaces.basket);
        removeProduct.remove();
    }
    
    renderOrderFirst(): void {
        const order=cloneTemplate('#order');
        const buttonOnline=order.querySelector('button[name="card"]') as HTMLButtonElement;
        const buttonPersonally=order.querySelector('button[name="cash"]') as HTMLButtonElement;
        const buttonContinue=order.querySelector('.order__button') as HTMLButtonElement;
        const inputAddress=order.querySelector('input[name="address"]') as HTMLInputElement;

        let data: { pay: "personally" | "online" | null, address: string; } = {
            pay: null,
            address: ''
        };

        buttonOnline.addEventListener('click', () => {
            data.pay='online';
            buttonOnline.classList.add('button_checked');
            buttonPersonally.classList.remove('button_checked');
        });
        buttonPersonally.addEventListener('click', () => {
            data.pay='personally';
            buttonPersonally.classList.add('button_checked');
            buttonOnline.classList.remove('button_checked');
        });

        inputAddress.addEventListener('input', () => {
            data.address=inputAddress.value;
            if (data.pay !== null && data.address.length > 8) {
                buttonContinue.removeAttribute('disabled');
            }
        })

        buttonContinue.addEventListener('click',  event => {
            event.preventDefault();
            this.emitter.emit('orderContinue', data);
        });

        this.uppendElement(order, 'modalContent', true);
    }   

    renderOrderContacts(): void {
        const orderContacts=cloneTemplate('#contacts');
        const buttonDoPay=ensureElement<HTMLButtonElement>('.button', orderContacts);
        const inputEmail=orderContacts.querySelector('input[name="email"]') as HTMLInputElement;
        const inputPhone=orderContacts.querySelector('input[name="phone"]') as HTMLInputElement;
        
        const data = {
            mail: '',
            phone: ''
        } as { mail: string; phone: string };

        inputEmail.addEventListener('input', ()=> {
            data.mail=inputEmail.value.trim();
            if (data.mail !== '' && data.phone !== '' ) {
                buttonDoPay.removeAttribute('disabled');
            }
        })

        inputPhone.addEventListener('input', () => {
            data.phone=inputPhone.value.trim();
            if (data.mail !== '' && data.phone !== '' ) {
                buttonDoPay.removeAttribute('disabled');
            }
        })

        orderContacts.addEventListener('submit', event => {
            event.preventDefault();
            
            // Отправляем данные в презентер
            this.emitter.emit('doPay', data);
            
        });
        this.uppendElement(orderContacts, 'modalContent', true);
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

    openModalWindow(): void {
        const buttonClose=this.modalWindow.querySelector('.modal__close') as HTMLButtonElement;
        this.modalWindow.classList.add('modal_active');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        document.addEventListener('keydown', (evt: KeyboardEvent) => this.handleEscKeyUp(evt));
        buttonClose.addEventListener('click', () => this.closeModalWindow());
    }

    closeModalWindow(): void {
        this.modalWindow.classList.remove('modal_active');
        document.removeEventListener('keydown', this.handleEscKeyUp);
    }

    handleEscKeyUp(evt: KeyboardEvent): void { 
        if (evt.key === "Escape") {
            this.closeModalWindow();
        }
    }

    set ModalWindowSet(arg: string) {
        this.modalWindow=ensureElement<HTMLDivElement>(arg);
    };

}
    








