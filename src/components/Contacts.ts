import { Form } from "./common/Form";
import { IOrderForm } from "../types";
import { EventEmitter } from "./base/events";

export class Contacts extends Form<IOrderForm> {
        
    /*constructor(events: EventEmitter, container: HTMLFormElement) {
        super(events, container);
    }*/

    set email(value: string) {
        (this.container.elements.namedItem('email') as HTMLInputElement).value = value;
    }

    set phone(value: string) {
        (this.container.elements.namedItem('phone') as HTMLInputElement).value = value;
    }
}