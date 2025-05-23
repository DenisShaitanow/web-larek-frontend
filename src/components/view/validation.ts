import { cloneTemplate, ensureAllElements, isSelector, ensureElement, createElement } from "../../utils/utils";
import { IValidation, FormForValidation } from "../../types/view/validation";




export class Validation implements IValidation {

    formList: Record<string, FormForValidation> ={};
    
    constructor () {
    }

    formListSet( nameForm: string, formElement: HTMLFormElement, inputClass: string): void {
        // Проверяем наличие формы с данным именем
        if (this.formList[nameForm]) {
            // Форма уже существует, значит, мы ничего не делаем
            return;
        }

        // Получаем список инпутов для новой формы
        const inputList = Array.from(ensureAllElements<HTMLInputElement>(`.${inputClass}`, formElement));
        if (!inputList) {
            throw new Error('Инпуты не найдены');
        }

        // Формируем новую запись в объекте formList
        this.formList[nameForm] = {
            formValidation: formElement,
            inputList: inputList,
            validity: false
        };
    }

    checkInputValidity(inputElement: HTMLInputElement, formElement: HTMLFormElement): void {
        if (inputElement.validity.patternMismatch) {
          // встроенный метод setCustomValidity принимает на вход строку
          // и заменяет ею стандартное сообщение об ошибке
          inputElement.setCustomValidity(inputElement.dataset.errorMessage);
        } else {
          // если передать пустую строку, то будут доступны
          // стандартные браузерные сообщения
          inputElement.setCustomValidity("");
        }
      
        if (!inputElement.validity.valid) {
          // теперь, если ошибка вызвана регулярным выражением,
          // переменная validationMessage хранит наше кастомное сообщение
          this.showInputError(
            inputElement.validationMessage,
            formElement
          );
        } else {
          this.hideInputError(formElement);
        }
    }

    // Функция, которая добавляет класс с ошибкой
    showInputError( errorMessage: string, formElement: HTMLFormElement): void {
        // Находим элемент ошибки внутри самой функции
        
        const errorElement = ensureElement<HTMLSpanElement>(`.form__errors`, formElement);
        
        errorElement.textContent = errorMessage;
    };
      
    // Функция, которая удаляет класс с ошибкой
    hideInputError(formElement: HTMLFormElement): void {
        // Находим элемент ошибки
        
        const errorElement = ensureElement<HTMLSpanElement>(`.form__errors`, formElement);
        // Остальной код такой же
        /*inputElement.classList.add(arr.inputErrorClass);*/
        
        errorElement.textContent = "";
    }
      
    // функция активации и деактивации кнопки сабмит
    toggleState(formElement: HTMLFormElement, inputList: HTMLInputElement[]): void {
        
        const formNoValid = inputList.some((inputElement) => {
          // Если поле не валидно, колбэк вернёт true
          
          return (
            inputElement.validity.patternMismatch || !inputElement.validity.valid
          );
        });

        let form: FormForValidation;
        for (const key in this.formList) {
            if (this.formList[key].formValidation === formElement) {
                form = this.formList[key];
            }
        }

        if (formNoValid === true) {
          form.validity = false;
        } else {
            form.validity = true;
        }
    }
 
    setEventListeners(nameForm: string): void {
        
        let form: HTMLFormElement | null = null;
        let inputList: HTMLInputElement[] | null =null;

        if (this.formList[nameForm]) {
            // Форма уже существует, значит, мы ничего не делаем
            form = this.formList[nameForm].formValidation;
            inputList = this.formList[nameForm].inputList;
        }

        if (form === null && inputList === null) {
            throw new Error('Форма не найдена');
        }
        

        inputList.forEach((inputElement: HTMLInputElement) => {

            inputElement.addEventListener("input", () => {
                this.checkInputValidity(inputElement, form);
                this.toggleState(form, inputList);
            });
        });
    }
      
    // Функция обнуления поля ошибок при закрытии модального окна
    
    clearValidation(nameForm: string): void {

        let form: HTMLFormElement | null = null;
        let inputList: HTMLInputElement[] | null =null;

        if (this.formList[nameForm]) {
            // Форма уже существует, значит, мы ничего не делаем
            form = this.formList[nameForm].formValidation;
            inputList = this.formList[nameForm].inputList;
        }

        this.toggleState(form, inputList);
        inputList.forEach((inputElement) => {
          this.checkInputValidity(inputElement , form);
        });
    }
}
