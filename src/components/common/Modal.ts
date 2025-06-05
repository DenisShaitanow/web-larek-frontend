import { IEvents } from '../base/events';
import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

interface IModal {
	content: HTMLElement;
}

export class Modal extends Component<IModal> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;
	protected events: IEvents;

	constructor(events: IEvents, container: HTMLElement) {
		super(container);
		this.events = events;

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('click', this.close.bind(this));
		this._content.addEventListener('click', (evt) => evt.stopPropagation());
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	open() {
		this.container.classList.add('modal_active');
		this.events.emit('modal:open');
		document.addEventListener('keydown', (evt: KeyboardEvent) =>
			this.handleEscKeyUp(evt)
		);
	}

	close() {
		this.container.classList.remove('modal_active');
		this.content = null;
		document.removeEventListener('keydown', this.handleEscKeyUp);
		this.events.emit('modal:close');
	}

	render(data: IModal): HTMLElement {
		super.render(data);
		this.open();
		return this.container;
	}

	handleEscKeyUp(evt: KeyboardEvent): void {
		if (evt.key === 'Escape') {
			this.close();
		}
	}
}
