import { Personal_information, Product, Basket } from "../../../types";

export interface AppState {
    product_list?: Product[];
    selectProduct: Product;
    contacts: Personal_information;
    products_for_purchase: Product[];
    total_price: number;
    isOrderReady: boolean;

    load(): Promise<Product[]>;
    select_product(id: Product): Promise<Product>;
    put_to_busket(product: Product): Basket;
    open_busketModal(): HTMLElement;
    open_productModal(product: Product): HTMLElement;
    delete_product_from_busket(product: Product): void;
    design_order(): HTMLElement;
    do_pay(): Promise<void>;
    new_buys(): HTMLElement;
    close_modal(window: HTMLElement): void;
}