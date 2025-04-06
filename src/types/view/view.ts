import { Personal_information, Product, Basket } from "../../../types";

export interface ProductData {
    title: string;
    category: string;
    description: string;
    price: number;
    image: string;
}

export interface ProductSettings {
    title: string;
    category: string;
    description: string;
    price: number;
    image: string;
    compactClass: string;
    isCompact: boolean;
}

export interface BusketData {
    products_for_purchase: ProductData[];
    total_price: number;
}

export interface BusketSettings {
    products_for_purchase: ProductData[];
    total_price: number;
}

export interface ProductListSettings {
    productList: Product[];
}

