import { Component } from '../base/Component';
import { createElement, ensureElement } from '../../utils/utils';
import { EventEmitter } from '../base/events';

interface IBasketView {
	items: HTMLElement[];
}

export class Basket extends Component<IBasketView> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLElement;
	protected _events: EventEmitter;

	constructor(events: EventEmitter, container: HTMLElement) {
		super(container);
		this._events = events;

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = ensureElement<HTMLElement>('.basket__price', this.container);
		this._button = ensureElement<HTMLElement>(
			'.basket__button',
			this.container
		);
		this._button.addEventListener('click', () => {
			events.emit('order:open');
		});

		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
			this._button.removeAttribute('disabled');
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
			this._button.setAttribute('disabled', 'disabled');
		}
	}

	set total(value: number) {
		this.setText(this._total, `${value} синапсов`);
	}
}
