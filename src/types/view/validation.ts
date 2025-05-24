
export interface IValidation {
    formList: Record<string, FormForValidation>;

    formListSet( nameForm: string, formElement: HTMLFormElement, inputClass: string): void;
    checkInputValidity(inputElement: HTMLInputElement, formElement: HTMLFormElement): void;
    showInputError( errorMessage: string, formElement: HTMLFormElement): void;
    hideInputError(formElement: HTMLFormElement): void;
    toggleState(formElement: HTMLFormElement, inputList: HTMLInputElement[]): void;
    setEventListeners(nameForm: string): void;
    clearValidation(nameForm: string): void;
}


export type FormForValidation = {
    formValidation: HTMLFormElement;
    inputList: HTMLInputElement[];
    validity: boolean
}