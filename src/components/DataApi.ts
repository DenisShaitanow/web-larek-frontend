import { Api, ApiListResponse } from './base/api';
import { IDataApi, IOrder, TOrderResult, IProduct } from '../types';

export class DataApi extends Api implements IDataApi {
	protected cdn: string;

	constructor(baseUrl: string, cdn: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getProducts(): Promise<IProduct[]> {
		return this.get('/product').then((data: ApiListResponse<IProduct>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	getProduct(id: string): Promise<IProduct> {
		return this.get(`/product/${id}`).then((data: IProduct) => ({
			...data,
			image: this.cdn + data.image,
		}));
	}

	sendOrder(data: IOrder): Promise<TOrderResult> {
		return this.post('/order', data).then((res: TOrderResult) => res);
	}
}
