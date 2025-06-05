import { IProduct } from '../types';
import { ensureElement, bem } from '../utils/utils';
import { Component } from './base/Component';
import { settings } from '../utils/constants';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

type CardType = 'compact' | 'full';

export class Card extends Component<IProduct> {
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _price: HTMLElement;
	protected _description?: HTMLElement;
	protected _category?: HTMLElement;
	protected _button?: HTMLButtonElement;
	protected _index: HTMLElement;

	constructor(container: HTMLElement, actions?: ICardActions) {
		super(container);

		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);

		this._category = container.querySelector('.card__category');
		this._button = container.querySelector('.card__button');
		this._image = container.querySelector('.card__image');
		this._description = container.querySelector('.card__text');
		this._index = container.querySelector('.basket__item-index');

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	toogle(modifer: CardType) {
		this.toggleClass(this.container, bem('card', undefined, modifer).name);
	}

	set index(value: number) {
		this.setText(this._index, value);
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set price(value: number | null) {
		this.setText(this._price, value ? `${value} синапсов` : 'бесценно');
		if (this._button) {
			this._button.disabled = !value;
		}
	}

	set category(value: string) {
		switch (value) {
            // не совсем понял, что нужно сделать и как сократить код. Я затолкал классы внутрь объекта настройки. Но мне в любом случае нужно при создании каждой карточки определять категорию и назначать стили, значит блок СВИТЧ/Кейс убирать нельзя.
			case 'софт-скил': 
				this._category?.classList.add(`${settings['софт-скил']}`);
				break;
			case 'другое':
				this._category?.classList.add(`${settings['другое']}`);
				break;
			case 'дополнительное':
				this._category?.classList.add(`${settings['дополнительное']}`);
				break;
			case 'кнопка':
				this._category?.classList.add(`${settings['кнопка']}`);
				break;
			case 'хард-скил':
				this._category?.classList.add(`${settings['хард-скил']}`);
				break;
			default: {
				this._category?.classList.add(`${settings['хард-скил']}`);
			}
		}
		this.setText(this._category, value);
	}

	set description(value: string) {
		this.setText(this._description, value);
	}

	set button(value: string) {
		this.setText(this._button, value);
	}

	set image(value: string) {
		this.setImage(this._image, value);
	}
}
