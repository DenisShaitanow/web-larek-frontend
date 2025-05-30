import './scss/styles.scss'

import { DataApi } from "./components/DataApi";
import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';
import { IOrder, IProduct, IOrderForm } from './types';
import { Card } from './components/Card';
import { Modal } from './components/common/Modal';

import { EventEmitter } from './components/base/events';
import { AppData } from './components/AppData';
import {Page} from './components/Page';
import { Basket } from './components/common/Basket';
import { Success } from './components/common/Success';
import { Order } from './components/Order';
import { Contacts } from './components/Contacts';


const api = new DataApi(API_URL, CDN_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');

const events = new EventEmitter();
const appData = new AppData(events);

const modal = new Modal(events, ensureElement<HTMLElement>('#modal-container'));
const page = new Page(document.body, events);
const basket = new Basket(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#basket')));
const orderForm = new Order(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#order')));
const contactsForm = new Contacts(events, cloneTemplate(ensureElement<HTMLTemplateElement>('#contacts')));

events.on('contacts:submit', () => {
    api.sendOrder(appData.order).then(
        (result) => {
            const success = new Success(cloneTemplate(ensureElement<HTMLTemplateElement>('#success')), {
                onClick: () => {
                    modal.close();
                    appData.emptyBasket();
                }
            });

            modal.render({content: success.render(result)});

        }).catch(err => {console.error(err)});
});

events.on('order:open', () => {
    modal.render({
        content: orderForm.render({
            payment: null,
            address: '',
            valid: false,
            errors: []
        })
    })
})

events.on('order:submit', () => {
    modal.render({
        content: contactsForm.render({
            email: '',
            phone: '',
            valid: false,
            errors: []

        })
    })
});

events.on('order:ok', () => {
    contactsForm.valid = true;
});

events.on(/^order\..*:change/, (data: {field: keyof IOrderForm, value: string}) => {
    appData.setOrderField(data.field, data.value);
});

events.on(/^contacts\..*:change/, (data: {field: keyof IOrderForm, value: string}) => {
    appData.setOrderField(data.field, data.value);
});

events.on('Errors:change', (errors: Partial<Record<keyof IOrderForm, string>>) => {
    const { payment, address, email, phone} = errors;
    orderForm.valid = !payment   && !address;
    orderForm.errors = Object.values({payment, address}).filter(i => !!i).join('; ');
    contactsForm.errors = Object.values({email, phone}).filter(i => !!i).join('; ');
});

events.on('basket:open', () => {
    modal.render({content: basket.render()})
});

events.on('modal:open', () => {
    page.locked = true;
});

events.on('modal:close', () => {
    page.locked = false;
});

events.on('card:select', (item: IProduct) => {
    appData.setPreview(item);
});

events.on('items:change', (items: IProduct[]) => {
    page.catalog = items.map(item => {
        const card = new Card((cloneTemplate(cardCatalogTemplate)), {onClick: () => events.emit('card:select', item)});
        return card.render(item);
    });
});

events.on('basket:change', () => {
    page.counter = appData.basket.items.length;
    basket.items = appData.basket.items.map(id => {
        const item = appData.items.find(item => item.id === id);
        const card = new Card((cloneTemplate(cardBasketTemplate)), {onClick: () => {appData.removeFromBasket(item)}});
        return card.render(item);
    });
    basket.total = appData.basket.total;
});

events.on('preview:change', (item: IProduct) => {
    if (item) {
        const card = new Card((cloneTemplate(cardPreviewTemplate)), {onClick: () => {
            if (appData.inBasket(item)) {
                appData.removeFromBasket(item);
                card.button = 'В корзину'
            } else {
                appData.addToBasket(item);
                card.button = 'Удалить из корзины'
            }
        }});
        card.button = appData.inBasket(item) ? 'Удалить из корзины' : 'В корзину';

        modal.render({
            content: card.render(item)
        });
    } else {
        modal.close();
    }
});    
api.getProducts().then(appData.setItems.bind(appData)).catch(err => console.error(err));










