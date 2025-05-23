import { cloneTemplate, ensureAllElements, isSelector, ensureElement, createElement } from "../../utils/utils";
import { IModalWindow } from "../../types/view/modalWindow";

export class ModalWindow implements IModalWindow {
    modalWindow: HTMLElement;

    constructor() {
        this.addModalWindowDom<HTMLDivElement>('#modal-container');  // назначаю модальное окно из верстки, которое будет выскакивать
    }

    addModalWindowDom<T extends HTMLElement>(place: string): void {
        this.modalWindow=ensureElement<T>(place);
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



}