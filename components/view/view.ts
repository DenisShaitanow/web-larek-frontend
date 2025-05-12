
import { cloneTemplate, ensureAllElements, isSelector, ensureElement, createElement } from "../../utils/utils";
import {IEvents} from "../base/events";
import { IView } from "../../types/view/view";
import { ProductSettings } from "../../types/view/view";


export type TemplateType =  "CardCatalog" | "CardPreview" | "CardBasket";


export class View implements IView {

    emitter: IEvents;
    uppendPlaces: Record<string, HTMLElement> = {};
    modalWindow: HTMLElement;

    constructor(emitter: IEvents) {

        this.emitter=emitter;


        this.emitter.on('deleteFromBusket', (data: {id: string}) => this.removeProductFromBusketList(data));

    }

    

    addAppendPlace(placeName: string, classForAppend: string): void {
        const place = document.querySelector(`.${classForAppend}`) as HTMLElement;
        if (!place) {
            throw new Error(`Элемент с классом .${classForAppend} не найден.`);
        }
        this.uppendPlaces[placeName] = place;
    };
    

    renderCardsArray (cardsArray: ProductSettings[], cardType: TemplateType, place: string): void {
        cardsArray.forEach(item => {
            this.uppendElement(this.renderCard(item, cardType, item.image), place, false);

        })
    }

    renderCard(settingsCard: ProductSettings, cardType: TemplateType, img: string): HTMLElement {
        let rend: HTMLElement; 
    
        switch (cardType) {
            case "CardCatalog":
                rend = cloneTemplate('#card-catalog') as HTMLButtonElement;
                const imgCat = rend.querySelector("img") as HTMLImageElement;
                console.log(settingsCard.imageSvg);
                const svgImg = document.createElement('div');
                svgImg.innerHTML = settingsCard.imageSvg;
                imgCat.parentNode.replaceChild(svgImg, imgCat);
                const categoryCat = rend.querySelector('.card__category') as HTMLElement;
                const priceCat = rend.querySelector('.card__price') as HTMLElement;
                const titleCat = rend.querySelector('.card__title') as HTMLElement;
                

                if (!imgCat || !categoryCat || !priceCat || !titleCat) {
                    console.log('Отсутствуют необходимые элементы в шаблоне CardCatalog');
                }

                titleCat.textContent = settingsCard.title;
                priceCat.textContent = `${settingsCard.price} синапсов`;
                categoryCat.textContent = settingsCard.category;
                imgCat.src = settingsCard.image;
                imgCat.alt = settingsCard.description;
                rend.dataset.id=`${settingsCard.id}`
                rend.addEventListener('click', () => {
                    this.emitter.emit('selectProduct' , {id: rend.dataset.id})
                });
                return rend;
    
            case "CardPreview":
                rend = cloneTemplate('#card-preview') as HTMLButtonElement; 
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
                categoryPrev.textContent = settingsCard.category;
                imgPrev.src = settingsCard.image;
                imgPrev.alt = settingsCard.description;
                descriptionPrev.textContent = settingsCard.description;
                rend.dataset.id=`${settingsCard.id}`;
                buttonToBusket.addEventListener('click', () => {
                    this.emitter.emit('addToBusket', { id: rend.dataset.id})
                });
                
                return rend;
    
            case "CardBasket":
                rend = cloneTemplate('#card-basket') as HTMLButtonElement; 
                const titleBas = rend.querySelector('.card__title') as HTMLElement;
                const descriptionBas = rend.querySelector('.card__text') as HTMLElement;
                const buttonDeleteProduct=rend.querySelector('.basket__item-delete') as HTMLButtonElement;
                if (!titleBas || !descriptionBas) {
                    console.log('Отсутствуют необходимые элементы в шаблоне CardBasket');
                  }
                titleBas.textContent = settingsCard.title;
                descriptionBas.textContent = settingsCard.description;
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
        const busket=cloneTemplate('#busket');
        const busketPrice=busket.querySelector('.basket__price') as HTMLElement;
        const buttonOrder=busket.querySelector('.modal__actions button');
        this.renderCardsArray(productList, 'CardBasket', 'busket');
        buttonOrder.addEventListener('click', () => {
            this.emitter.emit('openOrder')
        })
        busketPrice.textContent=totalPrice;
        this.uppendElement(busket, 'modal', true);
        
    }

    removeProductFromBusketList(data: {id: string}): void {
        const removeProduct=document.querySelector(`.basket #${data.id}`);
        removeProduct.remove();
    }
    
    renderOrderFirst(): void {
        const order=cloneTemplate('#order');
        const form=order.querySelector('form[name="order"]') as HTMLFormElement;
        const buttonOnline=order.querySelector('button[name="card"]') as HTMLButtonElement;
        const buttonPersonally=order.querySelector('button[name="cash"]') as HTMLButtonElement;
        const inputAddress=order.querySelector('input[name="address"]') as HTMLInputElement;
        let pay:  "personally" | "online";
        buttonOnline.addEventListener('click', () => {
            pay='online';
        });
        buttonPersonally.addEventListener('click', () => {
            pay='personally';
        });
        form.addEventListener('submit',  event => {
            event.preventDefault();
            const data = {
                pay: pay,
                address: inputAddress.value.trim()
            } as { pay: "personally" | "online", address: string; };

            
            this.emitter.emit('orderContinue', data);
        });
        this.uppendElement(order, 'modal', true);
    }   

    renderOrderContacts(): void {
        const orderContacts=cloneTemplate('#contacts');
        const form=orderContacts.querySelector('form[name="contacts"]') as HTMLFormElement;
        const inputEmail=orderContacts.querySelector('input[name="email"]') as HTMLInputElement;
        const inputPhone=orderContacts.querySelector('input[name="phone"]') as HTMLInputElement;
        
        form.addEventListener('click', event => {
            event.preventDefault();
    
            // Типизируем объект прямо в методе
            const data = {
                mail: inputEmail.value.trim(),
                phone: inputPhone.value.trim()
            } as { mail: string; phone: string };
    
            // Отправляем данные в презентер
            this.emitter.emit('doPay', data);
            
        });
        this.uppendElement(orderContacts, 'modal', true);
    }

    renderPayDone(totalOrder: string): void {
       const payDone=cloneTemplate('#success');
        const totalPay=payDone.querySelector('.order-success__description');
        totalPay.textContent=totalOrder;
        const buttonNewBuys=payDone.querySelector('.order-success__close');
        buttonNewBuys.addEventListener('click', () => {
            this.emitter.emit('newBuys');
        });
       this.uppendElement(payDone, 'modal', true);


    }
   

    uppendElement(element: HTMLElement, place: string, doEmpty: boolean): void {
        let placeUppend: HTMLElement | undefined;
        for (let key in this.uppendPlaces) {

            if (place === key) {
            
                placeUppend = this.uppendPlaces[key]; // Нашел нужный элемент
                
            } else {
                console.log('Отсутствует место для рендеринга.');
            }
        }
        if (doEmpty) {placeUppend.innerHTML='';}
        
        placeUppend.append(element); // вывожу на страницу
    }

    openModalWindow(): void {
        
        const buttonClose=this.modalWindow.querySelector('.modal__close') as HTMLButtonElement;
        this.modalWindow.classList.add('modal_active');
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
    








