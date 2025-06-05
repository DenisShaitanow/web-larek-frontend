import { Form } from './common/Form';
import { TOrderForm } from '../types';

export class Contacts extends Form<TOrderForm> {
	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}
}
