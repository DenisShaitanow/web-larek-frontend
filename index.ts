import './scss/styles.scss';


import { API_URL, CDN_URL } from './utils/constants';
import { Api } from './components/base/api';
import { Order, PersonalInformation, Basket, LarekModel } from './components/model/model';
import { EventEmitter } from './components/base/events';
import { View } from './components/view/view';
import { Larek } from './components/presenter/presenter';

const api=new Api(API_URL);
const apiImage=new Api(CDN_URL);
const order=new Order();
const personalInformation=new PersonalInformation();
const busket=new Basket();
const larekModel=new LarekModel(personalInformation, busket, order, api, apiImage); // собрал модель

const emitter=new EventEmitter();
const view=new View(emitter);  // собрал отображение

const larek=new Larek(larekModel, emitter, view); // собираю презентер

// начало работы страницы
larek.view.addAppendPlace('gallery', 'gallery');
larek.renderProductList();




