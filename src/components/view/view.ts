
import { cloneTemplate, ensureAllElements, isSelector, ensureElement, createElement } from "../../utils/utils";
import {IEvents} from "../base/events";
import { IView, IValidation, FormForValidation } from "../../types/view/view";
import { ProductSettings } from "../../types/view/view";
import { API_URL, CDN_URL } from '../../utils/constants';
import { buffer } from "stream/consumers";


export type TemplateCardType =  "CardCatalog" | "CardPreview" | "CardBasket";


export class View implements IView {

    validation: IValidation;
    emitter: IEvents;

    uppendPlaces: Record<string, HTMLElement> = {};
    modalWindow: HTMLElement;
    headerBusketButton: HTMLButtonElement;
    headerBusketButtonCounter: HTMLSpanElement;
    templateBasket: HTMLElement;
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
        this.validation=new Validation();
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
        this.templateBasket=cloneTemplate<HTMLDivElement>('#basket');
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
        const basket=this.templateBasket;
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
            // Переходим сразу к отображению формы
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



/*-----------------------------------------------*/


export class Validation implements IValidation {

    formList: Record<string, FormForValidation> ={};
    
    constructor () {
    }

    formListSet( nameForm: string, formElement: HTMLFormElement, inputClass: string): void {
        // Проверяем наличие формы с данным именем
        if (this.formList[nameForm]) {
            // Форма уже существует, значит, мы ничего не делаем
            return;
        }

        // Получаем список инпутов для новой формы
        const inputList = Array.from(ensureAllElements<HTMLInputElement>(`.${inputClass}`, formElement));
        if (!inputList) {
            throw new Error('Инпуты не найдены');
        }

        // Формируем новую запись в объекте formList
        this.formList[nameForm] = {
            formValidation: formElement,
            inputList: inputList,
            validity: false
        };
    }

    checkInputValidity(inputElement: HTMLInputElement, formElement: HTMLFormElement): void {
        if (inputElement.validity.patternMismatch) {
          // встроенный метод setCustomValidity принимает на вход строку
          // и заменяет ею стандартное сообщение об ошибке
          inputElement.setCustomValidity(inputElement.dataset.errorMessage);
        } else {
          // если передать пустую строку, то будут доступны
          // стандартные браузерные сообщения
          inputElement.setCustomValidity("");
        }
      
        if (!inputElement.validity.valid) {
          // теперь, если ошибка вызвана регулярным выражением,
          // переменная validationMessage хранит наше кастомное сообщение
          this.showInputError(
            inputElement.validationMessage,
            formElement
          );
        } else {
          this.hideInputError(formElement);
        }
    }

    // Функция, которая добавляет класс с ошибкой
    showInputError( errorMessage: string, formElement: HTMLFormElement): void {
        // Находим элемент ошибки внутри самой функции
        
        const errorElement = ensureElement<HTMLSpanElement>(`.form__errors`, formElement);
        
        errorElement.textContent = errorMessage;
    };
      
    // Функция, которая удаляет класс с ошибкой
    hideInputError(formElement: HTMLFormElement): void {
        // Находим элемент ошибки
        
        const errorElement = ensureElement<HTMLSpanElement>(`.form__errors`, formElement);
        // Остальной код такой же
        /*inputElement.classList.add(arr.inputErrorClass);*/
        
        errorElement.textContent = "";
    }
      
    // функция активации и деактивации кнопки сабмит
    toggleButtonState(formElement: HTMLFormElement, inputList: HTMLInputElement[]): void {
        
        const formNoValid = inputList.some((inputElement) => {
          // Если поле не валидно, колбэк вернёт true
          
          return (
            inputElement.validity.patternMismatch || !inputElement.validity.valid
          );
        });

        let form: FormForValidation;
        for (const key in this.formList) {
            if (this.formList[key].formValidation === formElement) {
                form = this.formList[key];
            }
        }

        if (formNoValid === true) {
          form.validity = false;
        } else {
            form.validity = true;
        }
    }
 
    setEventListeners(nameForm: string): void {
        
        let form: HTMLFormElement | null = null;
        let inputList: HTMLInputElement[] | null =null;

        if (this.formList[nameForm]) {
            // Форма уже существует, значит, мы ничего не делаем
            form = this.formList[nameForm].formValidation;
            inputList = this.formList[nameForm].inputList;
        }

        if (form === null && inputList === null) {
            throw new Error('Форма не найдена');
        }
        

        inputList.forEach((inputElement: HTMLInputElement) => {

            inputElement.addEventListener("input", () => {
                this.checkInputValidity(inputElement, form);
                this.toggleButtonState(form, inputList);
            });
        });
    }
      
    // Функция обнуления поля ошибок при закрытии модального окна
    
    clearValidation(nameForm: string): void {

        let form: HTMLFormElement | null = null;
        let inputList: HTMLInputElement[] | null =null;

        if (this.formList[nameForm]) {
            // Форма уже существует, значит, мы ничего не делаем
            form = this.formList[nameForm].formValidation;
            inputList = this.formList[nameForm].inputList;
        }

        this.toggleButtonState(form, inputList);
        inputList.forEach((inputElement) => {
          this.checkInputValidity(inputElement , form);
        });
    }
}



    








