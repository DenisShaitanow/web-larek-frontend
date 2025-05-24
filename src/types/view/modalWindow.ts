

export interface IModalWindow {
    modalWindow: HTMLElement;

    addModalWindowDom<T extends HTMLElement>(place: string): void;
    openModalWindow(): void;
    closeModalWindow(): void;
    handleEscKeyUp(evt: KeyboardEvent): void;
}