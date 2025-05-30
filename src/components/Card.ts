import { IProduct } from "../types";
import { ensureElement, bem } from "../utils/utils";
import { Component } from "./base/Component";

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


    constructor(container: HTMLElement, actions?: ICardActions) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);

        this._category = container.querySelector('.card__category');
        this._button = container.querySelector('.card__button');
        this._image = container.querySelector('.card__image');
        this._description = container.querySelector('.card__description');

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

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id || ''
    }

    set title(value: string) {
        this.setText(this._category, value);
    }

    get title(): string {
        return this._category.textContent || '';
    }

    set price(value: number | null) {
        this.setText(this._price, value ? `${value} синапсов` : 'бесценно');
        if (this._button) {
            this._button.disabled = !value;
        }
    }

    set category(value: string) {
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