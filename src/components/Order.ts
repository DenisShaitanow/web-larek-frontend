import { Form } from './common/Form';
import { TOrderForm, PaymentType } from '../types';
import { EventEmitter } from './base/events';
import { ensureElement } from '../utils/utils';

export class Order extends Form<TOrderForm> {
	protected _paymentOnline: HTMLButtonElement;
	protected _paymentPersonally: HTMLButtonElement;

	constructor(events: EventEmitter, container: HTMLFormElement) {
		super(events, container);

		this._paymentOnline = ensureElement<HTMLButtonElement>(
			'.button_alt[name=card]',
			container
		);
		this._paymentPersonally = ensureElement<HTMLButtonElement>(
			'.button_alt[name=cash]',
			container
		);

		this._paymentOnline.addEventListener('click', () => {
			this.payment = 'online';
			this.onInputChange('payment', 'online');
		});

		this._paymentPersonally.addEventListener('click', () => {
			this.payment = 'personally';
			this.onInputChange('payment', 'personally');
		});
	}

	set payment(value: PaymentType) {
		this._paymentOnline.classList.toggle(
			'button_alt-active',
			value === 'online'
		);
		this._paymentPersonally.classList.toggle(
			'button_alt-active',
			value === 'personally'
		);
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}
}
