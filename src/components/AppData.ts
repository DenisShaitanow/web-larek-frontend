import { IOrder, IProduct, IBasket, TOrderForm, PaymentType } from '../types';
import { IEvents } from './base/events';

export class AppData {
	items: IProduct[] = [];
	events: IEvents;
	basket: IBasket = {
		items: [],
		total: 0,
	};
	preview: IProduct = null;
	order: IOrder = {
		payment: 'online',
		address: sessionStorage.getItem('address') || '',
		email: sessionStorage.getItem('email') || '',
		phone: sessionStorage.getItem('phone') || '',
		items: [],
		total: 0,
	};
	errorsOfForms: Partial<Record<keyof TOrderForm, string>> = {};

	constructor(events: IEvents) {
		this.events = events;
	}

	setItems(items: IProduct[]) {
		this.items = items;
		this.events.emit('items:change', this.items);
	}

	setPreview(item: IProduct) {
		this.preview = item;
		this.events.emit('preview:change', this.preview);
	}

	inBasket(item: IProduct) {
		return this.basket.items.includes(item.id);
	}

	addToBasket(item: IProduct) {
		this.basket.items.push(item.id);
		this.basket.total += item.price;
		this.events.emit('basket:change', this.basket);
	}

	removeFromBasket(item: IProduct) {
		this.basket.items = this.basket.items.filter((id) => id !== item.id);
		this.basket.total -= item.price;
		this.events.emit('basket:change', this.basket);
	}

	emptyBasket() {
		this.basket.items = [];
		this.basket.total = 0;
		this.events.emit('basket:change', this.basket);
	}

	selectPayment(method: PaymentType) {
		this.order.payment = method;
	}

	setOrderField(field: keyof TOrderForm, value: string) {
		if (field === 'payment') {
			this.selectPayment(value as PaymentType);
			sessionStorage[`${field}`] = value;
		} else {
			this.order[field] = value;
			sessionStorage[`${field}`] = value;
		}

		if (this.order.payment && this.validateOrder()) {
			this.order.total = this.basket.total;
			this.order.items = this.basket.items;
			this.events.emit('order:ok');
		}
	}

	validateOrder() {
		const errors: typeof this.errorsOfForms = {};
		if (this.order.payment === null) {
			errors.payment = 'Выберете способ оплаты';
		}

		if (!this.order.email) {
			errors.email = 'Укажите свою почту';
		}

		if (!this.order.phone) {
			errors.phone = 'Укажите свой телефон';
		}

		if (!this.order.address) {
			errors.address = 'Укажите свой адрес';
		}
		this.errorsOfForms = errors;
		this.events.emit('Errors:change', this.errorsOfForms);
		return Object.keys(errors).length === 0;
	}
}
